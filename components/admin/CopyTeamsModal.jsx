import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { X, Loader2, Copy, AlertTriangle } from 'lucide-react';

export default function CopyTeamsModal({ isOpen, targetSeason, seasons, onClose, onSuccess }) {
  const [sourceSeasonId, setSourceSeasonId] = useState('');
  const [sourceTeams, setSourceTeams] = useState([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [copying, setCopying] = useState(false);
  const [error, setError] = useState(null);

  // Filter out target season from source options
  const sourceOptions = (seasons || []).filter(
    (s) => s.id !== targetSeason?.id
  );

  // Load preview when source changes
  useEffect(() => {
    if (!sourceSeasonId) {
      setSourceTeams([]);
      return;
    }

    let cancelled = false;
    setLoadingPreview(true);
    setError(null);

    api
      .get(`/admin/teams?seasonId=${sourceSeasonId}`)
      .then((data) => {
        if (!cancelled) setSourceTeams(data || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoadingPreview(false);
      });

    return () => {
      cancelled = true;
    };
  }, [sourceSeasonId]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSourceSeasonId('');
      setSourceTeams([]);
      setError(null);
      setCopying(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    if (!sourceSeasonId || !targetSeason?.id) return;

    setCopying(true);
    setError(null);

    try {
      const result = await api.post('/admin/seasons/copy-teams', {
        sourceSeasonId,
        targetSeasonId: targetSeason.id,
      });
      onSuccess?.(result);
    } catch (err) {
      setError(err.message || 'Failed to copy teams');
      setCopying(false);
    }
  };

  const sourceName = sourceOptions.find((s) => s.id === sourceSeasonId)?.name;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-[14px] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-admin-card-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50">
              <Copy className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-admin-text">Copy Teams</h2>
              <p className="text-xs text-admin-text-secondary">
                to {targetSeason?.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-stone-100 rounded-lg transition-colors text-admin-text-secondary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Source season selector */}
          <div>
            <label className="block text-sm font-medium text-admin-text mb-1.5">
              Copy teams from
            </label>
            <select
              value={sourceSeasonId}
              onChange={(e) => setSourceSeasonId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-admin-card-border text-admin-text focus:outline-none focus:ring-2 focus:ring-admin-red/20 focus:border-admin-red/40"
            >
              <option value="">Select a season...</option>
              {sourceOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Preview */}
          {loadingPreview ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-admin-text-muted animate-spin" />
            </div>
          ) : sourceTeams.length > 0 ? (
            <div>
              <p className="text-sm font-medium text-admin-text mb-2">
                {sourceTeams.length} team{sourceTeams.length !== 1 ? 's' : ''} will be copied:
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {sourceTeams.map((team) => (
                  <div
                    key={team.id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-admin-content-bg border border-[#F2F2F0]"
                  >
                    <div>
                      <p className="text-sm font-medium text-admin-text">{team.name}</p>
                      <p className="text-xs text-admin-text-secondary">
                        {team.grade_level} &middot; {team.gender}
                        {team.head_coach && ` \u00b7 Coach ${team.head_coach.first_name} ${team.head_coach.last_name}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : sourceSeasonId ? (
            <p className="text-sm text-stone-500 py-4 text-center">
              No teams found in this season.
            </p>
          ) : null}

          {/* Info note */}
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800">
              Only team structures and coach assignments are copied. Player rosters are not included.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-admin-card-border text-admin-text hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCopy}
              disabled={!sourceSeasonId || sourceTeams.length === 0 || copying}
              className="px-4 py-2 rounded-lg bg-admin-red hover:opacity-85 text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {copying && <Loader2 className="w-4 h-4 animate-spin" />}
              Copy {sourceTeams.length > 0 ? `${sourceTeams.length} Teams` : 'Teams'}
              {sourceName && ` from ${sourceName}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
