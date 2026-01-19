// Payment-related constants

// Standard deposit amounts (same regardless of team fee)
const STANDARD_DEPOSIT = 200;
const LOWER_DEPOSIT = 150;

// Payment plan configurations
// Note: installmentAmount is calculated dynamically based on totalFee
// This ensures uniform fees and other add-ons are properly included

// For regular teams (under $1000)
const REGULAR_FEE_PLANS = {
  plan_1: {
    id: 'plan_1',
    name: 'Plan A - Lower Payments',
    deposit: STANDARD_DEPOSIT,
    installments: 2,
    // installmentAmount calculated dynamically in getPaymentPlanDetails
  },
  plan_2: {
    id: 'plan_2',
    name: 'Plan B - Spread Out',
    deposit: LOWER_DEPOSIT,
    installments: 3,
    // installmentAmount calculated dynamically in getPaymentPlanDetails
  },
};

// For Jr 3SSB teams ($1,400+)
const ELITE_FEE_PLANS = {
  plan_1: {
    id: 'plan_1',
    name: 'Plan A - Fewer Payments',
    deposit: STANDARD_DEPOSIT,
    installments: 4,
    // installmentAmount calculated dynamically in getPaymentPlanDetails
  },
  plan_2: {
    id: 'plan_2',
    name: 'Plan B - Smaller Payments',
    deposit: LOWER_DEPOSIT,
    installments: 5,
    // installmentAmount calculated dynamically in getPaymentPlanDetails
  },
};

// Fee threshold for elite teams
const ELITE_FEE_THRESHOLD = 1000;

/**
 * Get available payment plans based on total fee
 * @param {number} totalFee - The total registration fee
 * @returns {Object} Payment plans object
 */
export function getPaymentPlans(totalFee) {
  if (totalFee >= ELITE_FEE_THRESHOLD) {
    return ELITE_FEE_PLANS;
  }
  return REGULAR_FEE_PLANS;
}

/**
 * Get details for a specific payment plan with dynamically calculated installment amounts
 * @param {number} totalFee - The total registration fee (including uniforms/add-ons)
 * @param {string} planId - The plan identifier (plan_1, plan_2, etc.)
 * @returns {Object|null} Payment plan details with calculated amounts, or null if not found
 */
export function getPaymentPlanDetails(totalFee, planId) {
  const plans = getPaymentPlans(totalFee);
  const basePlan = plans[planId];
  if (!basePlan) return null;

  // Calculate installment amount based on actual totalFee
  const remaining = totalFee - basePlan.deposit;
  const installmentAmount = Math.ceil(remaining / basePlan.installments);

  return {
    ...basePlan,
    installmentAmount,
    description: `$${basePlan.deposit} today, then ${basePlan.installments} payments of $${installmentAmount}`,
  };
}

/**
 * Calculate payment schedule for a given plan
 * @param {number} totalFee - The total registration fee
 * @param {string} planId - The plan identifier
 * @returns {Array} Array of payment objects with dates and amounts
 */
export function calculatePaymentSchedule(totalFee, planId) {
  const plan = getPaymentPlanDetails(totalFee, planId);
  if (!plan) return [];

  const schedule = [
    { label: 'Today (Deposit)', amount: plan.deposit, due: 'Immediate' },
  ];

  for (let i = 1; i <= plan.installments; i++) {
    schedule.push({
      label: `Payment ${i}`,
      amount: plan.installmentAmount,
      due: `Due in ${i * 30} days`,
    });
  }

  return schedule;
}

// Special request reasons
export const SPECIAL_REQUEST_REASONS = [
  { value: 'financial_hardship', label: 'Financial hardship' },
  { value: 'timing_issue', label: 'Timing/scheduling issue' },
  { value: 'sponsorship', label: 'Awaiting sponsorship/scholarship' },
  { value: 'other', label: 'Other' },
];

// Payment methods
export const PAYMENT_METHODS = {
  paypal: {
    name: 'PayPal',
    url: 'https://www.tnebasketball.com',
    displayUrl: 'tnebasketball.com',
  },
  venmo: {
    name: 'Venmo',
    handle: '@Alvin-Mitchell-TNE',
  },
  cashapp: {
    name: 'Cash App',
    handle: '$AMitch2am',
  },
};

// Registration status definitions
export const REGISTRATION_STATUSES = {
  draft: { label: 'Draft', color: 'neutral' },
  pending_payment: { label: 'Pending Payment', color: 'amber' },
  payment_plan_active: { label: 'Payment Plan Active', color: 'blue' },
  awaiting_approval: { label: 'Awaiting Approval', color: 'amber' },
  fully_paid: { label: 'Fully Paid', color: 'emerald' },
  roster_confirmed: { label: 'Roster Confirmed', color: 'emerald' },
};

export const feeItems = [
  {
    name: 'Boys Fall (3rd-8th)',
    description: 'Fall season registration',
    amount: '$300',
    highlighted: false,
  },
  {
    name: 'Girls (3rd-8th)',
    description: 'Full season registration',
    amount: '$450',
    highlighted: false,
  },
  {
    name: 'Boys Winter Full (3rd-8th)',
    description: 'Winter season registration',
    amount: '$450',
    highlighted: false,
  },
  {
    name: 'Jr. 3SSB (5th-8th)',
    description: 'Elite circuit registration',
    amount: '$1,400',
    highlighted: false,
  },
  {
    name: 'Boys/Girls (K-2nd) Fall',
    description: 'Youth development',
    amount: '$200',
    highlighted: false,
  },
  {
    name: 'Boys/Girls (K-2nd) Winter',
    description: 'Youth development',
    amount: '$200',
    highlighted: false,
  },
  {
    name: 'Partial Payment',
    description: 'Payment plan option',
    amount: '$150',
    highlighted: true,
  },
];

export const faqItems = [
  {
    question: "What's included in the registration fee?",
    answer:
      "Registration fees cover practice facility costs, tournament entry fees, coaching staff, and team equipment. Uniforms are typically an additional cost and will be communicated by your team coach.",
  },
  {
    question: 'Can I set up a payment plan?',
    answer:
      'Yes! Select the "Partial Payment" option ($150) to make installment payments. Contact Director Alvin Mitchell at (402) 510-4919 to set up a payment schedule that works for your family.',
  },
  {
    question: "What's the difference between Fall and Winter?",
    answer:
      'Fall season typically runs September through November, while Winter season runs December through February. Each season has its own registration and tournament schedule. You can register for one or both seasons.',
  },
  {
    question: 'What is Jr. 3SSB?',
    answer:
      'Jr. 3SSB (Scholastic Sports Basketball) is our elite-level circuit for serious players in 5th-8th grade. It includes a more rigorous practice schedule and travel to high-profile tournaments with college scout exposure. The higher fee reflects increased tournament and travel costs.',
  },
  {
    question: 'Is there financial assistance available?',
    answer:
      "TNE United is committed to making basketball accessible to all players regardless of financial situation. More than 60% of our players receive free or reduced lunch. Please contact us directly to discuss options - we don't turn away dedicated players due to financial constraints.",
  },
];
