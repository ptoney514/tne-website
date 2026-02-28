/**
 * QuickAddPlayersCard - Card with textarea for bulk player entry
 *
 * Allows pasting names, jersey numbers, or full roster data
 * with smart parsing to extract player information
 */

export default function QuickAddPlayersCard({
  value,
  onChange,
  onParse,
  disabled = false,
}) {
  const hasContent = value && value.trim().length > 0;

  return (
    <div className="bg-white rounded-[14px] border-[1.5px] border-admin-card-border shadow-sm mb-8 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#F2F2F0] flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-tne-maroon to-tne-red flex items-center justify-center">
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
            />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-admin-text">Quick Add Players</h3>
          <p className="text-xs text-admin-text-secondary">
            Paste names, jersey numbers, or full roster &mdash; I'll figure it out
          </p>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-5">
        <div
          className={`
            border-[1.5px] border-admin-card-border rounded-[12px] transition-all
            focus-within:border-admin-red/40 focus-within:ring-2 focus-within:ring-admin-red/10
          `}
        >
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            rows={3}
            placeholder="e.g. Marcus Johnson #23, Tyler Smith, Jaylen Williams #11 (PG)..."
            className="w-full px-4 py-3 text-sm resize-none focus:outline-none rounded-t-[12px] disabled:bg-stone-50 disabled:cursor-not-allowed"
          />
          <div className="px-4 py-3 bg-admin-content-bg border-t border-[#F2F2F0] flex items-center justify-between rounded-b-[12px]">
            <div className="flex items-center gap-4 text-xs text-admin-text-secondary">
              <span className="flex items-center gap-1">
                <svg
                  className="w-3.5 h-3.5"
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
                Supports: names, jersey #s, positions, grades
              </span>
            </div>
            <button
              onClick={onParse}
              disabled={disabled || !hasContent}
              className={`
                px-4 py-2 text-sm font-medium rounded-lg
                flex items-center gap-2 transition-colors
                ${
                  hasContent && !disabled
                    ? 'bg-admin-red text-white hover:opacity-85'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }
              `}
            >
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              Parse &amp; Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
