#!/usr/bin/env node
/**
 * TNE United Express - Excel Data Seeding Script
 *
 * Reads data/team-data.xlsx and seeds Supabase with:
 * - Coaches (upserted by email)
 * - Seasons (created as needed)
 * - Teams (upserted by name + season)
 * - Players (upserted by name + grad year)
 * - Team rosters (junction table)
 *
 * Usage:
 *   npm run seed                           # Seed all data
 *   npm run seed -- --season "2024-25 Winter"  # Seed specific season only
 *   npm run seed -- --coaches-only         # Only seed coaches
 *   npm run seed -- --teams-only           # Only seed teams (+ seasons)
 *   npm run seed -- --rosters-only         # Only seed rosters/players
 *   npm run seed -- --dry-run              # Show what would be seeded
 */

import { createClient } from '@supabase/supabase-js';
import XLSX from 'xlsx';
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

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const coachesOnly = args.includes('--coaches-only');
const teamsOnly = args.includes('--teams-only');
const rostersOnly = args.includes('--rosters-only');
const seasonFilterIdx = args.indexOf('--season');
const seasonFilter = seasonFilterIdx >= 0 ? args[seasonFilterIdx + 1] : null;

// Validate environment
if (!dryRun && (!supabaseUrl || !supabaseKey)) {
  console.error('Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  console.error('Use --dry-run to preview without database connection.');
  process.exit(1);
}

const supabase = !dryRun ? createClient(supabaseUrl, supabaseKey) : null;

/**
 * Normalize gender input to 'male' or 'female'
 * Handles variations like: girls, F, female, boys, M, male, etc.
 */
function normalizeGender(value) {
  if (!value) return null;
  const normalized = String(value).trim().toLowerCase();

  // Female variations
  if (['female', 'f', 'girls', 'girl', 'women', 'woman', 'w'].includes(normalized)) {
    return 'female';
  }
  // Male variations
  if (['male', 'm', 'boys', 'boy', 'men', 'man'].includes(normalized)) {
    return 'male';
  }

  // Warn about unrecognized value
  console.warn(`  Warning: Unrecognized gender "${value}", defaulting to null`);
  return null;
}

// Read Excel file
function readExcelFile() {
  const filepath = path.join(rootDir, 'data', 'team-data.xlsx');

  if (!fs.existsSync(filepath)) {
    console.error(`Error: Excel file not found: ${filepath}`);
    console.error('Run "npm run seed:generate" to create the template first.');
    process.exit(1);
  }

  const workbook = XLSX.readFile(filepath);
  const sheets = {};

  for (const sheetName of ['Coaches', 'Teams', 'Rosters']) {
    if (!workbook.SheetNames.includes(sheetName)) {
      console.error(`Error: Missing "${sheetName}" sheet in Excel file.`);
      process.exit(1);
    }
    sheets[sheetName] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
  }

  return sheets;
}

// Validate data
function validateData(sheets) {
  const errors = [];

  // Check required columns in Coaches
  const coachCols = ['Name', 'Email'];
  for (let i = 0; i < sheets.Coaches.length; i++) {
    const row = sheets.Coaches[i];
    for (const col of coachCols) {
      if (!row[col]) {
        errors.push(`Coaches row ${i + 2}: Missing ${col}`);
      }
    }
  }

  // Check required columns in Teams
  const teamCols = ['Season', 'Team Name', 'Grade Level', 'Gender'];
  for (let i = 0; i < sheets.Teams.length; i++) {
    const row = sheets.Teams[i];
    for (const col of teamCols) {
      if (!row[col]) {
        errors.push(`Teams row ${i + 2}: Missing ${col}`);
      }
    }
  }

  // Check required columns in Rosters
  const rosterCols = ['Season', 'Team Name', 'Player Name', 'Grad Year'];
  for (let i = 0; i < sheets.Rosters.length; i++) {
    const row = sheets.Rosters[i];
    for (const col of rosterCols) {
      if (!row[col]) {
        errors.push(`Rosters row ${i + 2}: Missing ${col}`);
      }
    }
  }

  // Build set of valid coach names
  const coachNames = new Set(sheets.Coaches.map(c => c.Name));

  // Validate coach references in Teams
  for (let i = 0; i < sheets.Teams.length; i++) {
    const row = sheets.Teams[i];
    if (row['Head Coach'] && !coachNames.has(row['Head Coach'])) {
      errors.push(`Teams row ${i + 2}: Head Coach "${row['Head Coach']}" not found in Coaches sheet`);
    }
    if (row['Assistant Coach'] && !coachNames.has(row['Assistant Coach'])) {
      errors.push(`Teams row ${i + 2}: Assistant Coach "${row['Assistant Coach']}" not found in Coaches sheet`);
    }
  }

  // Build set of valid team keys (Season + Team Name)
  const teamKeys = new Set(sheets.Teams.map(t => `${t.Season}||${t['Team Name']}`));

  // Validate team references in Rosters
  for (let i = 0; i < sheets.Rosters.length; i++) {
    const row = sheets.Rosters[i];
    const key = `${row.Season}||${row['Team Name']}`;
    if (!teamKeys.has(key)) {
      errors.push(`Rosters row ${i + 2}: Team "${row['Team Name']}" in season "${row.Season}" not found in Teams sheet`);
    }
  }

  // Check for duplicate players on same team
  const playerTeamSet = new Set();
  for (let i = 0; i < sheets.Rosters.length; i++) {
    const row = sheets.Rosters[i];
    const key = `${row.Season}||${row['Team Name']}||${row['Player Name']}`;
    if (playerTeamSet.has(key)) {
      errors.push(`Rosters row ${i + 2}: Duplicate player "${row['Player Name']}" on team "${row['Team Name']}"`);
    }
    playerTeamSet.add(key);
  }

  return errors;
}

// Seed coaches
async function seedCoaches(coaches) {
  console.log('\n--- Seeding Coaches ---');

  const coachIdMap = {}; // name -> id
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const c of coaches) {
    const name = c.Name;
    const email = c.Email;
    const nameParts = name.split(' ');
    const firstName = nameParts[0] || 'Coach';
    const lastName = nameParts.slice(1).join(' ') || '';

    if (dryRun) {
      console.log(`  [DRY RUN] Would upsert: ${name} (${email})`);
      coachIdMap[name] = `dry-run-${email}`;
      continue;
    }

    // Check if coach exists by email
    const { data: existing } = await supabase
      .from('coaches')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from('coaches')
        .update({
          first_name: firstName,
          last_name: lastName,
          phone: c.Phone || null,
          certifications: c.Certifications || null
        })
        .eq('id', existing.id);

      if (error) {
        console.error(`  Error updating ${name}:`, error.message);
      } else {
        console.log(`  Updated: ${name}`);
        updated++;
      }
      coachIdMap[name] = existing.id;
    } else {
      // Create new
      const { data, error } = await supabase
        .from('coaches')
        .insert({
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone: c.Phone || null,
          certifications: c.Certifications || null,
          role: 'head',
          is_active: true
        })
        .select('id')
        .single();

      if (error) {
        console.error(`  Error creating ${name}:`, error.message);
      } else {
        console.log(`  Created: ${name}`);
        created++;
        coachIdMap[name] = data.id;
      }
    }
  }

  console.log(`Coaches: ${created} created, ${updated} updated`);
  return coachIdMap;
}

// Get or create season
async function getOrCreateSeason(seasonName) {
  if (dryRun) {
    return `dry-run-season-${seasonName}`;
  }

  // Check if season exists
  const { data: existing } = await supabase
    .from('seasons')
    .select('id')
    .eq('name', seasonName)
    .single();

  if (existing) {
    return existing.id;
  }

  // Parse season name for dates (e.g., "2024-25 Winter" or "2025 Fall")
  const match = seasonName.match(/(\d{4})/);
  const year = match ? parseInt(match[1]) : new Date().getFullYear();

  const isWinter = seasonName.toLowerCase().includes('winter');
  const isFall = seasonName.toLowerCase().includes('fall');
  const isSpring = seasonName.toLowerCase().includes('spring');
  const isSummer = seasonName.toLowerCase().includes('summer');

  let startDate, endDate;
  if (isWinter) {
    startDate = `${year}-12-01`;
    endDate = `${year + 1}-03-31`;
  } else if (isFall) {
    startDate = `${year}-09-01`;
    endDate = `${year}-11-30`;
  } else if (isSpring) {
    startDate = `${year}-03-01`;
    endDate = `${year}-05-31`;
  } else if (isSummer) {
    startDate = `${year}-06-01`;
    endDate = `${year}-08-31`;
  } else {
    startDate = `${year}-01-01`;
    endDate = `${year}-12-31`;
  }

  const { data, error } = await supabase
    .from('seasons')
    .insert({
      name: seasonName,
      start_date: startDate,
      end_date: endDate,
      is_active: true,
      registration_open: true,
      tryouts_open: false
    })
    .select('id')
    .single();

  if (error) {
    console.error(`Error creating season ${seasonName}:`, error.message);
    return null;
  }

  console.log(`  Created season: ${seasonName}`);
  return data.id;
}

// Seed teams
async function seedTeams(teams, coachIdMap) {
  console.log('\n--- Seeding Teams ---');

  const teamIdMap = {}; // "Season||TeamName" -> { id, gender }
  const seasonIdMap = {}; // season name -> id
  let created = 0;
  let updated = 0;

  // Get unique seasons
  const seasons = [...new Set(teams.map(t => t.Season))];

  // Filter by season if specified
  const filteredTeams = seasonFilter
    ? teams.filter(t => t.Season === seasonFilter)
    : teams;

  if (seasonFilter && filteredTeams.length === 0) {
    console.log(`  No teams found for season: ${seasonFilter}`);
    return teamIdMap;
  }

  // Create/get all seasons
  for (const season of seasons) {
    if (seasonFilter && season !== seasonFilter) continue;

    const seasonId = await getOrCreateSeason(season);
    seasonIdMap[season] = seasonId;
  }

  for (const t of filteredTeams) {
    const key = `${t.Season}||${t['Team Name']}`;
    const seasonId = seasonIdMap[t.Season];

    if (!seasonId) {
      console.error(`  Skipping ${t['Team Name']}: Season not found`);
      continue;
    }

    const gender = normalizeGender(t.Gender) || 'male';
    const headCoachId = t['Head Coach'] ? coachIdMap[t['Head Coach']] : null;
    const assistantCoachId = t['Assistant Coach'] ? coachIdMap[t['Assistant Coach']] : null;

    // Determine tier from team name
    let tier = 'express';
    if (t['Team Name']?.toLowerCase().includes('tne ') || t['Team Name']?.toLowerCase().includes('tne/')) {
      tier = 'tne';
    }

    if (dryRun) {
      console.log(`  [DRY RUN] Would upsert: ${t['Team Name']} (${t.Season})`);
      teamIdMap[key] = { id: `dry-run-${key}`, gender };
      continue;
    }

    // Check if team exists
    const { data: existing } = await supabase
      .from('teams')
      .select('id')
      .eq('name', t['Team Name'])
      .eq('season_id', seasonId)
      .single();

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from('teams')
        .update({
          grade_level: t['Grade Level'],
          gender: gender,
          tier: tier,
          head_coach_id: headCoachId,
          assistant_coach_id: assistantCoachId,
          team_fee: t['Team Fee'] || null,
          uniform_fee: t['Uniform Fee'] || null
        })
        .eq('id', existing.id);

      if (error) {
        console.error(`  Error updating ${t['Team Name']}:`, error.message);
      } else {
        console.log(`  Updated: ${t['Team Name']}`);
        updated++;
      }
      teamIdMap[key] = { id: existing.id, gender };
    } else {
      // Create new
      const { data, error } = await supabase
        .from('teams')
        .insert({
          season_id: seasonId,
          name: t['Team Name'],
          grade_level: t['Grade Level'],
          gender: gender,
          tier: tier,
          head_coach_id: headCoachId,
          assistant_coach_id: assistantCoachId,
          team_fee: t['Team Fee'] || null,
          uniform_fee: t['Uniform Fee'] || null,
          is_active: true
        })
        .select('id')
        .single();

      if (error) {
        console.error(`  Error creating ${t['Team Name']}:`, error.message);
      } else {
        console.log(`  Created: ${t['Team Name']}`);
        created++;
        teamIdMap[key] = { id: data.id, gender };
      }
    }
  }

  console.log(`Teams: ${created} created, ${updated} updated`);
  return teamIdMap;
}

// Seed players and rosters
async function seedRosters(rosters, teamIdMap) {
  console.log('\n--- Seeding Players & Rosters ---');

  let playersCreated = 0;
  let playersUpdated = 0;
  let rostersCreated = 0;
  let rostersSkipped = 0;

  // Filter by season if specified
  const filteredRosters = seasonFilter
    ? rosters.filter(r => r.Season === seasonFilter)
    : rosters;

  if (seasonFilter && filteredRosters.length === 0) {
    console.log(`  No roster entries found for season: ${seasonFilter}`);
    return;
  }

  for (const r of filteredRosters) {
    const teamKey = `${r.Season}||${r['Team Name']}`;
    const teamInfo = teamIdMap[teamKey];

    if (!teamInfo) {
      console.error(`  Skipping ${r['Player Name']}: Team not found (${r['Team Name']})`);
      continue;
    }

    const teamId = teamInfo.id;
    const playerGender = teamInfo.gender || 'male';

    const name = r['Player Name'];
    const nameParts = name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    const gradYear = parseInt(r['Grad Year']) || 2032;

    // Generate placeholder date_of_birth from graduating year
    const birthYear = gradYear - 18;
    const dateOfBirth = `${birthYear}-01-01`;

    if (dryRun) {
      console.log(`  [DRY RUN] Would add: ${name} -> ${r['Team Name']}`);
      continue;
    }

    // Check if player exists (by name + grad year as stable identifier)
    const { data: existingPlayer } = await supabase
      .from('players')
      .select('id')
      .eq('first_name', firstName)
      .eq('last_name', lastName)
      .eq('graduating_year', gradYear)
      .single();

    let playerId;

    if (existingPlayer) {
      playerId = existingPlayer.id;

      // Update player with current grade
      const { error } = await supabase
        .from('players')
        .update({
          current_grade: r.Grade || null
        })
        .eq('id', existingPlayer.id);

      if (!error) {
        playersUpdated++;
      }
    } else {
      // Create player
      const { data, error } = await supabase
        .from('players')
        .insert({
          first_name: firstName,
          last_name: lastName,
          date_of_birth: dateOfBirth,
          graduating_year: gradYear,
          current_grade: r.Grade || null,
          gender: playerGender
        })
        .select('id')
        .single();

      if (error) {
        console.error(`  Error creating player ${name}:`, error.message);
        continue;
      }

      playerId = data.id;
      playersCreated++;
    }

    // Check if roster entry exists
    const { data: existingRoster } = await supabase
      .from('team_roster')
      .select('id')
      .eq('team_id', teamId)
      .eq('player_id', playerId)
      .single();

    if (existingRoster) {
      // Update roster entry
      const { error } = await supabase
        .from('team_roster')
        .update({
          jersey_number: r['Jersey #'] || null,
          position: r.Position || null
        })
        .eq('id', existingRoster.id);

      if (error) {
        console.error(`  Error updating roster for ${name}:`, error.message);
      }
      rostersSkipped++;
    } else {
      // Create roster entry
      const { error } = await supabase
        .from('team_roster')
        .insert({
          team_id: teamId,
          player_id: playerId,
          jersey_number: r['Jersey #'] || null,
          position: r.Position || null,
          is_active: true
        });

      if (error) {
        console.error(`  Error adding ${name} to roster:`, error.message);
      } else {
        rostersCreated++;
        console.log(`  Added: ${name} -> ${r['Team Name']}`);
      }
    }
  }

  console.log(`Players: ${playersCreated} created, ${playersUpdated} updated`);
  console.log(`Rosters: ${rostersCreated} created, ${rostersSkipped} existing`);
}

// Get existing coach ID map (for when running --rosters-only or --teams-only)
async function getCoachIdMap() {
  if (dryRun) return {};

  const { data } = await supabase
    .from('coaches')
    .select('id, first_name, last_name');

  const map = {};
  data?.forEach(c => {
    const name = `${c.first_name} ${c.last_name}`.trim();
    map[name] = c.id;
  });
  return map;
}

// Get existing team ID map (for when running --rosters-only)
async function getTeamIdMap() {
  if (dryRun) return {};

  const { data } = await supabase
    .from('teams')
    .select('id, name, gender, season:seasons(name)');

  const map = {};
  data?.forEach(t => {
    const key = `${t.season?.name}||${t.name}`;
    map[key] = { id: t.id, gender: t.gender || 'male' };
  });
  return map;
}

// Main
async function main() {
  console.log('TNE United Express - Excel Data Seeding');
  console.log('=======================================');

  if (dryRun) {
    console.log('\n[DRY RUN MODE - No changes will be made]\n');
  }

  if (seasonFilter) {
    console.log(`Filtering by season: ${seasonFilter}\n`);
  }

  // Read Excel file
  const sheets = readExcelFile();
  console.log(`\nLoaded: ${sheets.Coaches.length} coaches, ${sheets.Teams.length} teams, ${sheets.Rosters.length} roster entries`);

  // Validate data
  const errors = validateData(sheets);
  if (errors.length > 0) {
    console.error('\n--- Validation Errors ---');
    errors.forEach(e => console.error(`  ${e}`));
    console.error(`\nFix ${errors.length} error(s) in data/team-data.xlsx and try again.`);
    process.exit(1);
  }
  console.log('Validation passed!');

  let coachIdMap = {};
  let teamIdMap = {};

  // Seed coaches (unless --teams-only or --rosters-only)
  if (!teamsOnly && !rostersOnly) {
    coachIdMap = await seedCoaches(sheets.Coaches);
  } else {
    coachIdMap = await getCoachIdMap();
  }

  // Seed teams (unless --coaches-only or --rosters-only)
  if (!coachesOnly && !rostersOnly) {
    teamIdMap = await seedTeams(sheets.Teams, coachIdMap);
  } else if (rostersOnly) {
    teamIdMap = await getTeamIdMap();
  }

  // Seed rosters (unless --coaches-only or --teams-only)
  if (!coachesOnly && !teamsOnly) {
    await seedRosters(sheets.Rosters, teamIdMap);
  }

  console.log('\n--- Done! ---');

  if (dryRun) {
    console.log('\n[DRY RUN] No changes were made. Remove --dry-run to apply changes.');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
