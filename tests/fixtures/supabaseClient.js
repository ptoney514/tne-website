/**
 * Supabase Test Client
 *
 * Provides a client with service role access for E2E test verification.
 * Uses service role key to bypass RLS for reading/writing test data.
 */

import { createClient } from '@supabase/supabase-js';

// Get environment variables - support both Vite and Node.js env patterns
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Track whether we've warned about missing config
let hasWarned = false;

/**
 * Create a Supabase client with service role access (bypasses RLS)
 * This should ONLY be used for test verification, never in production code.
 */
function createTestClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    if (!hasWarned) {
      console.warn(
        '[Test Client] Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local'
      );
      hasWarned = true;
    }
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Export singleton instance
export const testSupabase = createTestClient();

/**
 * Check if test client is configured
 */
export function isTestClientConfigured() {
  return testSupabase !== null;
}

/**
 * Verify a tryout signup exists in the database
 * @param {string} email - Parent email to search for
 * @param {object} expected - Expected values to verify
 */
export async function verifyTryoutSignup(email, expected = {}) {
  if (!testSupabase) {
    throw new Error('Test client not configured');
  }

  const { data, error } = await testSupabase
    .from('tryout_signups')
    .select('*')
    .eq('parent_email', email)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    throw new Error(`Failed to verify tryout signup: ${error.message}`);
  }

  if (!data) {
    throw new Error(`Tryout signup not found for email: ${email}`);
  }

  // Verify expected fields if provided
  const mismatches = [];
  for (const [key, value] of Object.entries(expected)) {
    // Map frontend field names to database column names
    const columnMap = {
      playerFirstName: 'player_first_name',
      playerLastName: 'player_last_name',
      playerGrade: 'player_grade',
      playerGender: 'player_gender',
      parentFirstName: 'parent_first_name',
      parentLastName: 'parent_last_name',
      parentEmail: 'parent_email',
      parentPhone: 'parent_phone',
      sessionId: 'session_id',
    };

    const columnName = columnMap[key] || key;

    if (data[columnName] !== value) {
      mismatches.push(`${key}: expected "${value}", got "${data[columnName]}"`);
    }
  }

  if (mismatches.length > 0) {
    throw new Error(`Tryout signup verification failed:\n${mismatches.join('\n')}`);
  }

  return data;
}

/**
 * Verify a contact submission exists in the database
 * @param {string} email - Email to search for
 * @param {object} expected - Expected values to verify
 */
export async function verifyContactSubmission(email, expected = {}) {
  if (!testSupabase) {
    throw new Error('Test client not configured');
  }

  const { data, error } = await testSupabase
    .from('contact_submissions')
    .select('*')
    .eq('email', email)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    throw new Error(`Failed to verify contact submission: ${error.message}`);
  }

  if (!data) {
    throw new Error(`Contact submission not found for email: ${email}`);
  }

  // Verify expected fields if provided
  const mismatches = [];
  for (const [key, value] of Object.entries(expected)) {
    if (data[key] !== value) {
      mismatches.push(`${key}: expected "${value}", got "${data[key]}"`);
    }
  }

  if (mismatches.length > 0) {
    throw new Error(`Contact submission verification failed:\n${mismatches.join('\n')}`);
  }

  return data;
}

/**
 * Verify a registration exists in the database
 * @param {string} email - Parent email to search for
 * @param {object} expected - Expected values to verify
 */
export async function verifyRegistration(email, expected = {}) {
  if (!testSupabase) {
    throw new Error('Test client not configured');
  }

  const { data, error } = await testSupabase
    .from('registrations')
    .select('*')
    .eq('parent_email', email)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    throw new Error(`Failed to verify registration: ${error.message}`);
  }

  if (!data) {
    throw new Error(`Registration not found for email: ${email}`);
  }

  // Verify expected fields if provided
  const mismatches = [];
  for (const [key, value] of Object.entries(expected)) {
    // Map frontend field names to database column names
    const columnMap = {
      playerFirstName: 'player_first_name',
      playerLastName: 'player_last_name',
      playerGrade: 'player_current_grade',
      playerGender: 'player_gender',
      parentFirstName: 'parent_first_name',
      parentLastName: 'parent_last_name',
      parentEmail: 'parent_email',
      parentPhone: 'parent_phone',
      addressStreet: 'parent_address_street',
      addressCity: 'parent_address_city',
      addressState: 'parent_address_state',
      addressZip: 'parent_address_zip',
      jerseySize: 'jersey_size',
      paymentPlanType: 'payment_plan_type',
    };

    const columnName = columnMap[key] || key;

    if (data[columnName] !== value) {
      mismatches.push(`${key}: expected "${value}", got "${data[columnName]}"`);
    }
  }

  if (mismatches.length > 0) {
    throw new Error(`Registration verification failed:\n${mismatches.join('\n')}`);
  }

  return data;
}

/**
 * Clean up test data from all tables
 * Removes entries with emails matching test.%@example.com
 */
export async function cleanupTestData() {
  if (!testSupabase) {
    console.warn('[Test Client] Not configured, skipping cleanup');
    return { tryouts: 0, contacts: 0, registrations: 0 };
  }

  const results = {
    tryouts: 0,
    contacts: 0,
    registrations: 0,
  };

  // Clean tryout_signups
  const { data: tryoutData, error: tryoutError } = await testSupabase
    .from('tryout_signups')
    .delete()
    .like('parent_email', 'test.%@example.com')
    .select();

  if (tryoutError) {
    console.error('Failed to clean tryout_signups:', tryoutError.message);
  } else {
    results.tryouts = tryoutData?.length || 0;
  }

  // Clean contact_submissions
  const { data: contactData, error: contactError } = await testSupabase
    .from('contact_submissions')
    .delete()
    .like('email', 'test.%@example.com')
    .select();

  if (contactError) {
    console.error('Failed to clean contact_submissions:', contactError.message);
  } else {
    results.contacts = contactData?.length || 0;
  }

  // Clean registrations
  const { data: regData, error: regError } = await testSupabase
    .from('registrations')
    .delete()
    .like('parent_email', 'test.%@example.com')
    .select();

  if (regError) {
    console.error('Failed to clean registrations:', regError.message);
  } else {
    results.registrations = regData?.length || 0;
  }

  console.log(
    `[Test Cleanup] Removed: ${results.tryouts} tryouts, ${results.contacts} contacts, ${results.registrations} registrations`
  );

  return results;
}

/**
 * Get count of test data entries
 */
export async function getTestDataCounts() {
  if (!testSupabase) {
    return { tryouts: 0, contacts: 0, registrations: 0 };
  }

  const results = {
    tryouts: 0,
    contacts: 0,
    registrations: 0,
  };

  // Count tryout_signups
  const { count: tryoutCount } = await testSupabase
    .from('tryout_signups')
    .select('*', { count: 'exact', head: true })
    .like('parent_email', 'test.%@example.com');
  results.tryouts = tryoutCount || 0;

  // Count contact_submissions
  const { count: contactCount } = await testSupabase
    .from('contact_submissions')
    .select('*', { count: 'exact', head: true })
    .like('email', 'test.%@example.com');
  results.contacts = contactCount || 0;

  // Count registrations
  const { count: regCount } = await testSupabase
    .from('registrations')
    .select('*', { count: 'exact', head: true })
    .like('parent_email', 'test.%@example.com');
  results.registrations = regCount || 0;

  return results;
}

/**
 * Insert a test tryout session for testing purposes
 * @returns {object} The created session
 */
export async function createTestTryoutSession() {
  if (!testSupabase) {
    throw new Error('Test client not configured');
  }

  // Get active season
  const { data: seasons } = await testSupabase
    .from('seasons')
    .select('id')
    .eq('is_active', true)
    .limit(1);

  const seasonId = seasons?.[0]?.id;

  if (!seasonId) {
    throw new Error('No active season found');
  }

  // Create future date
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 14);
  const dateStr = futureDate.toISOString().split('T')[0];

  const { data, error } = await testSupabase
    .from('tryout_sessions')
    .insert({
      season_id: seasonId,
      description: 'Test Tryout Session',
      session_date: dateStr,
      start_time: '09:00',
      end_time: '12:00',
      location: 'Test Facility',
      grades: '4th-8th',
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create test session: ${error.message}`);
  }

  return data;
}

/**
 * Delete test tryout sessions
 */
export async function cleanupTestTryoutSessions() {
  if (!testSupabase) {
    return 0;
  }

  const { data, error } = await testSupabase
    .from('tryout_sessions')
    .delete()
    .eq('description', 'Test Tryout Session')
    .select();

  if (error) {
    console.error('Failed to clean test sessions:', error.message);
    return 0;
  }

  return data?.length || 0;
}

export default {
  testSupabase,
  isTestClientConfigured,
  verifyTryoutSignup,
  verifyContactSubmission,
  verifyRegistration,
  cleanupTestData,
  getTestDataCounts,
  createTestTryoutSession,
  cleanupTestTryoutSessions,
};
