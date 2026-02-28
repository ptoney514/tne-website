/**
 * Development Seed Script
 *
 * Creates sample data for local development.
 * Run with: npx tsx scripts/seed-dev-data.ts
 */

import 'dotenv/config';
import { guardAgainstProduction } from './lib/db-guard';
guardAgainstProduction();
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../lib/schema';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function seed() {
  console.log('🌱 Seeding development data...\n');

  // 1. Create a season
  console.log('Creating season...');
  const [season] = await db
    .insert(schema.seasons)
    .values({
      name: '2025-26 Winter',
      startDate: '2025-10-01',
      endDate: '2026-03-31',
      isActive: true,
      tryoutsOpen: true,
      tryoutsLabel: 'Winter 2025-26 Tryouts',
    })
    .returning();
  console.log(`  ✓ Created season: ${season.name}`);

  // 2. Create coaches
  console.log('Creating coaches...');
  const [headCoach] = await db
    .insert(schema.coaches)
    .values({
      firstName: 'Marcus',
      lastName: 'Johnson',
      email: 'marcus@tneexpress.com',
      phone: '555-0101',
      bio: 'Former college player with 10 years of coaching experience.',
      isActive: true,
    })
    .returning();

  const [asstCoach] = await db
    .insert(schema.coaches)
    .values({
      firstName: 'Sarah',
      lastName: 'Williams',
      email: 'sarah@tneexpress.com',
      phone: '555-0102',
      bio: 'Youth development specialist.',
      isActive: true,
    })
    .returning();
  console.log(`  ✓ Created ${2} coaches`);

  // 3. Create teams
  console.log('Creating teams...');
  const teams = await db
    .insert(schema.teams)
    .values([
      {
        seasonId: season.id,
        name: '7th Grade Elite',
        gradeLevel: '7',
        gender: 'male',
        headCoachId: headCoach.id,
        practiceLocation: 'TNE Training Center',
        practiceDays: 'Tuesday, Thursday',
        practiceTime: '6:00 PM - 8:00 PM',
        teamFee: '450.00',
        uniformFee: '75.00',
        isActive: true,
      },
      {
        seasonId: season.id,
        name: '8th Grade Select',
        gradeLevel: '8',
        gender: 'male',
        headCoachId: headCoach.id,
        assistantCoachId: asstCoach.id,
        practiceLocation: 'TNE Training Center',
        practiceDays: 'Monday, Wednesday',
        practiceTime: '6:00 PM - 8:00 PM',
        teamFee: '495.00',
        uniformFee: '75.00',
        isActive: true,
      },
      {
        seasonId: season.id,
        name: '6th Grade Girls',
        gradeLevel: '6',
        gender: 'female',
        headCoachId: asstCoach.id,
        practiceLocation: 'Community Center',
        practiceDays: 'Tuesday, Thursday',
        practiceTime: '5:00 PM - 7:00 PM',
        teamFee: '400.00',
        uniformFee: '75.00',
        isActive: true,
      },
    ])
    .returning();
  console.log(`  ✓ Created ${teams.length} teams`);

  // 4. Create tryout sessions
  console.log('Creating tryout sessions...');
  const tryouts = await db
    .insert(schema.tryoutSessions)
    .values([
      {
        seasonId: season.id,
        name: 'Boys 6th-7th Grade Tryouts',
        date: '2025-09-15',
        startTime: '10:00:00',
        endTime: '12:00:00',
        location: 'TNE Training Center',
        gradeLevels: ['6', '7'],
        gender: 'male',
        maxCapacity: 40,
        isActive: true,
      },
      {
        seasonId: season.id,
        name: 'Boys 8th Grade Tryouts',
        date: '2025-09-15',
        startTime: '13:00:00',
        endTime: '15:00:00',
        location: 'TNE Training Center',
        gradeLevels: ['8'],
        gender: 'male',
        maxCapacity: 30,
        isActive: true,
      },
      {
        seasonId: season.id,
        name: 'Girls All Grades Tryouts',
        date: '2025-09-16',
        startTime: '10:00:00',
        endTime: '12:00:00',
        location: 'Community Center',
        gradeLevels: ['5', '6', '7', '8'],
        gender: 'female',
        maxCapacity: 50,
        isActive: true,
      },
    ])
    .returning();
  console.log(`  ✓ Created ${tryouts.length} tryout sessions`);

  // 5. Create sample events
  console.log('Creating events...');
  const events = await db
    .insert(schema.events)
    .values([
      {
        teamId: teams[0].id,
        seasonId: season.id,
        eventType: 'practice',
        title: 'Team Practice',
        date: '2025-10-07',
        startTime: '18:00:00',
        endTime: '20:00:00',
        location: 'TNE Training Center',
      },
      {
        teamId: teams[1].id,
        seasonId: season.id,
        eventType: 'game',
        title: 'vs. Rival Academy',
        date: '2025-10-12',
        startTime: '14:00:00',
        endTime: '16:00:00',
        location: 'Home Gym',
        opponent: 'Rival Academy',
        isHomeGame: true,
      },
      {
        teamId: teams[0].id,
        seasonId: season.id,
        eventType: 'tournament',
        title: 'Fall Classic',
        date: '2025-10-19',
        startTime: '08:00:00',
        endTime: '18:00:00',
        location: 'Sports Complex',
        tournamentName: 'Fall Classic Invitational',
      },
    ])
    .returning();
  console.log(`  ✓ Created ${events.length} events`);

  // 6. Create a sample parent and player
  console.log('Creating sample parent and player...');
  const [parent] = await db
    .insert(schema.parents)
    .values({
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@example.com',
      phone: '555-0201',
      addressStreet: '123 Main St',
      addressCity: 'Atlanta',
      addressState: 'GA',
      addressZip: '30301',
      relationship: 'Father',
    })
    .returning();

  const [player] = await db
    .insert(schema.players)
    .values({
      firstName: 'Michael',
      lastName: 'Smith',
      dateOfBirth: '2012-03-15',
      graduatingYear: 2030,
      currentGrade: '7',
      gender: 'male',
      primaryParentId: parent.id,
      emergencyContactName: 'Jane Smith',
      emergencyContactPhone: '555-0202',
      emergencyContactRelationship: 'Mother',
      jerseySize: 'Youth Large',
      position: 'Point Guard',
      yearsExperience: 3,
      priorTnePlayer: false,
    })
    .returning();
  console.log(`  ✓ Created parent: ${parent.firstName} ${parent.lastName}`);
  console.log(`  ✓ Created player: ${player.firstName} ${player.lastName}`);

  // 7. Add player to team roster
  await db.insert(schema.teamRoster).values({
    teamId: teams[0].id,
    playerId: player.id,
    jerseyNumber: '23',
    position: 'Point Guard',
    paymentStatus: 'paid',
    paymentAmount: '525.00',
    joinedDate: '2025-10-01',
    isActive: true,
  });
  console.log(`  ✓ Added player to roster`);

  console.log('\n✅ Seed completed successfully!');
  console.log(`
Summary:
- 1 season
- 2 coaches
- 3 teams
- 3 tryout sessions
- 3 events
- 1 parent
- 1 player (on roster)
`);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
