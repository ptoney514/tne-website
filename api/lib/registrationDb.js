/**
 * Server-side Registration Database Operations
 *
 * Uses Drizzle with Neon for server-side database operations.
 * Replaces the old supabaseAdmin.js functionality.
 */

import { db } from './db.js';
import { registrations } from './schema/index.js';

/**
 * Check if the database is configured
 */
export function isDatabaseConfigured() {
  return !!process.env.DATABASE_URL;
}

/**
 * Insert a registration into the database
 * @param {object} registration - Registration data from the form
 * @returns {object} - { success: boolean, id?: string, error?: string, skipped?: boolean }
 */
export async function insertRegistration(registration) {
  if (!isDatabaseConfigured()) {
    console.warn('[Database] Not configured, skipping insert');
    return { success: true, skipped: true };
  }

  try {
    // Map frontend field names to database column names
    const dbData = {
      source: registration.source || 'direct',
      teamId: registration.team_id,
      playerFirstName: registration.player_first_name,
      playerLastName: registration.player_last_name,
      playerDateOfBirth: registration.player_date_of_birth,
      playerGraduatingYear: registration.player_graduating_year || calculateGraduatingYear(registration.player_current_grade),
      playerCurrentGrade: registration.player_current_grade,
      playerGender: registration.player_gender,
      jerseySize: registration.jersey_size,
      position: registration.position || null,
      medicalNotes: registration.medical_notes || null,
      parentFirstName: registration.parent_first_name,
      parentLastName: registration.parent_last_name,
      parentEmail: registration.parent_email,
      parentPhone: registration.parent_phone,
      parentAddressStreet: registration.parent_address_street,
      parentAddressCity: registration.parent_address_city,
      parentAddressState: registration.parent_address_state,
      parentAddressZip: registration.parent_address_zip,
      parentRelationship: registration.parent_relationship,
      emergencyContactName: registration.emergency_contact_name,
      emergencyContactPhone: registration.emergency_contact_phone,
      emergencyContactRelationship: registration.emergency_contact_relationship || null,
      waiverAccepted: registration.waiver_liability && registration.waiver_medical && registration.waiver_media,
      waiverAcceptedAt: registration.waiver_accepted_at || (registration.waiver_liability ? new Date() : null),
      paymentStatus: mapPaymentStatus(registration.payment_plan_type),
      status: 'pending',
    };

    const [inserted] = await db
      .insert(registrations)
      .values(dbData)
      .returning();

    console.log('[Database] Registration inserted:', inserted.id);
    return { success: true, id: inserted.id };
  } catch (err) {
    console.error('[Database] Unexpected error:', err);
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

// Legacy exports for compatibility
export const isSupabaseConfigured = isDatabaseConfigured;

export default {
  isDatabaseConfigured,
  isSupabaseConfigured,
  insertRegistration,
};
