import Link from 'next/link';
import { CheckCircle, DollarSign, Clock, AlertTriangle, Calendar, Info } from 'lucide-react';
import { WizardProvider, useWizard } from './WizardContext';
import { calculateGraduatingYear } from './wizardValidation';
import StepIndicator from './ui/StepIndicator';
import PlayerTeamStep from './steps/PlayerTeamStep';
import PlayerSeasonStep from './steps/PlayerSeasonStep';
import ParentContactStep from './steps/ParentContactStep';
import PaymentCommitmentStep from './steps/PaymentCommitmentStep';
import ReviewConfirmStep from './steps/ReviewConfirmStep';
import { getPaymentPlanDetails, PAYMENT_METHODS } from '@/constants/payments';

function WizardContent({ onSubmit, submitting, submitSuccess, onReset, seasons }) {
  const {
    currentStep,
    registrationType,
    formData,
    selectedTeam,
    paymentReferenceId,
    clearDraft,
  } = useWizard();

  const handleSubmit = async (turnstileToken = null) => {
    const graduatingYear = calculateGraduatingYear(formData.playerGrade);

    // Season registration: simpler payload
    if (registrationType === 'season') {
      const registrationData = {
        registrationType: 'season',
        seasonId: formData.seasonId,
        playerFirstName: formData.playerFirstName,
        playerLastName: formData.playerLastName,
        playerDob: formData.playerDob,
        playerGraduatingYear: graduatingYear,
        playerGrade: formData.playerGrade,
        playerGender: formData.playerGender,
        position: formData.position,
        lastTeamPlayedFor: formData.lastTeamPlayedFor,
        parentFirstName: formData.parentFirstName,
        parentLastName: formData.parentLastName,
        parentEmail: formData.parentEmail,
        parentPhone: formData.parentPhone,
        relationship: formData.relationship,
        addressStreet: formData.addressStreet,
        addressCity: formData.addressCity,
        addressState: formData.addressState,
        addressZip: formData.addressZip,
        parentHomePhone: formData.parentHomePhone,
        parent2Name: formData.parent2Name,
        parent2Phone: formData.parent2Phone,
        parent2Email: formData.parent2Email,
        emergencyName: formData.emergencyName,
        emergencyPhone: formData.emergencyPhone,
        emergencyRelationship: formData.emergencyRelationship,
        waiverLiability: formData.waiverLiability,
        waiverMedical: formData.waiverMedical,
        waiverMedia: formData.waiverMedia,
        paymentReferenceId,
        status: 'registered_for_tryouts',
      };

      const result = await onSubmit(registrationData, turnstileToken);
      if (result.success) {
        clearDraft();
      }
      return result;
    }

    // Team registration: full payload (existing logic)
    let status = 'pending_payment';
    if (formData.paymentPlanType === 'special_request') {
      status = 'awaiting_approval';
    } else if (formData.paymentPlanType === 'installment') {
      status = 'payment_plan_active';
    }

    const teamFee = selectedTeam ? parseFloat(selectedTeam.team_fee) || 0 : 0;
    const uniformFee = selectedTeam ? parseFloat(selectedTeam.uniform_fee) || 0 : 0;
    const totalFee = teamFee + uniformFee;

    const paymentPlan = formData.paymentPlanType === 'installment'
      ? getPaymentPlanDetails(totalFee, formData.paymentPlanOption)
      : null;

    const initialAmountDue = formData.paymentPlanType === 'full'
      ? totalFee
      : formData.paymentPlanType === 'installment' && paymentPlan
      ? paymentPlan.deposit
      : 0;

    const remainingBalance = formData.paymentPlanType === 'full'
      ? 0
      : formData.paymentPlanType === 'installment' && paymentPlan
      ? totalFee - paymentPlan.deposit
      : totalFee;

    const registrationData = {
      registrationType: 'team',
      teamId: formData.teamId,
      playerFirstName: formData.playerFirstName,
      playerLastName: formData.playerLastName,
      playerDob: formData.playerDob,
      playerGraduatingYear: graduatingYear,
      playerGrade: formData.playerGrade,
      playerGender: formData.playerGender,
      jerseySize: formData.jerseySize,
      position: formData.position,
      parentFirstName: formData.parentFirstName,
      parentLastName: formData.parentLastName,
      parentEmail: formData.parentEmail,
      parentPhone: formData.parentPhone,
      relationship: formData.relationship,
      addressStreet: formData.addressStreet,
      addressCity: formData.addressCity,
      addressState: formData.addressState,
      addressZip: formData.addressZip,
      emergencyName: formData.emergencyName,
      emergencyPhone: formData.emergencyPhone,
      emergencyRelationship: formData.emergencyRelationship,
      parentHomePhone: formData.parentHomePhone,
      parent2Name: formData.parent2Name,
      parent2Phone: formData.parent2Phone,
      parent2Email: formData.parent2Email,
      paymentPlanType: formData.paymentPlanType,
      paymentPlanOption: formData.paymentPlanOption,
      initialAmountDue,
      remainingBalance,
      paymentReferenceId,
      paymentConfirmed: formData.paymentConfirmed,
      paymentTermsAcknowledged: formData.paymentTermsAcknowledged,
      specialRequestReason: formData.specialRequestReason,
      specialRequestNotes: formData.specialRequestNotes,
      waiverLiability: formData.waiverLiability,
      waiverMedical: formData.waiverMedical,
      waiverMedia: formData.waiverMedia,
      status,
    };

    const result = await onSubmit(registrationData, turnstileToken);
    if (result.success) {
      clearDraft();
    }
    return result;
  };

  // Season registration success state
  if (submitSuccess && registrationType === 'season') {
    const seasonName = seasons?.find(s => s.id === formData.seasonId)?.name || 'the upcoming season';

    return (
      <div className="rounded-3xl bg-white border border-neutral-300 shadow-sm overflow-hidden">
        <div className="px-6 py-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">
            You&apos;re Registered for {seasonName}!
          </h3>
          <p className="text-neutral-600 mb-2 max-w-md mx-auto">
            We&apos;ll contact <strong>{formData.playerFirstName}</strong> at{' '}
            <strong>{formData.parentEmail}</strong> with tryout information.
          </p>

          {/* Reference ID */}
          <div className="rounded-xl bg-neutral-100 p-4 mb-6 inline-block">
            <p className="text-sm text-neutral-600 mb-1">Reference ID</p>
            <p className="font-mono text-lg font-bold text-neutral-900">{paymentReferenceId}</p>
          </div>

          {/* What's Next */}
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 mb-6 text-left max-w-md mx-auto">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm text-blue-800">
                <p className="font-medium">What&apos;s Next</p>
                <ul className="space-y-1.5">
                  <li className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    Watch for tryout dates/times via email
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    After tryouts, you&apos;ll be notified of team placement
                  </li>
                  <li className="flex items-start gap-2">
                    <DollarSign className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    Complete team registration &amp; payment after placement
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/tryouts"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-tne-red text-white font-medium hover:bg-tne-red-dark transition-colors"
            >
              <Calendar className="w-4 h-4" />
              View Tryout Info
            </Link>
            <button
              onClick={onReset}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-neutral-100 text-neutral-700 font-medium hover:bg-neutral-200 transition-colors"
            >
              Register Another Player
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Team registration success state (existing)
  if (submitSuccess) {
    const isSpecialRequest = formData.paymentPlanType === 'special_request';
    const isPaidInFull = formData.paymentPlanType === 'full' && formData.paymentConfirmed;

    return (
      <div className="rounded-3xl bg-white border border-neutral-300 shadow-sm overflow-hidden">
        <div className="px-6 py-12 text-center">
          {isSpecialRequest ? (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-600 mb-4">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                Request Submitted
              </h3>
              <p className="text-neutral-600 mb-6 max-w-md mx-auto">
                Your registration and special payment arrangement request has been submitted.
                Our team will review your request and contact you within 1-2 business days.
              </p>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                Registration Complete!
              </h3>
              <p className="text-neutral-600 mb-2 max-w-md mx-auto">
                Thank you for registering <strong>{formData.playerFirstName}</strong> for{' '}
                <strong>{selectedTeam?.name}</strong>.
              </p>
              <p className="text-neutral-500 text-sm mb-6 max-w-md mx-auto">
                A confirmation email will be sent to <strong>{formData.parentEmail}</strong>.
              </p>
            </>
          )}

          {/* Payment Reference */}
          <div className="rounded-xl bg-neutral-100 p-4 mb-6 inline-block">
            <p className="text-sm text-neutral-600 mb-1">Your Reference ID</p>
            <p className="font-mono text-lg font-bold text-neutral-900">{paymentReferenceId}</p>
          </div>

          {/* Next Steps */}
          {!isSpecialRequest && !isPaidInFull && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 mb-6 text-left max-w-md mx-auto">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Payment Required</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Please complete your payment to secure your spot. Include your reference ID
                    ({paymentReferenceId}) with your payment.
                  </p>
                  <div className="mt-2 space-y-1 text-xs text-amber-700">
                    <p><strong>Venmo:</strong> {PAYMENT_METHODS.venmo.handle}</p>
                    <p><strong>Cash App:</strong> {PAYMENT_METHODS.cashapp.handle}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/payments"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-tne-red text-white font-medium hover:bg-tne-red-dark transition-colors"
            >
              <DollarSign className="w-4 h-4" />
              View Payment Status
            </Link>
            <button
              onClick={onReset}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-neutral-100 text-neutral-700 font-medium hover:bg-neutral-200 transition-colors"
            >
              Register Another Player
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Season wizard steps (3 steps: Player → Contact → Confirm)
  if (registrationType === 'season') {
    return (
      <div className="rounded-3xl bg-white border border-neutral-300 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-200 bg-neutral-50">
          <StepIndicator />
        </div>

        <div className="px-5 py-6">
          {currentStep === 1 && <PlayerSeasonStep seasons={seasons} />}
          {currentStep === 2 && <ParentContactStep />}
          {currentStep === 3 && (
            <ReviewConfirmStep
              onSubmit={handleSubmit}
              isSubmitting={submitting}
            />
          )}
        </div>
      </div>
    );
  }

  // Team wizard steps (4 steps: Player → Contact → Payment → Confirm)
  return (
    <div className="rounded-3xl bg-white border border-neutral-300 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-neutral-200 bg-neutral-50">
        <StepIndicator />
      </div>

      <div className="px-5 py-6">
        {currentStep === 1 && <PlayerTeamStep />}
        {currentStep === 2 && <ParentContactStep />}
        {currentStep === 3 && <PaymentCommitmentStep />}
        {currentStep === 4 && (
          <ReviewConfirmStep
            onSubmit={handleSubmit}
            isSubmitting={submitting}
          />
        )}
      </div>
    </div>
  );
}

// Export WizardContent for use when WizardProvider is lifted
export { WizardContent };

export default function RegistrationWizard({
  teams,
  onSubmit,
  submitting,
  submitSuccess,
  onReset,
  seasons,
}) {
  return (
    <WizardProvider teams={teams}>
      <WizardContent
        onSubmit={onSubmit}
        submitting={submitting}
        submitSuccess={submitSuccess}
        onReset={onReset}
        seasons={seasons}
      />
    </WizardProvider>
  );
}
