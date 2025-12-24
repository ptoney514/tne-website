/**
 * Program Tiers and Custom Tags Configuration
 *
 * Tiers: Single-select classification for team skill level
 * Tags: Multi-select metadata for flexible categorization
 */

// Program Tiers (teams have exactly one)
export const TIER_CONFIG = {
  tne: {
    slug: 'tne',
    name: 'TNE Elite',
    description: 'Top-tier competitive teams. Regional/national tournament schedule.',
    color: 'bg-tne-maroon',
    textColor: 'text-tne-maroon',
    bgLight: 'bg-tne-maroon/10',
    borderColor: 'border-tne-maroon/30',
    dotColor: 'bg-tne-maroon',
  },
  express: {
    slug: 'express',
    name: 'Express United',
    description: 'Competitive teams with local/regional focus. Strong fundamentals.',
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgLight: 'bg-blue-50',
    borderColor: 'border-blue-200',
    dotColor: 'bg-blue-500',
  },
  dev: {
    slug: 'dev',
    name: 'Development',
    description: 'Skills-focused teams. Building fundamentals and confidence.',
    color: 'bg-stone-400',
    textColor: 'text-stone-600',
    bgLight: 'bg-stone-100',
    borderColor: 'border-stone-300',
    dotColor: 'bg-stone-400',
  },
};

// Custom Tags (teams can have multiple)
export const TAG_CONFIG = {
  '3ssb': {
    slug: '3ssb',
    name: '3SSB',
    fullName: '3SSB Circuit',
    color: 'bg-purple-100',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
  },
  tournament: {
    slug: 'tournament',
    name: 'Tournament',
    fullName: 'Tournament Ready',
    color: 'bg-orange-100',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200',
  },
  recruiting: {
    slug: 'recruiting',
    name: 'Recruiting',
    fullName: 'Recruiting Focus',
    color: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
  },
};

// Default tier for new teams
export const DEFAULT_TIER = 'express';

// Available tier slugs
export const TIER_SLUGS = Object.keys(TIER_CONFIG);

// Available tag slugs
export const TAG_SLUGS = Object.keys(TAG_CONFIG);

/**
 * Get tier configuration by slug
 * @param {string} tierSlug - The tier slug (tne, express, dev)
 * @returns {object} Tier configuration object
 */
export function getTierConfig(tierSlug) {
  return TIER_CONFIG[tierSlug] || TIER_CONFIG[DEFAULT_TIER];
}

/**
 * Get tag configuration by slug
 * @param {string} tagSlug - The tag slug
 * @returns {object|null} Tag configuration object or null if not found
 */
export function getTagConfig(tagSlug) {
  return TAG_CONFIG[tagSlug] || null;
}

/**
 * Filter tier options for dropdown/radio selection
 * @returns {Array} Array of tier options with value and label
 */
export function getTierOptions() {
  return Object.values(TIER_CONFIG).map((tier) => ({
    value: tier.slug,
    label: tier.name,
    description: tier.description,
  }));
}

/**
 * Filter tag options for checkbox selection
 * @returns {Array} Array of tag options with value and label
 */
export function getTagOptions() {
  return Object.values(TAG_CONFIG).map((tag) => ({
    value: tag.slug,
    label: tag.name,
    fullName: tag.fullName,
  }));
}
