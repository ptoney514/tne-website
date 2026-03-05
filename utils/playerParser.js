/**
 * Player Parser - Smart parsing for Quick Add functionality
 *
 * Supported formats:
 * - Simple name: "John Smith" or "Smith, John"
 * - With jersey: "John Smith #23" or "#23 John Smith"
 * - With position: "John Smith (PG)" or "John Smith PG"
 * - Combined: "Marcus Johnson #5 PG"
 * - Comma-separated: "John #5, Tyler, Jaylen #11 (SG)"
 * - Newline-separated: Each line is a player
 */

// Valid basketball positions
const VALID_POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C'];

// Position name mappings for display
export const POSITION_NAMES = {
  PG: 'Point Guard',
  SG: 'Shooting Guard',
  SF: 'Small Forward',
  PF: 'Power Forward',
  C: 'Center',
};

/**
 * Parse raw input text into an array of player objects
 * @param {string} rawInput - The raw text input from Quick Add
 * @returns {Array} Array of parsed player objects
 */
export function parsePlayerInput(rawInput) {
  if (!rawInput || typeof rawInput !== 'string') {
    return [];
  }

  // Split by newlines first, then by commas (but not commas inside "Last, First" format)
  const lines = rawInput
    .split(/\n/)
    .flatMap((line) => {
      // If line contains "Last, First" format, don't split by comma
      if (line.match(/^[^,]+,\s*[^,]+$/)) {
        return [line];
      }
      return line.split(/,(?![^(]*\))/); // Split by comma but not inside parentheses
    })
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const players = [];

  for (const line of lines) {
    const parsed = parseSinglePlayer(line);
    if (parsed) {
      players.push(parsed);
    }
  }

  return players;
}

/**
 * Parse a single player entry
 * @param {string} input - Single player string
 * @returns {object|null} Parsed player object or null if invalid
 */
function parseSinglePlayer(input) {
  if (!input || input.trim().length === 0) {
    return null;
  }

  let remaining = input.trim();
  let jerseyNumber = null;
  let position = null;
  let firstName = null;
  let lastName = null;

  // Extract jersey number: #XX or just XX at start/end with # prefix
  const jerseyMatch = remaining.match(/#(\d{1,2})/);
  if (jerseyMatch) {
    jerseyNumber = jerseyMatch[1];
    remaining = remaining.replace(jerseyMatch[0], '').trim();
  }

  // Extract position: (PG) or standalone PG/SG/SF/PF/C at word boundary
  const positionPattern = new RegExp(
    `\\(?\\b(${VALID_POSITIONS.join('|')})\\b\\)?`,
    'i'
  );
  const posMatch = remaining.match(positionPattern);
  if (posMatch) {
    position = posMatch[1].toUpperCase();
    remaining = remaining.replace(posMatch[0], '').trim();
  }

  // Clean up any extra whitespace or punctuation
  remaining = remaining.replace(/\s+/g, ' ').replace(/^[,\s]+|[,\s]+$/g, '');

  // Parse name: "First Last" or "Last, First"
  if (remaining.includes(',')) {
    // "Last, First" format
    const parts = remaining.split(',').map((s) => s.trim());
    if (parts.length >= 2) {
      lastName = parts[0];
      firstName = parts[1];
    } else if (parts.length === 1) {
      firstName = parts[0];
      lastName = '';
    }
  } else {
    // "First Last" or "First Middle Last" format
    const nameParts = remaining.split(/\s+/).filter((p) => p.length > 0);

    if (nameParts.length >= 2) {
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(' ');
    } else if (nameParts.length === 1) {
      // Single name - treat as first name
      firstName = nameParts[0];
      lastName = '';
    } else {
      return null; // No valid name found
    }
  }

  // Validate we have at least a first name
  if (!firstName || firstName.length === 0) {
    return null;
  }

  return {
    firstName: capitalize(firstName),
    lastName: capitalize(lastName || ''),
    jerseyNumber,
    position,
    status: 'ready',
    raw: input, // Keep original for debugging/display
  };
}

/**
 * Capitalize first letter of each word
 * @param {string} str
 * @returns {string}
 */
function capitalize(str) {
  if (!str) return '';
  return str
    .split(' ')
    .map((word) => {
      if (word.length === 0) return '';
      // Handle hyphenated names
      if (word.includes('-')) {
        return word
          .split('-')
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
          .join('-');
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

/**
 * Validate parsed players and add warnings
 * @param {Array} players - Array of parsed player objects
 * @returns {Array} Players with isValid flag and warnings
 */
export function validateParsedPlayers(players) {
  return players.map((player) => {
    const warnings = [];

    // Check for missing last name
    if (!player.lastName) {
      warnings.push('No last name provided');
    }

    // Check for duplicate jersey numbers
    const sameJersey = players.filter(
      (p) =>
        p !== player &&
        p.jerseyNumber &&
        p.jerseyNumber === player.jerseyNumber
    );
    if (sameJersey.length > 0) {
      warnings.push(`Jersey #${player.jerseyNumber} used by multiple players`);
    }

    return {
      ...player,
      isValid: player.firstName && player.firstName.length > 0,
      warnings,
    };
  });
}

/**
 * Get the full position name
 * @param {string} position - Short position code (PG, SG, etc.)
 * @returns {string} Full position name
 */
export function getPositionName(position) {
  if (!position) return '';
  return POSITION_NAMES[position.toUpperCase()] || position;
}

/**
 * Check if a string looks like it contains valid player data
 * @param {string} input
 * @returns {boolean}
 */
/**
 * Calculate graduating year from grade level
 * @param {string|number} grade - Grade level (e.g., "3", "10", "3rd")
 * @returns {number} Estimated graduating year
 */
export function calculateGraduatingYear(grade) {
  const currentYear = new Date().getFullYear();
  const gradeNum = parseInt(grade);
  if (isNaN(gradeNum) || gradeNum < 1 || gradeNum > 12) return currentYear + 6;
  return currentYear + (12 - gradeNum);
}

export function hasPlayerData(input) {
  if (!input || typeof input !== 'string') return false;
  // Must have at least 2 characters that aren't just whitespace/punctuation
  const cleaned = input.replace(/[^a-zA-Z]/g, '');
  return cleaned.length >= 2;
}
