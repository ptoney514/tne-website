/**
 * Global Setup for E2E Tests
 *
 * Runs before all tests to:
 * - Clean up any leftover test data from previous runs
 * - Verify test environment is configured correctly
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default async function globalSetup() {
  // Load environment variables from .env.local
  dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

  console.log('\n[Global Setup] Starting E2E test setup...');

  // Check for required environment variables
  const requiredVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
  const missingVars = requiredVars.filter((v) => !process.env[v] && !process.env[`VITE_${v}`]);

  if (missingVars.length > 0) {
    console.warn(
      `[Global Setup] Warning: Missing environment variables: ${missingVars.join(', ')}`
    );
    console.warn('[Global Setup] Supabase verification will be skipped in tests.');
  } else {
    console.log('[Global Setup] Environment variables loaded successfully.');

    // Import dynamically to ensure env vars are loaded first
    const { cleanupTestData, getTestDataCounts, isTestClientConfigured } = await import(
      '../fixtures/supabaseClient.js'
    );

    if (isTestClientConfigured()) {
      // Check for leftover test data
      const counts = await getTestDataCounts();
      const totalLeftover = counts.tryouts + counts.contacts + counts.registrations;

      if (totalLeftover > 0) {
        console.log(
          `[Global Setup] Found ${totalLeftover} leftover test entries, cleaning up...`
        );
        await cleanupTestData();
      }

      console.log('[Global Setup] Test database ready.');
    }
  }

  console.log('[Global Setup] Setup complete.\n');
}
