import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTeams } from '../hooks/useTeams';
import TeamsNavbar from '../components/TeamsNavbar';
import TeamsFooter from '../components/TeamsFooter';
import { Plus, Edit, Trash2, Users, ChevronLeft, X, Loader2 } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-neutral-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-xl font-bebas">{team ? 'Edit Team' : 'Create Team'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">Team Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-tne-red/50"
                placeholder="e.g., 5th Grade Boys Elite"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">Grade Level *</label>
              <select
                required
                value={formData.grade_level}
                onChange={(e) => handleChange('grade_level', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-tne-red/50"
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
              <label className="block text-sm font-medium text-white/60 mb-1">Gender *</label>
              <select
                required
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-tne-red/50"
              >
                <option value="male">Boys</option>
                <option value="female">Girls</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">Season *</label>
              <select
                required
                value={formData.season_id}
                onChange={(e) => handleChange('season_id', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-tne-red/50"
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
              <label className="block text-sm font-medium text-white/60 mb-1">Head Coach</label>
              <select
                value={formData.head_coach_id || ''}
                onChange={(e) => handleChange('head_coach_id', e.target.value || null)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-tne-red/50"
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
              <label className="block text-sm font-medium text-white/60 mb-1">Assistant Coach</label>
              <select
                value={formData.assistant_coach_id || ''}
                onChange={(e) => handleChange('assistant_coach_id', e.target.value || null)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-tne-red/50"
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

          <div className="border-t border-white/10 pt-4 mt-4">
            <h3 className="text-sm font-medium text-white/80 mb-3">Practice Schedule</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.practice_location || ''}
                  onChange={(e) => handleChange('practice_location', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-tne-red/50"
                  placeholder="e.g., TNE Training Center"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Days</label>
                <input
                  type="text"
                  value={formData.practice_days || ''}
                  onChange={(e) => handleChange('practice_days', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-tne-red/50"
                  placeholder="e.g., Mon, Wed, Fri"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Time</label>
                <input
                  type="text"
                  value={formData.practice_time || ''}
                  onChange={(e) => handleChange('practice_time', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-tne-red/50"
                  placeholder="e.g., 6:00 PM - 8:00 PM"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 mt-4">
            <h3 className="text-sm font-medium text-white/80 mb-3">Fees</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Team Fee ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.team_fee || ''}
                  onChange={(e) => handleChange('team_fee', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-tne-red/50"
                  placeholder="600.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Uniform Fee ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.uniform_fee || ''}
                  onChange={(e) => handleChange('uniform_fee', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-tne-red/50"
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
              className="rounded border-white/20"
            />
            <label htmlFor="is_active" className="text-sm text-white/80">
              Team is active
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-white/20 text-white/80 hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-tne-red hover:bg-tne-red-dark text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {team ? 'Update Team' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TeamCard({ team, onEdit, onDelete, onManageRoster }) {
  const coachName = team.head_coach
    ? `${team.head_coach.first_name} ${team.head_coach.last_name}`
    : 'No coach assigned';

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-5 hover:border-white/20 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-lg">{team.name}</h3>
          <p className="text-sm text-white/60">
            {team.grade_level} • {team.gender === 'male' ? 'Boys' : 'Girls'}
          </p>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            team.is_active
              ? 'bg-green-500/20 text-green-400'
              : 'bg-white/10 text-white/50'
          }`}
        >
          {team.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="space-y-2 text-sm text-white/70">
        <p>Coach: {coachName}</p>
        <p>Season: {team.season?.name || 'N/A'}</p>
        {team.practice_days && (
          <p>Practice: {team.practice_days} {team.practice_time && `@ ${team.practice_time}`}</p>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
        <button
          onClick={() => onManageRoster(team)}
          className="flex items-center gap-2 text-sm text-tne-red hover:text-white transition-colors"
        >
          <Users className="w-4 h-4" />
          <span>{team.player_count} Players</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(team)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
            title="Edit team"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(team)}
            className="p-2 rounded-lg hover:bg-red-500/20 transition-colors text-white/60 hover:text-red-400"
            title="Delete team"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
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
      // Clean up empty strings to nulls
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
    <div className="bg-[#050505] text-white antialiased min-h-screen flex flex-col font-sans">
      <TeamsNavbar />

      <main className="flex-1 px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              to="/admin"
              className="flex items-center gap-1 text-sm text-white/60 hover:text-white mb-4 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bebas tracking-tight">Team Management</h1>
                <p className="text-white/60 mt-1">
                  Create and manage teams, assign coaches, and set schedules
                </p>
              </div>
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-tne-red hover:bg-tne-red-dark text-white font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Team
              </button>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
              Failed to load teams: {error}
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl bg-white/5 border border-white/10 p-5 h-48 animate-pulse" />
              ))}
            </div>
          ) : teams.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-12 h-12 mx-auto text-white/30 mb-4" />
              <h3 className="text-lg font-medium mb-2">No teams yet</h3>
              <p className="text-white/60 mb-6">Create your first team to get started</p>
              <button
                onClick={handleCreate}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-tne-red hover:bg-tne-red-dark text-white font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Team
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map((team) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onManageRoster={handleManageRoster}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <TeamsFooter />

      {/* Create/Edit Modal - key forces remount when editing different teams */}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-neutral-900 rounded-2xl w-full max-w-md p-6 border border-white/10">
            <h3 className="text-lg font-semibold mb-2">Delete Team?</h3>
            <p className="text-white/70 mb-6">
              Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl border border-white/20 text-white/80 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
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
