/**
 * Spring 2026 Tryout Sessions Seed Script
 *
 * Seeds the database with 5 tryout sessions for the Spring 2026 season.
 * Uses the existing active season from the database.
 *
 * Run with: npx tsx scripts/seed-spring-2026-tryouts.ts
 */

import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as schema from '../lib/schema';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function seed() {
  console.log('Seeding Spring 2026 tryout sessions...\n');

  // Find the active season
  const [activeSeason] = await db
    .select()
    .from(schema.seasons)
    .where(eq(schema.seasons.isActive, true))
    .limit(1);

  if (!activeSeason) {
    throw new Error('No active season found in database');
  }

  console.log(`Using season: ${activeSeason.name} (${activeSeason.id})`);

  // DB gender enum uses 'male'/'female', mapping from boys/girls
  const sessionsData = [
    {
      name: 'Boys Spring Tryouts',
      date: '2026-03-02',
      startTime: '18:00',
      endTime: '19:30',
      location: 'Monroe MS',
      gradeLevels: ['3rd', '4th'],
      gender: 'male' as const,
    },
    {
      name: 'Boys Spring Tryouts',
      date: '2026-03-03',
      startTime: '18:00',
      endTime: '19:30',
      location: 'Monroe MS',
      gradeLevels: ['5th'],
      gender: 'male' as const,
    },
    {
      name: 'Boys Spring Tryouts',
      date: '2026-03-03',
      startTime: '18:00',
      endTime: '19:30',
      location: 'McMillan MS',
      gradeLevels: ['6th'],
      gender: 'male' as const,
    },
    {
      name: 'Boys Spring Tryouts',
      date: '2026-03-04',
      startTime: '18:00',
      endTime: '19:30',
      location: 'North HS',
      gradeLevels: ['7th', '8th'],
      gender: 'male' as const,
    },
    {
      name: 'Girls Spring Tryouts',
      date: '2026-03-15',
      startTime: '15:00',
      endTime: '16:00',
      location: 'Girls Inc.',
      gradeLevels: ['3rd', '4th', '5th', '6th', '7th', '8th'],
      gender: 'female' as const,
    },
  ];

  for (const session of sessionsData) {
    const [inserted] = await db
      .insert(schema.tryoutSessions)
      .values({
        seasonId: activeSeason.id,
        ...session,
        isActive: true,
      })
      .returning();
    console.log(
      `  Inserted: ${inserted.name} on ${inserted.date} at ${inserted.location} (${inserted.id})`
    );
  }

  console.log(`\nDone! Inserted ${sessionsData.length} tryout sessions.`);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
