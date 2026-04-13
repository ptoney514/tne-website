/**
 * Girls Summer 2026 Seed Script
 *
 * Seeds the database with girls basketball program data:
 * - 5 coaches (Mike, Shanique, Eric, Nicole, Latrell)
 * - 5 teams (Express United 4th-8th, gender: female)
 * - 48 unique players across 51 roster slots (3 shared players)
 * - 9 tournaments with game_teams linkages
 * - 4 practice sessions with team assignments
 *
 * Requires the "2026 Summer" season to already exist in the database.
 *
 * Run with:
 *   npx tsx scripts/seed-girls-summer-2026.ts          # dev (default)
 *   CONFIRM_PRODUCTION=true npx tsx scripts/seed-girls-summer-2026.ts  # prod
 */

import 'dotenv/config';

// Production safety check — requires explicit opt-in
const databaseUrl = process.env.DATABASE_URL ?? '';
const productionEndpoint = process.env.NEON_PRODUCTION_ENDPOINT ?? '';
const isProduction = productionEndpoint && databaseUrl.includes(productionEndpoint);

if (isProduction && process.env.CONFIRM_PRODUCTION !== 'true') {
  console.error(
    '\n\u{1F6D1} ABORT: DATABASE_URL points to the PRODUCTION database.\n' +
      '   To run against production, set CONFIRM_PRODUCTION=true:\n\n' +
      '   CONFIRM_PRODUCTION=true npx tsx scripts/seed-girls-summer-2026.ts\n'
  );
  process.exit(1);
}

if (isProduction) {
  console.log('\n\u26A0\uFE0F  PRODUCTION MODE \u2014 writing to production database');
  console.log(`   Endpoint: ...${productionEndpoint}\n`);
}

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as schema from '../lib/schema';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// ─── Grade -> graduating year (2025-2026 school year) ────────────────
const GRADE_GRADUATING_YEAR: Record<number, number> = {
  4: 2034,
  5: 2033,
  6: 2032,
  7: 2031,
  8: 2030,
};

// ─── Coach definitions ───────────────────────────────────────────────
interface CoachDef {
  key: string;
  firstName: string;
  lastName: string;
}

const coachDefs: CoachDef[] = [
  { key: 'mike', firstName: 'Mike', lastName: '' },
  { key: 'shanique', firstName: 'Shanique', lastName: '' },
  { key: 'eric', firstName: 'Eric', lastName: '' },
  { key: 'nicole', firstName: 'Nicole', lastName: '' },
  { key: 'latrell', firstName: 'Latrell', lastName: '' },
];

// ─── Team definitions ────────────────────────────────────────────────
interface TeamDef {
  name: string;
  gradeLevel: string;
  headCoachKey: string | null;
  assistantCoachKey: string | null;
  players: string[]; // "FirstName LastName"
}

const teamDefs: TeamDef[] = [
  {
    name: 'Express United 4th',
    gradeLevel: '4',
    headCoachKey: 'mike',
    assistantCoachKey: null,
    players: [
      'Laya Brice',
      'London Jones',
      'Lauren Knowles',
      'Alexis Williams',
      'Ivy Schlickbernd',
      'Marlee Adams',
      'Mereville Ndelo',
      'Lleya Wiggins',
    ],
  },
  {
    name: 'Express United 5th',
    gradeLevel: '5',
    headCoachKey: null, // Coach TBD
    assistantCoachKey: null,
    players: [
      'Avery Jensen',
      'Cecilia Garden',
      'Eva Allen',
      'Grace Ndelo',
      'Jenesis Jackson',
      'Kamden Wells',
      'Maggie Mendenhall',
      'Nora Burke',
      'Rhonda Madhavem',
      'Violet Dahlke',
    ],
  },
  {
    name: 'Express United 6th',
    gradeLevel: '6',
    headCoachKey: 'shanique',
    assistantCoachKey: null,
    players: [
      'Brinley Vader',
      'Caliyah Legon',
      'Emma Wulf',
      'Norah Colling',
      'Siri Dey',
      'Dniya Lloyd',
      'Lizzy Wiggins',
      'Lauren Collin',
      'Sydney Samuel',
      'Maya Schlickbernd',
      'Kamden Wells', // Also on 5th grade team
    ],
  },
  {
    name: 'Express United 7th',
    gradeLevel: '7',
    headCoachKey: 'eric',
    assistantCoachKey: null,
    players: [
      'Aria Latham',
      'Ionnah Gordon',
      'Jada Hartzell',
      'Jariel Pittman',
      'Jiyah Adams',
      'Kaniyah Ezell',
      'Mari Cook',
      'Mya Phillips',
      'Mya Price',
      'Nyshae Hall',
      'Tayla Brown',
      'Zoe Harris',
      'DeVahea Lee',
    ],
  },
  {
    name: 'Express United 8th',
    gradeLevel: '8',
    headCoachKey: 'nicole',
    assistantCoachKey: 'latrell',
    players: [
      'Kamari Carter',
      'Aleila Green',
      'Laila Starks',
      'Maya Smith',
      'Demetria Johnson',
      'Morgan Roper',
      'Reagan Griffin',
      'Jiyah Adams', // Also on 7th grade team
      'Mari Cook', // Also on 7th grade team
    ],
  },
];

// ─── Tournament definitions ─────────────────────────────────────────
interface TournamentDef {
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  address: string;
  driveTime: string;
  teamIndices: number[]; // indices into teamDefs
}

const tournamentDefs: TournamentDef[] = [
  {
    name: 'April Showdown',
    startDate: '2026-04-17',
    endDate: '2026-04-19',
    location: 'Council Bluffs, IA',
    address: 'Council Bluffs, IA',
    driveTime: '10 min',
    teamIndices: [1], // 5th
  },
  {
    name: 'Big Time Hoops',
    startDate: '2026-04-24',
    endDate: '2026-04-26',
    location: 'Omaha, NE',
    address: 'Omaha, NE',
    driveTime: 'Local',
    teamIndices: [0, 2, 3, 4], // 4th, 6th, 7th, 8th
  },
  {
    name: 'Spring Tune Up',
    startDate: '2026-05-01',
    endDate: '2026-05-03',
    location: 'Lincoln, NE',
    address: 'Lincoln, NE',
    driveTime: '1 hr',
    teamIndices: [1], // 5th
  },
  {
    name: 'Summer Tip-Off',
    startDate: '2026-05-08',
    endDate: '2026-05-10',
    location: 'Omaha, NE',
    address: 'Omaha, NE',
    driveTime: 'Local',
    teamIndices: [0, 1, 2, 3, 4], // all teams
  },
  {
    name: 'Heart of Texas',
    startDate: '2026-05-14',
    endDate: '2026-05-17',
    location: 'Dallas, TX',
    address: 'Dallas, TX',
    driveTime: '9 hrs',
    teamIndices: [3, 4], // 7th, 8th
  },
  {
    name: 'Midwest Basketball Showcase',
    startDate: '2026-05-22',
    endDate: '2026-05-24',
    location: 'Omaha, NE',
    address: 'Omaha, NE',
    driveTime: 'Local',
    teamIndices: [0, 2, 3, 4], // 4th, 6th, 7th, 8th
  },
  {
    name: 'June Jam',
    startDate: '2026-05-29',
    endDate: '2026-05-31',
    location: 'Omaha, NE',
    address: 'Omaha, NE',
    driveTime: 'Local',
    teamIndices: [0, 1, 2], // 4th, 5th, 6th
  },
  {
    name: 'Battle of the Border',
    startDate: '2026-06-06',
    endDate: '2026-06-07',
    location: 'Kansas City, MO',
    address: 'Kansas City, MO',
    driveTime: '3 hrs',
    teamIndices: [3, 4], // 7th, 8th
  },
  {
    name: 'Summer Jam',
    startDate: '2026-06-12',
    endDate: '2026-06-14',
    location: 'Lincoln, NE',
    address: 'Lincoln, NE',
    driveTime: '1 hr',
    teamIndices: [1, 2], // 5th, 6th
  },
];

// ─── Practice session definitions ────────────────────────────────────
interface PracticeSessionDef {
  dayOfWeek: 'Monday' | 'Tuesday' | 'Thursday';
  startTime: string;
  endTime: string;
  location: string;
  notes: string;
  teamIndices: number[];
}

const practiceSessionDefs: PracticeSessionDef[] = [
  {
    dayOfWeek: 'Monday',
    startTime: '18:30:00',
    endTime: '20:00:00',
    location: 'North High School',
    notes: '4th/8th Skill Development',
    teamIndices: [0, 4], // 4th, 8th
  },
  {
    dayOfWeek: 'Tuesday',
    startTime: '18:30:00',
    endTime: '20:30:00',
    location: 'Central HS',
    notes: '7th/8th Practice',
    teamIndices: [3, 4], // 7th, 8th
  },
  {
    dayOfWeek: 'Tuesday',
    startTime: '18:30:00',
    endTime: '20:00:00',
    location: 'North High School',
    notes: '4th/6th Practice',
    teamIndices: [0, 2], // 4th, 6th
  },
  {
    dayOfWeek: 'Thursday',
    startTime: '18:30:00',
    endTime: '20:30:00',
    location: 'Central HS',
    notes: '4th/8th Practice',
    teamIndices: [0, 4], // 4th, 8th
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────

function parseName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(' ');
  const firstName = parts[0];
  const lastName = parts.slice(1).join(' ');
  return { firstName, lastName };
}

function playerKey(firstName: string, lastName: string): string {
  return `${firstName.toLowerCase()}|${lastName.toLowerCase()}`;
}

// ─── Main seed function ──────────────────────────────────────────────

async function seed() {
  console.log('\u{1F331} Seeding Girls Summer 2026 data...\n');

  // ─── 1. Find existing "2026 Summer" season ────────────────────────
  console.log('Step 1: Looking up 2026 Summer season...');
  const [season] = await db
    .select()
    .from(schema.seasons)
    .where(eq(schema.seasons.name, '2026 Summer'));

  if (!season) {
    console.error('\u274C Season "2026 Summer" not found. Create it first.');
    process.exit(1);
  }
  console.log(`  \u2713 Found season: ${season.name} (${season.id})\n`);

  // ─── 2. Insert coaches ────────────────────────────────────────────
  console.log('Step 2: Creating coaches...');
  const coachMap: Record<string, string> = {}; // key -> coachId

  for (const c of coachDefs) {
    try {
      const [coach] = await db
        .insert(schema.coaches)
        .values({
          firstName: c.firstName,
          lastName: c.lastName,
          isActive: true,
        })
        .returning();
      coachMap[c.key] = coach.id;
      console.log(`  \u2713 Created coach: ${c.firstName}`);
    } catch (err: any) {
      console.error(`  \u2717 Failed to create coach ${c.firstName}: ${err.message}`);
    }
  }
  console.log(`  \u2713 ${Object.keys(coachMap).length} coaches created\n`);

  // ─── 3. Insert teams ─────────────────────────────────────────────
  console.log('Step 3: Creating girls teams...');
  const teamIds: string[] = [];

  for (const t of teamDefs) {
    try {
      const [team] = await db
        .insert(schema.teams)
        .values({
          seasonId: season.id,
          name: t.name,
          gradeLevel: t.gradeLevel,
          gender: 'female',
          headCoachId: t.headCoachKey ? coachMap[t.headCoachKey] ?? null : null,
          assistantCoachId: t.assistantCoachKey ? coachMap[t.assistantCoachKey] ?? null : null,
          teamFee: '450.00',
          isActive: true,
        })
        .returning();
      teamIds.push(team.id);
      console.log(`  \u2713 Created team: ${t.name} (grade ${t.gradeLevel})`);
    } catch (err: any) {
      console.error(`  \u2717 Failed to create team ${t.name}: ${err.message}`);
      teamIds.push(''); // placeholder to keep indices aligned
    }
  }
  console.log(`  \u2713 ${teamIds.filter(Boolean).length} teams created\n`);

  // ─── 4. Insert players and roster entries ─────────────────────────
  console.log('Step 4: Creating players and roster entries...');
  const playerMap = new Map<string, string>(); // "first|last" -> playerId
  let playersCreated = 0;
  let rosterEntriesCreated = 0;

  for (let i = 0; i < teamDefs.length; i++) {
    const t = teamDefs[i];
    const teamId = teamIds[i];
    if (!teamId) continue;

    const grade = parseInt(t.gradeLevel);
    const graduatingYear = GRADE_GRADUATING_YEAR[grade];

    console.log(`  ${t.name}:`);

    for (const playerName of t.players) {
      const { firstName, lastName } = parseName(playerName);
      const key = playerKey(firstName, lastName);

      let playerId = playerMap.get(key);

      if (!playerId) {
        // Create new player
        try {
          const [player] = await db
            .insert(schema.players)
            .values({
              firstName,
              lastName,
              currentGrade: String(grade),
              graduatingYear,
              gender: 'female',
            })
            .returning();
          playerId = player.id;
          playerMap.set(key, playerId);
          playersCreated++;
          console.log(`    + ${firstName} ${lastName}`);
        } catch (err: any) {
          console.error(`    \u2717 Failed to create player ${playerName}: ${err.message}`);
          continue;
        }
      } else {
        console.log(`    ~ ${firstName} ${lastName} (shared from another team)`);
      }

      // Create roster entry
      try {
        await db
          .insert(schema.teamRoster)
          .values({
            teamId,
            playerId,
            isActive: true,
          })
          .onConflictDoNothing();
        rosterEntriesCreated++;
      } catch (err: any) {
        console.error(`    \u2717 Failed to add ${playerName} to roster: ${err.message}`);
      }
    }
  }
  console.log(`  \u2713 ${playersCreated} players created`);
  console.log(`  \u2713 ${rosterEntriesCreated} roster entries created\n`);

  // ─── 5. Insert tournaments ────────────────────────────────────────
  console.log('Step 5: Creating tournaments...');
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
      console.log(`  \u2713 ${t.name} (${t.startDate} \u2013 ${t.endDate})`);

      // Insert tournament_details with drive time
      await db.insert(schema.tournamentDetails).values({
        gameId: game.id,
        driveTime: t.driveTime,
      });

      // Link teams via game_teams
      for (const teamIdx of t.teamIndices) {
        const teamId = teamIds[teamIdx];
        if (!teamId) continue;
        try {
          await db.insert(schema.gameTeams).values({
            gameId: game.id,
            teamId,
          });
          gameTeamCount++;
        } catch (err: any) {
          console.error(`    \u2717 Failed to link team ${teamDefs[teamIdx].name}: ${err.message}`);
        }
      }
    } catch (err: any) {
      console.error(`  \u2717 Failed to create tournament ${t.name}: ${err.message}`);
    }
  }
  console.log(`  \u2713 ${tournamentCount} tournaments created`);
  console.log(`  \u2713 ${gameTeamCount} game_teams linkages created\n`);

  // ─── 6. Insert practice sessions ──────────────────────────────────
  console.log('Step 6: Creating practice sessions...');
  let practiceCount = 0;
  let practiceTeamCount = 0;

  for (const p of practiceSessionDefs) {
    try {
      const [session] = await db
        .insert(schema.practiceSessions)
        .values({
          seasonId: season.id,
          dayOfWeek: p.dayOfWeek,
          startTime: p.startTime,
          endTime: p.endTime,
          location: p.location,
          notes: p.notes,
          isActive: true,
        })
        .returning();
      practiceCount++;
      console.log(`  \u2713 ${p.dayOfWeek} ${p.location} (${p.notes})`);

      // Link teams
      for (const teamIdx of p.teamIndices) {
        const teamId = teamIds[teamIdx];
        if (!teamId) continue;
        try {
          await db.insert(schema.practiceSessionTeams).values({
            practiceSessionId: session.id,
            teamId,
          });
          practiceTeamCount++;
        } catch (err: any) {
          console.error(`    \u2717 Failed to link team ${teamDefs[teamIdx].name}: ${err.message}`);
        }
      }
    } catch (err: any) {
      console.error(`  \u2717 Failed to create practice session: ${err.message}`);
    }
  }
  console.log(`  \u2713 ${practiceCount} practice sessions created`);
  console.log(`  \u2713 ${practiceTeamCount} practice_session_teams linkages created\n`);

  // ─── Summary ──────────────────────────────────────────────────────
  console.log('\u2705 Girls Summer 2026 seed completed!\n');
  console.log(`Summary:
- Season: ${season.name} (existing)
- ${Object.keys(coachMap).length} coaches created
- ${teamIds.filter(Boolean).length} girls teams created
- ${playersCreated} players created (${rosterEntriesCreated} roster entries)
- ${tournamentCount} tournaments created (${gameTeamCount} game_teams linkages)
- ${practiceCount} practice sessions created (${practiceTeamCount} practice_session_teams linkages)
`);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
