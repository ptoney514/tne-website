import { useState, useMemo } from 'react';
import { usePracticeSchedulesAdmin } from '../hooks/usePracticeSchedulesAdmin';
import { formatPracticeTime } from '../hooks/usePracticeSchedule';
import AdminNavbar from '../components/AdminNavbar';

// Icons as inline SVGs
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const MapPinIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const PencilIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

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

const UsersIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Practice Schedule Modal
function PracticeModal({ isOpen, onClose, practice, teams, onSave, isSaving }) {
  const [formData, setFormData] = useState(
    practice
      ? {
          day_of_week: practice.day_of_week,
          start_time: practice.start_time,
          end_time: practice.end_time,
          location: practice.location,
          address: practice.address || '',
          notes: practice.notes || '',
          is_active: practice.is_active,
        }
      : {
          day_of_week: 'Monday',
          start_time: '18:00',
          end_time: '19:30',
          location: '',
          address: '',
          notes: '',
          is_active: true,
        }
  );

  const [selectedTeamIds, setSelectedTeamIds] = useState(
    practice?.practice_session_teams?.map((pst) => pst.team.id) || []
  );

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(formData, selectedTeamIds);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleTeam = (teamId) => {
    setSelectedTeamIds((prev) =>
      prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
          <h2 className="text-lg font-semibold text-stone-900">
            {practice ? 'Edit Practice Session' : 'Add Practice Session'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-stone-100 rounded-lg transition-colors text-stone-500">
            <XIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Day of Week *</label>
              <select
                required
                value={formData.day_of_week}
                onChange={(e) => handleChange('day_of_week', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
              >
                {DAYS_OF_WEEK.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Location *</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
                placeholder="e.g., Monroe MS"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Start Time *</label>
              <input
                type="time"
                required
                value={formData.start_time}
                onChange={(e) => handleChange('start_time', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">End Time *</label>
              <input
                type="time"
                required
                value={formData.end_time}
                onChange={(e) => handleChange('end_time', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Address (optional)</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
              placeholder="Full address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Notes (optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
              placeholder="Additional notes..."
            />
          </div>

          <div className="border-t border-stone-200 pt-4">
            <label className="block text-sm font-medium text-stone-700 mb-3">
              Assign Teams (select all that practice at this time)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {teams.map((team) => (
                <label
                  key={team.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedTeamIds.includes(team.id)
                      ? 'border-tne-red bg-tne-red/5'
                      : 'border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedTeamIds.includes(team.id)}
                    onChange={() => toggleTeam(team.id)}
                    className="rounded border-stone-300 text-tne-red focus:ring-tne-red"
                  />
                  <div>
                    <div className="font-medium text-stone-900 text-sm">{team.name}</div>
                    <div className="text-xs text-stone-500">{team.grade_level}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => handleChange('is_active', e.target.checked)}
              className="rounded border-stone-300"
            />
            <label htmlFor="is_active" className="text-sm text-stone-700">
              Practice is active
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 rounded-lg bg-tne-red hover:bg-tne-red-dark text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving && <LoaderIcon />}
              {practice ? 'Update' : 'Add Practice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Practice Card Component
function PracticeCard({ practice, onEdit, onDelete }) {
  const startTime = formatPracticeTime(practice.start_time);
  const endTime = formatPracticeTime(practice.end_time);
  const teams = practice.practice_session_teams || [];

  return (
    <div className={`bg-white rounded-xl border border-stone-200 p-4 ${!practice.is_active ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-stone-900">{practice.day_of_week}</span>
            {!practice.is_active && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-500">Inactive</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-stone-600">
            <ClockIcon />
            <span>{startTime} - {endTime}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(practice)}
            className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-stone-600 transition-colors"
          >
            <PencilIcon />
          </button>
          <button
            onClick={() => onDelete(practice)}
            className="p-1.5 hover:bg-red-50 rounded-lg text-stone-400 hover:text-red-600 transition-colors"
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-sm text-stone-600 mb-3">
        <MapPinIcon />
        <span>{practice.location}</span>
      </div>

      {practice.notes && (
        <p className="text-xs text-stone-500 mb-3 italic">{practice.notes}</p>
      )}

      {teams.length > 0 && (
        <div className="pt-3 border-t border-stone-100">
          <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-2">
            <UsersIcon />
            <span>{teams.length} team{teams.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {teams.map((pst) => (
              <span
                key={pst.id}
                className="text-xs px-2 py-1 rounded-full bg-stone-100 text-stone-600"
              >
                {pst.team.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPracticeSchedulePage() {
  const { practices, teams, loading, error, createPractice, updatePractice, deletePractice } = usePracticeSchedulesAdmin();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPractice, setEditingPractice] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Group practices by day
  const practicesByDay = useMemo(() => {
    const grouped = {};
    DAYS_OF_WEEK.forEach((day) => {
      grouped[day] = practices.filter((p) => p.day_of_week === day);
    });
    return grouped;
  }, [practices]);

  const handleCreate = () => {
    setEditingPractice(null);
    setModalOpen(true);
  };

  const handleEdit = (practice) => {
    setEditingPractice(practice);
    setModalOpen(true);
  };

  const handleSave = async (formData, teamIds) => {
    setIsSaving(true);
    try {
      if (editingPractice) {
        await updatePractice(editingPractice.id, formData, teamIds);
      } else {
        await createPractice(formData, teamIds);
      }
      setModalOpen(false);
      setEditingPractice(null);
    } catch (err) {
      console.error('Error saving practice:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (practice) => {
    setDeleteConfirm(practice);
  };

  const confirmDelete = async () => {
    try {
      await deletePractice(deleteConfirm.id);
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting practice:', err);
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="bg-stone-100 text-stone-900 antialiased min-h-screen">
      <AdminNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Practice Schedule</h1>
            <p className="text-sm text-stone-500 mt-1">Manage practice sessions and team assignments</p>
          </div>
          <button
            onClick={handleCreate}
            className="px-5 py-2.5 bg-tne-red text-white text-sm font-semibold rounded-xl hover:bg-tne-red-dark transition-colors flex items-center justify-center gap-2 shadow-lg shadow-tne-red/20"
          >
            <PlusIcon />
            Add Practice
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            Failed to load practice schedules: {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8 text-center">
            <LoaderIcon />
            <p className="text-stone-500 mt-2">Loading practice schedules...</p>
          </div>
        ) : practices.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-stone-100 flex items-center justify-center">
              <ClockIcon />
            </div>
            <h3 className="text-lg font-medium text-stone-900 mb-2">No practice sessions yet</h3>
            <p className="text-stone-500 mb-6">Add your first practice session to get started</p>
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-tne-red hover:bg-tne-red-dark text-white font-medium transition-colors"
            >
              <PlusIcon />
              Add Practice
            </button>
          </div>
        ) : (
          /* Weekly Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {DAYS_OF_WEEK.map((day) => {
              const dayPractices = practicesByDay[day];
              if (dayPractices.length === 0) return null;

              return (
                <div key={day}>
                  <h3 className="text-sm font-semibold text-stone-600 uppercase tracking-wider mb-3">{day}</h3>
                  <div className="space-y-3">
                    {dayPractices.map((practice) => (
                      <PracticeCard
                        key={practice.id}
                        practice={practice}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Create/Edit Modal */}
      <PracticeModal
        key={editingPractice?.id || 'new'}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingPractice(null);
        }}
        practice={editingPractice}
        teams={teams}
        onSave={handleSave}
        isSaving={isSaving}
      />

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-stone-900 mb-2">Delete Practice Session?</h3>
            <p className="text-stone-600 mb-6">
              Are you sure you want to delete this {deleteConfirm.day_of_week} practice at{' '}
              <strong>{deleteConfirm.location}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
