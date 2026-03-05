/**
 * RosterTableRow - Single row in the enhanced roster table
 *
 * Shows jersey badge, player name/grade, position, parent contact, status, actions
 */

import { useState, useRef } from 'react';
import JerseyBadge from './JerseyBadge';
import { getPositionName } from '@/utils/playerParser';

const STATUS_STYLES = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  partial: 'bg-blue-100 text-blue-700',
  waived: 'bg-stone-100 text-stone-600',
};

// Calculate if dropdown should open upward based on button position
function shouldOpenUpward(buttonElement) {
  if (!buttonElement) return false;
  const rect = buttonElement.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom;
  // Menu is ~140px tall. Only open upward if truly at the bottom (< 160px space)
  // AND the button is in the lower half of the viewport
  const isInLowerHalf = rect.top > window.innerHeight / 2;
  return spaceBelow < 160 && isInLowerHalf;
}

export default function RosterTableRow({
  entry,
  teamId,
  gradeLevel,
  onEdit,
  onUpdatePayment,
  onRemove,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const buttonRef = useRef(null);

  // Handle menu toggle - calculate direction on open
  const handleToggleMenu = () => {
    if (!showMenu) {
      setOpenUpward(shouldOpenUpward(buttonRef.current));
    }
    setShowMenu(!showMenu);
  };

  const player = entry.player || {};
  const parent = player.primary_parent || entry.primary_parent;

  // Resolve roster-specific data from team_assignments if available
  const rosterAssignment = teamId && entry.team_assignments
    ? entry.team_assignments.find(ta => ta.team_id === teamId)
    : null;
  const rosterNotes = rosterAssignment?.notes || entry.notes;

  const jerseyNumber = rosterAssignment?.jersey_number || entry.jersey_number || player.jersey_number;
  const position = entry.position || player.position;
  const paymentStatus = rosterAssignment?.payment_status || entry.payment_status || 'pending';
  const statusLabel = paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1);

  return (
    <tr className="hover:bg-stone-50 transition-colors">
      {/* Jersey Number */}
      <td className="px-5 py-4">
        <JerseyBadge number={jerseyNumber} gradeLevel={gradeLevel} />
      </td>

      {/* Player Name & Grade */}
      <td className="px-5 py-4">
        <div className="font-medium text-admin-text">
          {player.first_name || entry.first_name} {player.last_name || entry.last_name}
          {rosterNotes && (
            <span className="ml-1.5 text-xs text-amber-600" title={rosterNotes}>*</span>
          )}
        </div>
        <div className="text-xs text-admin-text-secondary">
          {player.current_grade || entry.current_grade} Grade
          {rosterNotes && (
            <span className="ml-1 text-amber-500 truncate max-w-[180px] inline-block align-bottom" title={rosterNotes}>
              — {rosterNotes}
            </span>
          )}
        </div>
      </td>

      {/* Position */}
      <td className="px-5 py-4 text-sm text-admin-text-secondary">
        {position ? getPositionName(position) : '-'}
      </td>

      {/* Parent Contact */}
      <td className="px-5 py-4">
        {parent ? (
          <>
            <div className="text-sm text-admin-text">
              {parent.first_name} {parent.last_name}
            </div>
            <div className="text-xs text-admin-text-secondary">{parent.phone || 'No phone'}</div>
          </>
        ) : (
          <span className="text-sm text-admin-text-muted">No parent linked</span>
        )}
      </td>

      {/* Status Badge */}
      <td className="px-5 py-4">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[paymentStatus] || STATUS_STYLES.pending}`}
        >
          {statusLabel}
        </span>
      </td>

      {/* Actions Menu */}
      <td className="px-5 py-4 text-right relative">
        <button
          ref={buttonRef}
          onClick={handleToggleMenu}
          className="p-2 text-admin-text-muted hover:text-admin-text-secondary hover:bg-stone-100 rounded-lg transition-colors"
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
            <div
              className={`absolute right-0 w-48 bg-white rounded-lg shadow-lg border border-admin-card-border py-1 z-20 ${
                openUpward ? 'bottom-full mb-2' : 'top-full mt-2'
              }`}
            >
              <button
                onClick={() => {
                  setShowMenu(false);
                  onEdit?.(entry);
                }}
                className="w-full px-4 py-2 text-left text-sm text-admin-text hover:bg-stone-100 flex items-center gap-2"
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit Player
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  onUpdatePayment?.(entry);
                }}
                className="w-full px-4 py-2 text-left text-sm text-admin-text hover:bg-stone-100 flex items-center gap-2"
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
