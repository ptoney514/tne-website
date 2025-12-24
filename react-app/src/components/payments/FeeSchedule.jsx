import { Info } from 'lucide-react';
import { feeItems } from '../../constants/payments';

export default function FeeSchedule() {
  return (
    <div className="sticky top-24 space-y-8" data-testid="fee-schedule">
      {/* Fee Schedule Header */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-tne-red shadow-[0_0_8px_rgba(227,24,55,0.5)]" />
          <span className="font-mono text-xs text-tne-red uppercase tracking-widest">
            2025-26 Season
          </span>
        </div>
        <h2 className="text-3xl font-semibold text-neutral-900 tracking-tight mb-2">
          Fee Schedule
        </h2>
        <p className="text-neutral-500 text-sm">
          Select your payment type from the dropdown menu
        </p>
      </div>

      {/* Fee Breakdown Cards */}
      <div className="space-y-3" data-testid="fee-list">
        {feeItems.map((item, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-4 rounded-lg border ${
              item.highlighted
                ? 'bg-tne-red/5 border-tne-red/20'
                : 'bg-neutral-50 border-neutral-200'
            }`}
            data-testid={`fee-item-${index}`}
          >
            <div>
              <div className="font-medium text-neutral-900">{item.name}</div>
              <div
                className={`text-xs ${item.highlighted ? 'text-tne-red' : 'text-neutral-500'}`}
              >
                {item.description}
              </div>
            </div>
            <div className="text-lg font-bebas text-neutral-900">
              {item.amount}
            </div>
          </div>
        ))}
      </div>

      {/* Help Text */}
      <div className="p-4 bg-neutral-100 rounded-lg" data-testid="help-section">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-neutral-400 mt-0.5 shrink-0" />
          <div className="text-sm text-neutral-600">
            <p className="mb-2">
              Questions about fees or need a payment plan? Contact us:
            </p>
            <a
              href="mailto:amitch2am@gmail.com"
              className="text-tne-red hover:underline"
            >
              amitch2am@gmail.com
            </a>
            <span className="mx-2 text-neutral-300">|</span>
            <a
              href="tel:+14025104919"
              className="text-tne-red hover:underline"
            >
              (402) 510-4919
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
