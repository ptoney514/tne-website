'use client';

import { Info, Loader2 } from 'lucide-react';
import { useRegistrationStatus } from '@/hooks/useRegistrationStatus';
import { useSeasonFees } from '@/hooks/useSeasonFees';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function FeeSchedule() {
  const { seasonId, seasonName, loading: statusLoading } = useRegistrationStatus();
  const { fees, loading: feesLoading } = useSeasonFees(seasonId);

  const loading = statusLoading || feesLoading;

  return (
    <div className="sticky top-24 space-y-8" data-testid="fee-schedule">
      {/* Fee Schedule Header */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-tne-red shadow-[0_0_8px_rgba(227,24,55,0.5)]" />
          <span className="font-mono text-xs text-tne-red uppercase tracking-widest" data-testid="season-indicator">
            {statusLoading ? '...' : seasonName || 'Current Season'}
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
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-stone-400 animate-spin" />
          </div>
        ) : fees.length > 0 ? (
          fees.map((fee, index) => (
            <div
              key={fee.id || index}
              className="flex items-center justify-between p-4 rounded-lg border bg-neutral-50 border-neutral-200"
              data-testid={`fee-item-${index}`}
            >
              <div>
                <div className="font-medium text-neutral-900">{fee.name}</div>
                {fee.description && (
                  <div className="text-xs text-neutral-500">
                    {fee.description}
                  </div>
                )}
              </div>
              <div className="text-lg font-bebas text-neutral-900">
                {formatCurrency(fee.amount)}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-neutral-500 text-sm" data-testid="fee-empty-state">
            Fee schedule will be available soon
          </div>
        )}
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
