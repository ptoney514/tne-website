/**
 * RosterTableRow - Single row in the enhanced roster table
 *
 * Shows jersey badge, player name/grade, position, parent contact, status, actions
 */

import { useState } from 'react';
import JerseyBadge from './JerseyBadge';
import { getPositionName } from '../../utils/playerParser';

const STATUS_STYLES = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  partial: 'bg-blue-100 text-blue-700',
  waived: 'bg-stone-100 text-stone-600',
};

export default function RosterTableRow({
  entry,
  gradeLevel,
  onUpdatePayment,
  onRemove,
}) {
  const [showMenu, setShowMenu] = useState(false);

  const player = entry.player || {};
  const parent = player.primary_parent;

  const jerseyNumber = entry.jersey_number || player.jersey_number;
  const position = entry.position || player.position;
  const statusLabel =
    entry.payment_status?.charAt(0).toUpperCase() +
    entry.payment_status?.slice(1);

  return (
    <tr className="hover:bg-stone-50 transition-colors">
      {/* Jersey Number */}
      <td className="px-5 py-4">
        <JerseyBadge number={jerseyNumber} gradeLevel={gradeLevel} />
      </td>

      {/* Player Name & Grade */}
      <td className="px-5 py-4">
        <div className="font-medium text-stone-900">
          {player.first_name} {player.last_name}
        </div>
        <div className="text-xs text-stone-500">{player.current_grade} Grade</div>
      </td>

      {/* Position */}
      <td className="px-5 py-4 text-sm text-stone-600">
        {position ? getPositionName(position) : '-'}
      </td>

      {/* Parent Contact */}
      <td className="px-5 py-4">
        {parent ? (
          <>
            <div className="text-sm text-stone-900">
              {parent.first_name} {parent.last_name}
            </div>
            <div className="text-xs text-stone-500">{parent.phone || 'No phone'}</div>
          </>
        ) : (
          <span className="text-sm text-stone-400">No parent linked</span>
        )}
      </td>

      {/* Status Badge */}
      <td className="px-5 py-4">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[entry.payment_status] || STATUS_STYLES.pending}`}
        >
          {statusLabel}
        </span>
      </td>

      {/* Actions Menu */}
      <td className="px-5 py-4 text-right relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-stone-200 py-1 z-20">
              <button
                onClick={() => {
                  setShowMenu(false);
                  onUpdatePayment?.(entry);
                }}
                className="w-full px-4 py-2 text-left text-sm text-stone-700 hover:bg-stone-100 flex items-center gap-2"
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
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Update Payment
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  onRemove?.(entry);
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Remove from Team
              </button>
            </div>
          </>
        )}
      </td>
    </tr>
  );
}
