/**
 * Server-side Supabase Admin Client
 *
 * Uses service role key to bypass RLS for server-side operations.
 * This should ONLY be used in API routes, never in client-side code.
 */

import { createClient } from '@supabase/supabase-js';

// Get environment variables for server-side use
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin = null;

/**
 * Check if Supabase admin is configured
 */
export function isSupabaseConfigured() {
  return !!(supabaseUrl && serviceRoleKey);
}

/**
 * Get or create the Supabase admin client
 * Lazy initialization to avoid errors when env vars are not set
 */
export function getSupabaseAdmin() {
  if (!supabaseAdmin && isSupabaseConfigured()) {
    supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return supabaseAdmin;
}

/**
 * Insert a registration into Supabase
 * @param {object} registration - Registration data from the form
 * @returns {object} - { success: boolean, error?: string }
 */
export async function insertRegistration(registration) {
  const client = getSupabaseAdmin();

  if (!client) {
    console.warn('[Supabase] Admin client not configured, skipping insert');
    return { success: true, skipped: true };
  }

  try {
    // Map frontend field names to database column names
    const dbData = {
      source: registration.source || 'direct',
      team_id: registration.team_id,
      player_first_name: registration.player_first_name,
      player_last_name: registration.player_last_name,
      player_date_of_birth: registration.player_date_of_birth,
      player_graduating_year: registration.player_graduating_year || calculateGraduatingYear(registration.player_current_grade),
      player_current_grade: registration.player_current_grade,
      player_gender: registration.player_gender,
      jersey_size: registration.jersey_size,
      position: registration.position || null,
      medical_notes: registration.medical_notes || null,
      parent_first_name: registration.parent_first_name,
      parent_last_name: registration.parent_last_name,
      parent_email: registration.parent_email,
      parent_phone: registration.parent_phone,
      parent_address_street: registration.parent_address_street,
      parent_address_city: registration.parent_address_city,
      parent_address_state: registration.parent_address_state,
      parent_address_zip: registration.parent_address_zip,
      parent_relationship: registration.parent_relationship,
      emergency_contact_name: registration.emergency_contact_name,
      emergency_contact_phone: registration.emergency_contact_phone,
      emergency_contact_relationship: registration.emergency_contact_relationship || null,
      waiver_accepted: registration.waiver_liability && registration.waiver_medical && registration.waiver_media,
      waiver_accepted_at: registration.waiver_accepted_at || (registration.waiver_liability ? new Date().toISOString() : null),
      payment_status: mapPaymentStatus(registration.payment_plan_type),
      status: 'pending',
    };

    const { data, error } = await client
      .from('registrations')
      .insert(dbData)
      .select()
      .single();

    if (error) {
      console.error('[Supabase] Insert registration error:', error);
      return { success: false, error: error.message };
    }

    console.log('[Supabase] Registration inserted:', data.id);
    return { success: true, id: data.id };
  } catch (err) {
    console.error('[Supabase] Unexpected error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Calculate graduating year from grade
 */
function calculateGraduatingYear(grade) {
  const gradeNum = parseInt(grade);
  if (isNaN(gradeNum)) return null;

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  // If we're past August, they're in the new school year
  const schoolYear = currentMonth >= 7 ? currentYear : currentYear - 1;

  // Years until high school graduation (grade 12)
  const yearsUntilGrad = 12 - gradeNum;

  return schoolYear + yearsUntilGrad;
}

/**
 * Map payment plan type to payment status
 */
function mapPaymentStatus(paymentPlanType) {
  switch (paymentPlanType) {
    case 'full':
      return 'pending';
    case 'installment':
      return 'partial';
    case 'special_request':
      return 'pending';
    default:
      return 'pending';
  }
}

export default {
  isSupabaseConfigured,
  getSupabaseAdmin,
  insertRegistration,
};
