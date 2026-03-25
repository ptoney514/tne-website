import { User, Users, DollarSign, Calendar } from 'lucide-react';
import { useWizard } from '../WizardContext';
import { getPaymentPlanDetails } from '@/constants/payments';

export default function SummaryCard() {
  const { formData, selectedTeam, paymentReferenceId } = useWizard();

  if (!selectedTeam) return null;

  const teamFee = parseFloat(selectedTeam.team_fee) || 0;
  const uniformFee = parseFloat(selectedTeam.uniform_fee) || 0;
  const totalFee = teamFee + uniformFee;

  const paymentPlan = formData.paymentPlanType === 'installment'
    ? getPaymentPlanDetails(totalFee, formData.paymentPlanOption)
    : null;

  const getAmountDueToday = () => {
    if (formData.paymentPlanType === 'full') {
      return totalFee;
    }
    if (formData.paymentPlanType === 'installment' && paymentPlan) {
      return paymentPlan.deposit;
    }
    return 0;
  };

  const amountDueToday = getAmountDueToday();

  return (
    <div className="rounded-2xl bg-neutral-50 border border-neutral-200 overflow-hidden">
      <div className="px-4 py-3 bg-neutral-100 border-b border-neutral-200">
        <h3 className="font-semibold text-neutral-900">Registration Summary</h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Player Info */}
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-100">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-neutral-500">Player</p>
            <p className="font-medium text-neutral-900">
              {formData.playerFirstName} {formData.playerLastName}
            </p>
          </div>
        </div>

        {/* Team Info */}
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-purple-100">
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-neutral-500">Team</p>
            <p className="font-medium text-neutral-900">{selectedTeam.name}</p>
          </div>
        </div>

        {/* Payment Plan */}
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-100">
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-neutral-500">Payment</p>
            {formData.paymentPlanType === 'full' && (
              <p className="font-medium text-neutral-900">Pay in Full</p>
            )}
            {formData.paymentPlanType === 'installment' && paymentPlan && (
              <>
                <p className="font-medium text-neutral-900">{paymentPlan.name}</p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  ${paymentPlan.deposit} deposit + {paymentPlan.installments}x ${paymentPlan.installmentAmount}
                </p>
              </>
            )}
            {formData.paymentPlanType === 'special_request' && (
              <p className="font-medium text-amber-600">Pending Approval</p>
            )}
            {formData.paymentPlanType === 'make_arrangements' && (
              <p className="font-medium text-amber-600">Arrangements Pending</p>
            )}
          </div>
        </div>

        {/* Reference ID */}
        {paymentReferenceId && (
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-neutral-200">
              <Calendar className="w-4 h-4 text-neutral-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Reference ID</p>
              <p className="font-mono font-medium text-neutral-900">{paymentReferenceId}</p>
            </div>
          </div>
        )}

        {/* Amount Due */}
        {formData.paymentPlanType && formData.paymentPlanType !== 'special_request' && formData.paymentPlanType !== 'make_arrangements' && (
          <div className="pt-3 border-t border-neutral-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-600">Amount Due Today</span>
              <span className="text-xl font-bold text-tne-red">${amountDueToday.toFixed(2)}</span>
            </div>
            {formData.paymentPlanType === 'installment' && paymentPlan && (
              <p className="text-xs text-neutral-500 text-right mt-1">
                Remaining: ${(totalFee - paymentPlan.deposit).toFixed(2)}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
