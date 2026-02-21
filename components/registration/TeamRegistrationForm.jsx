import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle, AlertCircle, Send, DollarSign } from 'lucide-react';

const gradeOptions = [
  { value: '', label: 'Select grade' },
  { value: '4', label: '4th Grade' },
  { value: '5', label: '5th Grade' },
  { value: '6', label: '6th Grade' },
  { value: '7', label: '7th Grade' },
  { value: '8', label: '8th Grade' },
];

const relationshipOptions = [
  { value: 'mother', label: 'Mother' },
  { value: 'father', label: 'Father' },
  { value: 'guardian', label: 'Legal Guardian' },
  { value: 'other', label: 'Other' },
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
  { value: '', label: 'Select position' },
  { value: 'guard', label: 'Guard' },
  { value: 'forward', label: 'Forward' },
  { value: 'center', label: 'Center' },
  { value: 'none', label: 'No Preference' },
];

const stateOptions = [
  { value: '', label: 'Select state' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'CO', label: 'Colorado' },
  { value: 'SD', label: 'South Dakota' },
];

// Calculate graduating year from current grade
function calculateGraduatingYear(grade) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-11
  // If we're past August, they're in the new school year
  const schoolYear = currentMonth >= 7 ? currentYear + 1 : currentYear;
  const gradeNum = parseInt(grade, 10);
  // 8th grade graduates in the school year they're in
  // So 8th grader in 2025-26 school year graduates in 2030 from high school
  return schoolYear + (12 - gradeNum);
}

export default function TeamRegistrationForm({
  teams,
  onSubmit,
  submitting,
  submitSuccess,
  submitError,
  onReset,
}) {
  const [formData, setFormData] = useState({
    teamId: '',
    playerFirstName: '',
    playerLastName: '',
    playerDob: '',
    playerGrade: '',
    playerGender: '',
    jerseySize: '',
    position: '',
    medicalNotes: '',
    parentFirstName: '',
    parentLastName: '',
    parentEmail: '',
    parentPhone: '',
    relationship: '',
    addressStreet: '',
    addressCity: '',
    addressState: 'NE',
    addressZip: '',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelationship: '',
    waiverAccepted: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const graduatingYear = calculateGraduatingYear(formData.playerGrade);
    const result = await onSubmit({
      ...formData,
      playerGraduatingYear: graduatingYear,
    });
    if (result.success) {
      setFormData({
        teamId: '',
        playerFirstName: '',
        playerLastName: '',
        playerDob: '',
        playerGrade: '',
        playerGender: '',
        jerseySize: '',
        position: '',
        medicalNotes: '',
        parentFirstName: '',
        parentLastName: '',
        parentEmail: '',
        parentPhone: '',
        relationship: '',
        addressStreet: '',
        addressCity: '',
        addressState: 'NE',
        addressZip: '',
        emergencyName: '',
        emergencyPhone: '',
        emergencyRelationship: '',
        waiverAccepted: false,
      });
    }
  };

  // Get selected team for fee display
  const selectedTeam = teams.find((t) => t.id === formData.teamId);
  const totalFee = selectedTeam
    ? (parseFloat(selectedTeam.team_fee) || 0) + (parseFloat(selectedTeam.uniform_fee) || 0)
    : 0;

  if (submitSuccess) {
    return (
      <div className="rounded-3xl bg-white border border-neutral-300 shadow-sm overflow-hidden">
        <div className="px-5 py-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">
            Registration Submitted!
          </h3>
          <p className="text-neutral-600 mb-6 max-w-sm mx-auto">
            Thank you for registering. You will receive a confirmation email
            shortly. To complete your registration, please submit payment.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/payments"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-tne-red text-white font-medium hover:bg-tne-red-dark transition-colors"
            >
              <DollarSign className="w-4 h-4" />
              Complete Payment
            </Link>
            <button
              onClick={onReset}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-100 text-neutral-700 font-medium hover:bg-neutral-200 transition-colors"
            >
              Register Another Player
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="registration"
      className="rounded-3xl bg-white border border-neutral-300 shadow-sm overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-neutral-200 bg-neutral-50">
        <h2 className="text-lg font-semibold text-neutral-900">
          Team Registration
        </h2>
        <p className="text-sm text-neutral-600 mt-0.5">
          Complete the form below to register for a team
        </p>
      </div>

      <form onSubmit={handleSubmit} className="px-5 py-5 space-y-5">
        {submitError && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{submitError}</p>
          </div>
        )}

        {/* Team Selection */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-neutral-900 uppercase tracking-wide">
            Team Selection
          </h3>
          <div>
            <label
              htmlFor="teamId"
              className="block text-sm font-medium text-neutral-700 mb-1"
            >
              Select Team *
            </label>
            <select
              id="teamId"
              name="teamId"
              value={formData.teamId}
              onChange={handleChange}
              required
              className="block w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-tne-red/50 focus:border-tne-red/50"
            >
              <option value="">Select a team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name} - {team.gender === 'male' ? 'Boys' : 'Girls'}
                </option>
              ))}
            </select>
          </div>
          {selectedTeam && (
            <div className="p-4 rounded-xl bg-tne-red/5 border border-tne-red/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-700">Registration Fee:</span>
                <span className="text-lg font-bold text-tne-red">${totalFee.toFixed(2)}</span>
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Includes team fee (${parseFloat(selectedTeam.team_fee || 0).toFixed(2)}) + uniform (${parseFloat(selectedTeam.uniform_fee || 0).toFixed(2)})
              </p>
            </div>
          )}
        </div>

        {/* Player Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-neutral-900 uppercase tracking-wide">
            Player Information
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="playerFirstName"
                className="block text-sm font-medium text-neutral-700 mb-1"
              >
                First Name *
              </label>
              <input
                type="text"
                id="playerFirstName"
                name="playerFirstName"
                value={formData.playerFirstName}
                onChange={handleChange}
                required
                className="block w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-tne-red/50 focus:border-tne-red/50"
              />
            </div>
            <div>
              <label
                htmlFor="playerLastName"
                className="block text-sm font-medium text-neutral-700 mb-1"
              >
                Last Name *
              </label>
              <input
                type="text"
                id="playerLastName"
                name="playerLastName"
                value={formData.playerLastName}
                onChange={handleChange}
                required
                className="block w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-tne-red/50 focus:border-tne-red/50"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="playerDob"
                className="block text-sm font-medium text-neutral-700 mb-1"
              >
                Date of Birth *
              </label>
              <input
                type="date"
                id="playerDob"
                name="playerDob"
                value={formData.playerDob}
                onChange={handleChange}
                required
                className="block w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-tne-red/50 focus:border-tne-red/50"
              />
            </div>
            <div>
              <label
                htmlFor="playerGrade"
                className="block text-sm font-medium text-neutral-700 mb-1"
              >
                Current Grade *
              </label>
              <select
                id="playerGrade"
                name="playerGrade"
                value={formData.playerGrade}
                onChange={handleChange}
                required
                className="block w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-tne-red/50 focus:border-tne-red/50"
              >
                {gradeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
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
                  required
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
                  required
                  className="w-4 h-4 text-tne-red border-neutral-300 focus:ring-tne-red/50"
                />
                <span className="ml-2 text-sm text-neutral-700">Female</span>
              </label>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="jerseySize"
                className="block text-sm font-medium text-neutral-700 mb-1"
              >
                Jersey Size *
              </label>
              <select
                id="jerseySize"
                name="jerseySize"
                value={formData.jerseySize}
                onChange={handleChange}
                required
                className="block w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-tne-red/50 focus:border-tne-red/50"
              >
                {jerseySizeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="position"
                className="block text-sm font-medium text-neutral-700 mb-1"
              >
                Position Preference
              </label>
              <select
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="block w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-tne-red/50 focus:border-tne-red/50"
              >
                {positionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="medicalNotes"
              className="block text-sm font-medium text-neutral-700 mb-1"
            >
              Medical Notes / Allergies
            </label>
            <textarea
              id="medicalNotes"
              name="medicalNotes"
              value={formData.medicalNotes}
              onChange={handleChange}
              rows={2}
              className="block w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-tne-red/50 focus:border-tne-red/50"
              placeholder="Any medical conditions, allergies, or special needs we should know about"
            />
          </div>
        </div>

        {/* Parent/Guardian Info */}
        <div className="space-y-4 pt-2 border-t border-neutral-200">
          <h3 className="text-sm font-medium text-neutral-900 uppercase tracking-wide pt-2">
            Parent/Guardian Information
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="parentFirstName"
                className="block text-sm font-medium text-neutral-700 mb-1"
              >
                First Name *
              </label>
              <input
                type="text"
                id="parentFirstName"
                name="parentFirstName"
                value={formData.parentFirstName}
                onChange={handleChange}
                required
                className="block w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-tne-red/50 focus:border-tne-red/50"
              />
            </div>
            <div>
              <label
                htmlFor="parentLastName"
                className="block text-sm font-medium text-neutral-700 mb-1"
              >
                Last Name *
              </label>
              <input
                type="text"
                id="parentLastName"
                name="parentLastName"
                value={formData.parentLastName}
                onChange={handleChange}
                required
                className="block w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-tne-red/50 focus:border-tne-red/50"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="parentEmail"
              className="block text-sm font-medium text-neutral-700 mb-1"
            >
              Email Address *
            </label>
            <input
              type="email"
              id="parentEmail"
              name="parentEmail"
              value={formData.parentEmail}
              onChange={handleChange}
              required
              className="block w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-tne-red/50 focus:border-tne-red/50"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="parentPhone"
                className="block text-sm font-medium text-neutral-700 mb-1"
              >
                Phone Number *
              </label>
              <input
                type="tel"
                id="parentPhone"
                name="parentPhone"
                value={formData.parentPhone}
                onChange={handleChange}
                required
                className="block w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-tne-red/50 focus:border-tne-red/50"
                placeholder="(402) 555-0123"
              />
            </div>
            <div>
              <label
                htmlFor="relationship"
                className="block text-sm font-medium text-neutral-700 mb-1"
              >
                Relationship *
              </label>
              <select
                id="relationship"
                name="relationship"
                value={formData.relationship}
                onChange={handleChange}
                required
                className="block w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-tne-red/50 focus:border-tne-red/50"
              >
                <option value="">Select relationship</option>
                {relationshipOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="addressStreet"
              className="block text-sm font-medium text-neutral-700 mb-1"
            >
              Street Address *
            </label>
            <input
              type="text"
              id="addressStreet"
              name="addressStreet"
              value={formData.addressStreet}
              onChange={handleChange}
              required
              className="block w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-tne-red/50 focus:border-tne-red/50"
              placeholder="123 Main Street"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label
                htmlFor="addressCity"
                className="block text-sm font-medium text-neutral-700 mb-1"
              >
                City *
              </label>
              <input
                type="text"
                id="addressCity"
                name="addressCity"
                value={formData.addressCity}
                onChange={handleChange}
                required
                className="block w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-tne-red/50 focus:border-tne-red/50"
                placeholder="Omaha"
              />
            </div>
            <div>
              <label
                htmlFor="addressState"
                className="block text-sm font-medium text-neutral-700 mb-1"
              >
                State *
              </label>
              <select
                id="addressState"
                name="addressState"
                value={formData.addressState}
                onChange={handleChange}
                required
                className="block w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-tne-red/50 focus:border-tne-red/50"
              >
                {stateOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="addressZip"
                className="block text-sm font-medium text-neutral-700 mb-1"
              >
                ZIP Code *
              </label>
              <input
                type="text"
                id="addressZip"
                name="addressZip"
                value={formData.addressZip}
                onChange={handleChange}
                required
                pattern="[0-9]{5}"
                className="block w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-tne-red/50 focus:border-tne-red/50"
                placeholder="68114"
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="space-y-4 pt-2 border-t border-neutral-200">
          <h3 className="text-sm font-medium text-neutral-900 uppercase tracking-wide pt-2">
            Emergency Contact
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label
                htmlFor="emergencyName"
                className="block text-sm font-medium text-neutral-700 mb-1"
              >
                Name *
              </label>
              <input
                type="text"
                id="emergencyName"
                name="emergencyName"
                value={formData.emergencyName}
                onChange={handleChange}
                required
                className="block w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-tne-red/50 focus:border-tne-red/50"
              />
            </div>
            <div>
              <label
                htmlFor="emergencyPhone"
                className="block text-sm font-medium text-neutral-700 mb-1"
              >
                Phone *
              </label>
              <input
                type="tel"
                id="emergencyPhone"
                name="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={handleChange}
                required
                className="block w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-tne-red/50 focus:border-tne-red/50"
                placeholder="(402) 555-0123"
              />
            </div>
            <div>
              <label
                htmlFor="emergencyRelationship"
                className="block text-sm font-medium text-neutral-700 mb-1"
              >
                Relationship
              </label>
              <input
                type="text"
                id="emergencyRelationship"
                name="emergencyRelationship"
                value={formData.emergencyRelationship}
                onChange={handleChange}
                className="block w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-tne-red/50 focus:border-tne-red/50"
                placeholder="Grandmother, Uncle, etc."
              />
            </div>
          </div>
        </div>

        {/* Waiver */}
        <div className="space-y-4 pt-2 border-t border-neutral-200">
          <h3 className="text-sm font-medium text-neutral-900 uppercase tracking-wide pt-2">
            Waiver & Agreement
          </h3>
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-sm text-neutral-600 max-h-32 overflow-y-auto">
            <p className="mb-2">
              <strong>Liability Waiver:</strong> I hereby release TNE United Express, its coaches,
              volunteers, and affiliated organizations from any liability for injuries sustained
              during practices, games, or team activities.
            </p>
            <p className="mb-2">
              <strong>Medical Authorization:</strong> In case of emergency, I authorize TNE United
              Express staff to seek medical treatment for my child.
            </p>
            <p>
              <strong>Photo/Video Release:</strong> I grant permission for photos and videos of
              my child to be used for promotional purposes by TNE United Express.
            </p>
          </div>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              name="waiverAccepted"
              checked={formData.waiverAccepted}
              onChange={handleChange}
              required
              className="mt-0.5 w-4 h-4 text-tne-red border-neutral-300 rounded focus:ring-tne-red/50"
            />
            <span className="text-sm text-neutral-700">
              I have read and agree to the above waiver, release of liability, and photo/video
              release. I confirm that all information provided is accurate. *
            </span>
          </label>
        </div>

        {/* Payment Info */}
        {selectedTeam && (
          <div className="space-y-4 pt-2 border-t border-neutral-200">
            <h3 className="text-sm font-medium text-neutral-900 uppercase tracking-wide pt-2">
              Payment Information
            </h3>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    Total Due: ${totalFee.toFixed(2)}
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    After submitting this registration, you will be redirected to complete
                    your payment. Registration is not confirmed until payment is received.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={submitting || !formData.waiverAccepted}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-tne-red text-white font-medium hover:bg-tne-red-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                Submitting...
              </>
            ) : (
              <>
                Complete Registration
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
          <p className="mt-3 text-xs text-neutral-500">
            By registering, you agree to our terms and conditions. Payment is due to
            confirm your spot on the team.
          </p>
        </div>
      </form>
    </div>
  );
}
