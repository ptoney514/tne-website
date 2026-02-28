/**
 * Seed Test Users Script
 *
 * Creates test user accounts for development and links them to existing data.
 * Run with: npx tsx scripts/seed-test-users.ts
 *
 * Prerequisites: Run db:seed first so coaches and parents records exist.
 * Creates users via Neon Auth HTTP API (scripts run outside Next.js context).
 */

import 'dotenv/config';
import { guardAgainstProduction } from './lib/db-guard';
guardAgainstProduction();
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import { userProfiles } from '../lib/schema/userProfiles';
import { coaches } from '../lib/schema/coaches';
import { parents } from '../lib/schema/parents';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const NEON_AUTH_BASE_URL = process.env.NEON_AUTH_BASE_URL!;

interface TestUser {
  email: string;
  password: string;
  name: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'coach' | 'parent';
}

const TEST_USERS: TestUser[] = [
  {
    email: 'admin@tnebasketball.com',
    password: 'TestAdmin123!',
    name: 'Admin User',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
  },
  {
    email: 'coach@tnebasketball.com',
    password: 'TestCoach123!',
    name: 'Coach User',
    firstName: 'Coach',
    lastName: 'User',
    role: 'coach',
  },
  {
    email: 'parent@tnebasketball.com',
    password: 'TestParent123!',
    name: 'Parent User',
    firstName: 'Parent',
    lastName: 'User',
    role: 'parent',
  },
];

async function createUser(testUser: TestUser): Promise<string | null> {
  // Create user via Neon Auth HTTP API
  const signUpUrl = `${NEON_AUTH_BASE_URL}/sign-up/email`;
  const response = await fetch(signUpUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': NEON_AUTH_BASE_URL,
    },
    body: JSON.stringify({
      email: testUser.email,
      password: testUser.password,
      name: testUser.name,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    // User may already exist — check for conflict
    if (response.status === 422 || response.status === 409 || body.includes('already exists')) {
      console.log(`  ⏭ ${testUser.email} already exists`);
      // Try to find existing profile
      const [existing] = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.id, testUser.email)); // fallback
      return existing?.id ?? null;
    }
    console.error(`  ✗ Failed to create ${testUser.email}: ${body}`);
    return null;
  }

  const result = await response.json();
  const userId = result.user?.id;

  if (!userId) {
    console.error(`  ✗ No user ID returned for ${testUser.email}`);
    return null;
  }

  console.log(`  ✓ Created ${testUser.email}`);

  // Create user_profiles row
  await db
    .insert(userProfiles)
    .values({
      id: userId,
      firstName: testUser.firstName,
      lastName: testUser.lastName,
      role: testUser.role,
    })
    .onConflictDoUpdate({
      target: userProfiles.id,
      set: {
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        role: testUser.role,
        updatedAt: new Date(),
      },
    });

  console.log(`    → Set role to ${testUser.role}`);

  return userId;
}

async function linkCoach(userId: string) {
  const [coach] = await db
    .select()
    .from(coaches)
    .where(eq(coaches.isActive, true))
    .limit(1);

  if (!coach) {
    console.log('    → No active coach record found to link');
    return;
  }

  await db
    .update(coaches)
    .set({ profileId: userId })
    .where(eq(coaches.id, coach.id));

  console.log(`    → Linked to coach: ${coach.firstName} ${coach.lastName}`);
}

async function linkParent(userId: string) {
  const [parent] = await db
    .select()
    .from(parents)
    .limit(1);

  if (!parent) {
    console.log('    → No parent record found to link');
    return;
  }

  await db
    .update(parents)
    .set({ profileId: userId })
    .where(eq(parents.id, parent.id));

  console.log(`    → Linked to parent: ${parent.firstName} ${parent.lastName}`);
}

async function seedTestUsers() {
  console.log('🌱 Seeding test user accounts...\n');

  for (const testUser of TEST_USERS) {
    console.log(`Creating ${testUser.role} user...`);
    const userId = await createUser(testUser);

    if (!userId) continue;

    if (testUser.role === 'coach') {
      await linkCoach(userId);
    } else if (testUser.role === 'parent') {
      await linkParent(userId);
    }

    console.log('');
  }

  console.log('✅ Test user seeding completed!');
  console.log(`
Summary:
- admin@tnebasketball.com  / TestAdmin123!  (role: admin)
- coach@tnebasketball.com  / TestCoach123!  (role: coach)
- parent@tnebasketball.com / TestParent123! (role: parent)
`);
}

seedTestUsers().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
