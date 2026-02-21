/**
 * Shared Admin Badge Components
 *
 * These components provide consistent styling across Players and Coaches pages,
 * matching the Teams page design system.
 */

// Grade Badge Colors - Pastel backgrounds matching the mockup design
// These differ from the solid gradient colors used in team roster views
const GRADE_BADGE_STYLES = {
  '3rd': { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
  '4th': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  '5th': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  '6th': { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
  '7th': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  '8th': { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-200' },
  'HS': { bg: 'bg-stone-200', text: 'text-stone-800', border: 'border-stone-300' },
};

// Payment Status Styles
const PAYMENT_STYLES = {
  paid: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Paid' },
  unpaid: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', label: 'Unpaid' },
  pending: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', label: 'Unpaid' },
  partial: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Partial' },
  waived: { bg: 'bg-indigo-100', text: 'text-indigo-700', dot: 'bg-indigo-500', label: 'Waived' },
};

// Status Styles
const STATUS_STYLES = {
  active: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Active' },
  inactive: { bg: 'bg-stone-100', text: 'text-stone-500', dot: 'bg-stone-400', label: 'Inactive' },
  pending: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Pending' },
  needs_team: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', label: 'Needs Team' },
  needs_assignment: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', label: 'Unassigned' },
};

// Certification Status Styles
const CERT_STYLES = {
  valid: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300' },
  expiring: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
  expired: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
  missing: { bg: 'bg-stone-100', text: 'text-stone-400', border: 'border-stone-300 border-dashed' },
};

// Export style constants for testing
export { GRADE_BADGE_STYLES, PAYMENT_STYLES, STATUS_STYLES, CERT_STYLES };

/**
 * GradeBadge - Displays player grade with colored background
 * @param {object} props
 * @param {string} props.grade - Grade level (3rd, 4th, 5th, etc.)
 * @param {string} [props.size='md'] - Size variant (sm, md)
 */
export function GradeBadge({ grade, size = 'md' }) {
  if (!grade) return null;

  // Normalize grade string
  const normalizedGrade = String(grade)
    .replace(/\s*grade\s*/i, '')
    .trim();

  const style = GRADE_BADGE_STYLES[normalizedGrade] || GRADE_BADGE_STYLES['5th'];

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-md ${style.bg} ${style.text} ${sizeClasses[size]}`}
      data-testid="grade-badge"
      data-grade={normalizedGrade}
    >
      {normalizedGrade}
    </span>
  );
}

/**
 * PaymentBadge - Shows payment status with optional dot indicator
 * @param {object} props
 * @param {string} props.status - Payment status (paid, unpaid, partial, waived)
 * @param {boolean} [props.showDot=true] - Show status dot indicator
 */
export function PaymentBadge({ status, showDot = true }) {
  const style = PAYMENT_STYLES[status] || PAYMENT_STYLES.pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full ${style.bg} ${style.text}`}
      data-testid="payment-badge"
      data-status={status}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />}
      {style.label}
    </span>
  );
}

/**
 * StatusBadge - Generic status indicator with dot
 * @param {object} props
 * @param {string} props.status - Status value
 * @param {boolean} [props.showDot=true] - Show status dot
 */
export function StatusBadge({ status, showDot = true }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.inactive;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${style.bg} ${style.text}`}
      data-testid="status-badge"
      data-status={status}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />}
      {style.label}
    </span>
  );
}

/**
 * CertBadge - Coach certification badge with status colors
 * @param {object} props
 * @param {string} props.label - Certification abbreviation (USA, CPR, BG)
 * @param {boolean} props.hasIt - Whether coach has certification
 * @param {Date} [props.expiresAt] - Expiration date (optional)
 */
export function CertBadge({ label, hasIt, expiresAt }) {
  let status = hasIt ? 'valid' : 'missing';

  // Check if expiring within 30 days
  if (hasIt && expiresAt) {
    const expirationDate = new Date(expiresAt);
    const now = new Date();
    const daysUntilExpiry = Math.floor((expirationDate - now) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      status = 'expired';
    } else if (daysUntilExpiry <= 30) {
      status = 'expiring';
    }
  }

  const style = CERT_STYLES[status];

  return (
    <span
      className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded border ${style.bg} ${style.text} ${style.border}`}
      data-testid="cert-badge"
      data-cert={label}
      data-status={status}
      title={
        status === 'expiring'
          ? `Expires ${new Date(expiresAt).toLocaleDateString()}`
          : status === 'expired'
            ? 'Certification expired'
            : status === 'missing'
              ? 'Certification missing'
              : 'Valid certification'
      }
    >
      {label}
    </span>
  );
}

/**
 * FilterPill - Interactive filter button with optional count and icon
 * @param {object} props
 * @param {boolean} props.active - Whether filter is active
 * @param {function} props.onClick - Click handler
 * @param {React.ReactNode} props.children - Button content
 * @param {number} [props.count] - Optional count to display
 * @param {React.ReactNode} [props.icon] - Optional icon to display
 * @param {'default' | 'warning' | 'error' | 'success'} [props.variant='default'] - Color variant
 */
export function FilterPill({ active, onClick, children, count, icon, variant = 'default' }) {
  const variantStyles = {
    default: 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100',
    warning: 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100',
    error: 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100',
    success: 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full
        border transition-all
        ${variantStyles[variant]}
        ${active ? 'ring-2 ring-offset-1 ring-tne-red/30' : ''}
      `}
      data-testid="filter-pill"
      data-active={active}
      data-variant={variant}
    >
      {icon}
      {children}
      {count !== undefined && <span className="font-semibold">({count})</span>}
    </button>
  );
}

/**
 * QuickFilterGroup - Container for related filter pills with label
 * @param {object} props
 * @param {string} props.label - Group label
 * @param {React.ReactNode} props.children - Filter pills
 */
export function QuickFilterGroup({ label, children }) {
  return (
    <>
      <span className="text-xs text-stone-400 font-medium">{label}:</span>
      {children}
    </>
  );
}

export default {
  GradeBadge,
  PaymentBadge,
  StatusBadge,
  CertBadge,
  FilterPill,
  QuickFilterGroup,
};
