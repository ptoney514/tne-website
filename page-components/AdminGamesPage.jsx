import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useGames } from '@/hooks/useGames';
import { useTeams } from '@/hooks/useTeams';
import { formatShortDate, formatDateRange } from '@/lib/tournament-utils';


// Icons
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const TrophyIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);

const MapPinIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
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

const StarIcon = () => (
  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const LinkIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);


// Game/Tournament Modal for Create/Edit
function GameModal({ isOpen, onClose, game, onSave, isSaving }) {
  const [formData, setFormData] = useState(
    game || {
      game_type: 'tournament',
      name: '',
      date: '',
      start_time: '',
      end_time: '',
      location: '',
      address: '',
      external_url: '',
      is_featured: false,
      notes: '',
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
      <div className="bg-white rounded-[14px] w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-admin-card-border">
          <h2 className="text-base font-bold text-admin-text">
            {game ? 'Edit Tournament' : 'Create Tournament'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-stone-100 rounded-lg transition-colors text-admin-text-secondary">
            <XIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type is always tournament now - hidden input to maintain data structure */}
          <input type="hidden" value="tournament" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-admin-text mb-1">
                Tournament Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-admin-card-border text-admin-text focus:outline-none focus:ring-2 focus:ring-admin-red/20 focus:border-admin-red/40"
                placeholder="e.g., MLK Weekend Classic"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-admin-text mb-1">Date *</label>
              <input
                type="date"
                required
                value={formData.date || ''}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-admin-card-border text-admin-text focus:outline-none focus:ring-2 focus:ring-admin-red/20 focus:border-admin-red/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-admin-text mb-1">Start Time</label>
                <input
                  type="time"
                  value={formData.start_time || ''}
                  onChange={(e) => handleChange('start_time', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-admin-card-border text-admin-text focus:outline-none focus:ring-2 focus:ring-admin-red/20 focus:border-admin-red/40"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-admin-text mb-1">End Time</label>
                <input
                  type="time"
                  value={formData.end_time || ''}
                  onChange={(e) => handleChange('end_time', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-admin-card-border text-admin-text focus:outline-none focus:ring-2 focus:ring-admin-red/20 focus:border-admin-red/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-admin-text mb-1">Location</label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => handleChange('location', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-admin-card-border text-admin-text focus:outline-none focus:ring-2 focus:ring-admin-red/20 focus:border-admin-red/40"
                placeholder="e.g., Omaha Sports Complex"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-admin-text mb-1">Address</label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-admin-card-border text-admin-text focus:outline-none focus:ring-2 focus:ring-admin-red/20 focus:border-admin-red/40"
                placeholder="Full address"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-admin-text mb-1">Tournament Website</label>
              <input
                type="url"
                value={formData.external_url || ''}
                onChange={(e) => handleChange('external_url', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-admin-card-border text-admin-text focus:outline-none focus:ring-2 focus:ring-admin-red/20 focus:border-admin-red/40"
                placeholder="https://..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-admin-text mb-1">Notes</label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-admin-card-border text-admin-text focus:outline-none focus:ring-2 focus:ring-admin-red/20 focus:border-admin-red/40"
                placeholder="Internal notes..."
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_featured"
                checked={formData.is_featured || false}
                onChange={(e) => handleChange('is_featured', e.target.checked)}
                className="rounded border-admin-card-border"
              />
              <label htmlFor="is_featured" className="text-sm text-admin-text">
                Featured tournament (highlight on public schedule)
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-admin-card-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-admin-card-border text-admin-text hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 rounded-lg bg-admin-red hover:opacity-85 text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving && <LoaderIcon />}
              {game ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Team Assignment Modal
function TeamAssignmentModal({ isOpen, onClose, game, teams, onSave, isSaving }) {
  const [selectedTeamIds, setSelectedTeamIds] = useState(
    game?.assigned_teams?.map(t => t.team_id) || []
  );

  if (!isOpen || !game) return null;

  const handleToggleTeam = (teamId) => {
    setSelectedTeamIds(prev =>
      prev.includes(teamId)
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const handleSave = async () => {
    await onSave(game.id, selectedTeamIds);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-[14px] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-admin-card-border">
          <div>
            <h2 className="text-base font-bold text-admin-text">Assign Teams</h2>
            <p className="text-sm text-admin-text-secondary">{game.name}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-stone-100 rounded-lg transition-colors text-admin-text-secondary">
            <XIcon />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-admin-text-secondary mb-4">
            Select the teams participating in this tournament:
          </p>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {teams.map((team) => (
              <button
                type="button"
                key={team.id}
                onClick={() => handleToggleTeam(team.id)}
                className={`flex items-center gap-3 p-3 rounded-[12px] border cursor-pointer transition-colors w-full text-left ${
                  selectedTeamIds.includes(team.id)
                    ? 'border-admin-red bg-red-50'
                    : 'border-admin-card-border hover:bg-stone-50'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    selectedTeamIds.includes(team.id)
                      ? 'bg-admin-red border-admin-red text-white'
                      : 'border-admin-card-border'
                  }`}
                >
                  {selectedTeamIds.includes(team.id) && <CheckIcon />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-admin-text">{team.name}</p>
                  <p className="text-sm text-admin-text-secondary">
                    {team.grade_level} - {team.gender === 'male' ? 'Boys' : 'Girls'}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-admin-card-border flex justify-between items-center">
            <p className="text-sm text-admin-text-secondary">
              {selectedTeamIds.length} team{selectedTeamIds.length !== 1 ? 's' : ''} selected
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-admin-card-border text-admin-text hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 rounded-lg bg-admin-red hover:opacity-85 text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving && <LoaderIcon />}
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Tournament Row — date block + info + actions
function TournamentRow({ game, onEdit, onDelete, onAssignTeams }) {
  const { month, day, endDay } = formatShortDate(game.date, game.end_date);
  const daysUntil = Math.ceil(
    (new Date(game.date + 'T00:00:00') - new Date()) / (1000 * 60 * 60 * 24)
  );
  const isPast = daysUntil < 0;

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-[14px] bg-white border-[1.5px] border-admin-card-border hover:shadow-md transition-shadow ${
        isPast ? 'opacity-60' : ''
      }`}
    >
      {/* Date block */}
      <div className="w-[52px] flex-shrink-0 text-center">
        <div className="text-admin-red uppercase text-[10px] font-bold tracking-wide">
          {month}
        </div>
        <div className="text-2xl font-extrabold text-admin-text leading-none">
          {day}
        </div>
        {endDay && (
          <div className="text-xs text-admin-text-muted">– {endDay}</div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        {/* Badges */}
        <div className="flex gap-2 mb-1">
          {game.is_featured && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider">
              <StarIcon />
              Featured
            </span>
          )}
          {!isPast && daysUntil <= 14 && (
            <span className="px-2 py-0.5 rounded-full bg-red-50 text-admin-red text-[10px] font-bold uppercase tracking-wider">
              {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil}d away`}
            </span>
          )}
        </div>

        {/* Name */}
        <div className="text-[15px] font-bold text-admin-text truncate">
          {game.name}
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-admin-text-secondary mt-1">
          {game.location && (
            <span className="flex items-center gap-1">
              <MapPinIcon />
              {game.location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <UsersIcon />
            {game.teams_count} {game.teams_count === 1 ? 'team' : 'teams'}
          </span>
          {game.external_url && (
            <a
              href={game.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-admin-red hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <LinkIcon />
              Website
            </a>
          )}
        </div>

        {/* Team chips */}
        {game.assigned_teams?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {game.assigned_teams.slice(0, 4).map((gt) => (
              <span
                key={gt.id}
                className="px-2 py-0.5 rounded bg-stone-100 text-admin-text-secondary text-[11px]"
              >
                {gt.team?.name?.split(' ').slice(-1)[0] || 'Team'}
              </span>
            ))}
            {game.assigned_teams.length > 4 && (
              <span className="px-2 py-0.5 rounded bg-stone-100 text-admin-text-secondary text-[11px]">
                +{game.assigned_teams.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => onAssignTeams(game)}
          className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-admin-red hover:bg-red-50 transition-colors"
        >
          Assign
        </button>
        <Link
          href={`/admin/games/${game.id}`}
          className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors text-admin-text-muted hover:text-admin-text-secondary"
          title="Details"
        >
          <SettingsIcon />
        </Link>
        <button
          onClick={() => onEdit(game)}
          className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors text-admin-text-muted hover:text-admin-text-secondary"
          title="Edit"
        >
          <EditIcon />
        </button>
        <button
          onClick={() => onDelete(game)}
          className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-admin-text-muted hover:text-red-500"
          title="Delete"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

export default function AdminGamesPage() {
  const { games, loading, error, createGame, updateGame, deleteGame, assignTeams } = useGames();
  const { teams } = useTeams();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assigningGame, setAssigningGame] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleCreate = () => {
    setEditingGame(null);
    setModalOpen(true);
  };

  const handleEdit = (game) => {
    setEditingGame(game);
    setModalOpen(true);
  };

  const handleSave = async (formData) => {
    setIsSaving(true);
    try {
      if (editingGame) {
        await updateGame(editingGame.id, formData);
      } else {
        await createGame(formData);
      }
      setModalOpen(false);
      setEditingGame(null);
    } catch (err) {
      console.error('Error saving game:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (game) => {
    setDeleteConfirm(game);
  };

  const confirmDelete = async () => {
    try {
      await deleteGame(deleteConfirm.id);
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting game:', err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleAssignTeams = (game) => {
    setAssigningGame(game);
    setAssignModalOpen(true);
  };

  const handleSaveAssignments = async (gameId, teamIds) => {
    setIsSaving(true);
    try {
      await assignTeams(gameId, teamIds);
    } catch (err) {
      console.error('Error assigning teams:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Only show tournaments, sorted by date, grouped by month
  const tournaments = useMemo(() => {
    return games
      .filter(g => g.game_type === 'tournament')
      .sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  }, [games]);

  const monthGroups = useMemo(() => {
    const groups = [];
    let currentKey = null;

    for (const t of tournaments) {
      if (!t.date) continue;
      const d = new Date(t.date + 'T00:00:00');
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();

      if (key !== currentKey) {
        groups.push({ key, label, tournaments: [] });
        currentKey = key;
      }
      groups[groups.length - 1].tournaments.push(t);
    }

    return groups;
  }, [tournaments]);

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-admin-card-border -mx-4 -mt-4 sm:-mx-8 sm:-mt-8 px-4 sm:px-8 py-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-[22px] font-extrabold text-admin-text tracking-[-0.02em] flex items-center gap-3">
                <TrophyIcon />
                Tournament Schedule
              </h1>
              <p className="text-admin-text-secondary mt-1">
                {tournaments.length} tournament{tournaments.length !== 1 ? 's' : ''} &middot; Manage tournaments and assign teams
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-[12px] bg-admin-red hover:opacity-85 text-white font-medium transition-colors"
            >
              <PlusIcon />
              Add Tournament
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Error State */}
        {error && (
          <div className="mb-6 px-4 py-3 rounded-[12px] bg-red-50 border border-red-200 text-red-700 text-sm">
            Failed to load: {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-[14px] bg-white border-[1.5px] border-admin-card-border animate-pulse"
              >
                <div className="w-[52px] h-14 rounded bg-stone-100 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 bg-stone-100 rounded" />
                  <div className="h-3 w-72 bg-stone-50 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : tournaments.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-stone-100 flex items-center justify-center">
              <TrophyIcon />
            </div>
            <h3 className="text-base font-bold text-admin-text mb-2">No tournaments yet</h3>
            <p className="text-admin-text-secondary mb-6">Create a tournament, then assign teams to it</p>
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[12px] bg-admin-red hover:opacity-85 text-white font-medium transition-colors"
            >
              <PlusIcon />
              Add Tournament
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {monthGroups.map((group) => (
              <div key={group.key}>
                {/* Month header */}
                <div className="sticky top-0 z-10 bg-admin-bg/95 backdrop-blur-sm -mx-4 px-4 py-2 mb-3">
                  <h2 className="text-xs font-bold text-admin-text-muted tracking-widest uppercase">
                    {group.label}
                  </h2>
                </div>

                {/* Tournament rows */}
                <div className="space-y-2">
                  {group.tournaments.map((tournament) => (
                    <TournamentRow
                      key={tournament.id}
                      game={tournament}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onAssignTeams={handleAssignTeams}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <GameModal
          key={editingGame?.id || 'new'}
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingGame(null);
          }}
          game={editingGame}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}

      {/* Team Assignment Modal */}
      {assignModalOpen && (
        <TeamAssignmentModal
          isOpen={assignModalOpen}
          onClose={() => {
            setAssignModalOpen(false);
            setAssigningGame(null);
          }}
          game={assigningGame}
          teams={teams}
          onSave={handleSaveAssignments}
          isSaving={isSaving}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-[14px] w-full max-w-md p-6 shadow-xl">
            <h3 className="text-base font-bold text-admin-text mb-2">Delete Tournament?</h3>
            <p className="text-admin-text-secondary mb-6">
              Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This will also remove all team assignments.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg border border-admin-card-border text-admin-text hover:bg-stone-50 transition-colors"
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
    </>
  );
}
