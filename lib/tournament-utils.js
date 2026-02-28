/**
 * Shared tournament utility functions
 * Used by both listing and detail views
 */

/**
 * Format a date range for display.
 * Examples:
 *   "December 27 – 28, 2025"
 *   "January 30 – February 1, 2026"
 *   "March 15, 2025" (single day)
 */
export function formatDateRange(startDate, endDate) {
  const start = new Date(startDate + 'T00:00:00');
  const end = endDate ? new Date(endDate + 'T00:00:00') : null;

  const options = { month: 'long', day: 'numeric', year: 'numeric' };

  if (!end || startDate === endDate) {
    return start.toLocaleDateString('en-US', options);
  }

  const startMonth = start.toLocaleDateString('en-US', { month: 'long' });
  const endMonth = end.toLocaleDateString('en-US', { month: 'long' });

  if (startMonth === endMonth) {
    return `${startMonth} ${start.getDate()} – ${end.getDate()}, ${start.getFullYear()}`;
  }

  return `${start.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} – ${end.toLocaleDateString('en-US', options)}`;
}

/**
 * Format short date for card display.
 * Returns: { month: "DEC", day: "27", endDay: "28" | null }
 */
export function formatShortDate(startDate, endDate) {
  const start = new Date(startDate + 'T00:00:00');
  const month = start.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const day = String(start.getDate());

  let endDay = null;
  if (endDate && endDate !== startDate) {
    const end = new Date(endDate + 'T00:00:00');
    endDay = String(end.getDate());
  }

  return { month, day, endDay };
}

/**
 * Derive program labels (boys/girls) from a team array.
 * @param {Array<{gender: string}>} teams
 * @returns {string[]} e.g. ['boys'], ['girls'], ['boys', 'girls']
 */
export function derivePrograms(teams) {
  const genders = new Set(teams.map((t) => t.gender));
  const programs = [];
  if (genders.has('male')) programs.push('boys');
  if (genders.has('female')) programs.push('girls');
  return programs;
}
