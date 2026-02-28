import { useState, useEffect, useCallback } from 'react';
import { useSeasons } from '@/hooks/useSeasons';
import { useSeason } from '@/contexts/SeasonContext';
import { api } from '@/lib/api-client';

import SeasonFormModal from '@/components/admin/SeasonFormModal';
import CopyTeamsModal from '@/components/admin/CopyTeamsModal';
import SeasonFeesList from '@/components/admin/SeasonFeesList';
import {
  Plus,
  Loader2,
  Calendar,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Users,
  Copy,
  CalendarCheck,
  Radio,
  Power,
  Check,
  X,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  DollarSign,
} from 'lucide-react';

function StatusBadge({ isActive }) {
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
        isActive
          ? 'bg-green-100 text-green-700'
          : 'bg-admin-content-bg text-admin-text-secondary'
      }`}
    >
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}

function formatDateRange(startDate, endDate) {
  const opts = { month: 'short', day: 'numeric', year: 'numeric' };
  const start = new Date(startDate + 'T00:00:00').toLocaleDateString('en-US', opts);
  const end = new Date(endDate + 'T00:00:00').toLocaleDateString('en-US', opts);
  return `${start} \u2013 ${end}`;
}

// Inline toggle for tryouts/registration
function InlineToggle({ label, isOpen, color, saving, onToggle }) {
  const colorMap = {
    blue: {
      active: 'bg-blue-500 shadow-blue-500/30',
      dot: 'text-blue-500',
      text: 'text-blue-600',
    },
    green: {
      active: 'bg-green-500 shadow-green-500/30',
      dot: 'text-green-500',
      text: 'text-green-600',
    },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onToggle}
        disabled={saving}
        className={`relative w-10 h-5.5 rounded-full transition-all duration-300 ${
          isOpen ? `${c.active} shadow-sm` : 'bg-stone-300'
        } ${saving ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
      >
        <div
          className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-all duration-300 flex items-center justify-center ${
            isOpen ? 'left-5' : 'left-0.5'
          }`}
        >
          <Power className={`w-2.5 h-2.5 ${isOpen ? c.dot : 'text-admin-text-muted'}`} />
        </div>
      </button>
      <span className={`text-xs font-medium ${isOpen ? c.text : 'text-admin-text-secondary'}`}>
        {label}: {isOpen ? 'Open' : 'Closed'}
      </span>
    </div>
  );
}

// Mini team card for display within season cards
function MiniTeamCard({ team }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-[12px] bg-admin-content-bg border border-[#F2F2F0]">
      <div className="w-8 h-8 rounded-lg bg-stone-200 flex items-center justify-center shrink-0">
        <Users className="w-4 h-4 text-admin-text-secondary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-admin-text truncate">{team.name}</p>
        <p className="text-[11px] text-admin-text-secondary">
          {team.grade_level} &middot; {team.gender}
          {team.head_coach && ` \u00b7 ${team.head_coach.first_name} ${team.head_coach.last_name}`}
        </p>
      </div>
      <span className="text-xs font-admin-mono text-admin-text-muted shrink-0">
        {team.player_count || 0}
      </span>
    </div>
  );
}

// Season card component
function SeasonCard({
  season,
  teams: seasonTeams,
  loadingTeams,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleTryouts,
  onToggleRegistration,
  onCopyTeams,
}) {
  const [expanded, setExpanded] = useState(false);
  const [feesExpanded, setFeesExpanded] = useState(false);
  const [savingTryouts, setSavingTryouts] = useState(false);
  const [savingRegistration, setSavingRegistration] = useState(false);
  const [tryoutsOpen, setTryoutsOpen] = useState(season.tryouts_open || false);
  const [registrationOpen, setRegistrationOpen] = useState(season.registration_open || false);

  useEffect(() => {
    setTryoutsOpen(season.tryouts_open || false);
    setRegistrationOpen(season.registration_open || false);
  }, [season]);

  const handleToggleTryouts = async () => {
    setSavingTryouts(true);
    const newState = !tryoutsOpen;
    try {
      await onToggleTryouts(season.id, newState);
      setTryoutsOpen(newState);
    } catch {
      // revert on error
    } finally {
      setSavingTryouts(false);
    }
  };

  const handleToggleRegistration = async () => {
    setSavingRegistration(true);
    const newState = !registrationOpen;
    try {
      await onToggleRegistration(season.id, newState);
      setRegistrationOpen(newState);
    } catch {
      // revert on error
    } finally {
      setSavingRegistration(false);
    }
  };

  const teamCount = seasonTeams?.length || 0;

  return (
    <div className="rounded-[14px] bg-white border-[1.5px] border-admin-card-border overflow-hidden hover:border-admin-card-border transition-colors">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-base font-bold text-admin-text">{season.name}</h3>
              <StatusBadge isActive={season.is_active} />
            </div>
            <p className="text-sm text-admin-text-secondary">
              {formatDateRange(season.start_date, season.end_date)}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onToggleActive(season)}
              className="p-2 rounded-lg text-admin-text-muted hover:bg-stone-100 hover:text-admin-text transition-colors"
              title={season.is_active ? 'Deactivate' : 'Activate'}
            >
              {season.is_active ? (
                <ToggleRight className="w-5 h-5 text-green-600" />
              ) : (
                <ToggleLeft className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => onEdit(season)}
              className="p-2 rounded-lg text-admin-text-muted hover:bg-stone-100 hover:text-admin-text transition-colors"
              title="Edit"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(season)}
              className="p-2 rounded-lg text-admin-text-muted hover:bg-red-50 hover:text-red-600 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Inline Controls */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <InlineToggle
            label="Tryouts"
            isOpen={tryoutsOpen}
            color="blue"
            saving={savingTryouts}
            onToggle={handleToggleTryouts}
          />
          <InlineToggle
            label="Registration"
            isOpen={registrationOpen}
            color="green"
            saving={savingRegistration}
            onToggle={handleToggleRegistration}
          />
        </div>

        {/* Teams & Fees summary + expand */}
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-sm text-admin-text-secondary hover:text-admin-text transition-colors"
          >
            <Users className="w-4 h-4" />
            <span className="font-medium">
              {loadingTeams ? 'Loading...' : `${teamCount} Team${teamCount !== 1 ? 's' : ''}`}
            </span>
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => setFeesExpanded(!feesExpanded)}
            className="flex items-center gap-2 text-sm text-admin-text-secondary hover:text-admin-text transition-colors"
          >
            <DollarSign className="w-4 h-4" />
            <span className="font-medium">Fees</span>
            {feesExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Teams Grid */}
      {expanded && (
        <div className="px-6 pb-6 pt-0">
          <div className="border-t border-[#F2F2F0] pt-4">
            {loadingTeams ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 text-admin-text-muted animate-spin" />
              </div>
            ) : teamCount > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {seasonTeams.map((team) => (
                  <MiniTeamCard key={team.id} team={team} />
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-admin-text-secondary mb-3">No teams in this season</p>
                <button
                  onClick={() => onCopyTeams(season)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Copy Teams from Another Season
                </button>
              </div>
            )}
          </div>

          {/* Copy Teams button for seasons with teams too (less prominent) */}
          {teamCount > 0 && (
            <div className="mt-3 pt-3 border-t border-[#F2F2F0]">
              <button
                onClick={() => onCopyTeams(season)}
                className="text-xs text-admin-text-secondary hover:text-blue-600 transition-colors flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy teams from another season
              </button>
            </div>
          )}
        </div>
      )}

      {/* Expanded Fees Section */}
      {feesExpanded && (
        <div className="px-6 pb-6 pt-0">
          <div className="border-t border-[#F2F2F0] pt-4">
            <SeasonFeesList seasonId={season.id} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminSeasonsPage() {
  const {
    seasons,
    loading,
    error,
    createSeason,
    updateSeason,
    deleteSeason,
    toggleActive,
    refetch,
  } = useSeasons();
  const { seasons: allSeasons, refetch: refetchSeasonContext } = useSeason();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [copyTeamsTarget, setCopyTeamsTarget] = useState(null);
  const [teamsPerSeason, setTeamsPerSeason] = useState({});
  const [loadingTeams, setLoadingTeams] = useState({});

  // Fetch teams for all seasons
  const fetchTeamsForSeasons = useCallback(async () => {
    if (!seasons.length) return;

    const newLoadingState = {};
    seasons.forEach((s) => {
      newLoadingState[s.id] = true;
    });
    setLoadingTeams(newLoadingState);

    const results = {};
    await Promise.all(
      seasons.map(async (season) => {
        try {
          const data = await api.get(`/admin/teams?seasonId=${season.id}`);
          results[season.id] = data || [];
        } catch {
          results[season.id] = [];
        }
      })
    );

    setTeamsPerSeason(results);
    setLoadingTeams({});
  }, [seasons]);

  useEffect(() => {
    fetchTeamsForSeasons();
  }, [fetchTeamsForSeasons]);

  const handleCreate = () => {
    setEditingSeason(null);
    setModalOpen(true);
  };

  const handleEdit = (season) => {
    setEditingSeason(season);
    setModalOpen(true);
  };

  const handleSave = async (formData) => {
    if (editingSeason) {
      await updateSeason(editingSeason.id, formData);
    } else {
      await createSeason(formData);
    }
    await refetchSeasonContext();
    setModalOpen(false);
    setEditingSeason(null);
  };

  const handleDelete = (season) => {
    setDeleteConfirm(season);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteSeason(deleteConfirm.id);
      await refetchSeasonContext();
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting season:', err);
    }
  };

  const handleToggleActive = async (season) => {
    try {
      await toggleActive(season.id, !season.is_active);
      await refetchSeasonContext();
    } catch (err) {
      console.error('Error toggling season:', err);
    }
  };

  const handleToggleTryouts = async (seasonId, newState) => {
    await api.patch(`/admin/seasons?id=${seasonId}`, { tryoutsOpen: newState });
    await refetch();
  };

  const handleToggleRegistration = async (seasonId, newState) => {
    await api.patch(`/admin/seasons?id=${seasonId}`, { registrationOpen: newState });
    await refetch();
  };

  const handleCopyTeams = (season) => {
    setCopyTeamsTarget(season);
  };

  const handleCopyTeamsSuccess = async () => {
    setCopyTeamsTarget(null);
    await refetch();
    await fetchTeamsForSeasons();
  };

  return (
    <>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-extrabold text-admin-text tracking-[-0.02em]">
              Seasons
            </h1>
            <p className="text-sm text-admin-text-secondary mt-1">
              Manage seasons, control tryout/registration access, and view team structures
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-[12px] bg-admin-red hover:opacity-85 text-white font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Season
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 px-4 py-3 rounded-[12px] bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
            <span className="flex-1">Failed to load seasons: {error}</span>
            <button onClick={refetch} className="ml-auto text-red-800 underline hover:text-red-900 font-medium whitespace-nowrap">
              Retry
            </button>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-admin-text-muted animate-spin" />
          </div>
        ) : seasons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-[14px] bg-stone-200 flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-admin-text-muted" />
            </div>
            <h3 className="text-lg font-medium text-admin-text mb-2">No seasons yet</h3>
            <p className="text-admin-text-secondary mb-6">Create your first season to get started</p>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-5 py-2.5 rounded-[12px] bg-admin-red hover:opacity-85 text-white font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Season
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {seasons.map((season) => (
              <SeasonCard
                key={season.id}
                season={season}
                teams={teamsPerSeason[season.id]}
                loadingTeams={!!loadingTeams[season.id]}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
                onToggleTryouts={handleToggleTryouts}
                onToggleRegistration={handleToggleRegistration}
                onCopyTeams={handleCopyTeams}
              />
            ))}
          </div>
        )}

        {/* Footer count */}
        {seasons.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-admin-text-muted">
              {seasons.length} season{seasons.length !== 1 ? 's' : ''}
              {' \u00b7 '}
              {seasons.filter((s) => s.is_active).length} active
            </p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <SeasonFormModal
        isOpen={modalOpen}
        season={editingSeason}
        onClose={() => {
          setModalOpen(false);
          setEditingSeason(null);
        }}
        onSave={handleSave}
      />

      {/* Copy Teams Modal */}
      <CopyTeamsModal
        isOpen={!!copyTeamsTarget}
        targetSeason={copyTeamsTarget}
        seasons={seasons}
        onClose={() => setCopyTeamsTarget(null)}
        onSuccess={handleCopyTeamsSuccess}
      />

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-[14px] w-full max-w-md p-6 shadow-xl">
            <h3 className="text-base font-bold text-admin-text mb-2">
              Delete Season?
            </h3>
            <p className="text-admin-text-secondary mb-2">
              Are you sure you want to delete <strong>{deleteConfirm.name}</strong>?
            </p>
            <p className="text-sm text-red-600 mb-6">
              This will also delete all teams associated with this season. This action cannot be undone.
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
                Delete Season
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
