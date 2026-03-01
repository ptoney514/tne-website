/**
 * Summer 2026 Season Seed Script
 *
 * Seeds the dev database with Summer 2026 data including:
 * - 11 teams (3 programs: Jr 3SSB, TNE, Express United)
 * - 22 tournaments
 * - game_teams linkages with conflict/travel notes
 * - tournament_details with drive time estimates
 *
 * Requires the "2026 Summer" season to already exist in the database.
 *
 * Run with: npx tsx scripts/seed-summer-2026.ts
 */

import 'dotenv/config';
import { guardAgainstProduction } from './lib/db-guard';
guardAgainstProduction();
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as schema from '../lib/schema';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// ─── Team definitions ─────────────────────────────────────────────────
interface TeamDef {
  name: string;
  gradeLevel: string;
  program: 'jr3ssb' | 'tne' | 'express';
}

const teamDefs: TeamDef[] = [
  // TNE Jr 3SSB (grades 6-8)
  { name: 'TNE Jr 3SSB 6th', gradeLevel: '6', program: 'jr3ssb' },
  { name: 'TNE Jr 3SSB 7th', gradeLevel: '7', program: 'jr3ssb' },
  { name: 'TNE Jr 3SSB 8th', gradeLevel: '8', program: 'jr3ssb' },
  // TNE (grades 5-8)
  { name: 'TNE 5th', gradeLevel: '5', program: 'tne' },
  { name: 'TNE 6th', gradeLevel: '6', program: 'tne' },
  { name: 'TNE 7th', gradeLevel: '7', program: 'tne' },
  { name: 'TNE 8th', gradeLevel: '8', program: 'tne' },
  // Express United (grades 5-8)
  { name: 'Express United 5th', gradeLevel: '5', program: 'express' },
  { name: 'Express United 6th', gradeLevel: '6', program: 'express' },
  { name: 'Express United 7th', gradeLevel: '7', program: 'express' },
  { name: 'Express United 8th', gradeLevel: '8', program: 'express' },
];

// ─── Tournament definitions ───────────────────────────────────────────
interface TournamentDef {
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  address: string;
  driveTime: string;
  /** Which programs participate: key = program, value = optional notes per-team */
  programs: {
    jr3ssb?: string | null;
    tne?: string | null;
    express?: string | null;
  };
}

const tournamentDefs: TournamentDef[] = [
  {
    name: 'Regional Series I',
    startDate: '2026-03-21',
    endDate: '2026-03-22',
    location: 'Mishawaka, IN',
    address: 'Mishawaka Fieldhouse, Mishawaka, IN',
    driveTime: '8.5 hrs',
    programs: { jr3ssb: null },
  },
  {
    name: 'Recruit Looks (Omaha)',
    startDate: '2026-03-27',
    endDate: '2026-03-29',
    location: 'Omaha, NE',
    address: 'Omaha, NE',
    driveTime: 'Local',
    programs: { jr3ssb: null, tne: null },
  },
  {
    name: 'Recruit Looks (KC)',
    startDate: '2026-04-03',
    endDate: '2026-04-05',
    location: 'Kansas City, MO',
    address: 'Kansas City, MO',
    driveTime: '3 hrs',
    programs: { jr3ssb: null, tne: null },
  },
  {
    name: 'Spring Meltdown',
    startDate: '2026-04-10',
    endDate: '2026-04-12',
    location: 'Omaha/Council Bluffs',
    address: 'Omaha/Council Bluffs',
    driveTime: 'Local',
    programs: { tne: null, express: null },
  },
  {
    name: 'April Showdown',
    startDate: '2026-04-17',
    endDate: '2026-04-19',
    location: 'Council Bluffs, IA',
    address: 'Council Bluffs, IA',
    driveTime: '10 min',
    programs: { express: null },
  },
  {
    name: 'Regional Series II',
    startDate: '2026-04-18',
    endDate: '2026-04-19',
    location: 'Detroit, MI',
    address: 'Hype Athletics, Detroit, MI',
    driveTime: '11 hrs',
    programs: { jr3ssb: null },
  },
  {
    name: 'Never Walk On The Hardwood',
    startDate: '2026-04-24',
    endDate: '2026-04-26',
    location: 'Kansas City, MO',
    address: 'Hy-Vee Arena, Kansas City, MO',
    driveTime: '3 hrs',
    programs: {
      jr3ssb: 'Out of town with ETG',
      tne: 'Will be in CA with ETG',
    },
  },
  {
    name: 'MADE HOOPS Iowa Clash',
    startDate: '2026-05-08',
    endDate: '2026-05-10',
    location: 'Des Moines, IA',
    address: 'Des Moines, IA',
    driveTime: '2.5 hrs',
    programs: {
      jr3ssb: 'Alternative to Super Regional (May 9-10, Norman, OK)',
      tne: 'Alternative to Battle at the Lakes (May 8-10, Minneapolis, MN)',
    },
  },
  {
    name: 'Battle at the Lakes',
    startDate: '2026-05-08',
    endDate: '2026-05-10',
    location: 'Minneapolis, MN',
    address: 'Minneapolis, MN',
    driveTime: '6 hrs',
    programs: {
      tne: 'Alternative to MADE HOOPS Iowa Clash (May 8-10, Des Moines, IA)',
    },
  },
  {
    name: 'Summer Tip-Off',
    startDate: '2026-05-08',
    endDate: '2026-05-10',
    location: 'Omaha, NE',
    address: 'Omaha, NE',
    driveTime: 'Local',
    programs: { express: null },
  },
  {
    name: 'Super Regional',
    startDate: '2026-05-09',
    endDate: '2026-05-10',
    location: 'Norman, OK',
    address: 'Young Family Athletic Center, Norman, OK',
    driveTime: '6 hrs',
    programs: {
      jr3ssb: 'Alternative to MADE HOOPS Iowa Clash (May 8-10, Des Moines, IA)',
    },
  },
  {
    name: 'Midwest Mayhem',
    startDate: '2026-05-15',
    endDate: '2026-05-17',
    location: 'Lincoln, NE',
    address: 'Lincoln, NE',
    driveTime: '1 hr',
    programs: { express: null },
  },
  {
    name: 'Midwest Basketball Showcase',
    startDate: '2026-05-22',
    endDate: '2026-05-24',
    location: 'Omaha, NE',
    address: 'Omaha, NE',
    driveTime: 'Local',
    programs: { jr3ssb: null, tne: null },
  },
  {
    name: 'Recruit Looks Finale',
    startDate: '2026-05-29',
    endDate: '2026-05-31',
    location: 'St Louis, MO',
    address: 'St Louis, MO',
    driveTime: '6 hrs',
    programs: { tne: null },
  },
  {
    name: 'June Jam',
    startDate: '2026-05-29',
    endDate: '2026-05-31',
    location: 'Omaha, NE',
    address: 'Omaha, NE',
    driveTime: 'Local',
    programs: { express: null },
  },
  {
    name: 'Star City Classic',
    startDate: '2026-06-05',
    endDate: '2026-06-07',
    location: 'Lincoln, NE',
    address: 'Lincoln, NE',
    driveTime: '1 hr',
    programs: { express: null },
  },
  {
    name: 'Gym Rats Heat Up the Hardwood',
    startDate: '2026-06-13',
    endDate: '2026-06-14',
    location: 'Des Moines, IA',
    address: 'Des Moines, IA',
    driveTime: '2.5 hrs',
    programs: {
      jr3ssb: 'Or can play local and play up',
      tne: null,
    },
  },
  {
    name: 'Summer Shootout',
    startDate: '2026-06-19',
    endDate: '2026-06-21',
    location: 'Omaha, NE',
    address: 'Omaha, NE',
    driveTime: 'Local',
    programs: { tne: null, express: null },
  },
  {
    name: 'Jr 3SSB Nationals',
    startDate: '2026-06-26',
    endDate: '2026-06-28',
    location: 'Rock Hill, SC',
    address: 'Rock Hill Sports & Event Center, Rock Hill, SC',
    driveTime: '18 hrs',
    programs: { jr3ssb: null },
  },
  {
    name: 'River Cities',
    startDate: '2026-07-03',
    endDate: '2026-07-05',
    location: 'Omaha, NE',
    address: 'Omaha, NE',
    driveTime: 'Local',
    programs: { jr3ssb: null, tne: null, express: null },
  },
  {
    name: 'July Jam',
    startDate: '2026-07-17',
    endDate: '2026-07-19',
    location: 'Omaha, NE',
    address: 'Omaha, NE',
    driveTime: 'Local',
    programs: {
      jr3ssb: 'Will be in SC with ETG',
      tne: 'Will be in SC with ETG',
    },
  },
  {
    name: 'Nationals',
    startDate: '2026-07-30',
    endDate: '2026-08-02',
    location: 'Wichita, KS',
    address: 'Wichita, KS',
    driveTime: '5 hrs',
    programs: { jr3ssb: null, tne: null },
  },
];

async function seed() {
  console.log('🌱 Seeding Summer 2026 data...\n');

  // ─── 1. Find existing "2026 Summer" season ──────────────────────────
  console.log('Looking up 2026 Summer season...');
  const [season] = await db
    .select()
    .from(schema.seasons)
    .where(eq(schema.seasons.name, '2026 Summer'));

  if (!season) {
    console.error('❌ Season "2026 Summer" not found. Create it first.');
    process.exit(1);
  }
  console.log(`  ✓ Found season: ${season.name} (${season.id})`);

  // ─── 2. Insert 11 teams ─────────────────────────────────────────────
  console.log('Creating teams...');
  const teamMap: Record<string, string> = {}; // team name -> teamId
  const programTeams: Record<string, string[]> = {
    jr3ssb: [],
    tne: [],
    express: [],
  };

  for (const t of teamDefs) {
    try {
      const [team] = await db
        .insert(schema.teams)
        .values({
          seasonId: season.id,
          name: t.name,
          gradeLevel: t.gradeLevel,
          gender: 'male',
          isActive: true,
        })
        .returning();
      teamMap[t.name] = team.id;
      programTeams[t.program].push(team.id);
      console.log(`  ✓ Created team: ${t.name}`);
    } catch (err: any) {
      console.error(`  ✗ Failed to create team ${t.name}: ${err.message}`);
    }
  }
  console.log(`  ✓ ${Object.keys(teamMap).length} teams created\n`);

  // ─── 3. Insert 22 tournaments + tournament_details + game_teams ─────
  console.log('Creating tournaments...');
  let tournamentCount = 0;
  let gameTeamCount = 0;

  for (const t of tournamentDefs) {
    try {
      // Insert the game (tournament)
      const [game] = await db
        .insert(schema.games)
        .values({
          seasonId: season.id,
          gameType: 'tournament',
          name: t.name,
          date: t.startDate,
          endDate: t.endDate,
          location: t.location,
          address: t.address,
        })
        .returning();
      tournamentCount++;
      console.log(`  ✓ Created tournament: ${t.name} (${t.startDate} – ${t.endDate})`);

      // Insert tournament_details with drive time
      await db.insert(schema.tournamentDetails).values({
        gameId: game.id,
        driveTime: t.driveTime,
      });

      // Link teams via game_teams
      for (const [program, note] of Object.entries(t.programs)) {
        const teamIds = programTeams[program] ?? [];
        for (const teamId of teamIds) {
          try {
            await db.insert(schema.gameTeams).values({
              gameId: game.id,
              teamId,
              notes: note ?? undefined,
            });
            gameTeamCount++;
          } catch (linkErr: any) {
            console.error(`    ✗ Failed to link team ${teamId} to ${t.name}: ${linkErr.message}`);
          }
        }
      }
    } catch (err: any) {
      console.error(`  ✗ Failed to create tournament ${t.name}: ${err.message}`);
    }
  }

  console.log(`  ✓ ${tournamentCount} tournaments created`);
  console.log(`  ✓ ${gameTeamCount} game_teams linkages created`);

  // ─── Summary ────────────────────────────────────────────────────────
  console.log('\n✅ Summer 2026 seed completed successfully!');
  console.log(`
Summary:
- Season: ${season.name} (existing)
- ${Object.keys(teamMap).length} teams created
- ${tournamentCount} tournaments created
- ${gameTeamCount} game_teams linkages
`);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
