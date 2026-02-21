import { getTierConfig } from '@/lib/tierTagConfig';

/**
 * TierBadge - Displays a team's program tier with colored indicator
 *
 * @param {object} props
 * @param {string} props.tier - Tier slug (tne, express, dev)
 * @param {string} [props.size='sm'] - Size variant (sm, md)
 * @param {string} [props.className] - Additional classes
 */
export function TierBadge({ tier, size = 'sm', className = '' }) {
  const config = getTierConfig(tier);

  const sizeClasses = {
    sm: 'text-[9px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full font-semibold uppercase tracking-wide
        ${config.bgLight} ${config.textColor} ${config.borderColor} border
        ${sizeClasses[size] || sizeClasses.sm}
        ${className}
      `}
      data-testid="tier-badge"
      data-tier={tier}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
      {config.name}
    </span>
  );
}

export default TierBadge;
