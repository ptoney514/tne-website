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

import { verifyTurnstile, isConfigured as isTurnstileConfigured } from './lib/turnstile.js';
import { appendRegistration, isConfigured as isSheetsConfigured } from './lib/googleSheets.js';
import { insertRegistration, isDatabaseConfigured } from './lib/registrationDb.js';

// Simple rate limiting map (per IP, in-memory)
// Note: This resets on each serverless cold start, but provides some protection
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 5; // 5 requests per minute per IP

/**
 * Check rate limit for an IP address
 */
function checkRateLimit(ip) {
  const now = Date.now();
  const ipData = rateLimitMap.get(ip);

  if (!ipData) {
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return { allowed: true };
  }

  // Reset window if expired
  if (now - ipData.windowStart > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return { allowed: true };
  }

  // Check if under limit
  if (ipData.count < RATE_LIMIT_MAX) {
    ipData.count++;
    return { allowed: true };
  }

  return {
    allowed: false,
    retryAfter: Math.ceil((RATE_LIMIT_WINDOW - (now - ipData.windowStart)) / 1000),
  };
}

/**
 * Validate registration data server-side
 */
function validateRegistration(data) {
  const errors = [];
  const isSeason = data.registration_type === 'season';

  // Season-specific validations
  if (isSeason) {
    if (!data.season_id) errors.push('Season is required');
  } else {
    // Team-specific validations
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

  // Payment (team only)
  if (!isSeason) {
    if (!data.payment_plan_type) errors.push('Payment option is required');
    if (!data.payment_terms_acknowledged) errors.push('Payment terms acknowledgment is required');
  }

  return errors;
}

/**
 * Main handler for POST /api/register
 */
export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get client IP for rate limiting
    const clientIP = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                     req.headers['x-real-ip'] ||
                     req.socket?.remoteAddress ||
                     'unknown';

    // Check rate limit
    const rateLimit = checkRateLimit(clientIP);
    if (!rateLimit.allowed) {
      return res.status(429).json({
        error: 'Too many registration attempts. Please try again later.',
        retryAfter: rateLimit.retryAfter,
      });
    }

    // Parse request body
    const { registration, turnstileToken } = req.body || {};

    if (!registration) {
      return res.status(400).json({ error: 'Registration data is required' });
    }

    // Step 1: Verify Turnstile token (if configured)
    if (isTurnstileConfigured()) {
      const turnstileResult = await verifyTurnstile(turnstileToken, clientIP);
      if (!turnstileResult.success) {
        return res.status(400).json({
          error: 'Captcha verification failed. Please try again.',
          details: turnstileResult.error,
        });
      }
    } else {
      console.warn('[Register] Turnstile not configured, skipping verification');
    }

    // Step 2: Validate registration data
    const validationErrors = validateRegistration(registration);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationErrors,
      });
    }

    // Step 3: Submit to Google Sheets (if configured)
    if (isSheetsConfigured()) {
      const sheetsResult = await appendRegistration(registration);

      if (!sheetsResult.success) {
        console.error('[Register] Google Sheets submission failed:', sheetsResult.error);
        return res.status(500).json({
          error: 'Registration submission failed. Please try again or contact us directly.',
          fallback: {
            email: 'info@tneunited.com',
            message: 'If this error persists, please email your registration details to us.',
          },
        });
      }

      // Step 4: Also write to Supabase (dual-write, don't fail if this fails)
      if (isDatabaseConfigured()) {
        const supabaseResult = await insertRegistration(registration);
        if (!supabaseResult.success && !supabaseResult.skipped) {
          console.warn('[Register] Supabase write failed (non-blocking):', supabaseResult.error);
        }
      }

      // Success!
      return res.status(200).json({
        success: true,
        referenceId: sheetsResult.registrationId,
        message: 'Registration submitted successfully',
      });
    } else {
      // Google Sheets not configured - try Supabase only or log
      console.warn('[Register] Google Sheets not configured');

      // Generate a reference ID anyway for tracking
      const referenceId = `REG-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Try Supabase if configured
      if (isDatabaseConfigured()) {
        const supabaseResult = await insertRegistration(registration);
        if (supabaseResult.success && !supabaseResult.skipped) {
          console.log('[Register] Registration saved to Supabase:', supabaseResult.id);
          return res.status(200).json({
            success: true,
            referenceId,
            message: 'Registration submitted successfully',
          });
        } else if (!supabaseResult.skipped) {
          console.error('[Register] Supabase write failed:', supabaseResult.error);
        }
      }

      // Neither configured - development mode
      console.log('[Register] Registration data:', JSON.stringify(registration, null, 2));

      return res.status(200).json({
        success: true,
        referenceId,
        message: 'Registration submitted successfully (development mode)',
      });
    }
  } catch (error) {
    console.error('[Register] Unexpected error:', error);
    return res.status(500).json({
      error: 'An unexpected error occurred. Please try again.',
    });
  }
}
