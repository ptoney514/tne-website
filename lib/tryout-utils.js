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

/**
 * Get Tailwind class pair for a grade string
 */
export function getGradeColor(grade) {
  return GRADE_COLORS[grade] || ALL_GRADES_COLOR;
}

/**
 * Parse grade_levels array + gender into display-ready data.
 * Handles ranges like "3rd-4th" by splitting into ["3rd", "4th"].
 */
export function parseSessionGrades(gradeLevels, gender) {
  let grades = [];

  if (Array.isArray(gradeLevels)) {
    grades = gradeLevels.flatMap((entry) => {
      if (typeof entry === 'string' && entry.includes('-')) {
        return entry.split('-').map((g) => g.trim());
      }
      return [typeof entry === 'string' ? entry.trim() : String(entry)];
    });
  } else if (typeof gradeLevels === 'string' && gradeLevels.length > 0) {
    grades = gradeLevels
      .split(/[-,]/)
      .map((g) => g.trim())
      .filter(Boolean);
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
