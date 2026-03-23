/**
 * Create Admin User Script
 *
 * Creates an admin account via Neon Auth and sets the role in user_profiles.
 *
 * Usage:
 *   npx tsx scripts/create-admin.ts --email user@example.com --password Pass123! --first-name John --last-name Doe
 *
 * CLI args take priority over env vars. Env vars fall back to defaults.
 *   --email       | ADMIN_EMAIL    (default: admin@tnebasketball.com)
 *   --password    | ADMIN_PASSWORD (default: TestAdmin123!)
 *   --first-name  | (default: Admin)
 *   --last-name   | (default: User)
 */

import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

import { userProfiles } from '../lib/schema/userProfiles';

// --- CLI argument parsing ---
function getArg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  return idx !== -1 && idx + 1 < process.argv.length ? process.argv[idx + 1] : undefined;
}

if (process.argv.includes('--help')) {
  console.log(`
Usage: npx tsx scripts/create-admin.ts [options]

Options:
  --email <email>          Admin email address
  --password <password>    Admin password
  --first-name <name>      Admin first name
  --last-name <name>       Admin last name
  --help                   Show this help message

Examples:
  npx tsx scripts/create-admin.ts --email alvin@example.com --password SecurePass! --first-name Alvin --last-name Mitchell
  ADMIN_EMAIL="admin@tnebasketball.com" npm run db:create-admin
`);
  process.exit(0);
}

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const NEON_AUTH_BASE_URL = process.env.NEON_AUTH_BASE_URL!;
const ADMIN_EMAIL = getArg('--email') || process.env.ADMIN_EMAIL || 'admin@tnebasketball.com';
const ADMIN_PASSWORD = getArg('--password') || process.env.ADMIN_PASSWORD || 'TestAdmin123!';
const FIRST_NAME = getArg('--first-name') || 'Admin';
const LAST_NAME = getArg('--last-name') || 'User';
const ADMIN_NAME = `${FIRST_NAME} ${LAST_NAME}`;

async function createAdmin() {
  console.log('🔐 Creating admin user...\n');
  console.log(`  Email:  ${ADMIN_EMAIL}`);
  console.log(`  Name:   ${FIRST_NAME} ${LAST_NAME}\n`);

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
      firstName: FIRST_NAME,
      lastName: LAST_NAME,
      role: 'admin',
    })
    .onConflictDoUpdate({
      target: userProfiles.id,
      set: { firstName: FIRST_NAME, lastName: LAST_NAME, role: 'admin', updatedAt: new Date() },
    });

  console.log(`  ✓ Set role to admin`);
  console.log('\n✅ Admin user created successfully.');
}

createAdmin().catch((err) => {
  console.error('Failed to create admin:', err);
  process.exit(1);
});
