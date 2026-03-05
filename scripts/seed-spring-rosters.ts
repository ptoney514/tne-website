/**
 * Spring 2026 Roster Seed Script
 *
 * Seeds the dev database with 5 teams and 38 players for the spring season.
 * Uses the active season already in the database.
 *
 * Run with: npx tsx scripts/seed-spring-rosters.ts
 */

import 'dotenv/config';
import { guardAgainstProduction } from './lib/db-guard';
guardAgainstProduction();
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, and, desc } from 'drizzle-orm';
import * as schema from '../lib/schema';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// Grade -> graduating year (2025-2026 school year)
const GRADE_GRADUATING_YEAR: Record<number, number> = {
  4: 2034,
  5: 2033,
  6: 2032,
};

interface TeamRoster {
  name: string;
  grade: number;
  players: string[]; // "FirstName LastName"
}

const ROSTERS: TeamRoster[] = [
  {
    name: 'Express United 4th',
    grade: 4,
    players: ['Landon Southerland'],
  },
  {
    name: 'Express United 5th',
    grade: 5,
    players: [
      'Charlie Butler',
      'Kingston Mallory',
      'Massiah Harbour',
      'Cayden Branch-Grixby',
      'Cameron Hunter',
      'Kaden Simms',
      'Aaron Evans',
    ],
  },
  {
    name: 'TNE Jr 3SSB 5th',
    grade: 5,
    players: [
      'Anthony McNair',
      'Beckett Parker',
      'James Clarkson',
      'Javari Stramel',
      'Jax Nichols',
      "J'Sieon Jilg-Brown",
      'Karmine Scott',
      'Kenyon Jackson',
      'Tucker Adams',
    ],
  },
  {
    name: 'Express United 6th',
    grade: 6,
    players: [
      'Joey Dix',
      'Reid Johnson',
      'LJ Gaines',
      'Malachi Atkins',
      'Zyaire Brown',
      'Kevin Lewis',
      'Carter Matthias',
      'Shalamar Drake',
      'Jakaien Stramel',
      'Khaden Pierce',
      'Jordan Wubbels',
    ],
  },
  {
    name: 'TNE Jr 3ssb 6th',
    grade: 6,
    players: [
      'Ryan Wood',
      'Kyrin Haynes',
      'David Brown',
      "Zy'Air Branch-Grixby",
      "A'sire Brown",
      'Giorgio Houston Jr',
      'Kristopher Kuhn II',
      'Jacob Knave',
      "Da'Moni Cheeks",
      'Lincoln Lisko',
    ],
  },
];

function parseName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(' ');
  const firstName = parts[0];
  const lastName = parts.slice(1).join(' ');
  return { firstName, lastName };
}

async function seed() {
  console.log('Seeding spring rosters...\n');

  // 1. Find active season
  const [season] = await db
    .select()
    .from(schema.seasons)
    .where(eq(schema.seasons.isActive, true))
    .limit(1);

  if (!season) {
    // Fallback: most recent season
    const [latest] = await db
      .select()
      .from(schema.seasons)
      .orderBy(desc(schema.seasons.createdAt))
      .limit(1);
    if (!latest) {
      console.error('No seasons found in database. Create a season first.');
      process.exit(1);
    }
    console.log(`No active season found. Using most recent: ${latest.name}`);
    Object.assign(season ?? {}, latest);
  }

  console.log(`Using season: ${season!.name} (${season!.id})\n`);

  let teamsCreated = 0;
  let teamsFound = 0;
  let playersCreated = 0;
  let rosterEntriesCreated = 0;

  for (const roster of ROSTERS) {
    // 2. Upsert team - check if exists by name + season
    let teamId: string;

    const [existingTeam] = await db
      .select()
      .from(schema.teams)
      .where(
        and(
          eq(schema.teams.name, roster.name),
          eq(schema.teams.seasonId, season!.id)
        )
      )
      .limit(1);

    if (existingTeam) {
      teamId = existingTeam.id;
      teamsFound++;
      console.log(`Found existing team: ${roster.name}`);
    } else {
      const [newTeam] = await db
        .insert(schema.teams)
        .values({
          seasonId: season!.id,
          name: roster.name,
          gradeLevel: String(roster.grade),
          gender: 'male',
          isActive: true,
        })
        .returning();
      teamId = newTeam.id;
      teamsCreated++;
      console.log(`Created team: ${roster.name}`);
    }

    // 3. Insert players and roster entries
    for (const playerName of roster.players) {
      const { firstName, lastName } = parseName(playerName);
      const graduatingYear = GRADE_GRADUATING_YEAR[roster.grade];

      const [player] = await db
        .insert(schema.players)
        .values({
          firstName,
          lastName,
          currentGrade: String(roster.grade),
          graduatingYear,
          gender: 'male',
        })
        .returning();
      playersCreated++;

      await db
        .insert(schema.teamRoster)
        .values({
          teamId,
          playerId: player.id,
          isActive: true,
        })
        .onConflictDoNothing();
      rosterEntriesCreated++;

      console.log(`  + ${firstName} ${lastName}`);
    }
  }

  console.log(`
Done!

Summary:
- Teams created: ${teamsCreated}
- Teams found (existing): ${teamsFound}
- Players created: ${playersCreated}
- Roster entries created: ${rosterEntriesCreated}
`);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
