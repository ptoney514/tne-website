import { useState } from 'react';
import {
  CreditCard,
  Calendar,
  AlertCircle,
  MessageCircle,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useWizard } from '../WizardContext';
import { validateStep3 } from '../wizardValidation';
import StepNavigation from '../ui/StepNavigation';
import PaymentOptionCard from '../ui/PaymentOptionCard';
import {
  getPaymentPlans,
  getPaymentPlanDetails,
  calculatePaymentSchedule,
  SPECIAL_REQUEST_REASONS,
  PAYMENT_METHODS,
} from '../../../constants/payments';

export default function PaymentCommitmentStep() {
  const {
    formData,
    selectedTeam,
    validationErrors,
    paymentReferenceId,
    updateField,
    updateFields,
    setValidationErrors,
    clearValidationError,
    nextStep,
    prevStep,
  } = useWizard();

  const [showPaymentInstructions, setShowPaymentInstructions] = useState(false);

  const teamFee = selectedTeam ? parseFloat(selectedTeam.team_fee) || 0 : 0;
  const uniformFee = selectedTeam ? parseFloat(selectedTeam.uniform_fee) || 0 : 0;
  const totalFee = teamFee + uniformFee;

  const paymentPlans = getPaymentPlans(totalFee);
  const selectedPlan = formData.paymentPlanOption
    ? getPaymentPlanDetails(totalFee, formData.paymentPlanOption)
    : null;
  const paymentSchedule = formData.paymentPlanOption
    ? calculatePaymentSchedule(totalFee, formData.paymentPlanOption)
    : [];

  const handleSelectPaymentType = (type) => {
    const updates = {
      paymentPlanType: type,
      paymentPlanOption: '',
      specialRequestReason: '',
      specialRequestNotes: '',
      paymentConfirmed: false,
    };
    updateFields(updates);
    setShowPaymentInstructions(false);

    if (validationErrors.paymentPlanType) {
      clearValidationError('paymentPlanType');
    }
  };

  const handleSelectPlan = (planId) => {
    updateField('paymentPlanOption', planId);
    if (validationErrors.paymentPlanOption) {
      clearValidationError('paymentPlanOption');
    }
  };

  const handleSpecialRequestChange = (e) => {
    const { name, value } = e.target;
    updateField(name, value);
    if (validationErrors[name]) {
      clearValidationError(name);
    }
  };

  // Determine if user can proceed based on payment selection
  const canProceed = (() => {
    if (!formData.paymentPlanType) return false;
    if (formData.paymentPlanType === 'installment' && !formData.paymentPlanOption) return false;
    if (formData.paymentPlanType === 'special_request') {
      if (!formData.specialRequestReason || !formData.specialRequestNotes?.trim()) return false;
    }
    return true;
  })();

  const handleNext = () => {
    const errors = validateStep3(formData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // For full and installment payments, show payment instructions first
    if (
      (formData.paymentPlanType === 'full' || formData.paymentPlanType === 'installment') &&
      !showPaymentInstructions
    ) {
      setShowPaymentInstructions(true);
      return;
    }

    nextStep();
  };

  const getAmountDueToday = () => {
    if (formData.paymentPlanType === 'full') {
      return totalFee;
    }
    if (formData.paymentPlanType === 'installment' && selectedPlan) {
      return selectedPlan.deposit;
    }
    return 0;
  };

  const inputClass = (fieldName) => `
    block w-full rounded-xl border bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400
    focus:outline-none focus:ring-2 focus:ring-tne-red/50 focus:border-tne-red/50
    ${validationErrors[fieldName] ? 'border-red-500' : 'border-neutral-300'}
  `;

  // Show payment instructions screen
  if (showPaymentInstructions) {
    const amountDue = getAmountDueToday();

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-semibold text-neutral-900">
            Complete Your Payment
          </h3>
          <p className="text-neutral-600 mt-1">
            Submit your payment using one of the methods below
          </p>
        </div>

        {/* Amount Due Card */}
        <div className="rounded-2xl bg-tne-red/5 border-2 border-tne-red/20 p-6 text-center">
          <p className="text-sm font-medium text-neutral-600 mb-1">Amount Due Today</p>
          <p className="text-4xl font-bold text-tne-red">${amountDue.toFixed(2)}</p>
          {formData.paymentPlanType === 'installment' && selectedPlan && (
            <p className="text-sm text-neutral-500 mt-2">
              Remaining balance: ${(totalFee - selectedPlan.deposit).toFixed(2)} in {selectedPlan.installments} payments
            </p>
          )}
        </div>

        {/* Reference ID */}
        <div className="rounded-xl bg-neutral-100 p-4">
          <p className="text-sm text-neutral-600 mb-1">Include this reference in your payment:</p>
          <p className="font-mono text-lg font-bold text-neutral-900">{paymentReferenceId}</p>
        </div>

        {/* Payment Methods */}
        <div className="space-y-3">
          <h4 className="font-medium text-neutral-900">Payment Methods</h4>

          <a
            href={PAYMENT_METHODS.paypal.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 rounded-xl bg-white border border-neutral-200 hover:border-neutral-300 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-neutral-900">PayPal</p>
                <p className="text-sm text-neutral-500">{PAYMENT_METHODS.paypal.displayUrl}</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-neutral-400" />
          </a>

          <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-neutral-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                V
              </div>
              <div>
                <p className="font-medium text-neutral-900">Venmo</p>
                <p className="text-sm font-mono text-neutral-700">{PAYMENT_METHODS.venmo.handle}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-neutral-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm">
                $
              </div>
              <div>
                <p className="font-medium text-neutral-900">Cash App</p>
                <p className="text-sm font-mono text-neutral-700">{PAYMENT_METHODS.cashapp.handle}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Confirmation Checkbox */}
        <label className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <input
            type="checkbox"
            checked={formData.paymentConfirmed}
            onChange={(e) => updateField('paymentConfirmed', e.target.checked)}
            className="mt-0.5 w-4 h-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500"
          />
          <span className="text-sm text-amber-800">
            I have submitted my payment of <strong>${amountDue.toFixed(2)}</strong> using one of the methods above.
          </span>
        </label>

        <div className="flex items-center justify-between pt-6 border-t border-neutral-200">
          <button
            type="button"
            onClick={() => setShowPaymentInstructions(false)}
            className="text-sm font-medium text-neutral-600 hover:text-neutral-900"
          >
            Back to Payment Options
          </button>
          <button
            type="button"
            onClick={nextStep}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-tne-red text-white font-medium hover:bg-tne-red-dark transition-colors"
          >
            Continue to Review
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-neutral-900">
          Choose Your Payment Option
        </h3>
        <p className="text-sm text-neutral-600 mt-1">
          Select how you would like to pay the ${totalFee.toFixed(2)} registration fee
        </p>
      </div>

      {validationErrors.paymentPlanType && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{validationErrors.paymentPlanType}</p>
        </div>
      )}

      {/* Payment Options */}
      <div className="space-y-4">
        {/* Option A: Pay in Full */}
        <PaymentOptionCard
          title="Pay in Full"
          description="Complete your registration with one payment"
          amount={`$${totalFee.toFixed(2)}`}
          selected={formData.paymentPlanType === 'full'}
          onSelect={() => handleSelectPaymentType('full')}
          variant="highlight"
          icon={<CreditCard className="w-5 h-5 text-emerald-600" />}
        />

        {/* Option B: Payment Plan */}
        <div
          className={`
            rounded-2xl border-2 transition-all
            ${formData.paymentPlanType === 'installment'
              ? 'border-tne-red ring-2 ring-tne-red/20 bg-tne-red/5'
              : 'border-neutral-200 bg-white'
            }
          `}
        >
          <button
            type="button"
            onClick={() => handleSelectPaymentType('installment')}
            className="w-full text-left p-4"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-neutral-900">Payment Plan</h4>
                <p className="text-sm text-neutral-600">
                  Split your payment into manageable installments
                </p>
              </div>
            </div>
          </button>

          {/* Plan selection (shown when installment is selected) */}
          {formData.paymentPlanType === 'installment' && (
            <div className="px-4 pb-4 space-y-3">
              {validationErrors.paymentPlanOption && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {validationErrors.paymentPlanOption}
                </p>
              )}

              {Object.values(paymentPlans).map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`
                    w-full text-left p-3 rounded-xl border transition-all
                    ${formData.paymentPlanOption === plan.id
                      ? 'border-tne-red bg-white ring-1 ring-tne-red/50'
                      : 'border-neutral-200 bg-neutral-50 hover:border-neutral-300'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-neutral-900">{plan.name}</p>
                      <p className="text-sm text-neutral-500">{plan.description}</p>
                    </div>
                    <div
                      className={`
                        w-5 h-5 rounded-full border-2 flex items-center justify-center
                        ${formData.paymentPlanOption === plan.id
                          ? 'bg-tne-red border-tne-red'
                          : 'border-neutral-300'
                        }
                      `}
                    >
                      {formData.paymentPlanOption === plan.id && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                </button>
              ))}

              {/* Payment Schedule Preview */}
              {selectedPlan && paymentSchedule.length > 0 && (
                <div className="mt-4 p-3 rounded-xl bg-neutral-100">
                  <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
                    Payment Schedule
                  </p>
                  <div className="space-y-2">
                    {paymentSchedule.map((payment, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-neutral-600">{payment.label}</span>
                        <div className="text-right">
                          <span className="font-medium text-neutral-900">
                            ${payment.amount.toFixed(2)}
                          </span>
                          <span className="text-neutral-500 text-xs ml-2">
                            {payment.due}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Option C: Special Arrangement */}
        <div
          className={`
            rounded-2xl border-2 transition-all
            ${formData.paymentPlanType === 'special_request'
              ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50'
              : 'border-amber-200 bg-amber-50/50'
            }
          `}
        >
          <button
            type="button"
            onClick={() => handleSelectPaymentType('special_request')}
            className="w-full text-left p-4"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <MessageCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h4 className="font-semibold text-neutral-900">Request Special Arrangement</h4>
                <p className="text-sm text-neutral-600">
                  Contact us if you need a custom payment plan or assistance
                </p>
              </div>
            </div>
          </button>

          {formData.paymentPlanType === 'special_request' && (
            <div className="px-4 pb-4 space-y-4">
              <div className="p-3 rounded-xl bg-amber-100 border border-amber-200">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> Your registration will be held until a staff member reviews
                  and approves your request. This typically takes 1-2 business days.
                </p>
              </div>

              <div>
                <label
                  htmlFor="specialRequestReason"
                  className="block text-sm font-medium text-neutral-700 mb-1"
                >
                  Reason for Request *
                </label>
                <select
                  id="specialRequestReason"
                  name="specialRequestReason"
                  value={formData.specialRequestReason}
                  onChange={handleSpecialRequestChange}
                  className={inputClass('specialRequestReason')}
                >
                  <option value="">Select a reason</option>
                  {SPECIAL_REQUEST_REASONS.map((reason) => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </select>
                {validationErrors.specialRequestReason && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {validationErrors.specialRequestReason}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="specialRequestNotes"
                  className="block text-sm font-medium text-neutral-700 mb-1"
                >
                  Additional Details *
                </label>
                <textarea
                  id="specialRequestNotes"
                  name="specialRequestNotes"
                  value={formData.specialRequestNotes}
                  onChange={handleSpecialRequestChange}
                  rows={3}
                  className={inputClass('specialRequestNotes')}
                  placeholder="Please explain your situation and what arrangement would work for you..."
                />
                {validationErrors.specialRequestNotes && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {validationErrors.specialRequestNotes}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Prompt when nothing selected */}
      {!formData.paymentPlanType && (
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-center">
          <p className="text-sm text-blue-700">Select a payment option above to continue</p>
        </div>
      )}

      <StepNavigation
        onNext={handleNext}
        onPrev={prevStep}
        disabled={!canProceed}
        nextLabel={
          formData.paymentPlanType === 'full' || formData.paymentPlanType === 'installment'
            ? 'Continue to Payment'
            : formData.paymentPlanType === 'special_request'
            ? 'Submit Request'
            : 'Continue'
        }
      />
    </div>
  );
}
