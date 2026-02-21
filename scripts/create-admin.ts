/**
 * Create Admin User Script
 *
 * Production bootstrap script to create the initial admin account.
 * Run with: npx tsx scripts/create-admin.ts
 *
 * Uses ADMIN_EMAIL / ADMIN_PASSWORD env vars, or falls back to defaults.
 */

import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as schema from '../api/lib/schema';
import { auth } from '../api/lib/auth';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@tnebasketball.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'TestAdmin123!';
const ADMIN_NAME = 'Admin User';

async function createAdmin() {
  console.log('🔐 Creating admin user...\n');

  // Check if user already exists
  const existing = await db
    .select()
    .from(schema.user)
    .where(eq(schema.user.email, ADMIN_EMAIL))
    .limit(1);

  if (existing.length > 0) {
    console.log(`  ⏭ User ${ADMIN_EMAIL} already exists (role: ${existing[0].role})`);

    // Ensure role is admin even if user existed
    if (existing[0].role !== 'admin') {
      await db
        .update(schema.user)
        .set({ role: 'admin' })
        .where(eq(schema.user.email, ADMIN_EMAIL));
      console.log(`  ✓ Updated role to admin`);
    }

    console.log('\n✅ Admin user ready.');
    return;
  }

  // Create user via Better Auth signup
  const result = await auth.api.signUpEmail({
    body: {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      name: ADMIN_NAME,
    },
  });

  if (!result) {
    throw new Error('Sign up returned no result');
  }

  console.log(`  ✓ Created user: ${ADMIN_EMAIL}`);

  // Update role to admin (role has input: false, so can't set during signup)
  await db
    .update(schema.user)
    .set({ role: 'admin' })
    .where(eq(schema.user.email, ADMIN_EMAIL));

  console.log(`  ✓ Set role to admin`);
  console.log('\n✅ Admin user created successfully.');
}

createAdmin().catch((err) => {
  console.error('Failed to create admin:', err);
  process.exit(1);
});
