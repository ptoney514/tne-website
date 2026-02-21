/**
 * ParsePreviewModal - Modal to preview and confirm parsed players
 *
 * Shows list of parsed players before adding to roster
 */

import { getGradeColor } from '@/utils/gradeColors';

export default function ParsePreviewModal({
  isOpen,
  onClose,
  players = [],
  teamName = '',
  gradeLevel = '',
  onConfirm,
  isLoading = false,
}) {
  if (!isOpen) return null;

  const gradeColor = getGradeColor(gradeLevel);
  const validPlayers = players.filter((p) => p.isValid !== false);

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Modal */}
      <div className="absolute inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900">Confirm New Players</h2>
            <p className="text-sm text-stone-500">
              Review parsed data before adding to roster
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Parsed Players List */}
          <div className="space-y-3">
            {players.map((player, index) => (
              <div
                key={index}
                className={`
                  flex items-center gap-4 p-4 rounded-xl border
                  ${
                    player.isValid === false
                      ? 'bg-red-50 border-red-200'
                      : 'bg-green-50 border-green-200'
                  }
                `}
              >
                {/* Jersey Badge */}
                <div
                  className={`
                    w-10 h-10 rounded-lg flex items-center justify-center font-bold
                    ${
                      player.jerseyNumber
                        ? `${gradeColor.bg} text-white`
                        : 'bg-stone-100 text-stone-400'
                    }
                  `}
                >
                  {player.jerseyNumber || '--'}
                </div>

                {/* Player Info */}
                <div className="flex-1">
                  <div className="font-medium text-stone-900">
                    {player.firstName} {player.lastName}
                  </div>
                  <div className="text-sm text-stone-500">
                    {player.jerseyNumber && `Jersey #${player.jerseyNumber}`}
                    {player.jerseyNumber && player.position && ' \u2022 '}
                    {player.position}
                    {!player.jerseyNumber && !player.position && 'No jersey number'}
                  </div>
                </div>

                {/* Status */}
                <span
                  className={`
                    text-xs font-medium
                    ${player.isValid === false ? 'text-red-600' : 'text-green-600'}
                  `}
                >
                  {player.isValid === false ? 'Invalid' : 'Ready'}
                </span>
              </div>
            ))}
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-sm text-blue-800">
                <strong>What happens next:</strong>
                <ul className="mt-1 space-y-1 text-blue-700">
                  <li>
                    &bull; Players will be added to the {gradeLevel} {teamName} roster
                  </li>
                  <li>&bull; Status set to "Pending" until registration is complete</li>
                  <li>
                    &bull; Parent contact info can be added via registration or manually
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-200 flex items-center justify-between">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-500">
              {validPlayers.length} player{validPlayers.length !== 1 ? 's' : ''} ready
            </span>
            <button
              onClick={onConfirm}
              disabled={isLoading || validPlayers.length === 0}
              className={`
                px-5 py-2.5 text-sm font-medium rounded-lg
                flex items-center gap-2 transition-colors
                ${
                  isLoading || validPlayers.length === 0
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    : 'bg-tne-red text-white hover:bg-tne-red-dark'
                }
              `}
            >
              {isLoading ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Adding...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Add to Roster
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
