#!/usr/bin/env node
/**
 * TNE United Express - Data Import Script
 *
 * Usage:
 *   node scripts/import-data.js --coaches    # Import coaches only
 *   node scripts/import-data.js --teams      # Import teams only
 *   node scripts/import-data.js --players    # Import players + roster assignments
 *   node scripts/import-data.js --games      # Import games/tournaments
 *   node scripts/import-data.js --all        # Import all in correct order
 *
 * Requirements:
 *   - Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 *   - CSV files in /data/ directory
 */

import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
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

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  console.error('The service role key is required to bypass RLS for imports.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to read and parse CSV
function readCSV(filename) {
  const filepath = path.join(rootDir, 'data', filename);
  if (!fs.existsSync(filepath)) {
    console.error(`File not found: ${filepath}`);
    return [];
  }
  const content = fs.readFileSync(filepath, 'utf-8');
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });
}

// Get or create active season
async function getActiveSeason() {
  const { data, error } = await supabase
    .from('seasons')
    .select('id, name')
    .eq('is_active', true)
    .single();

  if (error || !data) {
    console.log('No active season found, creating 2024-25 Winter season...');
    const { data: newSeason, error: createError } = await supabase
      .from('seasons')
      .insert({
        name: '2024-25 Winter',
        start_date: '2024-12-01',
        end_date: '2025-03-31',
        is_active: true,
        registration_open: true,
        tryouts_open: false
      })
      .select()
      .single();

    if (createError) {
      console.error('Failed to create season:', createError.message);
      process.exit(1);
    }
    return newSeason;
  }

  console.log(`Using active season: ${data.name}`);
  return data;
}

// Import coaches
async function importCoaches() {
  console.log('\n--- Importing Coaches ---');
  const records = readCSV('coaches.csv');

  if (records.length === 0) {
    console.log('No coaches to import');
    return {};
  }

  const coachIdMap = {};

  for (const row of records) {
    // Check if coach already exists by email
    const { data: existing } = await supabase
      .from('coaches')
      .select('id')
      .eq('email', row.email)
      .single();

    if (existing) {
      console.log(`  Skipping (exists): ${row.first_name} ${row.last_name}`);
      coachIdMap[row.email] = existing.id;
      continue;
    }

    const { data, error } = await supabase
      .from('coaches')
      .insert({
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email,
        phone: row.phone || null,
        role: row.role || 'head',
        bio: row.bio || null,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error(`  Error importing ${row.email}:`, error.message);
    } else {
      console.log(`  Imported: ${row.first_name} ${row.last_name}`);
      coachIdMap[row.email] = data.id;
    }
  }

  console.log(`Coaches complete: ${Object.keys(coachIdMap).length} total`);
  return coachIdMap;
}

// Get coach ID map (for use when importing teams separately)
async function getCoachIdMap() {
  const { data } = await supabase
    .from('coaches')
    .select('id, email');

  const map = {};
  data?.forEach(c => { map[c.email] = c.id; });
  return map;
}

// Import teams
async function importTeams(seasonId, coachIdMap) {
  console.log('\n--- Importing Teams ---');
  const records = readCSV('teams.csv');

  if (records.length === 0) {
    console.log('No teams to import');
    return {};
  }

  // If no coach map provided, fetch it
  if (!coachIdMap || Object.keys(coachIdMap).length === 0) {
    coachIdMap = await getCoachIdMap();
  }

  const teamIdMap = {};

  for (const row of records) {
    // Check if team already exists
    const { data: existing } = await supabase
      .from('teams')
      .select('id')
      .eq('name', row.name)
      .eq('season_id', seasonId)
      .single();

    if (existing) {
      console.log(`  Skipping (exists): ${row.name}`);
      teamIdMap[row.name] = existing.id;
      continue;
    }

    const headCoachId = row.head_coach_email ? coachIdMap[row.head_coach_email] : null;
    const assistantCoachId = row.assistant_coach_email ? coachIdMap[row.assistant_coach_email] : null;

    // Determine gender enum value
    const gender = row.gender === 'female' ? 'female' : 'male';

    // Determine tier
    const tier = row.tier || 'express';

    const { data, error } = await supabase
      .from('teams')
      .insert({
        season_id: seasonId,
        name: row.name,
        grade_level: row.grade_level,
        gender: gender,
        tier: tier,
        head_coach_id: headCoachId,
        assistant_coach_id: assistantCoachId,
        practice_location: row.practice_location || null,
        practice_days: row.practice_days || null,
        practice_time: row.practice_time || null,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error(`  Error importing ${row.name}:`, error.message);
    } else {
      console.log(`  Imported: ${row.name} (${row.grade_level} ${gender})`);
      teamIdMap[row.name] = data.id;
    }
  }

  console.log(`Teams complete: ${Object.keys(teamIdMap).length} total`);
  return teamIdMap;
}

// Get team ID map (for use when importing players separately)
async function getTeamIdMap(seasonId) {
  const { data } = await supabase
    .from('teams')
    .select('id, name')
    .eq('season_id', seasonId);

  const map = {};
  data?.forEach(t => { map[t.name] = t.id; });
  return map;
}

// Import players and roster assignments
async function importPlayers(teamIdMap) {
  console.log('\n--- Importing Players ---');
  const records = readCSV('players.csv');

  if (records.length === 0) {
    console.log('No players to import');
    return;
  }

  // If no team map provided, fetch it
  if (!teamIdMap || Object.keys(teamIdMap).length === 0) {
    const season = await getActiveSeason();
    teamIdMap = await getTeamIdMap(season.id);
  }

  let imported = 0;
  let skipped = 0;

  for (const row of records) {
    const teamId = teamIdMap[row.team_name];

    if (!teamId) {
      console.error(`  Team not found: ${row.team_name} (player: ${row.first_name} ${row.last_name})`);
      continue;
    }

    // Check if player already exists by name (simple check)
    const { data: existingPlayer } = await supabase
      .from('players')
      .select('id')
      .eq('first_name', row.first_name)
      .eq('last_name', row.last_name)
      .single();

    let playerId;

    if (existingPlayer) {
      playerId = existingPlayer.id;
      skipped++;
    } else {
      // Create player
      const gender = row.gender === 'female' ? 'female' : 'male';
      const gradYear = row.graduating_year ? parseInt(row.graduating_year) : 2030;

      // Generate placeholder date_of_birth from graduating year
      // Graduating year - 18 = approximate birth year
      const birthYear = gradYear - 18;
      const dateOfBirth = `${birthYear}-01-01`;

      // Calculate current grade from graduating year
      // If graduating 2031 = 8th grade now (2024-25 school year)
      // current_grade = 8 - (gradYear - 2031)
      const gradeNum = 8 - (gradYear - 2031);
      const currentGrade = gradeNum <= 0 ? 'K' : `${gradeNum}${gradeNum === 1 ? 'st' : gradeNum === 2 ? 'nd' : gradeNum === 3 ? 'rd' : 'th'}`;

      const { data: newPlayer, error: playerError } = await supabase
        .from('players')
        .insert({
          first_name: row.first_name,
          last_name: row.last_name,
          date_of_birth: dateOfBirth,
          graduating_year: gradYear,
          current_grade: currentGrade,
          gender: gender
        })
        .select()
        .single();

      if (playerError) {
        console.error(`  Error creating player ${row.first_name} ${row.last_name}:`, playerError.message);
        continue;
      }

      playerId = newPlayer.id;
      imported++;
    }

    // Check if roster entry exists
    const { data: existingRoster } = await supabase
      .from('team_roster')
      .select('id')
      .eq('team_id', teamId)
      .eq('player_id', playerId)
      .single();

    if (!existingRoster) {
      // Create roster entry
      const { error: rosterError } = await supabase
        .from('team_roster')
        .insert({
          team_id: teamId,
          player_id: playerId,
          jersey_number: row.jersey_number || null,
          position: row.position || null,
          is_active: true
        });

      if (rosterError) {
        console.error(`  Error adding ${row.first_name} to roster:`, rosterError.message);
      }
    }
  }

  console.log(`Players complete: ${imported} imported, ${skipped} existing`);
}

// Import games/tournaments
async function importGames(seasonId) {
  console.log('\n--- Importing Games/Tournaments ---');
  const records = readCSV('games.csv');

  if (records.length === 0) {
    console.log('No games to import');
    return;
  }

  let imported = 0;

  for (const row of records) {
    // Check if game already exists
    const { data: existing } = await supabase
      .from('games')
      .select('id')
      .eq('name', row.name)
      .eq('season_id', seasonId)
      .single();

    if (existing) {
      console.log(`  Skipping (exists): ${row.name}`);
      continue;
    }

    // Only use time fields if they look like times (contain :), not dates
    const endTime = row.end_time && row.end_time.includes(':') ? row.end_time : null;
    const startTime = row.start_time && row.start_time.includes(':') ? row.start_time : null;

    const { error } = await supabase
      .from('games')
      .insert({
        season_id: seasonId,
        game_type: row.game_type || 'tournament',
        name: row.name,
        date: row.date || null,
        start_time: startTime,
        end_time: endTime,
        location: row.location || null,
        notes: row.notes || null,
        is_featured: row.is_featured === 'true'
      });

    if (error) {
      console.error(`  Error importing ${row.name}:`, error.message);
    } else {
      console.log(`  Imported: ${row.name}`);
      imported++;
    }
  }

  console.log(`Games complete: ${imported} imported`);
}

// Main function
async function main() {
  const args = process.argv.slice(2);

  console.log('TNE United Express - Data Import');
  console.log('=================================');

  const season = await getActiveSeason();

  if (args.includes('--all')) {
    const coachIdMap = await importCoaches();
    const teamIdMap = await importTeams(season.id, coachIdMap);
    await importPlayers(teamIdMap);
    await importGames(season.id);
  } else {
    if (args.includes('--coaches')) {
      await importCoaches();
    }

    if (args.includes('--teams')) {
      await importTeams(season.id);
    }

    if (args.includes('--players')) {
      await importPlayers();
    }

    if (args.includes('--games')) {
      await importGames(season.id);
    }
  }

  if (args.length === 0) {
    console.log('\nUsage:');
    console.log('  node scripts/import-data.js --coaches   Import coaches');
    console.log('  node scripts/import-data.js --teams     Import teams');
    console.log('  node scripts/import-data.js --players   Import players + roster');
    console.log('  node scripts/import-data.js --games     Import games/tournaments');
    console.log('  node scripts/import-data.js --all       Import everything');
  }

  console.log('\nDone!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
