import { useState } from 'react';
import { ChevronDown, ChevronUp, Users, DollarSign, Shirt, CreditCard, Info } from 'lucide-react';
import { useWizard } from '../WizardContext';
import { getPaymentPlanDetails } from '@/constants/payments';

export default function RegistrationSummaryPanel() {
  const { formData, selectedTeam, currentStep, registrationType } = useWizard();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Season mode: show static fee preview
  if (registrationType === 'season') {
    return (
      <div className="rounded-3xl bg-white border border-neutral-300 shadow-sm overflow-hidden sticky top-24">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full px-5 py-4 border-b border-neutral-200 bg-gradient-to-r from-blue-50 to-transparent flex items-center justify-between md:cursor-default"
          aria-expanded={!isCollapsed}
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-100">
              <Info className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-neutral-900">Season Fee Preview</h2>
          </div>
          <span className="md:hidden text-neutral-400">
            {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </span>
        </button>

        <div className={`${isCollapsed ? 'hidden md:block' : 'block'}`}>
          <div className="px-5 py-4">
            <div className="divide-y divide-neutral-100">
              <div className="py-3 first:pt-0">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-neutral-900 text-sm">3rd-8th Girls</p>
                  <span className="text-lg font-semibold text-neutral-900">$450</span>
                </div>
              </div>
              <div className="py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-neutral-900 text-sm">3rd-8th Boys</p>
                  <span className="text-lg font-semibold text-neutral-900">$450</span>
                </div>
              </div>
              <div className="py-3 last:pb-0">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-neutral-900 text-sm">Jr 3SSB</p>
                  <span className="text-lg font-semibold text-tne-red">$1,400</span>
                </div>
              </div>
            </div>
          </div>
          <div className="px-5 py-3 bg-blue-50 border-t border-blue-200">
            <p className="text-xs text-blue-800 font-medium">
              No payment due until team placement. Fees apply after tryouts.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Team mode: existing dynamic panel (only show when team is selected)
  if (!selectedTeam) return null;

  const teamFee = parseFloat(selectedTeam.team_fee) || 0;
  const uniformFee = parseFloat(selectedTeam.uniform_fee) || 0;
  const totalFee = teamFee + uniformFee;

  const paymentPlan = formData.paymentPlanType === 'installment'
    ? getPaymentPlanDetails(totalFee, formData.paymentPlanOption)
    : null;

  const getPaymentLabel = () => {
    if (formData.paymentPlanType === 'full') return 'Pay in Full';
    if (formData.paymentPlanType === 'installment' && paymentPlan) return paymentPlan.name;
    if (formData.paymentPlanType === 'special_request') return 'Special Request';
    return null;
  };

  const paymentLabel = getPaymentLabel();

  // Calculate amount due today based on payment selection
  const getAmountDueToday = () => {
    if (formData.paymentPlanType === 'full') return totalFee;
    if (formData.paymentPlanType === 'installment' && paymentPlan) return paymentPlan.deposit;
    return null;
  };

  const amountDueToday = getAmountDueToday();
  const hasPaymentSelected = formData.paymentPlanType && formData.paymentPlanType !== 'special_request';

  return (
    <div className="rounded-3xl bg-white border border-neutral-300 shadow-sm overflow-hidden sticky top-24">
      {/* Header - always visible */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full px-5 py-4 border-b border-neutral-200 bg-gradient-to-r from-tne-red/5 to-transparent flex items-center justify-between md:cursor-default"
        aria-expanded={!isCollapsed}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-tne-red/10">
            <DollarSign className="w-4 h-4 text-tne-red" />
          </div>
          <h2 className="text-lg font-semibold text-neutral-900">Your Registration</h2>
        </div>
        <div className="flex items-center gap-2">
          {/* Mobile collapse indicator */}
          <span className="md:hidden text-neutral-400">
            {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </span>
        </div>
      </button>

      {/* Content - collapsible on mobile */}
      <div className={`${isCollapsed ? 'hidden md:block' : 'block'}`}>
        <div className="px-5 py-4 space-y-4">
          {/* Team Selected */}
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Team</p>
              <p className="font-medium text-neutral-900 truncate">{selectedTeam.name}</p>
            </div>
          </div>

          {/* Fee Breakdown */}
          <div className="rounded-xl bg-neutral-50 p-3 space-y-2">
            {teamFee > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">Season Fee</span>
                <span className="font-medium text-neutral-900">${teamFee.toFixed(2)}</span>
              </div>
            )}
            {uniformFee > 0 && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5 text-neutral-600">
                  <Shirt className="w-3.5 h-3.5" />
                  <span>Uniform</span>
                </div>
                <span className="font-medium text-neutral-900">${uniformFee.toFixed(2)}</span>
              </div>
            )}
            {/* Dynamic label based on payment selection */}
            {!hasPaymentSelected && (
              <div className="pt-2 border-t border-neutral-200 flex items-center justify-between">
                <span className="font-medium text-neutral-700">Estimated Total</span>
                <span className="text-lg font-bold text-neutral-900">${totalFee.toFixed(2)}</span>
              </div>
            )}
            {hasPaymentSelected && (
              <div className="pt-2 border-t border-neutral-200">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-neutral-700">Amount Due Today</span>
                  <span className="text-lg font-bold text-tne-red">${amountDueToday?.toFixed(2)}</span>
                </div>
                {formData.paymentPlanType === 'installment' && paymentPlan && (
                  <p className="text-xs text-neutral-500 text-right mt-1">
                    Remaining: ${(totalFee - paymentPlan.deposit).toFixed(2)}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Payment Option - shown after Step 3 */}
          {paymentLabel && currentStep >= 3 && (
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-100">
                <CreditCard className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Payment</p>
                <p className="font-medium text-neutral-900">{paymentLabel}</p>
                {formData.paymentPlanType === 'installment' && paymentPlan && (
                  <p className="text-xs text-neutral-500 mt-0.5">
                    ${paymentPlan.deposit} deposit + {paymentPlan.installments}x ${paymentPlan.installmentAmount}
                  </p>
                )}
                {formData.paymentPlanType === 'special_request' && (
                  <p className="text-xs text-amber-600 mt-0.5">Pending approval</p>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
