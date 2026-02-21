/**
 * JerseyBadge - Colored badge showing jersey number
 *
 * Used in roster tables and player previews
 */

import { getGradeColor } from '@/utils/gradeColors';

export default function JerseyBadge({
  number,
  gradeLevel,
  size = 'md',
  className = '',
}) {
  const color = getGradeColor(gradeLevel);

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  const hasNumber = number !== null && number !== undefined && number !== '';

  return (
    <span
      className={`
        inline-flex items-center justify-center
        rounded-lg font-bold
        ${hasNumber ? color.bg : 'bg-stone-200'}
        ${hasNumber ? 'text-white' : 'text-stone-400'}
        ${sizeClasses[size] || sizeClasses.md}
        ${className}
      `}
    >
      {hasNumber ? number : '--'}
    </span>
  );
}
