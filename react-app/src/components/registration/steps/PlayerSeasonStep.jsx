import { AlertCircle } from 'lucide-react';
import { useWizard } from '../WizardContext';
import { validateSeasonStep1 } from '../wizardValidation';
import StepNavigation from '../ui/StepNavigation';

const gradeOptions = [
  { value: '', label: 'Select grade' },
  { value: '3', label: '3rd Grade' },
  { value: '4', label: '4th Grade' },
  { value: '5', label: '5th Grade' },
  { value: '6', label: '6th Grade' },
  { value: '7', label: '7th Grade' },
  { value: '8', label: '8th Grade' },
];

const positionOptions = [
  { value: '', label: 'Select position (optional)' },
  { value: 'guard', label: 'Guard' },
  { value: 'forward', label: 'Forward' },
  { value: 'center', label: 'Center' },
  { value: 'none', label: 'No Preference' },
];

export default function PlayerSeasonStep({ seasons = [] }) {
  const {
    formData,
    validationErrors,
    updateField,
    setValidationErrors,
    clearValidationError,
    nextStep,
  } = useWizard();

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateField(name, value);
    if (validationErrors[name]) {
      clearValidationError(name);
    }
  };

  const handleNext = () => {
    const errors = validateSeasonStep1(formData);
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

  const selectClass = (fieldName) => `
    block w-full rounded-xl border bg-neutral-50 px-4 py-3 text-sm text-neutral-900
    focus:outline-none focus:ring-2 focus:ring-tne-red/50 focus:border-tne-red/50
    h-[42px] cursor-pointer
    ${validationErrors[fieldName] ? 'border-red-500' : 'border-neutral-300'}
  `;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-neutral-900">
          Register for Season
        </h3>
        <p className="text-sm text-neutral-600 mt-1">
          Sign up for tryouts. No payment is required at this time.
        </p>
      </div>

      {/* Season Selection */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-neutral-900 uppercase tracking-wide">
          Season
        </h3>

        <div data-error={!!validationErrors.seasonId}>
          <label htmlFor="seasonId" className="block text-sm font-medium text-neutral-700 mb-1">
            Season *
          </label>
          {seasons.length <= 1 ? (
            <div className="block w-full rounded-xl border border-neutral-300 bg-neutral-100 px-4 py-2.5 text-sm text-neutral-900">
              {seasons[0]?.name || 'No active season'}
            </div>
          ) : (
            <select
              id="seasonId"
              name="seasonId"
              value={formData.seasonId}
              onChange={handleChange}
              className={selectClass('seasonId')}
            >
              <option value="">Select a season</option>
              {seasons.map((season) => (
                <option key={season.id} value={season.id}>
                  {season.name}
                </option>
              ))}
            </select>
          )}
          {validationErrors.seasonId && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {validationErrors.seasonId}
            </p>
          )}
        </div>
      </div>

      {/* Player Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-neutral-900 uppercase tracking-wide">
          Player Information
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div data-error={!!validationErrors.playerFirstName}>
            <label htmlFor="playerFirstName" className="block text-sm font-medium text-neutral-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              id="playerFirstName"
              name="playerFirstName"
              value={formData.playerFirstName}
              onChange={handleChange}
              className={inputClass('playerFirstName')}
            />
            {validationErrors.playerFirstName && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.playerFirstName}
              </p>
            )}
          </div>

          <div data-error={!!validationErrors.playerLastName}>
            <label htmlFor="playerLastName" className="block text-sm font-medium text-neutral-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              id="playerLastName"
              name="playerLastName"
              value={formData.playerLastName}
              onChange={handleChange}
              className={inputClass('playerLastName')}
            />
            {validationErrors.playerLastName && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.playerLastName}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div data-error={!!validationErrors.playerDob}>
            <label htmlFor="playerDob" className="block text-sm font-medium text-neutral-700 mb-1">
              Date of Birth *
            </label>
            <input
              type="date"
              id="playerDob"
              name="playerDob"
              value={formData.playerDob}
              onChange={handleChange}
              className={inputClass('playerDob')}
            />
            {validationErrors.playerDob && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.playerDob}
              </p>
            )}
          </div>

          <div data-error={!!validationErrors.playerGrade}>
            <label htmlFor="playerGrade" className="block text-sm font-medium text-neutral-700 mb-1">
              Current Grade *
            </label>
            <select
              id="playerGrade"
              name="playerGrade"
              value={formData.playerGrade}
              onChange={handleChange}
              className={selectClass('playerGrade')}
            >
              {gradeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {validationErrors.playerGrade && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.playerGrade}
              </p>
            )}
          </div>
        </div>

        <div data-error={!!validationErrors.playerGender}>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Gender *
          </label>
          <div className="flex gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="playerGender"
                value="male"
                checked={formData.playerGender === 'male'}
                onChange={handleChange}
                className="w-4 h-4 text-tne-red border-neutral-300 focus:ring-tne-red/50"
              />
              <span className="ml-2 text-sm text-neutral-700">Male</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="playerGender"
                value="female"
                checked={formData.playerGender === 'female'}
                onChange={handleChange}
                className="w-4 h-4 text-tne-red border-neutral-300 focus:ring-tne-red/50"
              />
              <span className="ml-2 text-sm text-neutral-700">Female</span>
            </label>
          </div>
          {validationErrors.playerGender && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {validationErrors.playerGender}
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="position" className="block text-sm font-medium text-neutral-700 mb-1">
              Position Preference
            </label>
            <select
              id="position"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className={selectClass('position')}
            >
              {positionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div data-error={!!validationErrors.lastTeamPlayedFor}>
            <label htmlFor="lastTeamPlayedFor" className="block text-sm font-medium text-neutral-700 mb-1">
              Last Team Played For *
            </label>
            <input
              type="text"
              id="lastTeamPlayedFor"
              name="lastTeamPlayedFor"
              value={formData.lastTeamPlayedFor}
              onChange={handleChange}
              className={inputClass('lastTeamPlayedFor')}
              placeholder="e.g. Omaha Stars"
            />
            {validationErrors.lastTeamPlayedFor && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.lastTeamPlayedFor}
              </p>
            )}
          </div>
        </div>
      </div>

      <StepNavigation onNext={handleNext} showPrev={false} />
    </div>
  );
}
