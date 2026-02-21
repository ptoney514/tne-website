import { useState } from 'react';
import { TIER_CONFIG, TAG_CONFIG, getTierOptions, getTagOptions } from '@/lib/tierTagConfig';

// Icons as inline SVGs
const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const LoaderIcon = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

/**
 * EditTeamTagsModal - Modal for editing a team's tier and tags
 *
 * @param {object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {function} props.onClose - Callback when modal is closed
 * @param {object} props.team - The team being edited
 * @param {function} props.onSave - Callback with { tier, tags } when saved
 * @param {boolean} [props.isSaving] - Whether save is in progress
 */
export function EditTeamTagsModal({ isOpen, onClose, team, onSave, isSaving = false }) {
  // Note: Parent should use key={team?.id} to reset state when team changes
  const [selectedTier, setSelectedTier] = useState(team?.tier || 'express');
  const [selectedTags, setSelectedTags] = useState(team?.tags || []);

  if (!isOpen || !team) return null;

  const handleTagToggle = (tagSlug) => {
    setSelectedTags((prev) =>
      prev.includes(tagSlug) ? prev.filter((t) => t !== tagSlug) : [...prev, tagSlug]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      tier: selectedTier,
      tags: selectedTags,
    });
  };

  const tierOptions = getTierOptions();
  const tagOptions = getTagOptions();

  // Team display name
  const teamDisplayName = `${team.name} - ${team.grade_level} Grade`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" data-testid="edit-tags-modal">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 animate-fadeIn"
        onClick={onClose}
        data-testid="modal-backdrop"
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 animate-slideUp">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-stone-900">Edit Team Classification</h2>
              <p className="text-sm text-stone-500">{teamDisplayName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-stone-100 rounded-lg transition-colors text-stone-500"
              aria-label="Close modal"
            >
              <XIcon />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Tier Selection */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Program Tier</label>
              <div className="space-y-2">
                {tierOptions.map((option) => {
                  const tierConfig = TIER_CONFIG[option.value];
                  const isSelected = selectedTier === option.value;

                  return (
                    <label
                      key={option.value}
                      className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors
                        ${isSelected ? `${tierConfig.borderColor} ${tierConfig.bgLight}` : 'border-stone-200 hover:bg-stone-50'}`}
                    >
                      <input
                        type="radio"
                        name="tier"
                        value={option.value}
                        checked={isSelected}
                        onChange={() => setSelectedTier(option.value)}
                        className="w-4 h-4 text-tne-maroon border-stone-300 focus:ring-tne-maroon"
                        data-testid={`tier-${option.value}`}
                      />
                      <span className={`w-3 h-3 rounded-full ${tierConfig.dotColor}`} />
                      <span className="font-medium text-stone-900">{option.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Tags Selection */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Tags (select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {tagOptions.map((option) => {
                  const tagConfig = TAG_CONFIG[option.value];
                  const isSelected = selectedTags.includes(option.value);

                  return (
                    <label
                      key={option.value}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full cursor-pointer transition-all
                        ${tagConfig.color} ${tagConfig.textColor} ${tagConfig.borderColor} border
                        ${isSelected ? 'ring-2 ring-offset-1' : 'hover:opacity-80'}`}
                      style={isSelected ? { '--tw-ring-color': tagConfig.textColor.replace('text-', '') } : {}}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleTagToggle(option.value)}
                        className="sr-only"
                        data-testid={`tag-${option.value}`}
                      />
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${tagConfig.textColor.replace('text-', 'bg-')}`}
                      />
                      {option.fullName}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-tne-maroon hover:bg-tne-maroon/90 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving && <LoaderIcon />}
                Save
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.15s ease; }
        .animate-slideUp { animation: slideUp 0.2s ease; }
      `}</style>
    </div>
  );
}

export default EditTeamTagsModal;
