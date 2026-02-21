/**
 * Seed Test Users Script
 *
 * Creates test user accounts for development and links them to existing data.
 * Run with: npx tsx scripts/seed-test-users.ts
 *
 * Prerequisites: Run db:seed first so coaches and parents records exist.
 */

import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as schema from '../api/lib/schema';
import { auth } from '../api/lib/auth';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

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
  // Check if user already exists
  const existing = await db
    .select()
    .from(schema.user)
    .where(eq(schema.user.email, testUser.email))
    .limit(1);

  if (existing.length > 0) {
    console.log(`  ⏭ ${testUser.email} already exists`);
    return existing[0].id;
  }

  // Create user via Better Auth signup
  const result = await auth.api.signUpEmail({
    body: {
      email: testUser.email,
      password: testUser.password,
      name: testUser.name,
      firstName: testUser.firstName,
      lastName: testUser.lastName,
    },
  });

  if (!result) {
    console.error(`  ✗ Failed to create ${testUser.email}`);
    return null;
  }

  console.log(`  ✓ Created ${testUser.email}`);

  // Update role if not parent (parent is the default)
  if (testUser.role !== 'parent') {
    await db
      .update(schema.user)
      .set({ role: testUser.role })
      .where(eq(schema.user.email, testUser.email));
    console.log(`    → Set role to ${testUser.role}`);
  }

  // Fetch the created user to return the id
  const [created] = await db
    .select()
    .from(schema.user)
    .where(eq(schema.user.email, testUser.email))
    .limit(1);

  return created?.id ?? null;
}

async function linkCoach(userId: string) {
  // Find first active coach without a profileId
  const [coach] = await db
    .select()
    .from(schema.coaches)
    .where(eq(schema.coaches.isActive, true))
    .limit(1);

  if (!coach) {
    console.log('    → No active coach record found to link');
    return;
  }

  await db
    .update(schema.coaches)
    .set({ profileId: userId })
    .where(eq(schema.coaches.id, coach.id));

  console.log(`    → Linked to coach: ${coach.firstName} ${coach.lastName}`);
}

async function linkParent(userId: string) {
  // Find first parent without a profileId
  const [parent] = await db
    .select()
    .from(schema.parents)
    .limit(1);

  if (!parent) {
    console.log('    → No parent record found to link');
    return;
  }

  await db
    .update(schema.parents)
    .set({ profileId: userId })
    .where(eq(schema.parents.id, parent.id));

  console.log(`    → Linked to parent: ${parent.firstName} ${parent.lastName}`);
}

async function seedTestUsers() {
  console.log('🌱 Seeding test user accounts...\n');

  for (const testUser of TEST_USERS) {
    console.log(`Creating ${testUser.role} user...`);
    const userId = await createUser(testUser);

    if (!userId) continue;

    // Link to role-specific records
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
