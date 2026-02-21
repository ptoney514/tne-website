import { useState, useEffect } from 'react';
import { useSeason } from '@/contexts/SeasonContext';
import { api } from '@/lib/api-client';
import {
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  Eye,
} from 'lucide-react';

export default function AdminRegistrationSettings() {
  const { seasons, selectedSeason, loading: seasonsLoading, refetch } = useSeason();

  // Form state
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [registrationLabel, setRegistrationLabel] = useState('');
  const [selectedSeasonId, setSelectedSeasonId] = useState(null);

  // UI state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Initialize form when season loads
  useEffect(() => {
    if (selectedSeason) {
      setSelectedSeasonId(selectedSeason.id);
      setRegistrationOpen(selectedSeason.registration_open || false);
      setRegistrationLabel(selectedSeason.registration_label || '');
    }
  }, [selectedSeason]);

  // Update form when switching seasons
  const handleSeasonChange = (seasonId) => {
    const season = seasons.find((s) => s.id === seasonId);
    if (season) {
      setSelectedSeasonId(season.id);
      setRegistrationOpen(season.registration_open || false);
      setRegistrationLabel(season.registration_label || '');
    }
  };

  const handleSave = async () => {
    if (!selectedSeasonId) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await api.patch(`/admin/seasons?id=${selectedSeasonId}`, {
        registrationOpen: registrationOpen,
        registrationLabel: registrationLabel || null,
      });

      setSuccess(true);
      refetch(); // Refresh season data

      // Clear success after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving registration settings:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const currentSeason = seasons.find((s) => s.id === selectedSeasonId);

  if (seasonsLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-stone-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Registration Settings</h1>
            <p className="text-sm text-stone-500 mt-1">
              Control registration status and display label on the homepage
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || !selectedSeasonId}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-tne-red hover:bg-tne-red-dark disabled:bg-stone-300 text-white font-medium transition-colors"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-stone-50 p-6">
        {/* Status Messages */}
        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            Settings saved successfully!
          </div>
        )}

        <div className="max-w-2xl space-y-6">
          {/* Season Selector */}
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <h2 className="text-lg font-semibold text-stone-900 mb-4">Season</h2>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Select Season to Configure
              </label>
              <select
                value={selectedSeasonId || ''}
                onChange={(e) => handleSeasonChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
              >
                <option value="">Select a season...</option>
                {seasons.map((season) => (
                  <option key={season.id} value={season.id}>
                    {season.name} {season.is_active && '(Active)'}
                  </option>
                ))}
              </select>
              {seasons.length === 0 && (
                <p className="text-sm text-stone-500 mt-2">
                  No seasons found. Create a season first.
                </p>
              )}
            </div>
          </div>

          {/* Registration Toggle */}
          {selectedSeasonId && (
            <div className="bg-white rounded-xl border border-stone-200 p-6">
              <h2 className="text-lg font-semibold text-stone-900 mb-4">
                Registration Status
              </h2>

              <div className="space-y-6">
                {/* Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-stone-900">Registration Open</p>
                    <p className="text-sm text-stone-500">
                      When enabled, the Register button and status pill will appear on the homepage
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRegistrationOpen(!registrationOpen)}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                      registrationOpen ? 'bg-green-500' : 'bg-stone-300'
                    }`}
                  >
                    {registrationOpen ? (
                      <ToggleRight className="absolute right-1 w-6 h-6 text-white" />
                    ) : (
                      <ToggleLeft className="absolute left-1 w-6 h-6 text-white" />
                    )}
                  </button>
                </div>

                {/* Label Input */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Registration Label
                  </label>
                  <input
                    type="text"
                    value={registrationLabel}
                    onChange={(e) => setRegistrationLabel(e.target.value)}
                    placeholder="e.g., Fall/Winter '25-26"
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
                  />
                  <p className="text-sm text-stone-500 mt-2">
                    This text appears in the registration status pill on the homepage
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Preview */}
          {selectedSeasonId && (
            <div className="bg-white rounded-xl border border-stone-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-5 h-5 text-stone-500" />
                <h2 className="text-lg font-semibold text-stone-900">Preview</h2>
              </div>

              <div className="bg-stone-900 rounded-lg p-6">
                <p className="text-xs text-stone-400 uppercase tracking-wider mb-3">
                  Homepage Display
                </p>

                {registrationOpen ? (
                  <div className="space-y-3">
                    {/* Status Pill Preview */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-tne-red/30 bg-tne-red/10">
                      <div className="w-1.5 h-1.5 rounded-full bg-tne-red animate-pulse" />
                      <span className="text-[10px] font-mono font-medium text-red-300 uppercase tracking-widest">
                        {registrationLabel || currentSeason?.name || 'Season'} Reg Open
                      </span>
                    </div>

                    {/* Button Preview */}
                    <div>
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-tne-red text-white text-sm font-medium rounded-lg">
                        Register For Tryouts
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-stone-600 text-stone-400 text-sm font-medium rounded-lg cursor-not-allowed">
                      Registration Coming Soon
                    </span>
                    <p className="text-xs text-stone-500 mt-2">
                      The registration pill will be hidden
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
