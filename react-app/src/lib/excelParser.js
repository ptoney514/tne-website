/**
 * Excel Parser Utility for Admin Dashboard
 *
 * Parses Excel files containing team, coach, and roster data
 * and validates it before syncing to Supabase.
 */

import * as XLSX from 'xlsx';

// Helper to generate slug-based ID
export function generateId(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
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

/**
 * Parse Excel file and return structured data with validation
 * @param {ArrayBuffer} fileBuffer - The Excel file as an ArrayBuffer
 * @returns {Object} Parsed data with teams, coaches, rosters, and errors
 */
export async function parseExcelFile(fileBuffer) {
  const workbook = XLSX.read(fileBuffer, { type: 'array' });
  const sheetNames = workbook.SheetNames;

  const result = {
    teams: [],
    coaches: [],
    rosters: [],
    events: [],
    errors: [],
    warnings: [],
    sheets: sheetNames,
  };

  const coachMap = new Map();

  // Process Teams sheet
  if (sheetNames.includes('Teams')) {
    try {
      const teamsSheet = workbook.Sheets['Teams'];
      const teamsData = XLSX.utils.sheet_to_json(teamsSheet);

      teamsData.forEach((row, rowIndex) => {
        const teamName = row['Team Name'] || row.name || row.team_name;

        if (!teamName) {
          result.errors.push({
            sheet: 'Teams',
            row: rowIndex + 2, // Excel row (1-indexed + header)
            message: 'Missing team name',
          });
          return;
        }

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
          const key = name.toLowerCase();

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
            result.coaches.push(coach);
          }
          headCoachId = coachMap.get(key).id;
        }

        if (assistantCoachName && assistantCoachName.trim()) {
          const name = assistantCoachName.trim();
          const key = name.toLowerCase();

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
            result.coaches.push(coach);
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
          id: generateId(teamName),
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
          _rowIndex: rowIndex + 2,
        };

        result.teams.push(team);
      });
    } catch (err) {
      result.errors.push({
        sheet: 'Teams',
        row: null,
        message: `Failed to parse Teams sheet: ${err.message}`,
      });
    }
  } else {
    result.warnings.push('No "Teams" sheet found in the workbook');
  }

  // Process Coaches sheet if it exists (overrides extracted coaches)
  if (sheetNames.includes('Coaches')) {
    try {
      const coachesSheet = workbook.Sheets['Coaches'];
      const coachesData = XLSX.utils.sheet_to_json(coachesSheet);

      // Clear existing and rebuild from sheet
      result.coaches = [];
      coachMap.clear();

      coachesData.forEach((row, rowIndex) => {
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

        if (!firstName && !lastName) {
          result.errors.push({
            sheet: 'Coaches',
            row: rowIndex + 2,
            message: 'Missing coach name',
          });
          return;
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
          role: (row.role || row.Role || 'head').toLowerCase(),
          bio: row.bio || null,
          certifications: certifications ? String(certifications).split(',').map(c => c.trim()).filter(Boolean) : [],
          _rowIndex: rowIndex + 2,
        };

        result.coaches.push(coach);
        coachMap.set(coach.email || coach.id, coach);
      });
    } catch (err) {
      result.errors.push({
        sheet: 'Coaches',
        row: null,
        message: `Failed to parse Coaches sheet: ${err.message}`,
      });
    }
  }

  // Process Rosters sheet if it exists
  if (sheetNames.includes('Rosters')) {
    try {
      const rostersSheet = workbook.Sheets['Rosters'];
      const rostersData = XLSX.utils.sheet_to_json(rostersSheet);

      const teamPlayersMap = new Map();

      rostersData.forEach((row, rowIndex) => {
        const teamName = row['Team Name'];
        if (!teamName) {
          result.warnings.push(`Rosters row ${rowIndex + 2}: Missing team name, skipping`);
          return;
        }

        const teamId = generateId(teamName);
        const playerName = row['Player Name'] || '';

        if (!playerName.trim()) {
          result.warnings.push(`Rosters row ${rowIndex + 2}: Missing player name, skipping`);
          return;
        }

        const nameParts = playerName.trim().split(/\s+/);
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        const jerseyRaw = row['Jersey #'];
        const jerseyNumber = jerseyRaw ? String(jerseyRaw).trim() || null : null;

        const grade = row['Grade'] || null;
        const gradYear = row['Grad Year'] ? parseInt(row['Grad Year']) : null;

        const player = {
          id: `player-${Date.now()}-${rowIndex}`,
          first_name: firstName,
          last_name: lastName,
          jersey_number: jerseyNumber,
          position: row['Position'] || null,
          grade: grade,
          graduating_year: gradYear,
          _rowIndex: rowIndex + 2,
        };

        if (!teamPlayersMap.has(teamId)) {
          teamPlayersMap.set(teamId, []);
        }
        teamPlayersMap.get(teamId).push(player);
      });

      for (const [teamId, players] of teamPlayersMap) {
        result.rosters.push({
          team_id: teamId,
          players: players,
        });
      }
    } catch (err) {
      result.errors.push({
        sheet: 'Rosters',
        row: null,
        message: `Failed to parse Rosters sheet: ${err.message}`,
      });
    }
  }

  // Process Events/Schedule sheet if it exists
  const scheduleSheetName = sheetNames.find(s =>
    ['Schedule', 'Games', 'Events', 'Tournaments'].includes(s)
  );

  if (scheduleSheetName) {
    try {
      const scheduleSheet = workbook.Sheets[scheduleSheetName];
      const scheduleData = XLSX.utils.sheet_to_json(scheduleSheet);

      scheduleData.forEach((row, rowIndex) => {
        const eventName = row.name || row['Name'] || row['Event Name'];

        if (!eventName) {
          result.warnings.push(`${scheduleSheetName} row ${rowIndex + 2}: Missing event name, skipping`);
          return;
        }

        const event = {
          id: row.id || generateId(eventName),
          game_type: (row.game_type || row.type || row['Type'] || 'tournament').toLowerCase(),
          name: eventName,
          date: formatDate(row.date || row['Date']),
          end_date: formatDate(row.end_date || row['End Date']),
          start_time: row.start_time || row['Start Time'] || null,
          end_time: row.end_time || row['End Time'] || null,
          location: row.location || row['Location'] || null,
          notes: row.notes || row['Notes'] || null,
          is_featured: row.is_featured === true || row.is_featured === 'true' || row.is_featured === 'TRUE',
          gender: (row.gender || row['Gender'] || 'both').toLowerCase(),
          team_ids: row.team_ids ? row.team_ids.split(',').map(t => t.trim()) : [],
          _rowIndex: rowIndex + 2,
        };

        result.events.push(event);
      });
    } catch (err) {
      result.errors.push({
        sheet: scheduleSheetName,
        row: null,
        message: `Failed to parse ${scheduleSheetName} sheet: ${err.message}`,
      });
    }
  }

  return result;
}

/**
 * Compare parsed data with existing database data to determine changes
 * @param {Object} parsedData - Output from parseExcelFile
 * @param {Object} existingData - Current data from Supabase { teams, coaches, players }
 * @returns {Object} Diff showing new, updated, and unchanged records
 */
export function compareWithExisting(parsedData, existingData) {
  const diff = {
    teams: { new: [], updated: [], unchanged: [] },
    coaches: { new: [], updated: [], unchanged: [] },
    rosters: { new: [], updated: [], unchanged: [] },
    events: { new: [], updated: [], unchanged: [] },
  };

  // Create lookup maps for existing data
  const existingTeamsMap = new Map(existingData.teams?.map(t => [t.id, t]) || []);
  const existingCoachesMap = new Map(existingData.coaches?.map(c => [c.id, c]) || []);
  const existingRostersMap = new Map(existingData.rosters?.map(r => [r.team_id, r]) || []);

  // Compare teams
  parsedData.teams.forEach(team => {
    const existing = existingTeamsMap.get(team.id);
    if (!existing) {
      diff.teams.new.push(team);
    } else if (hasTeamChanged(team, existing)) {
      diff.teams.updated.push({ ...team, _existing: existing });
    } else {
      diff.teams.unchanged.push(team);
    }
  });

  // Compare coaches
  parsedData.coaches.forEach(coach => {
    const existing = existingCoachesMap.get(coach.id);
    if (!existing) {
      diff.coaches.new.push(coach);
    } else if (hasCoachChanged(coach, existing)) {
      diff.coaches.updated.push({ ...coach, _existing: existing });
    } else {
      diff.coaches.unchanged.push(coach);
    }
  });

  // Compare rosters
  parsedData.rosters.forEach(roster => {
    const existing = existingRostersMap.get(roster.team_id);
    if (!existing) {
      diff.rosters.new.push(roster);
    } else if (hasRosterChanged(roster, existing)) {
      diff.rosters.updated.push({ ...roster, _existing: existing });
    } else {
      diff.rosters.unchanged.push(roster);
    }
  });

  return diff;
}

// Helper comparison functions
function hasTeamChanged(newTeam, existingTeam) {
  const fieldsToCompare = [
    'name', 'grade_level', 'gender', 'tier',
    'head_coach_id', 'assistant_coach_id',
    'team_fee', 'uniform_fee',
    'practice_location', 'practice_days', 'practice_time',
  ];

  return fieldsToCompare.some(field => newTeam[field] !== existingTeam[field]);
}

function hasCoachChanged(newCoach, existingCoach) {
  const fieldsToCompare = [
    'first_name', 'last_name', 'email', 'phone', 'role', 'bio',
  ];

  return fieldsToCompare.some(field => newCoach[field] !== existingCoach[field]);
}

function hasRosterChanged(newRoster, existingRoster) {
  if (!existingRoster.players || newRoster.players.length !== existingRoster.players.length) {
    return true;
  }

  // Simple comparison by player count - could be enhanced
  return newRoster.players.length !== existingRoster.players.length;
}

/**
 * Generate a blank Excel template for download
 * @returns {Blob} Excel file as a Blob
 */
export function generateTemplateFile() {
  const wb = XLSX.utils.book_new();

  // Teams sheet
  const teamsHeaders = [
    'Team Name', 'Grade Level', 'Gender', 'Tier',
    'Head Coach', 'Assistant Coach',
    'Team Fee', 'Uniform Fee',
    'Practice Location', 'Practice Days', 'Practice Time',
  ];
  const teamsWs = XLSX.utils.aoa_to_sheet([
    teamsHeaders,
    ['Example Express 12U Boys', '12U', 'male', 'express', 'John Smith', 'Jane Doe', 450, 75, 'Main Gym', 'Mon/Wed', '6:00 PM'],
  ]);
  XLSX.utils.book_append_sheet(wb, teamsWs, 'Teams');

  // Coaches sheet
  const coachesHeaders = ['Name', 'Email', 'Phone', 'Role', 'Certifications'];
  const coachesWs = XLSX.utils.aoa_to_sheet([
    coachesHeaders,
    ['John Smith', 'john@example.com', '555-123-4567', 'head', 'USA Basketball Gold'],
  ]);
  XLSX.utils.book_append_sheet(wb, coachesWs, 'Coaches');

  // Rosters sheet
  const rostersHeaders = ['Team Name', 'Player Name', 'Jersey #', 'Position', 'Grade', 'Grad Year'];
  const rostersWs = XLSX.utils.aoa_to_sheet([
    rostersHeaders,
    ['Example Express 12U Boys', 'Michael Johnson', '23', 'Guard', '6th', 2030],
  ]);
  XLSX.utils.book_append_sheet(wb, rostersWs, 'Rosters');

  // Schedule sheet
  const scheduleHeaders = ['Name', 'Type', 'Date', 'End Date', 'Start Time', 'Location', 'Notes'];
  const scheduleWs = XLSX.utils.aoa_to_sheet([
    scheduleHeaders,
    ['Winter Classic', 'tournament', '2025-02-15', '2025-02-16', '8:00 AM', 'Sports Center', 'All teams'],
  ]);
  XLSX.utils.book_append_sheet(wb, scheduleWs, 'Schedule');

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

/**
 * Export current data to Excel format
 * @param {Object} data - Data to export { teams, coaches, rosters, events }
 * @returns {Blob} Excel file as a Blob
 */
export function exportToExcel(data) {
  const wb = XLSX.utils.book_new();

  // Teams sheet
  if (data.teams?.length > 0) {
    const teamsData = data.teams.map(t => ({
      'Team Name': t.name,
      'Grade Level': t.grade_level,
      'Gender': t.gender,
      'Tier': t.tier,
      'Head Coach': t.head_coach_name || t.head_coach_id || '',
      'Assistant Coach': t.assistant_coach_name || t.assistant_coach_id || '',
      'Team Fee': t.team_fee,
      'Uniform Fee': t.uniform_fee,
      'Practice Location': t.practice_location,
      'Practice Days': t.practice_days,
      'Practice Time': t.practice_time,
    }));
    const teamsWs = XLSX.utils.json_to_sheet(teamsData);
    XLSX.utils.book_append_sheet(wb, teamsWs, 'Teams');
  }

  // Coaches sheet
  if (data.coaches?.length > 0) {
    const coachesData = data.coaches.map(c => ({
      'Name': `${c.first_name} ${c.last_name}`.trim(),
      'Email': c.email,
      'Phone': c.phone,
      'Role': c.role,
      'Certifications': c.certifications?.join(', ') || '',
    }));
    const coachesWs = XLSX.utils.json_to_sheet(coachesData);
    XLSX.utils.book_append_sheet(wb, coachesWs, 'Coaches');
  }

  // Rosters sheet
  if (data.rosters?.length > 0) {
    const rostersData = [];
    data.rosters.forEach(roster => {
      const team = data.teams?.find(t => t.id === roster.team_id);
      const teamName = team?.name || roster.team_id;

      roster.players?.forEach(p => {
        rostersData.push({
          'Team Name': teamName,
          'Player Name': `${p.first_name} ${p.last_name}`.trim(),
          'Jersey #': p.jersey_number,
          'Position': p.position,
          'Grade': p.grade,
          'Grad Year': p.graduating_year,
        });
      });
    });
    if (rostersData.length > 0) {
      const rostersWs = XLSX.utils.json_to_sheet(rostersData);
      XLSX.utils.book_append_sheet(wb, rostersWs, 'Rosters');
    }
  }

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}
