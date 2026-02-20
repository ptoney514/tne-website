import { useState, useCallback } from 'react';
import { AlertCircle, Check, Shield, Camera, Heart, Send, Loader2, DollarSign } from 'lucide-react';
import { useWizard } from '../WizardContext';
import { validateStep4 } from '../wizardValidation';
import SummaryCard from '../ui/SummaryCard';
import Turnstile from '../ui/Turnstile';

export default function ReviewConfirmStep({ onSubmit, isSubmitting }) {
  const {
    formData,
    validationErrors,
    updateField,
    setValidationErrors,
    clearValidationError,
    prevStep,
  } = useWizard();

  const [submitError, setSubmitError] = useState(null);
  const [turnstileToken, setTurnstileToken] = useState(null);
  const [turnstileError, setTurnstileError] = useState(null);

  const handleWaiverChange = (field, checked) => {
    updateField(field, checked);
    if (validationErrors[field]) {
      clearValidationError(field);
    }
  };

  const handleTurnstileSuccess = useCallback((token) => {
    setTurnstileToken(token);
    setTurnstileError(null);
  }, []);

  const handleTurnstileError = useCallback((error) => {
    setTurnstileToken(null);
    setTurnstileError('Captcha verification failed. Please try again.');
    console.error('Turnstile error:', error);
  }, []);

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken(null);
    setTurnstileError('Captcha expired. Please verify again.');
  }, []);

  const handleSubmit = async () => {
    const errors = validateStep4(formData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Check for Turnstile token
    if (!turnstileToken) {
      setSubmitError('Please complete the captcha verification.');
      return;
    }

    setSubmitError(null);
    const result = await onSubmit(turnstileToken);
    if (!result.success) {
      setSubmitError(result.error || 'Failed to submit registration. Please try again.');
    }
  };

  const allWaiversAccepted =
    formData.waiverLiability &&
    formData.waiverMedical &&
    formData.waiverMedia &&
    formData.paymentTermsAcknowledged;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-neutral-900">
          Review & Confirm
        </h3>
        <p className="text-sm text-neutral-600 mt-1">
          Please review your information and accept the waivers to complete registration
        </p>
      </div>

      {submitError && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{submitError}</p>
        </div>
      )}

      {/* Registration Summary */}
      <SummaryCard />

      {/* Player & Parent Summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-white border border-neutral-200 p-4">
          <h4 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-2">
            Player
          </h4>
          <p className="font-medium text-neutral-900">
            {formData.playerFirstName} {formData.playerLastName}
          </p>
          <p className="text-sm text-neutral-600">
            {formData.playerGrade && `Grade ${formData.playerGrade}`}
            {formData.playerGender && ` • ${formData.playerGender === 'male' ? 'Male' : 'Female'}`}
          </p>
          <p className="text-sm text-neutral-600">
            Jersey Size: {formData.jerseySize}
          </p>
          {formData.desiredJerseyNumber && (
            <p className="text-sm text-neutral-600">
              Desired Jersey #: {formData.desiredJerseyNumber}
            </p>
          )}
          {formData.lastTeamPlayedFor && (
            <p className="text-sm text-neutral-600">
              Last Team: {formData.lastTeamPlayedFor}
            </p>
          )}
        </div>

        <div className="rounded-xl bg-white border border-neutral-200 p-4">
          <h4 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-2">
            Parent/Guardian
          </h4>
          <p className="font-medium text-neutral-900">
            {formData.parentFirstName} {formData.parentLastName}
          </p>
          <p className="text-sm text-neutral-600">{formData.parentEmail}</p>
          <p className="text-sm text-neutral-600">Cell: {formData.parentPhone}</p>
          {formData.parentHomePhone && (
            <p className="text-sm text-neutral-600">Home: {formData.parentHomePhone}</p>
          )}
          {formData.parent2Name && (
            <div className="mt-2 pt-2 border-t border-neutral-100">
              <p className="text-xs text-neutral-500 uppercase">Parent/Guardian 2</p>
              <p className="text-sm font-medium text-neutral-900">{formData.parent2Name}</p>
              {formData.parent2Phone && (
                <p className="text-sm text-neutral-600">{formData.parent2Phone}</p>
              )}
              {formData.parent2Email && (
                <p className="text-sm text-neutral-600">{formData.parent2Email}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Waivers Section */}
      <div className="space-y-4 pt-4 border-t border-neutral-200">
        <h3 className="text-sm font-medium text-neutral-900 uppercase tracking-wide">
          Agreements & Waivers
        </h3>

        {Object.keys(validationErrors).length > 0 && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">Please accept all required waivers to continue</p>
          </div>
        )}

        {/* Liability Waiver */}
        <div
          className={`
            rounded-xl border p-4 transition-colors
            ${validationErrors.waiverLiability ? 'border-red-300 bg-red-50' : 'border-neutral-200 bg-white'}
          `}
        >
          <label className="flex items-start gap-3 cursor-pointer">
            <div className="mt-0.5">
              <input
                type="checkbox"
                checked={formData.waiverLiability}
                onChange={(e) => handleWaiverChange('waiverLiability', e.target.checked)}
                className="w-5 h-5 text-tne-red border-neutral-300 rounded focus:ring-tne-red/50"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-neutral-500" />
                <span className="font-medium text-neutral-900">Liability Waiver *</span>
              </div>
              <p className="text-sm text-neutral-600 mt-1">
                I hereby release TNE United Express, its coaches, volunteers, and affiliated
                organizations from any liability for injuries sustained during practices, games,
                or team activities. I understand that basketball is a physical sport with inherent
                risks of injury.
              </p>
            </div>
          </label>
        </div>

        {/* Medical Authorization */}
        <div
          className={`
            rounded-xl border p-4 transition-colors
            ${validationErrors.waiverMedical ? 'border-red-300 bg-red-50' : 'border-neutral-200 bg-white'}
          `}
        >
          <label className="flex items-start gap-3 cursor-pointer">
            <div className="mt-0.5">
              <input
                type="checkbox"
                checked={formData.waiverMedical}
                onChange={(e) => handleWaiverChange('waiverMedical', e.target.checked)}
                className="w-5 h-5 text-tne-red border-neutral-300 rounded focus:ring-tne-red/50"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-neutral-500" />
                <span className="font-medium text-neutral-900">Medical Authorization *</span>
              </div>
              <p className="text-sm text-neutral-600 mt-1">
                In case of emergency, I authorize TNE United Express staff to seek appropriate
                medical treatment for my child. I understand that reasonable efforts will be made
                to contact me before any medical decisions are made.
              </p>
            </div>
          </label>
        </div>

        {/* Photo/Video Release */}
        <div
          className={`
            rounded-xl border p-4 transition-colors
            ${validationErrors.waiverMedia ? 'border-red-300 bg-red-50' : 'border-neutral-200 bg-white'}
          `}
        >
          <label className="flex items-start gap-3 cursor-pointer">
            <div className="mt-0.5">
              <input
                type="checkbox"
                checked={formData.waiverMedia}
                onChange={(e) => handleWaiverChange('waiverMedia', e.target.checked)}
                className="w-5 h-5 text-tne-red border-neutral-300 rounded focus:ring-tne-red/50"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-neutral-500" />
                <span className="font-medium text-neutral-900">Photo/Video Release *</span>
              </div>
              <p className="text-sm text-neutral-600 mt-1">
                I grant permission for photos and videos of my child taken during TNE United Express
                activities to be used for promotional purposes, including but not limited to social
                media, website, and marketing materials.
              </p>
            </div>
          </label>
        </div>

        {/* Payment Terms Acknowledgment */}
        <div
          className={`
            rounded-xl border p-4 transition-colors
            ${validationErrors.paymentTermsAcknowledged ? 'border-red-300 bg-red-50' : 'border-neutral-200 bg-white'}
          `}
        >
          <label className="flex items-start gap-3 cursor-pointer">
            <div className="mt-0.5">
              <input
                type="checkbox"
                checked={formData.paymentTermsAcknowledged}
                onChange={(e) => handleWaiverChange('paymentTermsAcknowledged', e.target.checked)}
                className="w-5 h-5 text-tne-red border-neutral-300 rounded focus:ring-tne-red/50"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-neutral-500" />
                <span className="font-medium text-neutral-900">Payment Terms *</span>
              </div>
              <p className="text-sm text-neutral-600 mt-1">
                I understand that roster placement requires payment confirmation. My player&apos;s spot
                is not guaranteed until payment is received and verified by TNE United Express.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Turnstile Captcha */}
      <div className="pt-4 border-t border-neutral-200">
        <h3 className="text-sm font-medium text-neutral-900 uppercase tracking-wide mb-3">
          Security Verification
        </h3>
        {turnstileError && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 mb-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{turnstileError}</p>
          </div>
        )}
        <Turnstile
          onSuccess={handleTurnstileSuccess}
          onError={handleTurnstileError}
          onExpire={handleTurnstileExpire}
          className="flex justify-center"
        />
        {turnstileToken && (
          <p className="text-xs text-emerald-600 text-center mt-2">
            <Check className="w-4 h-4 inline mr-1" />
            Verification complete
          </p>
        )}
      </div>

      {/* Final Confirmation */}
      <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
        <div className="flex items-start gap-3">
          <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-emerald-800">
              By clicking &quot;Secure Player Spot&quot; below, I confirm that all information provided
              is accurate and I agree to the above waivers and terms.
              {formData.paymentPlanType === 'special_request' && (
                <span className="block mt-2 font-medium">
                  Note: Your registration will be held pending approval of your special payment request.
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-neutral-200">
        <button
          type="button"
          onClick={prevStep}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !allWaiversAccepted || !turnstileToken}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-tne-red text-white font-medium hover:bg-tne-red-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              Secure Player Spot
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
