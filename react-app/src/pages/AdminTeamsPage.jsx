import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeams } from '../hooks/useTeams';
import { getGradeBadgeClass, formatGradeLabel } from '../utils/gradeColors';
import TeamsNavbar from '../components/TeamsNavbar';

// Icons as inline SVGs to avoid lucide dependency issues
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

// Team Modal (light theme)
function TeamModal({ isOpen, onClose, team, seasons, coaches, onSave, isSaving }) {
  const [formData, setFormData] = useState(
    team || {
      name: '',
      grade_level: '',
      gender: 'male',
      season_id: seasons[0]?.id || '',
      head_coach_id: '',
      assistant_coach_id: '',
      practice_location: '',
      practice_days: '',
      practice_time: '',
      team_fee: '',
      uniform_fee: '',
      is_active: true,
    }
  );

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(formData);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
          <h2 className="text-lg font-semibold text-stone-900">{team ? 'Edit Team' : 'Create Team'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-stone-100 rounded-lg transition-colors text-stone-500">
            <XIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Team Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
                placeholder="e.g., Express United"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Grade Level *</label>
              <select
                required
                value={formData.grade_level}
                onChange={(e) => handleChange('grade_level', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
              >
                <option value="">Select Grade</option>
                <option value="3rd">3rd Grade</option>
                <option value="4th">4th Grade</option>
                <option value="5th">5th Grade</option>
                <option value="6th">6th Grade</option>
                <option value="7th">7th Grade</option>
                <option value="8th">8th Grade</option>
                <option value="HS">High School</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Gender *</label>
              <select
                required
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
              >
                <option value="male">Boys</option>
                <option value="female">Girls</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Season *</label>
              <select
                required
                value={formData.season_id}
                onChange={(e) => handleChange('season_id', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
              >
                <option value="">Select Season</option>
                {seasons.map((season) => (
                  <option key={season.id} value={season.id}>
                    {season.name} {season.is_active && '(Active)'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Head Coach</label>
              <select
                value={formData.head_coach_id || ''}
                onChange={(e) => handleChange('head_coach_id', e.target.value || null)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
              >
                <option value="">Select Coach</option>
                {coaches.map((coach) => (
                  <option key={coach.id} value={coach.id}>
                    {coach.first_name} {coach.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Assistant Coach</label>
              <select
                value={formData.assistant_coach_id || ''}
                onChange={(e) => handleChange('assistant_coach_id', e.target.value || null)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
              >
                <option value="">Select Coach</option>
                {coaches.map((coach) => (
                  <option key={coach.id} value={coach.id}>
                    {coach.first_name} {coach.last_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-t border-stone-200 pt-4 mt-4">
            <h3 className="text-sm font-medium text-stone-700 mb-3">Practice Schedule</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.practice_location || ''}
                  onChange={(e) => handleChange('practice_location', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
                  placeholder="e.g., Northwest HS"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Days</label>
                <input
                  type="text"
                  value={formData.practice_days || ''}
                  onChange={(e) => handleChange('practice_days', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
                  placeholder="e.g., Mon, Wed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Time</label>
                <input
                  type="text"
                  value={formData.practice_time || ''}
                  onChange={(e) => handleChange('practice_time', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
                  placeholder="e.g., 6:00 PM"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-stone-200 pt-4 mt-4">
            <h3 className="text-sm font-medium text-stone-700 mb-3">Fees</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Team Fee ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.team_fee || ''}
                  onChange={(e) => handleChange('team_fee', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
                  placeholder="600.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Uniform Fee ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.uniform_fee || ''}
                  onChange={(e) => handleChange('uniform_fee', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
                  placeholder="75.00"
                />
              </div>
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
              Team is active
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
              {team ? 'Update Team' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Team Card with colorful grade header
function TeamCard({ team, onEdit, onDelete, onManageRoster }) {
  const coachName = team.head_coach
    ? `Coach ${team.head_coach.last_name || team.head_coach.first_name}`
    : null;

  const practicesPerWeek = team.practice_days
    ? team.practice_days.split(',').length
    : 0;

  const scheduleText = team.practice_days && team.practice_location
    ? `${team.practice_days} @ ${team.practice_location}`
    : team.practice_days
    ? team.practice_days
    : null;

  return (
    <div
      className="rounded-2xl bg-white border border-stone-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
      onClick={() => onManageRoster(team)}
    >
      {/* Colored Grade Header */}
      <div className={`px-4 py-3 ${getGradeBadgeClass(team.grade_level)}`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider text-white/90">
            {formatGradeLabel(team.grade_level)}
          </span>
          {!team.head_coach && (
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/20 text-white">
              NEEDS COACH
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-stone-900">{team.name}</h3>
        <p className="text-sm text-stone-500 mt-0.5">
          {coachName || <span className="text-amber-600">Coach TBD</span>}
          {' \u2022 '}
          {team.gender === 'male' ? 'Boys' : 'Girls'}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-3 text-sm text-stone-600">
          <span className="flex items-center gap-1.5">
            <UsersIcon />
            {team.player_count} players
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarIcon />
            {practicesPerWeek} practices
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-stone-100 flex items-center justify-between">
        {scheduleText ? (
          <span className="text-xs text-stone-500 truncate max-w-[180px]">{scheduleText}</span>
        ) : (
          <span className="text-xs text-amber-600">Schedule not set</span>
        )}
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(team);
            }}
            className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors text-stone-400 hover:text-stone-600"
            title="Edit team"
          >
            <EditIcon />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(team);
            }}
            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-stone-400 hover:text-red-500"
            title="Delete team"
          >
            <TrashIcon />
          </button>
          <ChevronRightIcon />
        </div>
      </div>
    </div>
  );
}

// Create Team Placeholder Card
function CreateTeamCard({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl border-2 border-dashed border-stone-300 bg-white/50 p-8 flex flex-col items-center justify-center gap-3 hover:border-stone-400 hover:bg-white transition-all min-h-[200px]"
    >
      <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center">
        <PlusIcon />
      </div>
      <span className="text-sm font-medium text-stone-600">Create New Team</span>
    </button>
  );
}

export default function AdminTeamsPage() {
  const { teams, seasons, coaches, loading, error, createTeam, updateTeam, deleteTeam } = useTeams();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleCreate = () => {
    setEditingTeam(null);
    setModalOpen(true);
  };

  const handleEdit = (team) => {
    setEditingTeam(team);
    setModalOpen(true);
  };

  const handleSave = async (formData) => {
    setIsSaving(true);
    try {
      const cleanData = { ...formData };
      if (!cleanData.head_coach_id) cleanData.head_coach_id = null;
      if (!cleanData.assistant_coach_id) cleanData.assistant_coach_id = null;
      if (!cleanData.team_fee) cleanData.team_fee = null;
      if (!cleanData.uniform_fee) cleanData.uniform_fee = null;

      if (editingTeam) {
        await updateTeam(editingTeam.id, cleanData);
      } else {
        await createTeam(cleanData);
      }
      setModalOpen(false);
      setEditingTeam(null);
    } catch (err) {
      console.error('Error saving team:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (team) => {
    if (team.player_count > 0) {
      alert(`Cannot delete team with ${team.player_count} players. Remove all players first.`);
      return;
    }
    setDeleteConfirm(team);
  };

  const confirmDelete = async () => {
    try {
      await deleteTeam(deleteConfirm.id);
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting team:', err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleManageRoster = (team) => {
    navigate(`/admin/teams/${team.id}/roster`);
  };

  return (
    <div className="bg-stone-100 text-stone-900 antialiased min-h-screen">
      <TeamsNavbar />

      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-stone-900">Active Teams</h1>
              <p className="text-stone-500 mt-1">
                Select a team to manage rosters and schedules
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-tne-red hover:bg-tne-red-dark text-white font-medium transition-colors"
            >
              <PlusIcon />
              New Team
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Error State */}
        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            Failed to load teams: {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-white border border-stone-200 h-48 animate-pulse" />
            ))}
          </div>
        ) : teams.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-stone-100 flex items-center justify-center">
              <UsersIcon />
            </div>
            <h3 className="text-lg font-medium text-stone-900 mb-2">No teams yet</h3>
            <p className="text-stone-500 mb-6">Create your first team to get started</p>
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-tne-red hover:bg-tne-red-dark text-white font-medium transition-colors"
            >
              <PlusIcon />
              Create Team
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {teams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onManageRoster={handleManageRoster}
              />
            ))}
            <CreateTeamCard onClick={handleCreate} />
          </div>
        )}
      </main>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <TeamModal
          key={editingTeam?.id || 'new'}
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingTeam(null);
          }}
          team={editingTeam}
          seasons={seasons}
          coaches={coaches}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-stone-900 mb-2">Delete Team?</h3>
            <p className="text-stone-600 mb-6">
              Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.
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
