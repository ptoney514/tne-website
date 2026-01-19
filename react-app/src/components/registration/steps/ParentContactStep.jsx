import { AlertCircle } from 'lucide-react';
import { useWizard } from '../WizardContext';
import { validateStep2 } from '../wizardValidation';
import StepNavigation from '../ui/StepNavigation';

const relationshipOptions = [
  { value: '', label: 'Select relationship' },
  { value: 'mother', label: 'Mother' },
  { value: 'father', label: 'Father' },
  { value: 'guardian', label: 'Legal Guardian' },
  { value: 'other', label: 'Other' },
];

const stateOptions = [
  { value: '', label: 'Select state' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'CO', label: 'Colorado' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'MO', label: 'Missouri' },
];

// Format phone number as user types
function formatPhoneNumber(value) {
  const phone = value.replace(/\D/g, '');
  if (phone.length < 4) return phone;
  if (phone.length < 7) return `(${phone.slice(0, 3)}) ${phone.slice(3)}`;
  return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6, 10)}`;
}

export default function ParentContactStep() {
  const {
    formData,
    validationErrors,
    updateField,
    setValidationErrors,
    clearValidationError,
    nextStep,
    prevStep,
  } = useWizard();

  // Check if all required fields are filled
  const canProceed = (() => {
    // Parent/Guardian required fields
    if (!formData.parentFirstName?.trim()) return false;
    if (!formData.parentLastName?.trim()) return false;
    if (!formData.parentEmail?.trim()) return false;
    if (!formData.parentPhone?.trim()) return false;
    if (!formData.relationship) return false;

    // Address required fields
    if (!formData.addressStreet?.trim()) return false;
    if (!formData.addressCity?.trim()) return false;
    if (!formData.addressState) return false;
    if (!formData.addressZip?.trim()) return false;

    // Emergency contact required fields
    if (!formData.emergencyName?.trim()) return false;
    if (!formData.emergencyPhone?.trim()) return false;

    return true;
  })();

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Format phone numbers
    if (name === 'parentPhone' || name === 'emergencyPhone') {
      updateField(name, formatPhoneNumber(value));
    } else {
      updateField(name, value);
    }

    if (validationErrors[name]) {
      clearValidationError(name);
    }
  };

  const handleNext = () => {
    const errors = validateStep2(formData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      const firstError = document.querySelector('[data-error="true"]');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    nextStep();
  };

  const inputClass = (fieldName) => `
    block w-full rounded-xl border bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400
    focus:outline-none focus:ring-2 focus:ring-tne-red/50 focus:border-tne-red/50
    ${validationErrors[fieldName] ? 'border-red-500' : 'border-neutral-300'}
  `;

  return (
    <div className="space-y-6">
      {/* Parent/Guardian Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-neutral-900 uppercase tracking-wide">
          Parent/Guardian Information
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div data-error={!!validationErrors.parentFirstName}>
            <label htmlFor="parentFirstName" className="block text-sm font-medium text-neutral-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              id="parentFirstName"
              name="parentFirstName"
              value={formData.parentFirstName}
              onChange={handleChange}
              className={inputClass('parentFirstName')}
            />
            {validationErrors.parentFirstName && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.parentFirstName}
              </p>
            )}
          </div>

          <div data-error={!!validationErrors.parentLastName}>
            <label htmlFor="parentLastName" className="block text-sm font-medium text-neutral-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              id="parentLastName"
              name="parentLastName"
              value={formData.parentLastName}
              onChange={handleChange}
              className={inputClass('parentLastName')}
            />
            {validationErrors.parentLastName && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.parentLastName}
              </p>
            )}
          </div>
        </div>

        <div data-error={!!validationErrors.parentEmail}>
          <label htmlFor="parentEmail" className="block text-sm font-medium text-neutral-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            id="parentEmail"
            name="parentEmail"
            value={formData.parentEmail}
            onChange={handleChange}
            className={inputClass('parentEmail')}
            placeholder="email@example.com"
          />
          {validationErrors.parentEmail && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {validationErrors.parentEmail}
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div data-error={!!validationErrors.parentPhone}>
            <label htmlFor="parentPhone" className="block text-sm font-medium text-neutral-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              id="parentPhone"
              name="parentPhone"
              value={formData.parentPhone}
              onChange={handleChange}
              className={inputClass('parentPhone')}
              placeholder="(402) 555-0123"
            />
            {validationErrors.parentPhone && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.parentPhone}
              </p>
            )}
          </div>

          <div data-error={!!validationErrors.relationship}>
            <label htmlFor="relationship" className="block text-sm font-medium text-neutral-700 mb-1">
              Relationship to Player *
            </label>
            <select
              id="relationship"
              name="relationship"
              value={formData.relationship}
              onChange={handleChange}
              className={inputClass('relationship')}
            >
              {relationshipOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {validationErrors.relationship && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.relationship}
              </p>
            )}
          </div>
        </div>

        <div data-error={!!validationErrors.addressStreet}>
          <label htmlFor="addressStreet" className="block text-sm font-medium text-neutral-700 mb-1">
            Street Address *
          </label>
          <input
            type="text"
            id="addressStreet"
            name="addressStreet"
            value={formData.addressStreet}
            onChange={handleChange}
            className={inputClass('addressStreet')}
            placeholder="123 Main Street"
          />
          {validationErrors.addressStreet && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {validationErrors.addressStreet}
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div data-error={!!validationErrors.addressCity}>
            <label htmlFor="addressCity" className="block text-sm font-medium text-neutral-700 mb-1">
              City *
            </label>
            <input
              type="text"
              id="addressCity"
              name="addressCity"
              value={formData.addressCity}
              onChange={handleChange}
              className={inputClass('addressCity')}
              placeholder="Omaha"
            />
            {validationErrors.addressCity && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.addressCity}
              </p>
            )}
          </div>

          <div data-error={!!validationErrors.addressState}>
            <label htmlFor="addressState" className="block text-sm font-medium text-neutral-700 mb-1">
              State *
            </label>
            <select
              id="addressState"
              name="addressState"
              value={formData.addressState}
              onChange={handleChange}
              className={inputClass('addressState')}
            >
              {stateOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {validationErrors.addressState && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.addressState}
              </p>
            )}
          </div>

          <div data-error={!!validationErrors.addressZip}>
            <label htmlFor="addressZip" className="block text-sm font-medium text-neutral-700 mb-1">
              ZIP Code *
            </label>
            <input
              type="text"
              id="addressZip"
              name="addressZip"
              value={formData.addressZip}
              onChange={handleChange}
              className={inputClass('addressZip')}
              placeholder="68114"
              maxLength={5}
            />
            {validationErrors.addressZip && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.addressZip}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="space-y-4 pt-4 border-t border-neutral-200">
        <h3 className="text-sm font-medium text-neutral-900 uppercase tracking-wide">
          Emergency Contact
        </h3>
        <p className="text-sm text-neutral-500 -mt-2">
          Please provide a secondary contact in case of emergency
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div data-error={!!validationErrors.emergencyName}>
            <label htmlFor="emergencyName" className="block text-sm font-medium text-neutral-700 mb-1">
              Contact Name *
            </label>
            <input
              type="text"
              id="emergencyName"
              name="emergencyName"
              value={formData.emergencyName}
              onChange={handleChange}
              className={inputClass('emergencyName')}
            />
            {validationErrors.emergencyName && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.emergencyName}
              </p>
            )}
          </div>

          <div data-error={!!validationErrors.emergencyPhone}>
            <label htmlFor="emergencyPhone" className="block text-sm font-medium text-neutral-700 mb-1">
              Contact Phone *
            </label>
            <input
              type="tel"
              id="emergencyPhone"
              name="emergencyPhone"
              value={formData.emergencyPhone}
              onChange={handleChange}
              className={inputClass('emergencyPhone')}
              placeholder="(402) 555-0123"
            />
            {validationErrors.emergencyPhone && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.emergencyPhone}
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="emergencyRelationship" className="block text-sm font-medium text-neutral-700 mb-1">
            Relationship to Player
          </label>
          <input
            type="text"
            id="emergencyRelationship"
            name="emergencyRelationship"
            value={formData.emergencyRelationship}
            onChange={handleChange}
            className={inputClass('emergencyRelationship')}
            placeholder="Grandmother, Uncle, etc."
          />
        </div>
      </div>

      {/* Visual prompt when incomplete */}
      {!canProceed && (
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-center">
          <p className="text-sm text-blue-700">Complete all required fields to continue</p>
        </div>
      )}

      <StepNavigation onNext={handleNext} onPrev={prevStep} disabled={!canProceed} />
    </div>
  );
}
