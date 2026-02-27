import { useState } from 'react';
import { CheckCircle, AlertCircle, Send } from 'lucide-react';

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

export default function TryoutRegistrationForm({
  sessions,
  selectedSession,
  onSubmit,
  submitting,
  submitSuccess,
  submitError,
  onReset,
}) {
  const [formData, setFormData] = useState({
    sessionId: selectedSession?.id || '',
    playerFirstName: '',
    playerLastName: '',
    playerDob: '',
    playerGrade: '',
    playerGender: '',
    playerSchool: '',
    parentFirstName: '',
    parentLastName: '',
    parentEmail: '',
    parentPhone: '',
    relationship: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await onSubmit({
      ...formData,
      sessionId: formData.sessionId || selectedSession?.id || '',
    });
    if (result.success) {
      setFormData({
        sessionId: '',
        playerFirstName: '',
        playerLastName: '',
        playerDob: '',
        playerGrade: '',
        playerGender: '',
        playerSchool: '',
        parentFirstName: '',
        parentLastName: '',
        parentEmail: '',
        parentPhone: '',
        relationship: '',
      });
    }
  };

  const getSessionOptionLabel = (session) => {
    const date = session.session_date || session.date || 'TBD';
    const title =
      session.description
      || session.grade_levels
      || session.grades
      || 'Tryout Session';
    return `${title} - ${date}`;
  };

  if (submitSuccess) {
    return (
      <div className="rounded-3xl bg-white border border-neutral-300 shadow-sm overflow-hidden">
        <div className="px-5 py-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">
            Registration Complete!
          </h3>
          <p className="text-neutral-600 mb-6 max-w-sm mx-auto">
            Thank you for registering. You will receive a confirmation email
            shortly with tryout details.
          </p>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-100 text-neutral-700 font-medium hover:bg-neutral-200 transition-colors"
          >
            Register Another Player
          </button>
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
          Register for Tryouts
        </h2>
        <p className="text-sm text-neutral-600 mt-0.5">
          Complete the form below to secure your spot
        </p>
      </div>

      <form onSubmit={handleSubmit} className="px-5 py-5 space-y-5">
        {submitError && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{submitError}</p>
          </div>
        )}

        {/* Session Selection */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-neutral-900 uppercase tracking-wide">
            Tryout Session
          </h3>
          <div>
            <label
              htmlFor="sessionId"
              className="block text-sm font-medium text-neutral-700 mb-1"
            >
              Select Tryout Date *
            </label>
            <select
              id="sessionId"
              name="sessionId"
              value={formData.sessionId || selectedSession?.id || ''}
              onChange={handleChange}
              required
              className="block w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-tne-red/50 focus:border-tne-red/50"
            >
              <option value="">Select a tryout date</option>
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {getSessionOptionLabel(session)}
                </option>
              ))}
            </select>
          </div>
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

          <div>
            <label
              htmlFor="playerSchool"
              className="block text-sm font-medium text-neutral-700 mb-1"
            >
              Current School
            </label>
            <input
              type="text"
              id="playerSchool"
              name="playerSchool"
              value={formData.playerSchool}
              onChange={handleChange}
              className="block w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-tne-red/50 focus:border-tne-red/50"
              placeholder="School name"
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
        </div>

        {/* Submit */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={submitting}
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
            By registering, you agree to our terms and conditions.
          </p>
        </div>
      </form>
    </div>
  );
}
