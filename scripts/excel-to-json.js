#!/usr/bin/env node

/**
 * Excel-to-JSON Conversion Script
 *
 * Reads team data from /data/team-data.xlsx and converts it to JSON files:
 * - /data/json/teams.json
 * - /data/json/coaches.json
 * - /data/json/schedule.json
 * - /data/json/rosters.json
 *
 * Usage: npm run update-teams
 */

import XLSX from 'xlsx';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(__dirname, '..', 'data');
const JSON_DIR = join(DATA_DIR, 'json');

// Helper to generate slug-based ID
function generateId(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Load existing config.json to preserve settings
function loadExistingConfig() {
  const configPath = join(JSON_DIR, 'config.json');
  if (existsSync(configPath)) {
    try {
      const content = readFileSync(configPath, 'utf-8');
      return JSON.parse(content);
    } catch {
      console.warn('Could not read existing config.json, using defaults');
    }
  }
  return null;
}

// Main conversion function
function convertExcelToJSON() {
  const excelPath = join(DATA_DIR, 'team-data.xlsx');

  if (!existsSync(excelPath)) {
    console.error(`Excel file not found: ${excelPath}`);
    console.log('Please ensure /data/team-data.xlsx exists.');
    process.exit(1);
  }

  console.log('Reading Excel file...');
  const workbook = XLSX.readFile(excelPath);

  // Get sheet names
  const sheetNames = workbook.SheetNames;
  console.log(`Found sheets: ${sheetNames.join(', ')}`);

  // Process Teams sheet
  let teams = [];
  let coaches = [];
  let coachMap = new Map();

  if (sheetNames.includes('Teams')) {
    const teamsSheet = workbook.Sheets['Teams'];
    const teamsData = XLSX.utils.sheet_to_json(teamsSheet);

    console.log(`Found ${teamsData.length} teams`);

    teamsData.forEach(row => {
      // Handle both snake_case (legacy) and space-separated (Excel) column names
      const teamName = row['Team Name'] || row.name || row.team_name;
      const gradeLevel = row['Grade Level'] || row.grade_level || row.grade;
      const headCoachName = row['Head Coach'] || row.head_coach_name || row.head_coach;
      const assistantCoachName = row['Assistant Coach'] || row.assistant_coach_name || row.assistant_coach;
      const teamFee = row['Team Fee'] || row.team_fee;
      const uniformFee = row['Uniform Fee'] || row.uniform_fee;
      const gender = row['Gender'] || row.gender;
      const tier = row['Tier'] || row.tier;
      const practiceLocation = row['Practice Location'] || row.practice_location;
      const practiceDays = row['Practice Days'] || row.practice_days;
      const practiceTime = row['Practice Time'] || row.practice_time;
      const playerCount = row['Player Count'] || row.player_count;

      // Extract coach info and create/reuse coach IDs
      let headCoachId = null;
      let assistantCoachId = null;

      if (headCoachName) {
        const name = headCoachName.trim();
        const key = name;

        if (!coachMap.has(key)) {
          const nameParts = name.split(' ');
          const coach = {
            id: `coach-${generateId(name)}`,
            first_name: nameParts[0] || 'Coach',
            last_name: nameParts.slice(1).join(' ') || name,
            email: null,
            phone: null,
            role: 'head',
            bio: null,
            certifications: [],
          };
          coachMap.set(key, coach);
          coaches.push(coach);
        }
        headCoachId = coachMap.get(key).id;
      }

      if (assistantCoachName && assistantCoachName.trim()) {
        const name = assistantCoachName.trim();
        const key = name;

        if (!coachMap.has(key)) {
          const nameParts = name.split(' ');
          const coach = {
            id: `coach-${generateId(name)}`,
            first_name: nameParts[0] || 'Coach',
            last_name: nameParts.slice(1).join(' ') || name,
            email: null,
            phone: null,
            role: 'assistant',
            bio: null,
            certifications: [],
          };
          coachMap.set(key, coach);
          coaches.push(coach);
        }
        assistantCoachId = coachMap.get(key).id;
      }

      // Derive tier from team name if not explicitly set
      let derivedTier = (tier || 'express').toLowerCase();
      if (!tier && teamName) {
        if (teamName.toLowerCase().includes('tne')) {
          derivedTier = 'tne';
        }
      }

      const team = {
        id: generateId(teamName || `team-${teams.length + 1}`),
        name: teamName,
        grade_level: gradeLevel,
        gender: (gender || 'male').toLowerCase(),
        tier: derivedTier,
        head_coach_id: headCoachId,
        assistant_coach_id: assistantCoachId,
        team_fee: parseFloat(teamFee) || 450,
        uniform_fee: parseFloat(uniformFee) || 75,
        practice_location: practiceLocation || null,
        practice_days: practiceDays || null,
        practice_time: practiceTime || null,
        player_count: parseInt(playerCount) || 0,
      };

      teams.push(team);
    });
  }

  // Process Coaches sheet if it exists (overrides extracted coaches)
  if (sheetNames.includes('Coaches')) {
    const coachesSheet = workbook.Sheets['Coaches'];
    const coachesData = XLSX.utils.sheet_to_json(coachesSheet);

    console.log(`Found ${coachesData.length} coaches in Coaches sheet`);

    // Clear existing and rebuild from sheet
    coaches = [];
    coachMap = new Map();

    coachesData.forEach(row => {
      // Handle both single "Name" column and separate first_name/last_name columns
      let firstName, lastName;
      if (row['Name'] || row.name) {
        const fullName = (row['Name'] || row.name).trim();
        const nameParts = fullName.split(' ');
        firstName = nameParts[0] || 'Coach';
        lastName = nameParts.slice(1).join(' ') || fullName;
      } else {
        firstName = row.first_name || 'Coach';
        lastName = row.last_name || '';
      }

      const email = row['Email'] || row.email || null;
      const phone = row['Phone'] || row.phone || null;
      const certifications = row['Certifications'] || row.certifications;

      const coach = {
        id: row.id || `coach-${generateId(firstName + ' ' + lastName)}`,
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone || null,
        role: (row.role || 'head').toLowerCase(),
        bio: row.bio || null,
        certifications: certifications ? String(certifications).split(',').map(c => c.trim()).filter(Boolean) : [],
      };
      coaches.push(coach);
      coachMap.set(coach.email || coach.id, coach);
    });
  }

  // Process Schedule/Games sheet
  let events = [];
  const scheduleSheetName = sheetNames.find(s =>
    ['Schedule', 'Games', 'Events', 'Tournaments'].includes(s)
  );

  if (scheduleSheetName) {
    const scheduleSheet = workbook.Sheets[scheduleSheetName];
    const scheduleData = XLSX.utils.sheet_to_json(scheduleSheet);

    console.log(`Found ${scheduleData.length} events in ${scheduleSheetName} sheet`);

    scheduleData.forEach(row => {
      const event = {
        id: row.id || generateId(row.name || `event-${events.length + 1}`),
        game_type: (row.game_type || row.type || 'tournament').toLowerCase(),
        name: row.name,
        date: row.date ? formatDate(row.date) : null,
        end_date: row.end_date ? formatDate(row.end_date) : null,
        start_time: row.start_time || null,
        end_time: row.end_time || null,
        location: row.location || null,
        notes: row.notes || null,
        is_featured: row.is_featured === true || row.is_featured === 'true' || row.is_featured === 'TRUE',
        gender: (row.gender || 'both').toLowerCase(),
        team_ids: row.team_ids ? row.team_ids.split(',').map(t => t.trim()) : [],
      };
      events.push(event);
    });
  }

  // Process Rosters sheet if it exists
  let rosters = [];
  if (sheetNames.includes('Rosters')) {
    const rostersSheet = workbook.Sheets['Rosters'];
    const rostersData = XLSX.utils.sheet_to_json(rostersSheet);

    console.log(`Found ${rostersData.length} players in Rosters sheet`);

    // Group players by team
    const teamPlayersMap = new Map();

    rostersData.forEach((row, index) => {
      const teamName = row['Team Name'];
      if (!teamName) return;

      // Generate team ID to match teams.json format
      const teamId = generateId(teamName);

      // Parse player name into first/last
      const playerName = row['Player Name'] || '';
      const nameParts = playerName.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Parse jersey number (may be empty or a number)
      const jerseyRaw = row['Jersey #'];
      const jerseyNumber = jerseyRaw ? String(jerseyRaw).trim() || null : null;

      // Parse grade and graduating year
      const grade = row['Grade'] || null;
      const gradYear = row['Grad Year'] ? parseInt(row['Grad Year']) : null;

      const player = {
        id: `player-${index + 1}`,
        first_name: firstName,
        last_name: lastName,
        jersey_number: jerseyNumber,
        position: row['Position'] || null,
        grade: grade,
        graduating_year: gradYear,
      };

      if (!teamPlayersMap.has(teamId)) {
        teamPlayersMap.set(teamId, []);
      }
      teamPlayersMap.get(teamId).push(player);
    });

    // Convert map to array format
    for (const [teamId, players] of teamPlayersMap) {
      rosters.push({
        team_id: teamId,
        players: players,
      });
    }
  }

  // Get season info from config or use defaults
  const existingConfig = loadExistingConfig();
  const seasonId = existingConfig?.season?.id || '2024-25-winter';
  const seasonName = existingConfig?.season?.name || '2024-25 Winter';
  const timestamp = new Date().toISOString();

  // Write teams.json
  const teamsOutput = {
    season: {
      id: seasonId,
      name: seasonName,
    },
    teams,
    updated_at: timestamp,
  };
  writeFileSync(join(JSON_DIR, 'teams.json'), JSON.stringify(teamsOutput, null, 2));
  console.log(`Wrote ${teams.length} teams to teams.json`);

  // Write coaches.json
  const coachesOutput = {
    coaches,
    updated_at: timestamp,
  };
  writeFileSync(join(JSON_DIR, 'coaches.json'), JSON.stringify(coachesOutput, null, 2));
  console.log(`Wrote ${coaches.length} coaches to coaches.json`);

  // Write schedule.json
  const scheduleOutput = {
    season_id: seasonId,
    events,
    updated_at: timestamp,
  };
  writeFileSync(join(JSON_DIR, 'schedule.json'), JSON.stringify(scheduleOutput, null, 2));
  console.log(`Wrote ${events.length} events to schedule.json`);

  // Write rosters.json
  const rostersOutput = {
    rosters,
    updated_at: timestamp,
  };
  writeFileSync(join(JSON_DIR, 'rosters.json'), JSON.stringify(rostersOutput, null, 2));
  const totalPlayers = rosters.reduce((sum, r) => sum + r.players.length, 0);
  console.log(`Wrote ${totalPlayers} players across ${rosters.length} teams to rosters.json`);

  console.log('\nDone! JSON files updated successfully.');
  console.log('Run "npm run validate:data" to verify the output.');
}

// Helper to format Excel dates
function formatDate(dateValue) {
  if (!dateValue) return null;

  // If already a string in YYYY-MM-DD format
  if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return dateValue;
  }

  // If it's an Excel serial number
  if (typeof dateValue === 'number') {
    const date = XLSX.SSF.parse_date_code(dateValue);
    return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
  }

  // Try to parse as date string
  try {
    const date = new Date(dateValue);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch {
    // Ignore parsing errors
  }

  return null;
}

// Run the conversion
convertExcelToJSON();
