#!/usr/bin/env node
/**
 * TNE United Express - Practice Schedule Import Script
 *
 * Usage:
 *   node scripts/import-practices.js
 *
 * Requirements:
 *   - Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
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

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Practice schedule data based on user input
const practiceSchedules = [
  // Boys Practice Schedule (starts Dec 1)
  // 3rd/4th Foster - Mon and Wed at Monroe MS 6:00-7:30
  {
    day_of_week: 'Monday',
    start_time: '18:00',
    end_time: '19:30',
    location: 'Monroe MS',
    notes: '3rd/4th Foster',
    teams: ['Express United 3rd', 'Express United Foster 4th']
  },
  {
    day_of_week: 'Wednesday',
    start_time: '18:00',
    end_time: '19:30',
    location: 'Monroe MS',
    notes: '3rd/4th Foster',
    teams: ['Express United 3rd', 'Express United Foster 4th']
  },

  // 4th Grixby/Evans - Tues and Wed at Monroe MS 6:00-7:30
  {
    day_of_week: 'Tuesday',
    start_time: '18:00',
    end_time: '19:30',
    location: 'Monroe MS',
    notes: '4th Grixby/Evans',
    teams: ['Express United Grixby/Evans 4th']
  },
  {
    day_of_week: 'Wednesday',
    start_time: '18:00',
    end_time: '19:30',
    location: 'Monroe MS',
    notes: '4th Grixby/Evans',
    teams: ['Express United Grixby/Evans 4th']
  },

  // TNE Jr 3SSB 5th/Express United 5th - Tues and Thur at Monroe MS 6:00-7:30
  // Note: No 5th grade teams exist yet - creating practice without team links
  {
    day_of_week: 'Tuesday',
    start_time: '18:00',
    end_time: '19:30',
    location: 'Monroe MS',
    notes: '5th grade (TNE Jr 3SSB / Express United)',
    teams: []
  },
  {
    day_of_week: 'Thursday',
    start_time: '18:00',
    end_time: '19:30',
    location: 'Monroe MS',
    notes: '5th grade (TNE Jr 3SSB / Express United)',
    teams: []
  },

  // Express United 6th - Tues at McMillan MS 6:00-7:30 and Thur at Monroe MS 6:00-7:30
  // Note: No 6th grade teams exist yet
  {
    day_of_week: 'Tuesday',
    start_time: '18:00',
    end_time: '19:30',
    location: 'McMillan MS',
    notes: 'Express United 6th (Coach Darryle)',
    teams: []
  },
  {
    day_of_week: 'Thursday',
    start_time: '18:00',
    end_time: '19:30',
    location: 'Monroe MS',
    notes: 'Express United 6th (Coach Darryle)',
    teams: []
  },

  // TNE Jr 3SSB 6th - Tues at McMillan MS 6:00-7:30 and Wed at Central HS 6:00-7:30
  // Note: No 6th grade teams exist yet
  {
    day_of_week: 'Tuesday',
    start_time: '18:00',
    end_time: '19:30',
    location: 'McMillan MS',
    notes: 'TNE Jr 3SSB 6th',
    teams: []
  },
  {
    day_of_week: 'Wednesday',
    start_time: '18:00',
    end_time: '19:30',
    location: 'Central HS',
    notes: 'TNE Jr 3SSB 6th',
    teams: []
  },

  // Express United 7th/8th - Mon and Wed at Central HS 6:00-7:30
  {
    day_of_week: 'Monday',
    start_time: '18:00',
    end_time: '19:30',
    location: 'Central HS',
    notes: 'Express United 7th/8th',
    teams: ['TNE/Express United 7th', 'Express United 8th']
  },
  {
    day_of_week: 'Wednesday',
    start_time: '18:00',
    end_time: '19:30',
    location: 'Central HS',
    notes: 'Express United 7th/8th',
    teams: ['TNE/Express United 7th', 'Express United 8th']
  },

  // TNE Jr 3SSB 7th/8th/TNE 8th - Wed at Central HS 6:00-7:30 and Thur at North HS 6:00-7:30
  {
    day_of_week: 'Wednesday',
    start_time: '18:00',
    end_time: '19:30',
    location: 'Central HS',
    notes: 'TNE Jr 3SSB 7th/8th/TNE 8th',
    teams: ['TNE Jr 3SSB 7th', 'TNE Jr 3SSB 8th', 'TNE/Express United 8th']
  },
  {
    day_of_week: 'Thursday',
    start_time: '18:00',
    end_time: '19:30',
    location: 'North HS',
    notes: 'TNE Jr 3SSB 7th/8th/TNE 8th',
    teams: ['TNE Jr 3SSB 7th', 'TNE Jr 3SSB 8th', 'TNE/Express United 8th']
  },

  // Girls Practice Schedule
  // 5th-8th skills - Mon 6:30-8:30 at North HS
  {
    day_of_week: 'Monday',
    start_time: '18:30',
    end_time: '20:30',
    location: 'North HS',
    notes: 'Girls 5th-8th Skills Development',
    teams: []
  },

  // 5th-7th - Thu at Boys and Girls Club 6:00-8:00
  {
    day_of_week: 'Thursday',
    start_time: '18:00',
    end_time: '20:00',
    location: 'Boys and Girls Club',
    notes: 'Girls 5th-7th',
    teams: []
  },

  // 8th - Thu at Nathan Hale MS 6:30-8:30
  {
    day_of_week: 'Thursday',
    start_time: '18:30',
    end_time: '20:30',
    location: 'Nathan Hale MS',
    notes: 'Girls 8th',
    teams: []
  }
];

async function main() {
  console.log('TNE United Express - Practice Schedule Import');
  console.log('=============================================\n');

  // Get active season
  const { data: season, error: seasonError } = await supabase
    .from('seasons')
    .select('id, name')
    .eq('is_active', true)
    .single();

  if (seasonError || !season) {
    console.error('Error: No active season found');
    process.exit(1);
  }

  console.log(`Using season: ${season.name}\n`);

  // Get existing teams for linking
  const { data: teams } = await supabase
    .from('teams')
    .select('id, name')
    .eq('season_id', season.id);

  const teamNameToId = {};
  teams?.forEach(t => { teamNameToId[t.name] = t.id; });

  console.log(`Found ${teams?.length || 0} teams in database\n`);

  let imported = 0;
  let linked = 0;

  for (const schedule of practiceSchedules) {
    // Check if practice session already exists
    const { data: existing } = await supabase
      .from('practice_sessions')
      .select('id')
      .eq('season_id', season.id)
      .eq('day_of_week', schedule.day_of_week)
      .eq('start_time', schedule.start_time)
      .eq('location', schedule.location)
      .eq('notes', schedule.notes)
      .single();

    if (existing) {
      console.log(`  Skipping (exists): ${schedule.day_of_week} ${schedule.start_time} at ${schedule.location}`);
      continue;
    }

    // Create practice session
    const { data: practice, error: practiceError } = await supabase
      .from('practice_sessions')
      .insert({
        season_id: season.id,
        day_of_week: schedule.day_of_week,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        location: schedule.location,
        notes: schedule.notes,
        is_active: true
      })
      .select()
      .single();

    if (practiceError) {
      console.error(`  Error creating practice: ${practiceError.message}`);
      continue;
    }

    console.log(`  Created: ${schedule.day_of_week} ${schedule.start_time} at ${schedule.location}`);
    imported++;

    // Link teams
    for (const teamName of schedule.teams) {
      const teamId = teamNameToId[teamName];
      if (teamId) {
        const { error: linkError } = await supabase
          .from('practice_session_teams')
          .insert({
            practice_session_id: practice.id,
            team_id: teamId
          });

        if (!linkError) {
          console.log(`    Linked: ${teamName}`);
          linked++;
        }
      } else {
        console.log(`    Team not found: ${teamName}`);
      }
    }
  }

  console.log(`\nDone! Created ${imported} practice sessions, linked ${linked} teams.`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
