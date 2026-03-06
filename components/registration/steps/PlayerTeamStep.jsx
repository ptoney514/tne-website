import { AlertCircle } from 'lucide-react';
import { useWizard } from '../WizardContext';
import { validateStep1 } from '../wizardValidation';
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

const jerseySizeOptions = [
  { value: '', label: 'Select size' },
  { value: 'YS', label: 'Youth Small' },
  { value: 'YM', label: 'Youth Medium' },
  { value: 'YL', label: 'Youth Large' },
  { value: 'AS', label: 'Adult Small' },
  { value: 'AM', label: 'Adult Medium' },
  { value: 'AL', label: 'Adult Large' },
  { value: 'AXL', label: 'Adult X-Large' },
];

const positionOptions = [
  { value: '', label: 'Select position (optional)' },
  { value: 'guard', label: 'Guard' },
  { value: 'forward', label: 'Forward' },
  { value: 'center', label: 'Center' },
  { value: 'none', label: 'No Preference' },
];

export default function PlayerTeamStep() {
  const {
    formData,
    teams,
    selectedTeam,
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
    const errors = validateStep1(formData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      // Scroll to first error
      const firstError = document.querySelector('[data-error="true"]');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    nextStep();
  };

  const totalFee = selectedTeam
    ? (parseFloat(selectedTeam.team_fee) || 0) + (parseFloat(selectedTeam.uniform_fee) || 0)
    : 0;

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
      {/* Team Selection */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-neutral-900 uppercase tracking-wide">
          Select Your Team
        </h3>

        <div data-error={!!validationErrors.teamId}>
          <label htmlFor="teamId" className="block text-sm font-medium text-neutral-700 mb-1">
            Team *
          </label>
          <select
            id="teamId"
            name="teamId"
            value={formData.teamId}
            onChange={handleChange}
            className={selectClass('teamId')}
          >
            <option value="">Select a team</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name} - {team.gender === 'male' ? 'Boys' : 'Girls'}
              </option>
            ))}
            <option value="other">Other (Team not yet formed)</option>
          </select>
          {validationErrors.teamId && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {validationErrors.teamId}
            </p>
          )}
        </div>

        {formData.teamId === 'other' && (
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Team placement pending.</strong> You&apos;ll be contacted once your team is formed. No payment is required at this time.
            </p>
          </div>
        )}

        {selectedTeam && totalFee > 0 && formData.teamId !== 'other' && (
          <div className="p-4 rounded-xl bg-tne-red/5 border border-tne-red/20">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-700">Season Fee:</span>
              <span className="text-lg font-bold text-tne-red">${totalFee.toFixed(2)}</span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Team fee (${parseFloat(selectedTeam.team_fee || 0).toFixed(2)}) +
              Uniform (${parseFloat(selectedTeam.uniform_fee || 0).toFixed(2)})
            </p>
          </div>
        )}
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

        {formData.teamId !== 'other' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div data-error={!!validationErrors.jerseySize}>
              <label htmlFor="jerseySize" className="block text-sm font-medium text-neutral-700 mb-1">
                Jersey Size *
              </label>
              <select
                id="jerseySize"
                name="jerseySize"
                value={formData.jerseySize}
                onChange={handleChange}
                className={selectClass('jerseySize')}
              >
                {jerseySizeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {validationErrors.jerseySize && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {validationErrors.jerseySize}
                </p>
              )}
            </div>

            <div data-error={!!validationErrors.desiredJerseyNumber}>
              <label htmlFor="desiredJerseyNumber" className="block text-sm font-medium text-neutral-700 mb-1">
                Desired Jersey # *
              </label>
              <input
                type="text"
                id="desiredJerseyNumber"
                name="desiredJerseyNumber"
                value={formData.desiredJerseyNumber}
                onChange={handleChange}
                className={inputClass('desiredJerseyNumber')}
                placeholder="e.g. 23"
              />
              {validationErrors.desiredJerseyNumber && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {validationErrors.desiredJerseyNumber}
                </p>
              )}
            </div>
          </div>
        )}

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
