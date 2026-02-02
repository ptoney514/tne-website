/**
 * Global Teardown for E2E Tests
 *
 * Runs after all tests to:
 * - Clean up test data created during test run
 * - Report on test data cleanup results
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default async function globalTeardown() {
  // Load environment variables from .env.local
  dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

  console.log('\n[Global Teardown] Starting E2E test cleanup...');

  // Check if we should skip cleanup (useful for debugging)
  if (process.env.SKIP_TEST_CLEANUP === 'true') {
    console.log('[Global Teardown] SKIP_TEST_CLEANUP=true, preserving test data.');
    return;
  }

  // Check for required environment variables
  const hasEnvVars = !!process.env.DATABASE_URL;

  if (!hasEnvVars) {
    console.log('[Global Teardown] Database not configured, skipping cleanup.');
    return;
  }

  try {
    // Import dynamically to ensure env vars are loaded first
    const {
      cleanupTestData,
      cleanupTestTryoutSessions,
      getTestDataCounts,
      isTestClientConfigured,
    } = await import('../fixtures/testDbClient.js');

    if (!isTestClientConfigured()) {
      console.log('[Global Teardown] Test client not configured, skipping cleanup.');
      return;
    }

    // Get counts before cleanup for reporting
    const beforeCounts = await getTestDataCounts();
    const totalBefore =
      beforeCounts.tryouts + beforeCounts.contacts + beforeCounts.registrations;

    if (totalBefore === 0) {
      console.log('[Global Teardown] No test data to clean up.');
      return;
    }

    // Perform cleanup
    const results = await cleanupTestData();

    // Clean up test tryout sessions
    const sessionsRemoved = await cleanupTestTryoutSessions();
    if (sessionsRemoved > 0) {
      console.log(`[Global Teardown] Removed ${sessionsRemoved} test tryout sessions.`);
    }

    // Report results
    const totalRemoved = results.tryouts + results.contacts + results.registrations;
    console.log(`[Global Teardown] Cleaned up ${totalRemoved} test entries.`);
    console.log(`  - Tryout signups: ${results.tryouts}`);
    console.log(`  - Contact submissions: ${results.contacts}`);
    console.log(`  - Registrations: ${results.registrations}`);

    // Verify cleanup was successful
    const afterCounts = await getTestDataCounts();
    const totalAfter =
      afterCounts.tryouts + afterCounts.contacts + afterCounts.registrations;

    if (totalAfter > 0) {
      console.warn(
        `[Global Teardown] Warning: ${totalAfter} test entries remain after cleanup.`
      );
    }
  } catch (error) {
    console.error('[Global Teardown] Cleanup failed:', error.message);
  }

  console.log('[Global Teardown] Teardown complete.\n');
}
