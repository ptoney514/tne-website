#!/usr/bin/env node
/**
 * Generate Excel template for team data seeding
 *
 * Creates data/team-data.xlsx with:
 * - Coaches sheet
 * - Teams sheet
 * - Rosters sheet
 *
 * Populated with sample data from existing CSV files
 */

import XLSX from 'xlsx';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const dataDir = path.join(rootDir, 'data');

// Helper to read existing CSV if it exists
function readCSV(filename) {
  const filepath = path.join(dataDir, filename);
  if (!fs.existsSync(filepath)) {
    return [];
  }
  const content = fs.readFileSync(filepath, 'utf-8');
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });
}

// Calculate grade from graduating year
function calculateGrade(gradYear) {
  // School year 2024-25: 8th graders graduate 2031
  // Formula: grade = 8 - (gradYear - 2031)
  const currentGradYear = 2031; // 8th grade graduation year
  const gradeNum = 8 - (gradYear - currentGradYear);

  if (gradeNum <= 0) return 'K';
  if (gradeNum > 12) return '12th';

  const suffix = gradeNum === 1 ? 'st' : gradeNum === 2 ? 'nd' : gradeNum === 3 ? 'rd' : 'th';
  return `${gradeNum}${suffix}`;
}

function main() {
  console.log('Generating Excel template: data/team-data.xlsx\n');

  // Read existing CSV data
  const existingCoaches = readCSV('coaches.csv');
  const existingTeams = readCSV('teams.csv');
  const existingPlayers = readCSV('players.csv');

  // Default season
  const defaultSeason = '2024-25 Winter';

  // Build Coaches data
  const coachesData = [
    ['Name', 'Email', 'Phone', 'Certifications']
  ];

  if (existingCoaches.length > 0) {
    for (const c of existingCoaches) {
      const name = `${c.first_name} ${c.last_name}`.trim();
      coachesData.push([
        name,
        c.email || '',
        c.phone || '',
        c.certifications || ''
      ]);
    }
    console.log(`  Coaches: ${existingCoaches.length} from coaches.csv`);
  } else {
    // Sample data
    coachesData.push(['Coach Smith', 'smith@email.com', '555-1234', 'First Aid, CPR']);
    coachesData.push(['Coach Jones', 'jones@email.com', '555-5678', 'First Aid']);
    console.log('  Coaches: 2 sample entries');
  }

  // Build Teams data
  const teamsData = [
    ['Season', 'Team Name', 'Grade Level', 'Gender', 'Head Coach', 'Assistant Coach', 'Team Fee', 'Uniform Fee']
  ];

  // Build a coach name lookup from email
  const coachNameByEmail = {};
  for (const c of existingCoaches) {
    coachNameByEmail[c.email] = `${c.first_name} ${c.last_name}`.trim();
  }

  if (existingTeams.length > 0) {
    for (const t of existingTeams) {
      const headCoach = t.head_coach_email ? (coachNameByEmail[t.head_coach_email] || t.head_coach_email) : '';
      const assistantCoach = t.assistant_coach_email ? (coachNameByEmail[t.assistant_coach_email] || t.assistant_coach_email) : '';

      teamsData.push([
        defaultSeason,
        t.name,
        t.grade_level,
        t.gender || 'male',
        headCoach,
        assistantCoach,
        650,
        150
      ]);
    }
    console.log(`  Teams: ${existingTeams.length} from teams.csv`);
  } else {
    // Sample data
    teamsData.push([defaultSeason, 'Express 5th Boys', '5th', 'boys', 'Coach Smith', '', 650, 150]);
    teamsData.push([defaultSeason, 'Express 6th Boys', '6th', 'boys', 'Coach Jones', 'Coach Smith', 650, 150]);
    console.log('  Teams: 2 sample entries');
  }

  // Build Rosters data
  const rostersData = [
    ['Season', 'Team Name', 'Player Name', 'Jersey #', 'Position', 'Grade', 'Grad Year']
  ];

  if (existingPlayers.length > 0) {
    for (const p of existingPlayers) {
      const name = `${p.first_name} ${p.last_name}`.trim();
      const gradYear = parseInt(p.graduating_year) || 2032;
      const grade = calculateGrade(gradYear);

      rostersData.push([
        defaultSeason,
        p.team_name,
        name,
        p.jersey_number || '',
        p.position || '',
        grade,
        gradYear
      ]);
    }
    console.log(`  Rosters: ${existingPlayers.length} players from players.csv`);
  } else {
    // Sample data
    rostersData.push([defaultSeason, 'Express 5th Boys', 'John Smith', 23, 'PG', '5th', 2032]);
    rostersData.push([defaultSeason, 'Express 5th Boys', 'Mike Johnson', 12, 'SG', '5th', 2032]);
    rostersData.push([defaultSeason, 'Express 6th Boys', 'David Wilson', 5, 'C', '6th', 2031]);
    console.log('  Rosters: 3 sample entries');
  }

  // Create workbook
  const workbook = XLSX.utils.book_new();

  // Add sheets
  const coachesSheet = XLSX.utils.aoa_to_sheet(coachesData);
  const teamsSheet = XLSX.utils.aoa_to_sheet(teamsData);
  const rostersSheet = XLSX.utils.aoa_to_sheet(rostersData);

  // Set column widths
  coachesSheet['!cols'] = [
    { wch: 20 }, // Name
    { wch: 30 }, // Email
    { wch: 15 }, // Phone
    { wch: 25 }  // Certifications
  ];

  teamsSheet['!cols'] = [
    { wch: 18 }, // Season
    { wch: 35 }, // Team Name
    { wch: 12 }, // Grade Level
    { wch: 10 }, // Gender
    { wch: 20 }, // Head Coach
    { wch: 20 }, // Assistant Coach
    { wch: 10 }, // Team Fee
    { wch: 12 }  // Uniform Fee
  ];

  rostersSheet['!cols'] = [
    { wch: 18 }, // Season
    { wch: 35 }, // Team Name
    { wch: 25 }, // Player Name
    { wch: 10 }, // Jersey #
    { wch: 12 }, // Position
    { wch: 8 },  // Grade
    { wch: 10 }  // Grad Year
  ];

  XLSX.utils.book_append_sheet(workbook, coachesSheet, 'Coaches');
  XLSX.utils.book_append_sheet(workbook, teamsSheet, 'Teams');
  XLSX.utils.book_append_sheet(workbook, rostersSheet, 'Rosters');

  // Write file
  const outputPath = path.join(dataDir, 'team-data.xlsx');
  XLSX.writeFile(workbook, outputPath);

  console.log(`\nCreated: ${outputPath}`);
  console.log('\nEdit this file to update team data, then run:');
  console.log('  npm run seed        # Seed data from Excel');
  console.log('  npm run seed:clear  # Clear seeded data');
  console.log('  npm run seed:reset  # Clear and re-seed');
}

main();
