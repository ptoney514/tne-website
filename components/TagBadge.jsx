import { getTagConfig } from '@/lib/tierTagConfig';

/**
 * TagBadge - Displays a custom tag badge
 *
 * @param {object} props
 * @param {string} props.tag - Tag slug (3ssb, tournament, recruiting)
 * @param {string} [props.size='sm'] - Size variant (sm, md)
 * @param {string} [props.className] - Additional classes
 */
export function TagBadge({ tag, size = 'sm', className = '' }) {
  const config = getTagConfig(tag);

  if (!config) return null;

  const sizeClasses = {
    sm: 'text-[9px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium uppercase tracking-wide
        ${config.color} ${config.textColor} ${config.borderColor} border
        ${sizeClasses[size] || sizeClasses.sm}
        ${className}
      `}
      data-testid="tag-badge"
      data-tag={tag}
    >
      {config.name}
    </span>
  );
}

export default TagBadge;
