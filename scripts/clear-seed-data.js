#!/usr/bin/env node
/**
 * TNE United Express - Clear Seeded Data Script
 *
 * Clears data from Supabase in correct order (respecting foreign keys):
 * 1. team_roster (junction table)
 * 2. players
 * 3. teams
 * 4. coaches (optional)
 * 5. seasons (optional)
 *
 * Usage:
 *   npm run seed:clear -- --confirm              # Clear teams, rosters, players (keep coaches/seasons)
 *   npm run seed:clear -- --confirm --all        # Clear everything including coaches and seasons
 *   npm run seed:clear -- --confirm --keep-coaches  # Keep coaches, clear teams/rosters only
 *   npm run seed:clear -- --season "2024-25 Winter" --confirm  # Clear specific season only
 *
 * Safety: --confirm flag is REQUIRED to actually delete data
 */

import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load environment variables
dotenv.config({ path: path.join(rootDir, '.env.local') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Parse command line arguments
const args = process.argv.slice(2);
const confirm = args.includes('--confirm');
const clearAll = args.includes('--all');
const keepCoaches = args.includes('--keep-coaches');
const seasonFilterIdx = args.indexOf('--season');
const seasonFilter = seasonFilterIdx >= 0 ? args[seasonFilterIdx + 1] : null;

// Validate environment
if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  console.error('The service role key is required to bypass RLS for deletions.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Get season ID by name
async function getSeasonId(seasonName) {
  const { data, error } = await supabase
    .from('seasons')
    .select('id')
    .eq('name', seasonName)
    .single();

  if (error || !data) {
    console.error(`Season not found: ${seasonName}`);
    return null;
  }
  return data.id;
}

// Get team IDs for a season
async function getTeamIdsForSeason(seasonId) {
  const { data } = await supabase
    .from('teams')
    .select('id')
    .eq('season_id', seasonId);

  return data?.map(t => t.id) || [];
}

// Count records in a table
async function countRecords(table, filter = null) {
  let query = supabase.from(table).select('id', { count: 'exact', head: true });

  if (filter) {
    for (const [col, val] of Object.entries(filter)) {
      if (Array.isArray(val)) {
        query = query.in(col, val);
      } else {
        query = query.eq(col, val);
      }
    }
  }

  const { count } = await query;
  return count || 0;
}

// Delete records from a table
async function deleteRecords(table, filter = null, description = '') {
  let query = supabase.from(table).delete();

  if (filter) {
    for (const [col, val] of Object.entries(filter)) {
      if (Array.isArray(val)) {
        query = query.in(col, val);
      } else {
        query = query.eq(col, val);
      }
    }
  } else {
    // For safety, delete all requires explicit neq on a column that won't match
    // Using .neq('id', '00000000-0000-0000-0000-000000000000') to delete all
    query = query.neq('id', '00000000-0000-0000-0000-000000000000');
  }

  const { error, count } = await query;

  if (error) {
    console.error(`  Error deleting from ${table}:`, error.message);
    return 0;
  }

  console.log(`  ${description || table}: ${count || 'all'} records deleted`);
  return count || 0;
}

// Main
async function main() {
  console.log('TNE United Express - Clear Seeded Data');
  console.log('======================================');

  if (!confirm) {
    console.log('\n⚠️  This will DELETE data from your Supabase database!');
    console.log('\nWhat would be deleted:');

    if (seasonFilter) {
      const seasonId = await getSeasonId(seasonFilter);
      if (!seasonId) {
        console.log(`  Season "${seasonFilter}" not found.`);
        process.exit(1);
      }

      const teamIds = await getTeamIdsForSeason(seasonId);
      const rosterCount = teamIds.length > 0 ? await countRecords('team_roster', { team_id: teamIds }) : 0;
      const teamCount = await countRecords('teams', { season_id: seasonId });

      console.log(`\n  For season "${seasonFilter}":`);
      console.log(`    - ${rosterCount} roster entries`);
      console.log(`    - ${teamCount} teams`);
      console.log(`    - (Players are NOT deleted - they may be on other teams)`);
    } else {
      const rosterCount = await countRecords('team_roster');
      const playerCount = await countRecords('players');
      const teamCount = await countRecords('teams');
      const coachCount = await countRecords('coaches');
      const seasonCount = await countRecords('seasons');

      console.log(`\n  - ${rosterCount} roster entries`);

      if (!keepCoaches) {
        console.log(`  - ${playerCount} players`);
      }

      console.log(`  - ${teamCount} teams`);

      if (clearAll && !keepCoaches) {
        console.log(`  - ${coachCount} coaches`);
        console.log(`  - ${seasonCount} seasons`);
      }
    }

    console.log('\nTo proceed, run with --confirm flag:');
    console.log('  npm run seed:clear -- --confirm');
    console.log('\nOptions:');
    console.log('  --all              Clear everything including coaches and seasons');
    console.log('  --keep-coaches     Keep coaches, only clear teams/rosters/players');
    console.log('  --season "Name"    Only clear data for specific season');
    return;
  }

  // Confirmed - proceed with deletion
  console.log('\n--- Clearing Data ---\n');

  if (seasonFilter) {
    // Clear specific season
    const seasonId = await getSeasonId(seasonFilter);
    if (!seasonId) {
      console.error(`Season not found: ${seasonFilter}`);
      process.exit(1);
    }

    console.log(`Clearing data for season: ${seasonFilter}`);

    // Get team IDs for this season
    const teamIds = await getTeamIdsForSeason(seasonId);

    if (teamIds.length > 0) {
      // Clear roster entries for these teams
      await deleteRecords('team_roster', { team_id: teamIds }, 'Roster entries');
    }

    // Clear teams for this season
    await deleteRecords('teams', { season_id: seasonId }, 'Teams');

    // Note: Not deleting players as they may belong to other seasons

    console.log('\nNote: Players were NOT deleted (they may belong to other teams/seasons)');
    console.log('Note: Season was NOT deleted. Use --all to delete everything.');
  } else {
    // Clear all (or most)

    // 1. Clear roster entries
    await deleteRecords('team_roster', null, 'Roster entries');

    // 2. Clear players (unless keeping for historical)
    if (!keepCoaches) {
      await deleteRecords('players', null, 'Players');
    }

    // 3. Clear teams
    await deleteRecords('teams', null, 'Teams');

    // 4. Clear coaches (if --all)
    if (clearAll && !keepCoaches) {
      await deleteRecords('coaches', null, 'Coaches');
    }

    // 5. Clear seasons (if --all)
    if (clearAll) {
      await deleteRecords('seasons', null, 'Seasons');
    }
  }

  console.log('\n--- Done! ---');

  if (!clearAll && !seasonFilter) {
    console.log('\nNote: Coaches and seasons were preserved.');
    console.log('Use --all to clear everything.');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
