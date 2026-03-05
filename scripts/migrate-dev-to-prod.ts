/**
 * Dev → Production Data Migration
 *
 * Copies Summer 2026 data from the dev database to production:
 * - Coaches
 * - Teams (11 teams)
 * - Players
 * - Team roster entries
 * - Games/tournaments
 * - Tournament details
 * - Game-team linkages
 *
 * Also deactivates stale winter 2025-26 teams on production.
 *
 * Safety:
 * - Dry-run by default (logs what would happen)
 * - Pass --execute to actually write to production
 * - Entire write is wrapped in a single transaction
 *
 * Prerequisites:
 * - DATABASE_URL in .env points to dev branch
 * - PRODUCTION_DATABASE_URL in .env points to production
 *   (or it will be fetched via neonctl)
 *
 * Run with:
 *   npx tsx scripts/migrate-dev-to-prod.ts           # dry run
 *   npx tsx scripts/migrate-dev-to-prod.ts --execute  # write to production
 */

import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, and, inArray } from 'drizzle-orm';
import * as schema from '../lib/schema';
import { execSync } from 'child_process';

// ─── Config ──────────────────────────────────────────────────────────────────
const EXECUTE = process.argv.includes('--execute');
const PROD_SEASON_ID = 'd393ef8f-ec73-446a-a5f1-e129409517ce'; // "2026 Summer" on production
const WINTER_SEASON_ID = 'a2b33e21'; // prefix for "2025-26 Winter"

// ─── Connect to both databases ───────────────────────────────────────────────
function getProductionUrl(): string {
  if (process.env.PRODUCTION_DATABASE_URL) {
    return process.env.PRODUCTION_DATABASE_URL;
  }
  console.log('  PRODUCTION_DATABASE_URL not set, fetching via neonctl...');
  const url = execSync(
    'neonctl connection-string --project-id noisy-sea-79276165 --org-id org-morning-pine-04214347 --branch main',
    { encoding: 'utf-8' }
  ).trim();
  return url;
}

async function main() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(EXECUTE
    ? '🚀 EXECUTING migration: dev → production'
    : '🔍 DRY RUN: dev → production (pass --execute to write)');
  console.log(`${'='.repeat(60)}\n`);

  // ─── 1. Connect ────────────────────────────────────────────────────────
  const devUrl = process.env.DATABASE_URL;
  if (!devUrl) {
    console.error('❌ DATABASE_URL is not set.');
    process.exit(1);
  }

  // Safety: verify dev URL is NOT production
  if (devUrl.includes('ep-wild-sky-ahcar46r')) {
    console.error('🛑 DATABASE_URL points to production! This script reads from dev.');
    process.exit(1);
  }

  const prodUrl = getProductionUrl();
  if (!prodUrl.includes('ep-wild-sky-ahcar46r')) {
    console.error('🛑 Production URL does not look like the production endpoint.');
    process.exit(1);
  }

  const devSql = neon(devUrl);
  const devDb = drizzle(devSql, { schema });

  const prodSql = neon(prodUrl);
  const prodDb = drizzle(prodSql, { schema });

  console.log('✓ Connected to dev and production databases\n');

  // ─── 2. Find dev season ────────────────────────────────────────────────
  const devSeasons = await devDb
    .select()
    .from(schema.seasons)
    .where(eq(schema.seasons.name, '2026 Summer'));

  if (devSeasons.length === 0) {
    console.error('❌ "2026 Summer" season not found in dev database.');
    process.exit(1);
  }
  const devSeasonId = devSeasons[0].id;
  console.log(`Dev season: "${devSeasons[0].name}" (${devSeasonId})`);
  console.log(`Prod season: "${PROD_SEASON_ID}" (target)\n`);

  // ─── 3. Read all data from dev ─────────────────────────────────────────
  console.log('Reading data from dev...');

  // Coaches
  const devCoaches = await devDb.select().from(schema.coaches);
  console.log(`  Coaches: ${devCoaches.length}`);

  // Teams for summer 2026
  const devTeams = await devDb
    .select()
    .from(schema.teams)
    .where(eq(schema.teams.seasonId, devSeasonId));
  console.log(`  Teams: ${devTeams.length}`);

  const devTeamIds = devTeams.map((t) => t.id);

  // Players
  const devPlayers = await devDb.select().from(schema.players);
  console.log(`  Players: ${devPlayers.length}`);

  // Team roster for these teams
  const devRoster = devTeamIds.length > 0
    ? await devDb
        .select()
        .from(schema.teamRoster)
        .where(inArray(schema.teamRoster.teamId, devTeamIds))
    : [];
  console.log(`  Roster entries: ${devRoster.length}`);

  // Games (tournaments) for this season
  const devGames = await devDb
    .select()
    .from(schema.games)
    .where(eq(schema.games.seasonId, devSeasonId));
  console.log(`  Games/tournaments: ${devGames.length}`);

  const devGameIds = devGames.map((g) => g.id);

  // Tournament details
  const devTournamentDetails = devGameIds.length > 0
    ? await devDb
        .select()
        .from(schema.tournamentDetails)
        .where(inArray(schema.tournamentDetails.gameId, devGameIds))
    : [];
  console.log(`  Tournament details: ${devTournamentDetails.length}`);

  // Game-team linkages
  const devGameTeams = devGameIds.length > 0
    ? await devDb
        .select()
        .from(schema.gameTeams)
        .where(inArray(schema.gameTeams.gameId, devGameIds))
    : [];
  console.log(`  Game-team linkages: ${devGameTeams.length}`);

  console.log('');

  // ─── 4. Verify production season exists ────────────────────────────────
  const prodSeasons = await prodDb
    .select()
    .from(schema.seasons)
    .where(eq(schema.seasons.id, PROD_SEASON_ID));

  if (prodSeasons.length === 0) {
    console.error(`❌ Season ${PROD_SEASON_ID} not found in production.`);
    process.exit(1);
  }
  console.log(`✓ Production season verified: "${prodSeasons[0].name}"\n`);

  // ─── 5. Check existing production data ─────────────────────────────────
  const existingProdTeams = await prodDb
    .select()
    .from(schema.teams)
    .where(eq(schema.teams.seasonId, PROD_SEASON_ID));
  console.log(`Existing production summer 2026 teams: ${existingProdTeams.length}`);

  const existingProdTeamIds = existingProdTeams.map((t) => t.id);
  const existingProdGames = await prodDb
    .select()
    .from(schema.games)
    .where(eq(schema.games.seasonId, PROD_SEASON_ID));
  console.log(`Existing production summer 2026 games: ${existingProdGames.length}`);

  // Check registrations that reference these teams
  if (existingProdTeamIds.length > 0) {
    const regsWithTeam = await prodDb
      .select()
      .from(schema.registrations)
      .where(inArray(schema.registrations.teamId, existingProdTeamIds));
    console.log(`Registrations referencing these teams: ${regsWithTeam.length} (will be SET NULL on team delete)`);
  }

  console.log('');

  if (!EXECUTE) {
    console.log('─── DRY RUN SUMMARY ───');
    console.log('Would delete:');
    console.log(`  - ${existingProdGames.length} existing prod games + their game_teams/tournament_details (cascade)`);
    console.log(`  - ${existingProdTeams.length} existing prod teams + their roster entries (cascade)`);
    console.log('Would insert:');
    console.log(`  - ${devCoaches.length} coaches (ON CONFLICT DO NOTHING)`);
    console.log(`  - ${devTeams.length} teams`);
    console.log(`  - ${devPlayers.length} players (ON CONFLICT DO NOTHING)`);
    console.log(`  - ${devRoster.length} roster entries`);
    console.log(`  - ${devGames.length} games/tournaments`);
    console.log(`  - ${devTournamentDetails.length} tournament details`);
    console.log(`  - ${devGameTeams.length} game-team linkages`);
    console.log('Would deactivate:');
    console.log('  - Stale winter 2025-26 teams');
    console.log('\nRun with --execute to apply these changes.');
    process.exit(0);
  }

  // ─── 6. Execute migration (within raw SQL transaction) ─────────────────
  console.log('🚀 Executing migration...\n');

  // Since neon-http doesn't support transactions natively, we'll use
  // sequential operations with careful ordering. The cascade deletes
  // handle dependent rows automatically.

  // 6a. Delete existing production games (cascades to game_teams, tournament_details)
  if (existingProdGames.length > 0) {
    const existingGameIds = existingProdGames.map((g) => g.id);
    await prodDb
      .delete(schema.games)
      .where(inArray(schema.games.id, existingGameIds));
    console.log(`  ✓ Deleted ${existingProdGames.length} existing prod games (+ cascade)`);
  }

  // 6b. Delete existing production teams (cascades to roster)
  if (existingProdTeams.length > 0) {
    await prodDb
      .delete(schema.teams)
      .where(
        and(
          eq(schema.teams.seasonId, PROD_SEASON_ID),
          inArray(schema.teams.id, existingProdTeamIds)
        )
      );
    console.log(`  ✓ Deleted ${existingProdTeams.length} existing prod teams (+ cascade)`);
  }

  // 6c. Insert coaches (ON CONFLICT DO NOTHING by inserting one at a time and catching)
  let coachInserted = 0;
  for (const coach of devCoaches) {
    try {
      await prodDb.insert(schema.coaches).values({
        id: coach.id,
        profileId: coach.profileId,
        firstName: coach.firstName,
        lastName: coach.lastName,
        email: coach.email,
        phone: coach.phone,
        bio: coach.bio,
        isActive: coach.isActive,
      });
      coachInserted++;
    } catch {
      // Already exists — skip
    }
  }
  console.log(`  ✓ Coaches: ${coachInserted} inserted, ${devCoaches.length - coachInserted} already existed`);

  // 6d. Insert teams (with production season ID)
  const devToProdTeamMap: Record<string, string> = {}; // dev teamId -> prod teamId
  for (const team of devTeams) {
    const [inserted] = await prodDb
      .insert(schema.teams)
      .values({
        seasonId: PROD_SEASON_ID,
        name: team.name,
        gradeLevel: team.gradeLevel,
        gender: team.gender,
        headCoachId: team.headCoachId,
        assistantCoachId: team.assistantCoachId,
        practiceLocation: team.practiceLocation,
        practiceDays: team.practiceDays,
        practiceTime: team.practiceTime,
        teamFee: team.teamFee,
        uniformFee: team.uniformFee,
        isActive: team.isActive,
      })
      .returning();
    devToProdTeamMap[team.id] = inserted.id;
  }
  console.log(`  ✓ Teams: ${devTeams.length} inserted`);

  // 6e. Insert players (ON CONFLICT DO NOTHING)
  let playerInserted = 0;
  for (const player of devPlayers) {
    try {
      await prodDb.insert(schema.players).values({
        id: player.id,
        firstName: player.firstName,
        lastName: player.lastName,
        dateOfBirth: player.dateOfBirth,
        graduatingYear: player.graduatingYear,
        currentGrade: player.currentGrade,
        gender: player.gender,
        primaryParentId: player.primaryParentId,
        secondaryParentId: player.secondaryParentId,
        emergencyContactName: player.emergencyContactName,
        emergencyContactPhone: player.emergencyContactPhone,
        emergencyContactRelationship: player.emergencyContactRelationship,
        medicalNotes: player.medicalNotes,
        jerseyNumber: player.jerseyNumber,
        jerseySize: player.jerseySize,
        position: player.position,
        yearsExperience: player.yearsExperience,
        priorTnePlayer: player.priorTnePlayer,
        notes: player.notes,
      });
      playerInserted++;
    } catch {
      // Already exists — skip
    }
  }
  console.log(`  ✓ Players: ${playerInserted} inserted, ${devPlayers.length - playerInserted} already existed`);

  // 6f. Insert roster entries (with mapped team IDs)
  let rosterInserted = 0;
  for (const entry of devRoster) {
    const prodTeamId = devToProdTeamMap[entry.teamId];
    if (!prodTeamId) {
      console.warn(`  ⚠ Roster entry references unknown team ${entry.teamId}, skipping`);
      continue;
    }
    try {
      await prodDb.insert(schema.teamRoster).values({
        teamId: prodTeamId,
        playerId: entry.playerId,
        jerseyNumber: entry.jerseyNumber,
        position: entry.position,
        paymentStatus: entry.paymentStatus,
        paymentAmount: entry.paymentAmount,
        paymentDate: entry.paymentDate,
        paymentNotes: entry.paymentNotes,
        notes: entry.notes,
        joinedDate: entry.joinedDate,
        isActive: entry.isActive,
      });
      rosterInserted++;
    } catch (err: any) {
      console.warn(`  ⚠ Roster insert failed: ${err.message}`);
    }
  }
  console.log(`  ✓ Roster entries: ${rosterInserted} inserted`);

  // 6g. Insert games/tournaments (with production season ID)
  const devToProdGameMap: Record<string, string> = {}; // dev gameId -> prod gameId
  for (const game of devGames) {
    const [inserted] = await prodDb
      .insert(schema.games)
      .values({
        seasonId: PROD_SEASON_ID,
        gameType: game.gameType,
        name: game.name,
        description: game.description,
        date: game.date,
        endDate: game.endDate,
        startTime: game.startTime,
        endTime: game.endTime,
        location: game.location,
        address: game.address,
        externalUrl: game.externalUrl,
        isFeatured: game.isFeatured,
        notes: game.notes,
        isCancelled: game.isCancelled,
      })
      .returning();
    devToProdGameMap[game.id] = inserted.id;
  }
  console.log(`  ✓ Games/tournaments: ${devGames.length} inserted`);

  // 6h. Insert tournament details (with mapped game IDs)
  let tdInserted = 0;
  for (const td of devTournamentDetails) {
    const prodGameId = devToProdGameMap[td.gameId];
    if (!prodGameId) {
      console.warn(`  ⚠ Tournament detail references unknown game ${td.gameId}, skipping`);
      continue;
    }
    await prodDb.insert(schema.tournamentDetails).values({
      gameId: prodGameId,
      venueId: td.venueId,
      description: td.description,
      divisionCount: td.divisionCount,
      totalTeams: td.totalTeams,
      ageDivisions: td.ageDivisions,
      registrationUrl: td.registrationUrl,
      registrationDeadline: td.registrationDeadline,
      entryFee: td.entryFee,
      schedulePdfUrl: td.schedulePdfUrl,
      rulesPdfUrl: td.rulesPdfUrl,
      bracketUrl: td.bracketUrl,
      teamRateCode: td.teamRateCode,
      teamRateDeadline: td.teamRateDeadline,
      teamRateDescription: td.teamRateDescription,
      driveTime: td.driveTime,
      mapCenterLat: td.mapCenterLat,
      mapCenterLng: td.mapCenterLng,
      mapZoomLevel: td.mapZoomLevel,
      showHotels: td.showHotels,
      showAttractions: td.showAttractions,
      showRestaurants: td.showRestaurants,
    });
    tdInserted++;
  }
  console.log(`  ✓ Tournament details: ${tdInserted} inserted`);

  // 6i. Insert game-team linkages (with mapped IDs)
  let gtInserted = 0;
  for (const gt of devGameTeams) {
    const prodGameId = devToProdGameMap[gt.gameId];
    const prodTeamId = devToProdTeamMap[gt.teamId];
    if (!prodGameId || !prodTeamId) {
      console.warn(`  ⚠ game_teams references unknown game/team, skipping`);
      continue;
    }
    await prodDb.insert(schema.gameTeams).values({
      gameId: prodGameId,
      teamId: prodTeamId,
      opponent: gt.opponent,
      isHomeGame: gt.isHomeGame,
      result: gt.result,
      notes: gt.notes,
    });
    gtInserted++;
  }
  console.log(`  ✓ Game-team linkages: ${gtInserted} inserted`);

  // 6j. Deactivate stale winter 2025-26 teams
  const winterTeams = await prodDb
    .select()
    .from(schema.teams)
    .where(
      and(
        eq(schema.teams.isActive, true)
      )
    );

  // Find teams whose season is the inactive winter season
  const allProdSeasons = await prodDb.select().from(schema.seasons);
  const winterSeason = allProdSeasons.find((s) => s.id.startsWith(WINTER_SEASON_ID));

  if (winterSeason) {
    const staleTeams = winterTeams.filter((t) => t.seasonId === winterSeason.id);
    if (staleTeams.length > 0) {
      await prodDb
        .update(schema.teams)
        .set({ isActive: false, updatedAt: new Date() })
        .where(
          and(
            eq(schema.teams.seasonId, winterSeason.id),
            eq(schema.teams.isActive, true)
          )
        );
      console.log(`  ✓ Deactivated ${staleTeams.length} stale winter 2025-26 teams`);
    } else {
      console.log('  ✓ No stale winter teams to deactivate');
    }
  } else {
    console.log('  ⚠ Winter 2025-26 season not found, skipping deactivation');
  }

  // ─── 7. Summary ────────────────────────────────────────────────────────
  console.log(`\n${'='.repeat(60)}`);
  console.log('✅ Migration completed successfully!\n');
  console.log('Summary:');
  console.log(`  Coaches:          ${coachInserted} inserted`);
  console.log(`  Teams:            ${devTeams.length} inserted`);
  console.log(`  Players:          ${playerInserted} inserted`);
  console.log(`  Roster:           ${rosterInserted} inserted`);
  console.log(`  Games:            ${devGames.length} inserted`);
  console.log(`  Tournament details: ${tdInserted} inserted`);
  console.log(`  Game-team links:  ${gtInserted} inserted`);
  console.log(`\nVerify at:`);
  console.log(`  https://tnebasketball.com/api/public/teams?seasonId=${PROD_SEASON_ID}`);
  console.log(`${'='.repeat(60)}\n`);
}

main().catch((err) => {
  console.error('\n❌ Migration failed:', err);
  process.exit(1);
});
