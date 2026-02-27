/**
 * Grade color mappings and utility functions for tryout sessions
 */

export const GRADE_COLORS = {
  '3rd': { bg: 'bg-red-100', text: 'text-red-800' },
  '4th': { bg: 'bg-red-100', text: 'text-red-800' },
  '5th': { bg: 'bg-blue-100', text: 'text-blue-800' },
  '6th': { bg: 'bg-blue-100', text: 'text-blue-800' },
  '7th': { bg: 'bg-purple-100', text: 'text-purple-800' },
  '8th': { bg: 'bg-purple-100', text: 'text-purple-800' },
};

const ALL_GRADES_COLOR = { bg: 'bg-green-100', text: 'text-green-800' };

export const GRADE_ORDER = ['3rd', '4th', '5th', '6th', '7th', '8th'];

/**
 * Expand a grade range string like "3rd-8th" into all intermediate grades.
 * Falls back to raw endpoints for unknown grades (e.g. "K-2nd").
 */
export function expandGradeRange(rangeStr) {
  if (typeof rangeStr !== 'string' || !rangeStr.includes('-')) return [rangeStr];

  const [start, end] = rangeStr.split('-').map((g) => g.trim());
  const startIdx = GRADE_ORDER.indexOf(start);
  const endIdx = GRADE_ORDER.indexOf(end);

  if (startIdx === -1 || endIdx === -1 || startIdx > endIdx) {
    return [start, end].filter(Boolean);
  }

  return GRADE_ORDER.slice(startIdx, endIdx + 1);
}

/**
 * Get Tailwind class pair for a grade string
 */
export function getGradeColor(grade) {
  return GRADE_COLORS[grade] || ALL_GRADES_COLOR;
}

/**
 * Parse grade_levels array + gender into display-ready data.
 * Handles ranges like "3rd-8th" by expanding into all intermediate grades.
 */
export function parseSessionGrades(gradeLevels, gender) {
  let grades = [];

  if (Array.isArray(gradeLevels)) {
    grades = gradeLevels.flatMap((entry) => {
      if (typeof entry === 'string' && entry.includes('-')) {
        return expandGradeRange(entry);
      }
      return [typeof entry === 'string' ? entry.trim() : String(entry)];
    });
  } else if (typeof gradeLevels === 'string' && gradeLevels.length > 0) {
    if (gradeLevels.includes('-')) {
      grades = expandGradeRange(gradeLevels);
    } else {
      grades = gradeLevels
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean);
    }
  }

  const genderLabel = gender === 'male' ? 'Boys' : gender === 'female' ? 'Girls' : null;

  return { grades, genderLabel };
}

/**
 * Group sessions by gender field into boys/girls/other buckets
 */
export function groupSessionsByGender(sessions) {
  const boys = [];
  const girls = [];
  const other = [];

  sessions.forEach((session) => {
    if (session.gender === 'male') {
      boys.push(session);
    } else if (session.gender === 'female') {
      girls.push(session);
    } else {
      other.push(session);
    }
  });

  return { boys, girls, other };
}
