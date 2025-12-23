/**
 * Grade Colors - Seniority Gradient System
 *
 * Grades progress from warm/energetic to dark/distinguished.
 * Younger players get vibrant energy; 8th graders get "varsity" prestige.
 */

export const GRADE_COLORS = {
  '3rd': {
    name: 'Coral',
    hex: '#D4593E',
    bg: 'bg-[#D4593E]',
    text: 'text-[#D4593E]',
    border: 'border-[#D4593E]',
    bgLight: 'bg-[#D4593E]/10',
  },
  '4th': {
    name: 'Brick',
    hex: '#B84233',
    bg: 'bg-[#B84233]',
    text: 'text-[#B84233]',
    border: 'border-[#B84233]',
    bgLight: 'bg-[#B84233]/10',
  },
  '5th': {
    name: 'Maroon',
    hex: '#8B1F3A',
    bg: 'bg-tne-maroon',
    text: 'text-tne-maroon',
    border: 'border-tne-maroon',
    bgLight: 'bg-tne-maroon/10',
  },
  '6th': {
    name: 'Wine',
    hex: '#6B1B3D',
    bg: 'bg-[#6B1B3D]',
    text: 'text-[#6B1B3D]',
    border: 'border-[#6B1B3D]',
    bgLight: 'bg-[#6B1B3D]/10',
  },
  '7th': {
    name: 'Plum',
    hex: '#4D1D35',
    bg: 'bg-[#4D1D35]',
    text: 'text-[#4D1D35]',
    border: 'border-[#4D1D35]',
    bgLight: 'bg-[#4D1D35]/10',
  },
  '8th': {
    name: 'Noir',
    hex: '#2D1520',
    bg: 'bg-[#2D1520]',
    text: 'text-[#2D1520]',
    border: 'border-[#2D1520]',
    bgLight: 'bg-[#2D1520]/10',
  },
  'HS': {
    name: 'Black',
    hex: '#1A0F14',
    bg: 'bg-[#1A0F14]',
    text: 'text-[#1A0F14]',
    border: 'border-[#1A0F14]',
    bgLight: 'bg-[#1A0F14]/10',
  },
};

// Default fallback color
const DEFAULT_COLOR = GRADE_COLORS['5th'];

/**
 * Get the full color object for a grade level
 * @param {string} gradeLevel - e.g., "4th", "5th Grade", "5"
 * @returns {object} Color configuration object
 */
export function getGradeColor(gradeLevel) {
  if (!gradeLevel) return DEFAULT_COLOR;

  // Normalize the grade level string
  const normalized = String(gradeLevel)
    .toLowerCase()
    .replace(/\s*(grade|th|nd|rd|st)\s*/gi, '')
    .trim();

  // Map common formats
  const gradeMap = {
    '3': '3rd',
    '4': '4th',
    '5': '5th',
    '6': '6th',
    '7': '7th',
    '8': '8th',
    'hs': 'HS',
    'high school': 'HS',
    'highschool': 'HS',
  };

  const mappedGrade = gradeMap[normalized] || `${normalized}th`;
  return GRADE_COLORS[mappedGrade] || DEFAULT_COLOR;
}

/**
 * Get the background class for a grade badge
 * @param {string} gradeLevel
 * @returns {string} Tailwind class string
 */
export function getGradeBadgeClass(gradeLevel) {
  const color = getGradeColor(gradeLevel);
  return `${color.bg} text-white`;
}

/**
 * Get the hex color for a grade
 * @param {string} gradeLevel
 * @returns {string} Hex color code
 */
export function getGradeHex(gradeLevel) {
  return getGradeColor(gradeLevel).hex;
}

/**
 * Format grade level for display (e.g., "5TH GRADE")
 * @param {string} gradeLevel
 * @returns {string} Formatted display string
 */
export function formatGradeLabel(gradeLevel) {
  if (!gradeLevel) return '';

  const normalized = String(gradeLevel)
    .toLowerCase()
    .replace(/\s*(grade)\s*/gi, '')
    .trim();

  // Handle HS specially
  if (normalized === 'hs' || normalized === 'high school') {
    return 'HIGH SCHOOL';
  }

  // Extract just the number
  const num = normalized.replace(/\D/g, '');
  if (!num) return gradeLevel.toUpperCase();

  return `${num}TH GRADE`;
}

/**
 * Get short grade label (e.g., "5TH")
 * @param {string} gradeLevel
 * @returns {string} Short label
 */
export function formatGradeShort(gradeLevel) {
  if (!gradeLevel) return '';

  const normalized = String(gradeLevel)
    .toLowerCase()
    .replace(/\s*(grade)\s*/gi, '')
    .trim();

  if (normalized === 'hs' || normalized === 'high school') {
    return 'HS';
  }

  const num = normalized.replace(/\D/g, '');
  if (!num) return gradeLevel.toUpperCase();

  return `${num}TH`;
}
