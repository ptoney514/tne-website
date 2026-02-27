'use client';

import {
  CreditCard,
  ShieldCheck,
  Lock,
  Receipt,
  CalendarCheck,
} from 'lucide-react';
import { useRegistrationStatus } from '@/hooks/useRegistrationStatus';
import { useSeasonFees } from '@/hooks/useSeasonFees';

function PayPalIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .757-.644h6.142c2.414 0 4.097.587 5.006 1.746.877 1.12 1.02 2.533.425 4.2-.032.087-.064.174-.1.264-.036.087-.075.177-.116.27-.598 1.357-1.58 2.4-2.92 3.1-1.32.687-2.91 1.036-4.723 1.036H7.588l-.512 7.645zm4.006-17.308H7.41a.23.23 0 0 0-.226.19L5.677 17.7a.19.19 0 0 0 .188.22h2.263l.63-4.17a.77.77 0 0 1 .756-.643h1.598c3.56 0 6.343-1.47 7.15-5.72.035-.175.062-.343.085-.506.224-1.574-.002-2.643-.77-3.53-.846-.973-2.37-1.322-4.495-1.322z" />
    </svg>
  );
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function PaymentForm() {
  const { seasonId, seasonName, isRegistrationOpen, loading: statusLoading } = useRegistrationStatus();
  const { fees, loading: feesLoading } = useSeasonFees(seasonId);

  const statusText = statusLoading
    ? 'Loading...'
    : isRegistrationOpen
      ? `${seasonName || 'Season'} Registration Open`
      : `${seasonName || 'Season'} Registration Closed`;

  return (
    <div data-testid="payment-form">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xl overflow-hidden">
        {/* Card Header */}
        <div className="bg-neutral-900 px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-tne-red flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">
                Payment Options
              </h3>
              <p className="text-sm text-white/60">Secure checkout via PayPal</p>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-8">
          {/* Season Indicator */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-full mb-8" data-testid="season-status">
            <div className={`w-2 h-2 rounded-full ${isRegistrationOpen ? 'bg-green-500' : 'bg-stone-400'}`} />
            <span className="text-xs font-medium text-neutral-700">
              {statusText}
            </span>
          </div>

          {/* =============================================
              PAYPAL EMBED GOES HERE
              Replace this placeholder div with your PayPal code
              ============================================= */}
          <div id="paypal-embed-container" className="mb-8" data-testid="paypal-embed-container">
            {/* START: PayPal Embed Placeholder */}
            <div className="border-2 border-dashed border-neutral-300 rounded-xl p-8 bg-neutral-50">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-[#0070ba] rounded-xl flex items-center justify-center">
                  <PayPalIcon className="w-10 h-10 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-700 mb-1">
                    PayPal Payment Form
                  </p>
                  <p className="text-xs text-neutral-500">
                    Your PayPal embed code will appear here
                  </p>
                </div>

                {/* Simulated Form Elements (for preview) */}
                <div className="max-w-sm mx-auto space-y-4 pt-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 text-left mb-1">
                      Payment Type
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-neutral-900 bg-white focus:ring-2 focus:ring-tne-red focus:border-tne-red"
                      disabled
                    >
                      {feesLoading ? (
                        <option>Loading fees...</option>
                      ) : fees.length > 0 ? (
                        fees.map((fee) => (
                          <option key={fee.id} value={fee.id}>
                            {fee.name} {formatCurrency(fee.amount)} USD
                          </option>
                        ))
                      ) : (
                        <option>No fees available</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 text-left mb-1">
                      Player Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter player's full name"
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-tne-red focus:border-tne-red"
                      disabled
                    />
                  </div>
                  <button
                    className="w-full py-3 bg-[#ffc439] hover:bg-[#f0b72f] text-neutral-900 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                    disabled
                  >
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            </div>
            {/* END: PayPal Embed Placeholder */}
          </div>

          {/* Security Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-6 border-t border-neutral-200">
            <div className="flex items-center gap-2 text-neutral-400">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-xs font-medium">Secure Payment</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-400">
              <Lock className="w-5 h-5" />
              <span className="text-xs font-medium">SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-400">
              <PayPalIcon className="w-5 h-5" />
              <span className="text-xs font-medium">PayPal Protected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 bg-neutral-50 rounded-xl border border-neutral-200">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-tne-red/10 flex items-center justify-center shrink-0">
              <Receipt className="w-4 h-4 text-tne-red" />
            </div>
            <div>
              <h4 className="font-medium text-neutral-900 mb-1">
                Payment Confirmation
              </h4>
              <p className="text-sm text-neutral-500">
                You'll receive an email receipt from PayPal after payment
              </p>
            </div>
          </div>
        </div>
        <div className="p-5 bg-neutral-50 rounded-xl border border-neutral-200">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-tne-red/10 flex items-center justify-center shrink-0">
              <CalendarCheck className="w-4 h-4 text-tne-red" />
            </div>
            <div>
              <h4 className="font-medium text-neutral-900 mb-1">
                Registration Complete
              </h4>
              <p className="text-sm text-neutral-500">
                Team assignment details sent within 48 hours
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
