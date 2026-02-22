/**
 * Database Test Client
 *
 * Provides database access for E2E test verification using Drizzle/Neon.
 * Replaces the old Supabase-based test client.
 */

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, like, desc, sql } from 'drizzle-orm';
import * as schema from '../../lib/schema/index.ts';

// Get environment variables
const databaseUrl = process.env.DATABASE_URL;

// Track whether we've warned about missing config
let hasWarned = false;

/**
 * Create a database client for testing
 */
function createTestClient() {
  if (!databaseUrl) {
    if (!hasWarned) {
      console.warn(
        '[Test Client] Missing DATABASE_URL. Set it in .env.local'
      );
      hasWarned = true;
    }
    return null;
  }

  const neonClient = neon(databaseUrl);
  return drizzle(neonClient, { schema });
}

// Export singleton instance
export const testDb = createTestClient();

/**
 * Check if test client is configured
 */
export function isTestClientConfigured() {
  return testDb !== null;
}

/**
 * Verify a tryout signup exists in the database
 * @param {string} email - Parent email to search for
 * @param {object} expected - Expected values to verify
 */
export async function verifyTryoutSignup(email, expected = {}) {
  if (!testDb) {
    throw new Error('Test client not configured');
  }

  const [data] = await testDb
    .select()
    .from(schema.tryoutSignups)
    .where(eq(schema.tryoutSignups.parentEmail, email))
    .orderBy(desc(schema.tryoutSignups.createdAt))
    .limit(1);

  if (!data) {
    throw new Error(`Tryout signup not found for email: ${email}`);
  }

  // Verify expected fields if provided
  const mismatches = [];
  const fieldMap = {
    playerFirstName: 'playerFirstName',
    playerLastName: 'playerLastName',
    playerGrade: 'playerGrade',
    playerGender: 'playerGender',
    parentFirstName: 'parentFirstName',
    parentLastName: 'parentLastName',
    parentEmail: 'parentEmail',
    parentPhone: 'parentPhone',
    sessionId: 'sessionId',
  };

  for (const [key, value] of Object.entries(expected)) {
    const fieldName = fieldMap[key] || key;
    if (data[fieldName] !== value) {
      mismatches.push(`${key}: expected "${value}", got "${data[fieldName]}"`);
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
  if (!testDb) {
    throw new Error('Test client not configured');
  }

  const [data] = await testDb
    .select()
    .from(schema.contactSubmissions)
    .where(eq(schema.contactSubmissions.email, email))
    .orderBy(desc(schema.contactSubmissions.createdAt))
    .limit(1);

  if (!data) {
    throw new Error(`Contact submission not found for email: ${email}`);
  }

  // Verify expected fields
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
  if (!testDb) {
    throw new Error('Test client not configured');
  }

  const [data] = await testDb
    .select()
    .from(schema.registrations)
    .where(eq(schema.registrations.parentEmail, email))
    .orderBy(desc(schema.registrations.createdAt))
    .limit(1);

  if (!data) {
    throw new Error(`Registration not found for email: ${email}`);
  }

  // Verify expected fields
  const mismatches = [];
  const fieldMap = {
    playerFirstName: 'playerFirstName',
    playerLastName: 'playerLastName',
    playerGrade: 'playerCurrentGrade',
    playerGender: 'playerGender',
    parentFirstName: 'parentFirstName',
    parentLastName: 'parentLastName',
    parentEmail: 'parentEmail',
    parentPhone: 'parentPhone',
    addressStreet: 'parentAddressStreet',
    addressCity: 'parentAddressCity',
    addressState: 'parentAddressState',
    addressZip: 'parentAddressZip',
    jerseySize: 'jerseySize',
    paymentPlanType: 'paymentPlanType',
  };

  for (const [key, value] of Object.entries(expected)) {
    const fieldName = fieldMap[key] || key;
    if (data[fieldName] !== value) {
      mismatches.push(`${key}: expected "${value}", got "${data[fieldName]}"`);
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
  if (!testDb) {
    console.warn('[Test Client] Not configured, skipping cleanup');
    return { tryouts: 0, contacts: 0, registrations: 0 };
  }

  const results = {
    tryouts: 0,
    contacts: 0,
    registrations: 0,
  };

  try {
    // Clean tryout_signups
    const tryoutData = await testDb
      .delete(schema.tryoutSignups)
      .where(like(schema.tryoutSignups.parentEmail, 'test.%@example.com'))
      .returning();
    results.tryouts = tryoutData?.length || 0;
  } catch (err) {
    console.error('Failed to clean tryout_signups:', err.message);
  }

  try {
    // Clean contact_submissions
    const contactData = await testDb
      .delete(schema.contactSubmissions)
      .where(like(schema.contactSubmissions.email, 'test.%@example.com'))
      .returning();
    results.contacts = contactData?.length || 0;
  } catch (err) {
    console.error('Failed to clean contact_submissions:', err.message);
  }

  try {
    // Clean registrations
    const regData = await testDb
      .delete(schema.registrations)
      .where(like(schema.registrations.parentEmail, 'test.%@example.com'))
      .returning();
    results.registrations = regData?.length || 0;
  } catch (err) {
    console.error('Failed to clean registrations:', err.message);
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
  if (!testDb) {
    return { tryouts: 0, contacts: 0, registrations: 0 };
  }

  const results = {
    tryouts: 0,
    contacts: 0,
    registrations: 0,
  };

  try {
    const [tryoutCount] = await testDb
      .select({ count: sql`count(*)` })
      .from(schema.tryoutSignups)
      .where(like(schema.tryoutSignups.parentEmail, 'test.%@example.com'));
    results.tryouts = Number(tryoutCount?.count || 0);
  } catch (err) {
    console.error('Failed to count tryout_signups:', err.message);
  }

  try {
    const [contactCount] = await testDb
      .select({ count: sql`count(*)` })
      .from(schema.contactSubmissions)
      .where(like(schema.contactSubmissions.email, 'test.%@example.com'));
    results.contacts = Number(contactCount?.count || 0);
  } catch (err) {
    console.error('Failed to count contact_submissions:', err.message);
  }

  try {
    const [regCount] = await testDb
      .select({ count: sql`count(*)` })
      .from(schema.registrations)
      .where(like(schema.registrations.parentEmail, 'test.%@example.com'));
    results.registrations = Number(regCount?.count || 0);
  } catch (err) {
    console.error('Failed to count registrations:', err.message);
  }

  return results;
}

/**
 * Insert a test tryout session for testing purposes
 * @returns {object} The created session
 */
export async function createTestTryoutSession() {
  if (!testDb) {
    throw new Error('Test client not configured');
  }

  // Get active season
  const [season] = await testDb
    .select()
    .from(schema.seasons)
    .where(eq(schema.seasons.isActive, true))
    .limit(1);

  if (!season) {
    throw new Error('No active season found');
  }

  // Create future date
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 14);
  const dateStr = futureDate.toISOString().split('T')[0];

  const [data] = await testDb
    .insert(schema.tryoutSessions)
    .values({
      seasonId: season.id,
      description: 'Test Tryout Session',
      sessionDate: dateStr,
      startTime: '09:00',
      endTime: '12:00',
      location: 'Test Facility',
      grades: '4th-8th',
      isActive: true,
    })
    .returning();

  return data;
}

/**
 * Delete test tryout sessions
 */
export async function cleanupTestTryoutSessions() {
  if (!testDb) {
    return 0;
  }

  const data = await testDb
    .delete(schema.tryoutSessions)
    .where(eq(schema.tryoutSessions.description, 'Test Tryout Session'))
    .returning();

  return data?.length || 0;
}

// Legacy export names for compatibility
export const testSupabase = testDb;

export default {
  testDb,
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
