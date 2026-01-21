import { describe, it, expect } from 'vitest';
import {
  generateId,
  parseExcelFile,
  compareWithExisting,
  generateTemplateFile,
  exportToExcel,
} from '../../lib/excelParser';
import * as XLSX from 'xlsx';

describe('generateId', () => {
  it('converts name to slug format', () => {
    expect(generateId('Express United 12U Boys')).toBe('express-united-12u-boys');
  });

  it('handles special characters', () => {
    expect(generateId("Team's Name!")).toBe('teams-name');
  });

  it('handles multiple spaces', () => {
    expect(generateId('Team   Name')).toBe('team-name');
  });

  it('handles empty string', () => {
    expect(generateId('')).toBe('');
  });

  it('handles null/undefined', () => {
    expect(generateId(null)).toBe('');
    expect(generateId(undefined)).toBe('');
  });
});

describe('parseExcelFile', () => {
  // Helper to create a mock Excel file
  function createMockExcel(sheets) {
    const wb = XLSX.utils.book_new();
    for (const [name, data] of Object.entries(sheets)) {
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, name);
    }
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    return wbout;
  }

  it('parses Teams sheet correctly', async () => {
    const buffer = createMockExcel({
      Teams: [
        {
          'Team Name': 'Express 12U Boys',
          'Grade Level': '12U',
          'Gender': 'male',
          'Tier': 'express',
          'Head Coach': 'John Smith',
          'Team Fee': 450,
        },
      ],
    });

    const result = await parseExcelFile(buffer);

    expect(result.teams).toHaveLength(1);
    expect(result.teams[0].name).toBe('Express 12U Boys');
    expect(result.teams[0].grade_level).toBe('12U');
    expect(result.teams[0].gender).toBe('male');
    expect(result.teams[0].tier).toBe('express');
    expect(result.teams[0].team_fee).toBe(450);
    // Teams now store coach names (not IDs) for later resolution to UUIDs
    expect(result.teams[0].head_coach_name).toBe('John Smith');
    expect(result.teams[0]).not.toHaveProperty('id'); // No ID generated, DB will create UUID
  });

  it('creates coaches from Teams sheet Head Coach column', async () => {
    const buffer = createMockExcel({
      Teams: [
        { 'Team Name': 'Team 1', 'Head Coach': 'John Smith' },
        { 'Team Name': 'Team 2', 'Head Coach': 'Jane Doe' },
      ],
    });

    const result = await parseExcelFile(buffer);

    expect(result.coaches).toHaveLength(2);
    expect(result.coaches[0].first_name).toBe('John');
    expect(result.coaches[0].last_name).toBe('Smith');
    expect(result.coaches[1].first_name).toBe('Jane');
    expect(result.coaches[1].last_name).toBe('Doe');
  });

  it('deduplicates coaches referenced multiple times', async () => {
    const buffer = createMockExcel({
      Teams: [
        { 'Team Name': 'Team 1', 'Head Coach': 'John Smith' },
        { 'Team Name': 'Team 2', 'Head Coach': 'John Smith' },
      ],
    });

    const result = await parseExcelFile(buffer);

    expect(result.coaches).toHaveLength(1);
    // Teams store coach names (not IDs) for later resolution
    expect(result.teams[0].head_coach_name).toBe('John Smith');
    expect(result.teams[1].head_coach_name).toBe('John Smith');
  });

  it('parses Coaches sheet when present', async () => {
    const buffer = createMockExcel({
      Teams: [{ 'Team Name': 'Team 1' }],
      Coaches: [
        { Name: 'John Smith', Email: 'john@example.com', Role: 'head' },
        { Name: 'Jane Doe', Email: 'jane@example.com', Role: 'assistant' },
      ],
    });

    const result = await parseExcelFile(buffer);

    expect(result.coaches).toHaveLength(2);
    expect(result.coaches[0].email).toBe('john@example.com');
    expect(result.coaches[1].role).toBe('assistant');
  });

  it('parses Rosters sheet correctly with required fields', async () => {
    const buffer = createMockExcel({
      Teams: [{ 'Team Name': 'Express 12U Boys' }],
      Rosters: [
        {
          'Team Name': 'Express 12U Boys',
          'Player Name': 'Michael Johnson',
          'Jersey #': 23,
          'Date of Birth': '2012-03-15',
          'Current Grade': '6th',
          'Graduating Year': 2030,
          'Gender': 'male'
        },
        {
          'Team Name': 'Express 12U Boys',
          'Player Name': 'James Williams',
          'Jersey #': 10,
          'Date of Birth': '2012-06-20',
          'Current Grade': '6th',
          'Graduating Year': 2030,
          'Gender': 'male'
        },
      ],
    });

    const result = await parseExcelFile(buffer);

    expect(result.rosters).toHaveLength(1);
    // Rosters now use team_name (not team_id) for later resolution to UUID
    expect(result.rosters[0].team_name).toBe('Express 12U Boys');
    expect(result.rosters[0]).not.toHaveProperty('team_id');
    expect(result.rosters[0].players).toHaveLength(2);
    expect(result.rosters[0].players[0].first_name).toBe('Michael');
    expect(result.rosters[0].players[0].last_name).toBe('Johnson');
    expect(result.rosters[0].players[0].jersey_number).toBe('23');
    // Check required fields are parsed
    expect(result.rosters[0].players[0].date_of_birth).toBe('2012-03-15');
    expect(result.rosters[0].players[0].current_grade).toBe('6th');
    expect(result.rosters[0].players[0].graduating_year).toBe(2030);
    expect(result.rosters[0].players[0].gender).toBe('male');
    // Players should not have IDs - DB will generate UUIDs
    expect(result.rosters[0].players[0]).not.toHaveProperty('id');
    expect(result.errors).toHaveLength(0);
  });

  it('adds errors for missing required player fields', async () => {
    const buffer = createMockExcel({
      Teams: [{ 'Team Name': 'Express 12U Boys' }],
      Rosters: [
        {
          'Team Name': 'Express 12U Boys',
          'Player Name': 'Michael Johnson',
          'Jersey #': 23,
          // Missing: Date of Birth, Current Grade, Graduating Year, Gender
        },
      ],
    });

    const result = await parseExcelFile(buffer);

    // Should have errors for missing required fields
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some(e => e.message.includes('date of birth'))).toBe(true);
    expect(result.errors.some(e => e.message.includes('current grade'))).toBe(true);
    expect(result.errors.some(e => e.message.includes('graduating year'))).toBe(true);
    expect(result.errors.some(e => e.message.includes('gender'))).toBe(true);
  });

  it('adds error for missing gender field', async () => {
    const buffer = createMockExcel({
      Teams: [{ 'Team Name': 'Express 12U Boys' }],
      Rosters: [
        {
          'Team Name': 'Express 12U Boys',
          'Player Name': 'Michael Johnson',
          'Jersey #': 23,
          'Date of Birth': '2012-03-15',
          'Current Grade': '6th',
          'Graduating Year': 2030,
          // Missing Gender
        },
      ],
    });

    const result = await parseExcelFile(buffer);

    expect(result.errors.some(e => e.message.includes('Missing gender'))).toBe(true);
    expect(result.errors.some(e => e.message.includes('Michael Johnson'))).toBe(true);
  });

  it('adds error for invalid gender value', async () => {
    const buffer = createMockExcel({
      Teams: [{ 'Team Name': 'Express 12U Boys' }],
      Rosters: [
        {
          'Team Name': 'Express 12U Boys',
          'Player Name': 'Michael Johnson',
          'Jersey #': 23,
          'Date of Birth': '2012-03-15',
          'Current Grade': '6th',
          'Graduating Year': 2030,
          'Gender': 'other', // Invalid value
        },
      ],
    });

    const result = await parseExcelFile(buffer);

    expect(result.errors.some(e => e.message.includes('Invalid gender'))).toBe(true);
    expect(result.errors.some(e => e.message.includes('Must be "male" or "female"'))).toBe(true);
  });

  it('accepts valid gender values', async () => {
    const buffer = createMockExcel({
      Teams: [{ 'Team Name': 'Express 12U Boys' }],
      Rosters: [
        {
          'Team Name': 'Express 12U Boys',
          'Player Name': 'Michael Johnson',
          'Jersey #': 23,
          'Date of Birth': '2012-03-15',
          'Current Grade': '6th',
          'Graduating Year': 2030,
          'Gender': 'male',
        },
        {
          'Team Name': 'Express 12U Boys',
          'Player Name': 'Sarah Smith',
          'Jersey #': 10,
          'Date of Birth': '2012-04-20',
          'Current Grade': '6th',
          'Graduating Year': 2030,
          'Gender': 'Female', // Mixed case should work
        },
      ],
    });

    const result = await parseExcelFile(buffer);

    // No gender-related errors
    expect(result.errors.filter(e => e.message.includes('gender'))).toHaveLength(0);
    expect(result.rosters[0].players[0].gender).toBe('male');
    expect(result.rosters[0].players[1].gender).toBe('female');
  });

  it('adds errors for teams without names', async () => {
    const buffer = createMockExcel({
      Teams: [
        { 'Team Name': 'Valid Team' },
        { 'Grade Level': '12U' }, // Missing name
      ],
    });

    const result = await parseExcelFile(buffer);

    expect(result.teams).toHaveLength(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toContain('Missing team name');
  });

  it('adds warning when Teams sheet is missing', async () => {
    const buffer = createMockExcel({
      Coaches: [{ Name: 'John Smith' }],
    });

    const result = await parseExcelFile(buffer);

    expect(result.warnings).toContain('No "Teams" sheet found in the workbook');
  });

  it('derives tier from team name when TNE is present', async () => {
    const buffer = createMockExcel({
      Teams: [
        { 'Team Name': 'TNE United 12U' },
        { 'Team Name': 'Express 12U' },
      ],
    });

    const result = await parseExcelFile(buffer);

    expect(result.teams[0].tier).toBe('tne');
    expect(result.teams[1].tier).toBe('express');
  });
});

describe('compareWithExisting', () => {
  it('identifies new teams by name', () => {
    const parsedData = {
      teams: [{ name: 'New Team' }],
      coaches: [],
      rosters: [],
    };
    const existingData = {
      teams: [],
      coaches: [],
      rosters: [],
    };

    const diff = compareWithExisting(parsedData, existingData);

    expect(diff.teams.new).toHaveLength(1);
    expect(diff.teams.updated).toHaveLength(0);
    expect(diff.teams.unchanged).toHaveLength(0);
  });

  it('identifies updated teams by name', () => {
    const parsedData = {
      teams: [{ name: 'Team 1', grade_level: '13U' }],
      coaches: [],
      rosters: [],
    };
    const existingData = {
      teams: [{ id: 'uuid-123', name: 'Team 1', grade_level: '12U' }],
      coaches: [],
      rosters: [],
    };

    const diff = compareWithExisting(parsedData, existingData);

    expect(diff.teams.new).toHaveLength(0);
    expect(diff.teams.updated).toHaveLength(1);
    expect(diff.teams.unchanged).toHaveLength(0);
  });

  it('identifies unchanged teams by name', () => {
    const parsedData = {
      teams: [{ name: 'Team 1', grade_level: '12U', gender: 'male', tier: 'express' }],
      coaches: [],
      rosters: [],
    };
    const existingData = {
      teams: [{ id: 'uuid-123', name: 'Team 1', grade_level: '12U', gender: 'male', tier: 'express' }],
      coaches: [],
      rosters: [],
    };

    const diff = compareWithExisting(parsedData, existingData);

    expect(diff.teams.new).toHaveLength(0);
    expect(diff.teams.updated).toHaveLength(0);
    expect(diff.teams.unchanged).toHaveLength(1);
  });

  it('identifies new coaches by email', () => {
    const parsedData = {
      teams: [],
      coaches: [{ first_name: 'John', last_name: 'Smith', email: 'john@example.com' }],
      rosters: [],
    };
    const existingData = {
      teams: [],
      coaches: [],
      rosters: [],
    };

    const diff = compareWithExisting(parsedData, existingData);

    expect(diff.coaches.new).toHaveLength(1);
  });

  it('identifies existing coaches by email', () => {
    const parsedData = {
      teams: [],
      coaches: [{ first_name: 'John', last_name: 'Smith', email: 'john@example.com' }],
      rosters: [],
    };
    const existingData = {
      teams: [],
      coaches: [{ id: 'uuid-456', first_name: 'John', last_name: 'Smith', email: 'john@example.com' }],
      rosters: [],
    };

    const diff = compareWithExisting(parsedData, existingData);

    expect(diff.coaches.new).toHaveLength(0);
    expect(diff.coaches.unchanged).toHaveLength(1);
  });

  it('detects head coach assignment changes', () => {
    const parsedData = {
      teams: [{
        name: 'Team 1',
        grade_level: '12U',
        gender: 'male',
        tier: 'express',
        head_coach_name: 'Jane Doe', // Changed from John Smith
        assistant_coach_name: null,
      }],
      coaches: [],
      rosters: [],
    };
    const existingData = {
      teams: [{
        id: 'uuid-123',
        name: 'Team 1',
        grade_level: '12U',
        gender: 'male',
        tier: 'express',
        head_coach: { first_name: 'John', last_name: 'Smith' },
        assistant_coach: null,
      }],
      coaches: [],
      rosters: [],
    };

    const diff = compareWithExisting(parsedData, existingData);

    expect(diff.teams.new).toHaveLength(0);
    expect(diff.teams.updated).toHaveLength(1);
    expect(diff.teams.unchanged).toHaveLength(0);
  });

  it('detects assistant coach assignment changes', () => {
    const parsedData = {
      teams: [{
        name: 'Team 1',
        grade_level: '12U',
        gender: 'male',
        tier: 'express',
        head_coach_name: 'John Smith',
        assistant_coach_name: 'New Assistant', // Added
      }],
      coaches: [],
      rosters: [],
    };
    const existingData = {
      teams: [{
        id: 'uuid-123',
        name: 'Team 1',
        grade_level: '12U',
        gender: 'male',
        tier: 'express',
        head_coach: { first_name: 'John', last_name: 'Smith' },
        assistant_coach: null, // No assistant before
      }],
      coaches: [],
      rosters: [],
    };

    const diff = compareWithExisting(parsedData, existingData);

    expect(diff.teams.new).toHaveLength(0);
    expect(diff.teams.updated).toHaveLength(1);
    expect(diff.teams.unchanged).toHaveLength(0);
  });

  it('considers team unchanged when coach names match (case-insensitive)', () => {
    const parsedData = {
      teams: [{
        name: 'Team 1',
        grade_level: '12U',
        gender: 'male',
        tier: 'express',
        head_coach_name: 'john smith', // lowercase
        assistant_coach_name: null,
      }],
      coaches: [],
      rosters: [],
    };
    const existingData = {
      teams: [{
        id: 'uuid-123',
        name: 'Team 1',
        grade_level: '12U',
        gender: 'male',
        tier: 'express',
        head_coach: { first_name: 'John', last_name: 'Smith' }, // Mixed case
        assistant_coach: null,
      }],
      coaches: [],
      rosters: [],
    };

    const diff = compareWithExisting(parsedData, existingData);

    expect(diff.teams.new).toHaveLength(0);
    expect(diff.teams.updated).toHaveLength(0);
    expect(diff.teams.unchanged).toHaveLength(1);
  });
});

describe('generateTemplateFile', () => {
  it('creates a valid Excel blob', () => {
    const blob = generateTemplateFile();

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  });
});

describe('exportToExcel', () => {
  it('creates a valid Excel blob for teams data', () => {
    const data = {
      teams: [
        { name: 'Team 1', grade_level: '12U', gender: 'male', tier: 'express' },
      ],
      coaches: [],
      rosters: [],
    };

    const blob = exportToExcel(data);

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  });

  it('creates a valid Excel blob for coaches data', () => {
    const data = {
      teams: [],
      coaches: [
        { first_name: 'John', last_name: 'Smith', email: 'john@example.com', role: 'head' },
      ],
      rosters: [],
    };

    const blob = exportToExcel(data);

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  });

  it('creates a valid Excel blob for rosters data with team_name', () => {
    const data = {
      teams: [{ id: 'uuid-123', name: 'Team 1' }],
      coaches: [],
      rosters: [
        {
          team_name: 'Team 1',
          players: [
            {
              first_name: 'Michael',
              last_name: 'Johnson',
              jersey_number: '23',
              date_of_birth: '2012-03-15',
              current_grade: '6th',
              graduating_year: 2030,
              gender: 'male'
            },
          ],
        },
      ],
    };

    const blob = exportToExcel(data);

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  });
});
