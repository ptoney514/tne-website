/**
 * Create Admin User Script
 *
 * Production bootstrap script to create the initial admin account.
 * Run with: npx tsx scripts/create-admin.ts
 *
 * Uses ADMIN_EMAIL / ADMIN_PASSWORD env vars, or falls back to defaults.
 * Creates user via Neon Auth HTTP API (scripts run outside Next.js context).
 */

import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import { userProfiles } from '../lib/schema/userProfiles';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const NEON_AUTH_BASE_URL = process.env.NEON_AUTH_BASE_URL!;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@tnebasketball.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'TestAdmin123!';
const ADMIN_NAME = 'Admin User';

async function createAdmin() {
  console.log('🔐 Creating admin user...\n');

  // Try to sign up first; if user already exists, sign in to get the ID
  // Then check if they already have an admin profile

  // Create user via Neon Auth HTTP API
  const signUpUrl = `${NEON_AUTH_BASE_URL}/sign-up/email`;
  const response = await fetch(signUpUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': NEON_AUTH_BASE_URL,
    },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      name: ADMIN_NAME,
    }),
  });

  let userId: string;

  if (!response.ok) {
    // User may already exist in Neon Auth — try signing in to get the ID
    const signInUrl = `${NEON_AUTH_BASE_URL}/sign-in/email`;
    const signInResponse = await fetch(signInUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': NEON_AUTH_BASE_URL,
      },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      }),
    });

    if (!signInResponse.ok) {
      const body = await response.text();
      throw new Error(`Sign up failed (${response.status}): ${body}`);
    }

    const signInResult = await signInResponse.json();
    userId = signInResult.user?.id;
    if (!userId) {
      throw new Error('Sign in returned no user ID');
    }
    console.log(`  ✓ User already exists in Neon Auth: ${ADMIN_EMAIL}`);
  } else {
    const result = await response.json();
    userId = result.user?.id;
    if (!userId) {
      throw new Error('Sign up returned no user ID');
    }
    console.log(`  ✓ Created user: ${ADMIN_EMAIL}`);
  }

  // Create user_profiles row with admin role
  await db
    .insert(userProfiles)
    .values({
      id: userId,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
    })
    .onConflictDoUpdate({
      target: userProfiles.id,
      set: { role: 'admin', updatedAt: new Date() },
    });

  console.log(`  ✓ Set role to admin`);
  console.log('\n✅ Admin user created successfully.');
}

createAdmin().catch((err) => {
  console.error('Failed to create admin:', err);
  process.exit(1);
});
