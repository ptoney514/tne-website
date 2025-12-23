/**
 * EditPlayerModal - Modal for editing player and roster information
 *
 * Allows editing: jersey number, position, parent contact info
 */

import { useState, useEffect } from 'react';
import { getGradeColor } from '../../utils/gradeColors';

const POSITIONS = [
  { value: '', label: 'No Position' },
  { value: 'PG', label: 'Point Guard (PG)' },
  { value: 'SG', label: 'Shooting Guard (SG)' },
  { value: 'SF', label: 'Small Forward (SF)' },
  { value: 'PF', label: 'Power Forward (PF)' },
  { value: 'C', label: 'Center (C)' },
];

export default function EditPlayerModal({
  isOpen,
  onClose,
  entry,
  gradeLevel,
  onSave,
  isSaving = false,
}) {
  const [formData, setFormData] = useState({
    jerseyNumber: '',
    position: '',
    parentFirstName: '',
    parentLastName: '',
    parentPhone: '',
    parentEmail: '',
  });

  // Initialize form when entry changes
  useEffect(() => {
    if (entry) {
      const player = entry.player || {};
      const parent = player.primary_parent;

      setFormData({
        jerseyNumber: entry.jersey_number || player.jersey_number || '',
        position: entry.position || player.position || '',
        parentFirstName: parent?.first_name || '',
        parentLastName: parent?.last_name || '',
        parentPhone: parent?.phone || '',
        parentEmail: parent?.email || '',
      });
    }
  }, [entry]);

  if (!isOpen || !entry) return null;

  const player = entry.player || {};
  const gradeColor = getGradeColor(gradeLevel);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      rosterId: entry.id,
      playerId: player.id,
      parentId: player.primary_parent?.id,
      rosterData: {
        jersey_number: formData.jerseyNumber || null,
        position: formData.position || null,
      },
      parentData: {
        first_name: formData.parentFirstName,
        last_name: formData.parentLastName,
        phone: formData.parentPhone,
        email: formData.parentEmail,
      },
    });
  };

  const hasParentChanges =
    formData.parentFirstName ||
    formData.parentLastName ||
    formData.parentPhone ||
    formData.parentEmail;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={!isSaving ? onClose : undefined}
      />

      {/* Modal */}
      <div className="absolute inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl ${gradeColor.bg} flex items-center justify-center`}
          >
            <span className="text-white font-bold text-lg">
              {formData.jerseyNumber || '#'}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900">
              Edit {player.first_name} {player.last_name}
            </h2>
            <p className="text-sm text-stone-500">{gradeLevel} Grade</p>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {/* Player Details Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
              <svg
                className="w-4 h-4 text-stone-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Player Details
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Jersey Number */}
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1.5">
                  Jersey Number
                </label>
                <input
                  type="text"
                  value={formData.jerseyNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, jerseyNumber: e.target.value })
                  }
                  placeholder="e.g. 23"
                  className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
                />
              </div>

              {/* Position */}
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1.5">
                  Position
                </label>
                <select
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                  className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red bg-white"
                >
                  {POSITIONS.map((pos) => (
                    <option key={pos.value} value={pos.value}>
                      {pos.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Parent/Guardian Section */}
          <div>
            <h3 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
              <svg
                className="w-4 h-4 text-stone-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Parent/Guardian Contact
            </h3>

            <div className="space-y-4">
              {/* Parent Name Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.parentFirstName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        parentFirstName: e.target.value,
                      })
                    }
                    placeholder="Parent first name"
                    className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.parentLastName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        parentLastName: e.target.value,
                      })
                    }
                    placeholder="Parent last name"
                    className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
                  />
                </div>
              </div>

              {/* Contact Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1.5">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.parentPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, parentPhone: e.target.value })
                    }
                    placeholder="(555) 123-4567"
                    className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.parentEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, parentEmail: e.target.value })
                    }
                    placeholder="parent@email.com"
                    className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
                  />
                </div>
              </div>
            </div>

            {/* Info note */}
            {!player.primary_parent && hasParentChanges && (
              <p className="mt-3 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                A new parent record will be created and linked to this player.
              </p>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className={`
              px-5 py-2.5 text-sm font-medium rounded-lg
              flex items-center gap-2 transition-colors
              ${
                isSaving
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  : 'bg-tne-red text-white hover:bg-tne-red-dark'
              }
            `}
          >
            {isSaving ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
                Saving...
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
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
