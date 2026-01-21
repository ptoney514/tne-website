/**
 * EnhancedRosterTable - Table wrapper with Export/Add Manually buttons
 *
 * Displays the current roster with columns:
 * #, Player, Position, Parent Contact, Status, Actions
 */

import { useState } from 'react';
import RosterTableRow from './RosterTableRow';

export default function EnhancedRosterTable({
  roster = [],
  gradeLevel,
  onEdit,
  onUpdatePayment,
  onRemove,
  onAddManually,
  onExport,
  totalCount,
}) {
  const [showAll, setShowAll] = useState(false);

  // Show first 10 by default, or all if showAll is true
  const displayedRoster = showAll ? roster : roster.slice(0, 10);
  const hasMore = roster.length > 10;
  const displayCount = totalCount || roster.length;

  const handleExport = () => {
    // Generate CSV content
    const headers = ['Jersey #', 'First Name', 'Last Name', 'Grade', 'Position', 'Parent Name', 'Parent Phone', 'Payment Status'];
    const rows = roster.map((entry) => {
      const player = entry.player || {};
      const parent = player.primary_parent;
      return [
        entry.jersey_number || player.jersey_number || '',
        player.first_name || '',
        player.last_name || '',
        player.current_grade || '',
        entry.position || player.position || '',
        parent ? `${parent.first_name} ${parent.last_name}` : '',
        parent?.phone || '',
        entry.payment_status || '',
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    // Download the CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `roster-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onExport?.();
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between">
        <h3 className="font-semibold text-stone-900">Current Roster</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="text-sm text-stone-600 hover:text-stone-900 flex items-center gap-1.5 transition-colors"
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
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export
          </button>
          <button
            onClick={onAddManually}
            className="text-sm text-tne-red hover:text-tne-red-dark flex items-center gap-1.5 transition-colors"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Manually
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                #
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Player
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Position
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Parent Contact
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {displayedRoster.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center">
                  <div className="text-stone-400">
                    <svg
                      className="w-12 h-12 mx-auto mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <p className="text-sm">No players on this roster yet</p>
                    <p className="text-xs mt-1">
                      Use Quick Add above or click "Add Manually"
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              displayedRoster.map((entry) => (
                <RosterTableRow
                  key={entry.id}
                  entry={entry}
                  gradeLevel={gradeLevel}
                  onEdit={onEdit}
                  onUpdatePayment={onUpdatePayment}
                  onRemove={onRemove}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {roster.length > 0 && (
        <div className="px-5 py-4 border-t border-stone-100 bg-stone-50 text-sm text-stone-500">
          Showing {displayedRoster.length} of {displayCount} players
          {hasMore && !showAll && (
            <>
              {' \u2022 '}
              <button
                onClick={() => setShowAll(true)}
                className="text-tne-red hover:underline"
              >
                View all
              </button>
            </>
          )}
          {showAll && hasMore && (
            <>
              {' \u2022 '}
              <button
                onClick={() => setShowAll(false)}
                className="text-tne-red hover:underline"
              >
                Show less
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
