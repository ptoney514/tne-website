/**
 * Winter 2025 Season Seed Script
 *
 * Seeds the database with Winter 2025 season data including:
 * - Season record
 * - 7 coaches
 * - 9 teams
 * - 77 players (from rosters.json)
 * - Roster assignments linking players to teams
 *
 * Run with: npx tsx scripts/seed-winter-2025.ts
 */

import 'dotenv/config';
import { guardAgainstProduction } from './lib/db-guard';
guardAgainstProduction();
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as schema from '../lib/schema';

// Load roster data
import rostersData from '../data/json/rosters.json' assert { type: 'json' };

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// Map grade string (e.g. "4th") to numeric string and placeholder DOB
const GRADE_CONFIG: Record<string, { gradeNum: string; dob: string }> = {
  '4th': { gradeNum: '4', dob: '2013-01-01' },
  '5th': { gradeNum: '5', dob: '2012-01-01' },
  '6th': { gradeNum: '6', dob: '2011-01-01' },
  '7th': { gradeNum: '7', dob: '2010-01-01' },
  '8th': { gradeNum: '8', dob: '2009-01-01' },
};

// Map team_id from rosters.json to team name used in the teams table
const TEAM_ID_TO_NAME: Record<string, string> = {
  'express-united-4th-foster': 'Express United 4th - Foster',
  'express-united-4th-grixbyevans': 'Express United 4th - Grixby/Evans',
  'express-united-5th-perry': 'Express United 5th - Perry',
  'express-united-6th-todd': 'Express United 6th - Todd',
  'express-united-6th-scott': 'Express United 6th - Scott',
  'express-united-7th': 'Express United 7th',
  'express-united-7th-mitchell': 'Express United 7th - Mitchell',
  'express-united-8th': 'Express United 8th',
  'express-united-8th-mitchell': 'Express United 8th - Mitchell',
};

async function seed() {
  console.log('🌱 Seeding Winter 2025 data...\n');

  // ─── 1. Deactivate all existing seasons ────────────────────────────
  console.log('Deactivating old seasons...');
  await db
    .update(schema.seasons)
    .set({ isActive: false });
  console.log('  ✓ All existing seasons deactivated');

  // ─── 2. Insert Winter 2025 season ──────────────────────────────────
  console.log('Creating Winter 2025 season...');
  const [season] = await db
    .insert(schema.seasons)
    .values({
      name: 'Winter 2025',
      startDate: '2025-01-01',
      endDate: '2025-05-31',
      isActive: true,
      tryoutsOpen: false,
    })
    .returning();
  console.log(`  ✓ Created season: ${season.name} (${season.id})`);

  // ─── 3. Upsert coaches ────────────────────────────────────────────
  console.log('Creating coaches...');
  const coachData = [
    { firstName: 'Coach', lastName: 'Foster', email: 'foster@tneexpress.com' },
    { firstName: 'Coach', lastName: 'Grixby', email: 'grixby@tneexpress.com' },
    { firstName: 'Coach', lastName: 'Evans', email: 'evans@tneexpress.com' },
    { firstName: 'Coach', lastName: 'Perry', email: 'perry@tneexpress.com' },
    { firstName: 'Coach', lastName: 'Todd', email: 'todd@tneexpress.com' },
    { firstName: 'Coach', lastName: 'Scott', email: 'scott@tneexpress.com' },
    { firstName: 'Alvin', lastName: 'Mitchell', email: 'amitch2am@gmail.com' },
  ];

  const coachMap: Record<string, string> = {}; // lastName -> coachId

  for (const c of coachData) {
    try {
      const [coach] = await db
        .insert(schema.coaches)
        .values({
          firstName: c.firstName,
          lastName: c.lastName,
          email: c.email,
          isActive: true,
        })
        .onConflictDoNothing()
        .returning();

      if (coach) {
        coachMap[c.lastName] = coach.id;
        console.log(`  ✓ Created coach: ${c.firstName} ${c.lastName}`);
      } else {
        // Coach already exists, look them up by email
        const [existing] = await db
          .select()
          .from(schema.coaches)
          .where(eq(schema.coaches.email, c.email));
        if (existing) {
          coachMap[c.lastName] = existing.id;
          console.log(`  ⏭ Coach already exists: ${c.firstName} ${c.lastName}`);
        }
      }
    } catch (err) {
      // If onConflictDoNothing is not supported on this table (no unique constraint on email),
      // try a simple insert and handle duplicate errors
      console.log(`  ⚠ Could not insert coach ${c.lastName}, looking up existing...`);
      const [existing] = await db
        .select()
        .from(schema.coaches)
        .where(eq(schema.coaches.email, c.email!));
      if (existing) {
        coachMap[c.lastName] = existing.id;
        console.log(`  ⏭ Found existing coach: ${c.firstName} ${c.lastName}`);
      }
    }
  }
  console.log(`  ✓ ${Object.keys(coachMap).length} coaches ready`);

  // ─── 4. Insert teams ──────────────────────────────────────────────
  console.log('Creating teams...');

  interface TeamDef {
    name: string;
    gradeLevel: string;
    gender: 'male' | 'female';
    headCoachLastName: string | null;
    assistantCoachLastName: string | null;
    practiceLocation: string;
    practiceDays: string;
    practiceTime: string;
    teamFee: string;
    uniformFee: string;
  }

  const teamDefs: TeamDef[] = [
    {
      name: 'Express United 4th - Foster',
      gradeLevel: '4',
      gender: 'male',
      headCoachLastName: 'Foster',
      assistantCoachLastName: null,
      practiceLocation: 'Monroe MS',
      practiceDays: 'Mon/Wed',
      practiceTime: '6:00-7:30 PM',
      teamFee: '650.00',
      uniformFee: '150.00',
    },
    {
      name: 'Express United 4th - Grixby/Evans',
      gradeLevel: '4',
      gender: 'male',
      headCoachLastName: 'Grixby',
      assistantCoachLastName: 'Evans',
      practiceLocation: 'Northwest HS',
      practiceDays: 'Tue/Thu',
      practiceTime: '6:00-8:00 PM',
      teamFee: '650.00',
      uniformFee: '150.00',
    },
    {
      name: 'Express United 5th - Perry',
      gradeLevel: '5',
      gender: 'male',
      headCoachLastName: 'Perry',
      assistantCoachLastName: null,
      practiceLocation: 'Northwest HS',
      practiceDays: 'Tue/Thu',
      practiceTime: '6:00-8:00 PM',
      teamFee: '650.00',
      uniformFee: '150.00',
    },
    {
      name: 'Express United 6th - Todd',
      gradeLevel: '6',
      gender: 'male',
      headCoachLastName: 'Todd',
      assistantCoachLastName: null,
      practiceLocation: 'Tue McMillan MS / Wed Monroe MS',
      practiceDays: 'Tue/Wed',
      practiceTime: '6:00-7:30 PM',
      teamFee: '650.00',
      uniformFee: '150.00',
    },
    {
      name: 'Express United 6th - Scott',
      gradeLevel: '6',
      gender: 'male',
      headCoachLastName: 'Scott',
      assistantCoachLastName: null,
      practiceLocation: 'Tue McMillan MS / Wed Central HS',
      practiceDays: 'Tue/Wed',
      practiceTime: '6:00-7:30 PM',
      teamFee: '650.00',
      uniformFee: '150.00',
    },
    {
      name: 'Express United 7th',
      gradeLevel: '7',
      gender: 'male',
      headCoachLastName: null,
      assistantCoachLastName: null,
      practiceLocation: 'Central HS',
      practiceDays: 'Mon/Wed',
      practiceTime: '6:00-8:00 PM',
      teamFee: '650.00',
      uniformFee: '150.00',
    },
    {
      name: 'Express United 7th - Mitchell',
      gradeLevel: '7',
      gender: 'male',
      headCoachLastName: 'Mitchell',
      assistantCoachLastName: null,
      practiceLocation: 'Central HS',
      practiceDays: 'Mon/Wed',
      practiceTime: '6:00-8:00 PM',
      teamFee: '650.00',
      uniformFee: '150.00',
    },
    {
      name: 'Express United 8th',
      gradeLevel: '8',
      gender: 'male',
      headCoachLastName: null,
      assistantCoachLastName: null,
      practiceLocation: 'Central HS',
      practiceDays: 'Mon/Wed',
      practiceTime: '6:00-8:00 PM',
      teamFee: '650.00',
      uniformFee: '150.00',
    },
    {
      name: 'Express United 8th - Mitchell',
      gradeLevel: '8',
      gender: 'male',
      headCoachLastName: 'Mitchell',
      assistantCoachLastName: null,
      practiceLocation: 'Central HS',
      practiceDays: 'Mon/Wed',
      practiceTime: '6:00-8:00 PM',
      teamFee: '650.00',
      uniformFee: '150.00',
    },
  ];

  const teamMap: Record<string, string> = {}; // team name -> teamId

  for (const t of teamDefs) {
    try {
      const [team] = await db
        .insert(schema.teams)
        .values({
          seasonId: season.id,
          name: t.name,
          gradeLevel: t.gradeLevel,
          gender: t.gender,
          headCoachId: t.headCoachLastName ? coachMap[t.headCoachLastName] ?? null : null,
          assistantCoachId: t.assistantCoachLastName ? coachMap[t.assistantCoachLastName] ?? null : null,
          practiceLocation: t.practiceLocation,
          practiceDays: t.practiceDays,
          practiceTime: t.practiceTime,
          teamFee: t.teamFee,
          uniformFee: t.uniformFee,
          isActive: true,
        })
        .returning();
      teamMap[t.name] = team.id;
      console.log(`  ✓ Created team: ${t.name}`);
    } catch (err: any) {
      console.error(`  ✗ Failed to create team ${t.name}: ${err.message}`);
    }
  }
  console.log(`  ✓ ${Object.keys(teamMap).length} teams created`);

  // ─── 5. Insert players and roster entries ─────────────────────────
  console.log('Creating players and roster entries...');
  let playerCount = 0;
  let rosterCount = 0;

  for (const roster of rostersData.rosters) {
    const teamName = TEAM_ID_TO_NAME[roster.team_id];
    const teamId = teamName ? teamMap[teamName] : undefined;

    if (!teamId) {
      console.error(`  ✗ No team found for roster team_id: ${roster.team_id}`);
      continue;
    }

    for (const p of roster.players) {
      const gradeConfig = GRADE_CONFIG[p.grade];
      if (!gradeConfig) {
        console.error(`  ✗ Unknown grade "${p.grade}" for player ${p.first_name} ${p.last_name}`);
        continue;
      }

      try {
        // Insert the player
        const [player] = await db
          .insert(schema.players)
          .values({
            firstName: p.first_name,
            lastName: p.last_name,
            dateOfBirth: gradeConfig.dob,
            graduatingYear: p.graduating_year,
            currentGrade: gradeConfig.gradeNum,
            gender: 'male',
          })
          .returning();
        playerCount++;

        // Insert roster entry linking player to team
        try {
          await db.insert(schema.teamRoster).values({
            teamId: teamId,
            playerId: player.id,
            joinedDate: '2025-01-01',
            isActive: true,
          });
          rosterCount++;
        } catch (rosterErr: any) {
          console.error(`  ✗ Roster entry failed for ${p.first_name} ${p.last_name}: ${rosterErr.message}`);
        }
      } catch (playerErr: any) {
        console.error(`  ✗ Player insert failed for ${p.first_name} ${p.last_name}: ${playerErr.message}`);
      }
    }
  }

  console.log(`  ✓ Created ${playerCount} players`);
  console.log(`  ✓ Created ${rosterCount} roster entries`);

  // ─── Summary ──────────────────────────────────────────────────────
  console.log('\n✅ Winter 2025 seed completed successfully!');
  console.log(`
Summary:
- 1 season (Winter 2025)
- ${Object.keys(coachMap).length} coaches
- ${Object.keys(teamMap).length} teams
- ${playerCount} players
- ${rosterCount} roster entries
`);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
