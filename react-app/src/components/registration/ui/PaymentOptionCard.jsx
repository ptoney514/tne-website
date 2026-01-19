import { Check } from 'lucide-react';

export default function PaymentOptionCard({
  title,
  description,
  amount,
  schedule,
  selected,
  onSelect,
  variant = 'default', // 'default', 'highlight', 'warning'
  icon,
  disabled = false,
}) {
  const variantStyles = {
    default: {
      border: selected ? 'border-tne-red ring-2 ring-tne-red/20' : 'border-neutral-200 hover:border-neutral-300',
      bg: selected ? 'bg-tne-red/5' : 'bg-white',
      iconBg: 'bg-neutral-100',
    },
    highlight: {
      border: selected ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-emerald-200 hover:border-emerald-300',
      bg: selected ? 'bg-emerald-50' : 'bg-emerald-50/50',
      iconBg: 'bg-emerald-100',
    },
    warning: {
      border: selected ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-amber-200 hover:border-amber-300',
      bg: selected ? 'bg-amber-50' : 'bg-amber-50/50',
      iconBg: 'bg-amber-100',
    },
  };

  const styles = variantStyles[variant];

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={`
        relative w-full text-left p-4 rounded-2xl border-2 transition-all
        ${styles.border} ${styles.bg}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {/* Selection indicator */}
      <div
        className={`
          absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
          ${
            selected
              ? variant === 'highlight'
                ? 'bg-emerald-500 border-emerald-500'
                : variant === 'warning'
                ? 'bg-amber-500 border-amber-500'
                : 'bg-tne-red border-tne-red'
              : 'border-neutral-300 bg-white'
          }
        `}
      >
        {selected && <Check className="w-3 h-3 text-white" />}
      </div>

      <div className="flex items-start gap-3 pr-8">
        {icon && (
          <div className={`p-2 rounded-lg ${styles.iconBg}`}>
            {icon}
          </div>
        )}
        <div className="flex-1">
          <h4 className="font-semibold text-neutral-900">{title}</h4>
          {description && (
            <p className="text-sm text-neutral-600 mt-0.5">{description}</p>
          )}
          {amount && (
            <p className="text-lg font-bold text-neutral-900 mt-2">{amount}</p>
          )}
          {schedule && (
            <p className="text-xs text-neutral-500 mt-1">{schedule}</p>
          )}
        </div>
      </div>
    </button>
  );
}
