/**
 * Registration API Endpoint
 *
 * POST /api/register
 *
 * 1. Validates Turnstile token
 * 2. Validates registration data
 * 3. Appends row to Google Sheets
 * 4. Returns success with reference ID
 *
 * Environment variables:
 * - TURNSTILE_SECRET_KEY: Cloudflare Turnstile secret key
 * - GOOGLE_SERVICE_ACCOUNT_KEY: JSON string with Google service account credentials
 * - REGISTRATION_SHEET_ID: Google Sheets spreadsheet ID
 */

import { NextResponse } from 'next/server';
import { verifyTurnstile, isConfigured as isTurnstileConfigured } from '@/lib/turnstile.js';
import { appendRegistration, isConfigured as isSheetsConfigured } from '@/lib/googleSheets.js';
import { insertRegistration, isDatabaseConfigured } from '@/lib/registrationDb.js';
import { sendRegistrationConfirmation, sendAdminRegistrationNotification } from '@/lib/email';
import { createRateLimiter } from '@/lib/rate-limit';

// Rate limiter: 5 registrations per minute per IP
const limiter = createRateLimiter('register', { max: 5, windowMs: 60_000 });

function createEmailFailureResult(reason, error, recipients = []) {
  return {
    sent: false,
    reason,
    error: error instanceof Error ? error.message : error || undefined,
    recipients,
  };
}

/**
 * Send registration emails and capture delivery status for the response/UI.
 */
async function sendRegistrationEmails(registration, referenceId) {
  const playerName = `${registration.player_first_name} ${registration.player_last_name}`;
  const parentName = [registration.parent_first_name, registration.parent_last_name].filter(Boolean).join(' ') || '';
  const isOther = registration.team_other === true;
  const teamOrSeasonName = registration.team_name || (isOther ? 'Team Pending' : 'Team Registration');
  const emailReferenceId = registration.payment_reference_id || referenceId;
  const waiverAccepted = !!(registration.waiver_liability && registration.waiver_medical && registration.waiver_media);
  const parentPolicyAccepted = !!registration.parent_policy;

  const confirmationPromise = registration.parent_email
    ? sendRegistrationConfirmation({
      to: registration.parent_email,
      playerName,
      registrationType: 'team',
      teamOrSeasonName,
      parentName,
      referenceId: emailReferenceId,
      waiverAccepted,
      parentPolicyAccepted,
    }).catch((err) => {
      console.error('[Register] Failed to send confirmation email:', err);
      return createEmailFailureResult('send_failed', err, [registration.parent_email]);
    })
    : Promise.resolve(createEmailFailureResult('missing_recipient', null, []));

  // Build full address if available
  const addressParts = [
    registration.parent_address_street,
    registration.parent_address_city,
    registration.parent_address_state,
    registration.parent_address_zip,
  ].filter(Boolean);
  const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : '';

  const adminPromise = sendAdminRegistrationNotification({
    registrationType: 'team',
    referenceId: emailReferenceId,
    playerFirstName: registration.player_first_name,
    playerLastName: registration.player_last_name,
    playerDob: registration.player_date_of_birth || '',
    playerAge: registration.player_age || '',
    playerGrade: registration.player_current_grade || '',
    playerGender: registration.player_gender || '',
    jerseySize: registration.jersey_size || '',
    desiredJerseyNumber: registration.desired_jersey_number || '',
    lastTeamPlayedFor: registration.last_team_played_for || '',
    parentFirstName: registration.parent_first_name || '',
    parentLastName: registration.parent_last_name || '',
    parentEmail: registration.parent_email || '',
    parentPhone: registration.parent_phone || '',
    parentHomePhone: registration.parent_home_phone || '',
    parentRelationship: registration.parent_relationship || '',
    parentAddress: fullAddress,
    parent2FirstName: registration.parent2_first_name || '',
    parent2LastName: registration.parent2_last_name || '',
    parent2Email: registration.parent2_email || '',
    parent2Phone: registration.parent2_phone || '',
    parent2HomePhone: registration.parent2_home_phone || '',
    parent2Relationship: registration.parent2_relationship || '',
    emergencyContactName: registration.emergency_contact_name || '',
    emergencyContactPhone: registration.emergency_contact_phone || '',
    teamOrSeasonName,
    paymentPlan: registration.payment_plan_type || '',
    waiverAccepted,
    parentPolicyAccepted,
  }).catch((err) => {
    console.error('[Register] Failed to send admin notification:', err);
    return createEmailFailureResult('send_failed', err);
  });

  const [confirmation, admin] = await Promise.all([confirmationPromise, adminPromise]);

  return {
    confirmation,
    admin,
  };
}


/**
 * Validate registration data server-side
 */
function validateRegistration(data) {
  const errors = [];
  const isOther = data.team_other === true;

  // Team-specific validations (skip for "Other" registrations)
  if (!isOther) {
    if (!data.team_id) errors.push('Team is required');
    if (!data.jersey_size) errors.push('Jersey size is required');
    if (!data.desired_jersey_number?.trim()) errors.push('Desired jersey number is required');
  }

  // Common player fields
  if (!data.player_first_name?.trim()) errors.push('Player first name is required');
  if (!data.player_last_name?.trim()) errors.push('Player last name is required');
  if (!data.player_date_of_birth) errors.push('Date of birth is required');
  if (!data.player_current_grade) errors.push('Grade is required');
  if (!data.player_gender) errors.push('Gender is required');
  if (!data.last_team_played_for?.trim()) errors.push('Last team played for is required');

  // Required parent fields
  if (!data.parent_first_name?.trim()) errors.push('Parent first name is required');
  if (!data.parent_last_name?.trim()) errors.push('Parent last name is required');
  if (!data.parent_email?.trim()) errors.push('Email is required');
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.parent_email)) {
    errors.push('Invalid email format');
  }
  if (!data.parent_phone?.trim()) errors.push('Phone is required');
  if (!data.parent_relationship) errors.push('Relationship is required');
  if (!data.parent_home_phone?.trim()) errors.push('Home phone is required');

  // Required address fields
  if (!data.parent_address_street?.trim()) errors.push('Street address is required');
  if (!data.parent_address_city?.trim()) errors.push('City is required');
  if (!data.parent_address_state) errors.push('State is required');
  if (!data.parent_address_zip?.trim()) errors.push('ZIP code is required');
  else if (!/^\d{5}$/.test(data.parent_address_zip)) {
    errors.push('Invalid ZIP code format');
  }

  // Emergency contact
  if (!data.emergency_contact_name?.trim()) errors.push('Emergency contact name is required');
  if (!data.emergency_contact_phone?.trim()) errors.push('Emergency contact phone is required');

  // Waivers (all types)
  if (!data.waiver_liability) errors.push('Liability waiver acceptance is required');
  if (!data.waiver_medical) errors.push('Medical authorization is required');
  if (!data.waiver_media) errors.push('Media release is required');
  if (!data.parent_policy) errors.push('TNE United Parent Policy acceptance is required');

  // Payment (team only, skip for "Other")
  if (!isOther) {
    if (!data.payment_plan_type) errors.push('Payment option is required');
    if (!data.payment_terms_acknowledged) errors.push('Payment terms acknowledgment is required');
  }

  return errors;
}

/**
 * Main handler for POST /api/register
 */
export async function POST(request) {
  // Rate limit check
  const limited = limiter.check(request);
  if (limited) return limited;

  try {
    // Extract client IP for rate limiting and audit trail
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown';

    // Parse request body
    const body = await request.json();
    const { registration, turnstileToken } = body || {};

    if (!registration) {
      return NextResponse.json({ error: 'Registration data is required' }, { status: 400 });
    }

    // Step 1: Verify Turnstile token (if configured)
    if (isTurnstileConfigured()) {
      const turnstileResult = await verifyTurnstile(turnstileToken, clientIP);
      if (!turnstileResult.success) {
        return NextResponse.json({
          error: 'Captcha verification failed. Please try again.',
          details: turnstileResult.error,
        }, { status: 400 });
      }
    } else {
      console.warn('[Register] Turnstile not configured, skipping verification');
    }

    // Step 2: Validate registration data
    const validationErrors = validateRegistration(registration);
    if (validationErrors.length > 0) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validationErrors,
      }, { status: 400 });
    }

    // Step 3: Submit to Google Sheets (if configured)
    if (isSheetsConfigured()) {
      const sheetsResult = await appendRegistration(registration);

      if (!sheetsResult.success) {
        console.error('[Register] Google Sheets submission failed:', sheetsResult.error);
        return NextResponse.json({
          error: 'Registration submission failed. Please try again or contact us directly.',
          fallback: {
            email: 'info@tneunited.com',
            message: 'If this error persists, please email your registration details to us.',
          },
        }, { status: 500 });
      }

      // Step 4: Also write to Supabase (dual-write, don't fail if this fails)
      if (isDatabaseConfigured()) {
        registration.ip_address = clientIP;
        const supabaseResult = await insertRegistration(registration);
        if (!supabaseResult.success && !supabaseResult.skipped) {
          console.warn('[Register] Supabase write failed (non-blocking):', supabaseResult.error);
        }
      }

      const emailStatus = await sendRegistrationEmails(registration, sheetsResult.registrationId);

      // Success!
      return NextResponse.json({
        success: true,
        referenceId: sheetsResult.registrationId,
        message: 'Registration submitted successfully',
        emailStatus,
      });
    } else {
      // Google Sheets not configured - try Supabase only or log
      console.warn('[Register] Google Sheets not configured');

      // Generate a reference ID anyway for tracking
      const referenceId = `REG-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Try Supabase if configured
      if (isDatabaseConfigured()) {
        registration.ip_address = clientIP;
        const supabaseResult = await insertRegistration(registration);
        if (supabaseResult.success && !supabaseResult.skipped) {
          console.log('[Register] Registration saved to Supabase:', supabaseResult.id);
          const emailStatus = await sendRegistrationEmails(registration, referenceId);
          return NextResponse.json({
            success: true,
            referenceId,
            message: 'Registration submitted successfully',
            emailStatus,
          });
        } else if (!supabaseResult.skipped) {
          console.error('[Register] Supabase write failed:', supabaseResult.error);
        }
      }

      // Neither configured - development mode
      console.log('[Register] Registration data:', JSON.stringify(registration, null, 2));
      const emailStatus = await sendRegistrationEmails(registration, referenceId);

      return NextResponse.json({
        success: true,
        referenceId,
        message: 'Registration submitted successfully (development mode)',
        emailStatus,
      });
    }
  } catch (error) {
    console.error('[Register] Unexpected error:', error);
    return NextResponse.json({
      error: 'An unexpected error occurred. Please try again.',
    }, { status: 500 });
  }
}
