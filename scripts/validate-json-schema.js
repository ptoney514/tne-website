#!/usr/bin/env node

/**
 * JSON Schema Validation Script
 *
 * Validates data/json/*.json files for:
 * - Valid JSON syntax
 * - Required fields
 * - Foreign key integrity (coach IDs)
 * - Data type correctness
 *
 * Exit code 1 on failure to block deployment.
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(__dirname, '..', 'data', 'json');

let errors = [];
let warnings = [];

// Helper to add error
function addError(file, message) {
  errors.push(`[${file}] ${message}`);
}

// Helper to add warning
function addWarning(file, message) {
  warnings.push(`[${file}] ${message}`);
}

// Load and parse JSON file
function loadJSON(filename) {
  const filepath = join(DATA_DIR, filename);

  if (!existsSync(filepath)) {
    addError(filename, `File not found: ${filepath}`);
    return null;
  }

  try {
    const content = readFileSync(filepath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    addError(filename, `Invalid JSON: ${err.message}`);
    return null;
  }
}

// Validate teams.json
function validateTeams(data, coaches) {
  const filename = 'teams.json';

  if (!data) return;

  // Check required top-level fields
  if (!data.season || !data.season.id || !data.season.name) {
    addError(filename, 'Missing or invalid "season" object (requires id, name)');
  }

  if (!Array.isArray(data.teams)) {
    addError(filename, '"teams" must be an array');
    return;
  }

  if (!data.updated_at) {
    addWarning(filename, 'Missing "updated_at" timestamp');
  }

  // Build coach ID set for foreign key validation
  const validCoachIds = new Set();
  if (coaches && Array.isArray(coaches.coaches)) {
    coaches.coaches.forEach(c => validCoachIds.add(c.id));
  }

  // Validate each team
  const teamIds = new Set();
  data.teams.forEach((team, index) => {
    const teamLabel = team.name || `teams[${index}]`;

    // Required fields
    const required = ['id', 'name', 'grade_level', 'gender', 'tier'];
    required.forEach(field => {
      if (!team[field]) {
        addError(filename, `${teamLabel}: Missing required field "${field}"`);
      }
    });

    // Check for duplicate IDs
    if (team.id) {
      if (teamIds.has(team.id)) {
        addError(filename, `${teamLabel}: Duplicate team ID "${team.id}"`);
      }
      teamIds.add(team.id);
    }

    // Validate gender
    if (team.gender && !['male', 'female', 'coed'].includes(team.gender)) {
      addError(filename, `${teamLabel}: Invalid gender "${team.gender}" (must be male, female, or coed)`);
    }

    // Validate tier
    if (team.tier && !['tne', 'express', 'development'].includes(team.tier)) {
      addWarning(filename, `${teamLabel}: Non-standard tier "${team.tier}"`);
    }

    // Validate coach foreign keys
    if (team.head_coach_id && validCoachIds.size > 0 && !validCoachIds.has(team.head_coach_id)) {
      addError(filename, `${teamLabel}: Invalid head_coach_id "${team.head_coach_id}" (not found in coaches.json)`);
    }

    if (team.assistant_coach_id && validCoachIds.size > 0 && !validCoachIds.has(team.assistant_coach_id)) {
      addError(filename, `${teamLabel}: Invalid assistant_coach_id "${team.assistant_coach_id}" (not found in coaches.json)`);
    }

    // Validate numeric fields
    if (team.team_fee !== undefined && typeof team.team_fee !== 'number') {
      addError(filename, `${teamLabel}: team_fee must be a number`);
    }

    if (team.uniform_fee !== undefined && typeof team.uniform_fee !== 'number') {
      addError(filename, `${teamLabel}: uniform_fee must be a number`);
    }

    if (team.player_count !== undefined && (!Number.isInteger(team.player_count) || team.player_count < 0)) {
      addError(filename, `${teamLabel}: player_count must be a non-negative integer`);
    }
  });
}

// Validate coaches.json
function validateCoaches(data) {
  const filename = 'coaches.json';

  if (!data) return;

  if (!Array.isArray(data.coaches)) {
    addError(filename, '"coaches" must be an array');
    return;
  }

  if (!data.updated_at) {
    addWarning(filename, 'Missing "updated_at" timestamp');
  }

  const coachIds = new Set();
  data.coaches.forEach((coach, index) => {
    const coachLabel = coach.first_name && coach.last_name
      ? `${coach.first_name} ${coach.last_name}`
      : `coaches[${index}]`;

    // Required fields
    const required = ['id', 'first_name', 'last_name'];
    required.forEach(field => {
      if (!coach[field]) {
        addError(filename, `${coachLabel}: Missing required field "${field}"`);
      }
    });

    // Check for duplicate IDs
    if (coach.id) {
      if (coachIds.has(coach.id)) {
        addError(filename, `${coachLabel}: Duplicate coach ID "${coach.id}"`);
      }
      coachIds.add(coach.id);
    }

    // Validate role
    if (coach.role && !['head', 'assistant', 'volunteer'].includes(coach.role)) {
      addWarning(filename, `${coachLabel}: Non-standard role "${coach.role}"`);
    }

    // Validate email format (basic check)
    if (coach.email && !coach.email.includes('@')) {
      addError(filename, `${coachLabel}: Invalid email format "${coach.email}"`);
    }
  });
}

// Validate schedule.json
function validateSchedule(data) {
  const filename = 'schedule.json';

  if (!data) return;

  if (!data.season_id) {
    addWarning(filename, 'Missing "season_id"');
  }

  if (!Array.isArray(data.events)) {
    addError(filename, '"events" must be an array');
    return;
  }

  if (!data.updated_at) {
    addWarning(filename, 'Missing "updated_at" timestamp');
  }

  const eventIds = new Set();
  data.events.forEach((event, index) => {
    const eventLabel = event.name || `events[${index}]`;

    // Required fields
    const required = ['id', 'name', 'date'];
    required.forEach(field => {
      if (!event[field]) {
        addError(filename, `${eventLabel}: Missing required field "${field}"`);
      }
    });

    // Check for duplicate IDs
    if (event.id) {
      if (eventIds.has(event.id)) {
        addError(filename, `${eventLabel}: Duplicate event ID "${event.id}"`);
      }
      eventIds.add(event.id);
    }

    // Validate game_type
    if (event.game_type && !['tournament', 'game', 'practice', 'scrimmage', 'league'].includes(event.game_type)) {
      addWarning(filename, `${eventLabel}: Non-standard game_type "${event.game_type}"`);
    }

    // Validate date format (YYYY-MM-DD)
    if (event.date && !/^\d{4}-\d{2}-\d{2}$/.test(event.date)) {
      addError(filename, `${eventLabel}: Invalid date format "${event.date}" (expected YYYY-MM-DD)`);
    }

    // Validate end_date format if present
    if (event.end_date && !/^\d{4}-\d{2}-\d{2}$/.test(event.end_date)) {
      addError(filename, `${eventLabel}: Invalid end_date format "${event.end_date}" (expected YYYY-MM-DD)`);
    }

    // Validate gender
    if (event.gender && !['male', 'female', 'both', 'coed'].includes(event.gender)) {
      addError(filename, `${eventLabel}: Invalid gender "${event.gender}"`);
    }

    // Validate is_featured is boolean
    if (event.is_featured !== undefined && typeof event.is_featured !== 'boolean') {
      addError(filename, `${eventLabel}: is_featured must be a boolean`);
    }
  });
}

// Validate config.json
function validateConfig(data) {
  const filename = 'config.json';

  if (!data) return;

  // Check season
  if (!data.season || !data.season.id || !data.season.name) {
    addError(filename, 'Missing or invalid "season" object (requires id, name)');
  }

  // Check registration
  if (!data.registration) {
    addError(filename, 'Missing "registration" object');
  } else {
    if (typeof data.registration.is_open !== 'boolean') {
      addError(filename, 'registration.is_open must be a boolean');
    }
  }

  // Check tryouts
  if (!data.tryouts) {
    addError(filename, 'Missing "tryouts" object');
  } else {
    if (typeof data.tryouts.is_open !== 'boolean') {
      addError(filename, 'tryouts.is_open must be a boolean');
    }
  }

  if (!data.updated_at) {
    addWarning(filename, 'Missing "updated_at" timestamp');
  }
}

// Main validation function
function main() {
  console.log('Validating JSON data files...\n');

  // Load all files
  const coaches = loadJSON('coaches.json');
  const teams = loadJSON('teams.json');
  const schedule = loadJSON('schedule.json');
  const config = loadJSON('config.json');

  // Validate each file
  validateCoaches(coaches);
  validateTeams(teams, coaches);
  validateSchedule(schedule);
  validateConfig(config);

  // Print results
  if (warnings.length > 0) {
    console.log('Warnings:');
    warnings.forEach(w => console.log(`  ⚠ ${w}`));
    console.log('');
  }

  if (errors.length > 0) {
    console.log('Errors:');
    errors.forEach(e => console.log(`  ✗ ${e}`));
    console.log(`\n✗ Validation failed with ${errors.length} error(s)`);
    process.exit(1);
  }

  console.log(`✓ All JSON files validated successfully`);
  if (warnings.length > 0) {
    console.log(`  (${warnings.length} warning(s))`);
  }
  process.exit(0);
}

main();
