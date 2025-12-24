import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeams } from '../hooks/useTeams';
import { getGradeBadgeClass } from '../utils/gradeColors';
import AdminNavbar from '../components/AdminNavbar';
import { TierBadge } from '../components/TierBadge';
import { TagBadge } from '../components/TagBadge';
import { EditTeamTagsModal } from '../components/EditTeamTagsModal';
import { TIER_CONFIG, TAG_CONFIG, TIER_SLUGS, TAG_SLUGS } from '../lib/tierTagConfig';

// Icons as inline SVGs
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

const SearchIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const PencilIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

const AlertTriangleIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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

// Filter Chip Component
function FilterChip({ active, onClick, children, color = 'stone', count }) {
  const colorClasses = {
    stone: 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200',
    red: 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
    cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100',
    violet: 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
    orange: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
    maroon: 'bg-tne-maroon/10 text-tne-maroon border-tne-maroon/30 hover:bg-tne-maroon/20',
    blue: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
  };

  return (
    <button
      onClick={onClick}
      className={`filter-chip px-3 py-1.5 text-xs font-medium rounded-full border transition-all flex items-center gap-1.5
        ${colorClasses[color] || colorClasses.stone}
        ${active ? 'ring-2 ring-offset-1' : ''}`}
      data-testid={`filter-chip`}
    >
      {children}
      {count !== undefined && ` (${count})`}
    </button>
  );
}

// Team Modal (Create/Edit)
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
      tier: 'express',
      tags: [],
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

// Program Tier Legend
function TierLegend() {
  return (
    <div className="mt-6 p-4 bg-white rounded-xl border border-stone-200">
      <h3 className="text-sm font-semibold text-stone-700 mb-3">Program Tier Legend</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        {TIER_SLUGS.map((slug) => {
          const tier = TIER_CONFIG[slug];
          return (
            <div key={slug} className="flex items-start gap-3">
              <span className={`w-3 h-3 rounded-full ${tier.dotColor} mt-1 shrink-0`} />
              <div>
                <div className="font-medium text-stone-900">{tier.name}</div>
                <div className="text-xs text-stone-500">{tier.description}</div>
              </div>
            </div>
          );
        })}
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
  const [searchQuery, setSearchQuery] = useState('');
  const [editTagsTeam, setEditTagsTeam] = useState(null);
  const [isSavingTags, setIsSavingTags] = useState(false);

  // Filter state
  const [activeFilters, setActiveFilters] = useState({
    needsCoach: false,
    gender: null, // 'male' or 'female'
    grades: [], // array of grade strings
    tier: null, // 'tne', 'express', 'dev'
    tags: [], // array of tag slugs
  });

  // Count teams by tier
  const tierCounts = useMemo(() => {
    const counts = { tne: 0, express: 0, dev: 0 };
    teams.forEach((team) => {
      const tier = team.tier || 'express';
      counts[tier] = (counts[tier] || 0) + 1;
    });
    return counts;
  }, [teams]);

  // Count teams needing coach
  const needsCoachCount = useMemo(() => {
    return teams.filter((team) => !team.head_coach).length;
  }, [teams]);

  // Filter teams
  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          team.name.toLowerCase().includes(query) ||
          (team.head_coach && `${team.head_coach.first_name} ${team.head_coach.last_name}`.toLowerCase().includes(query)) ||
          team.practice_location?.toLowerCase().includes(query) ||
          team.grade_level?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Needs coach filter
      if (activeFilters.needsCoach && team.head_coach) return false;

      // Gender filter
      if (activeFilters.gender && team.gender !== activeFilters.gender) return false;

      // Grade filter
      if (activeFilters.grades.length > 0 && !activeFilters.grades.includes(team.grade_level)) return false;

      // Tier filter
      if (activeFilters.tier && (team.tier || 'express') !== activeFilters.tier) return false;

      // Tags filter (team must have ALL selected tags)
      if (activeFilters.tags.length > 0) {
        const teamTags = team.tags || [];
        const hasAllTags = activeFilters.tags.every((tag) => teamTags.includes(tag));
        if (!hasAllTags) return false;
      }

      return true;
    });
  }, [teams, searchQuery, activeFilters]);

  const toggleFilter = (filterType, value) => {
    setActiveFilters((prev) => {
      if (filterType === 'needsCoach') {
        return { ...prev, needsCoach: !prev.needsCoach };
      }
      if (filterType === 'gender') {
        return { ...prev, gender: prev.gender === value ? null : value };
      }
      if (filterType === 'grade') {
        const grades = prev.grades.includes(value)
          ? prev.grades.filter((g) => g !== value)
          : [...prev.grades, value];
        return { ...prev, grades };
      }
      if (filterType === 'tier') {
        return { ...prev, tier: prev.tier === value ? null : value };
      }
      if (filterType === 'tag') {
        const tags = prev.tags.includes(value)
          ? prev.tags.filter((t) => t !== value)
          : [...prev.tags, value];
        return { ...prev, tags };
      }
      return prev;
    });
  };

  const handleCreate = () => {
    setEditingTeam(null);
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

  // Delete functionality - kept for future use but currently not exposed in UI
  // eslint-disable-next-line no-unused-vars
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

  const handleRowClick = (team) => {
    navigate(`/admin/teams/${team.id}/roster`);
  };

  const handleEditTags = (team, e) => {
    e.stopPropagation();
    setEditTagsTeam(team);
  };

  const handleSaveTags = async ({ tier, tags }) => {
    setIsSavingTags(true);
    try {
      await updateTeam(editTagsTeam.id, { tier, tags });
      setEditTagsTeam(null);
    } catch (err) {
      console.error('Error saving tags:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSavingTags(false);
    }
  };

  const gradeColors = {
    '3rd': 'amber',
    '4th': 'amber',
    '5th': 'rose',
    '6th': 'emerald',
    '7th': 'cyan',
    '8th': 'violet',
  };

  return (
    <div className="bg-stone-100 text-stone-900 antialiased min-h-screen">
      <AdminNavbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Active Teams</h1>
            <p className="text-sm text-stone-500 mt-1">Select a team to manage rosters and schedules</p>
          </div>
          <button className="text-sm text-stone-500 hover:text-stone-700 flex items-center gap-1.5">
            <SettingsIcon />
            Manage Tags & Tiers
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            Failed to load teams: {error}
          </div>
        )}

        {/* Filter Card */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 mb-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <SearchIcon />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tne-maroon/20 focus:border-tne-maroon/50 transition-all"
                style={{ paddingLeft: '2.5rem' }}
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                <SearchIcon />
              </div>
            </div>

            <button
              onClick={handleCreate}
              className="px-5 py-2.5 bg-tne-red text-white text-sm font-semibold rounded-xl hover:bg-tne-red-dark transition-colors flex items-center justify-center gap-2 shadow-lg shadow-tne-red/20"
            >
              <PlusIcon />
              New Team
            </button>
          </div>

          {/* Quick Filters Row 1: Status, Gender, Grade */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-stone-100">
            <span className="text-xs text-stone-400 font-medium">Status:</span>
            <FilterChip
              active={activeFilters.needsCoach}
              onClick={() => toggleFilter('needsCoach')}
              color="red"
              count={needsCoachCount}
            >
              <AlertTriangleIcon />
              Needs Coach
            </FilterChip>

            <div className="w-px h-5 bg-stone-200 mx-1" />
            <span className="text-xs text-stone-400 font-medium">Gender:</span>
            <FilterChip
              active={activeFilters.gender === 'male'}
              onClick={() => toggleFilter('gender', 'male')}
              color="stone"
            >
              Boys
            </FilterChip>
            <FilterChip
              active={activeFilters.gender === 'female'}
              onClick={() => toggleFilter('gender', 'female')}
              color="stone"
            >
              Girls
            </FilterChip>

            <div className="w-px h-5 bg-stone-200 mx-1" />
            <span className="text-xs text-stone-400 font-medium">Grade:</span>
            {['3rd', '5th', '6th', '7th', '8th'].map((grade) => (
              <FilterChip
                key={grade}
                active={activeFilters.grades.includes(grade) || (grade === '3rd' && activeFilters.grades.includes('4th'))}
                onClick={() => toggleFilter('grade', grade)}
                color={gradeColors[grade] || 'stone'}
              >
                {grade === '3rd' ? '3rd-4th' : grade}
              </FilterChip>
            ))}
          </div>

          {/* Quick Filters Row 2: Tier, Tags */}
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-stone-100">
            <span className="text-xs text-stone-400 font-medium">Program Tier:</span>
            {TIER_SLUGS.map((slug) => {
              const tier = TIER_CONFIG[slug];
              return (
                <FilterChip
                  key={slug}
                  active={activeFilters.tier === slug}
                  onClick={() => toggleFilter('tier', slug)}
                  color={slug === 'tne' ? 'maroon' : slug === 'express' ? 'blue' : 'stone'}
                  count={tierCounts[slug]}
                >
                  <span className={`w-2 h-2 rounded-full ${tier.dotColor}`} />
                  {tier.name}
                </FilterChip>
              );
            })}

            <div className="w-px h-5 bg-stone-200 mx-2" />
            <span className="text-xs text-stone-400 font-medium">Tags:</span>
            {TAG_SLUGS.map((slug) => {
              const tag = TAG_CONFIG[slug];
              return (
                <FilterChip
                  key={slug}
                  active={activeFilters.tags.includes(slug)}
                  onClick={() => toggleFilter('tag', slug)}
                  color={slug === '3ssb' ? 'purple' : slug === 'tournament' ? 'orange' : 'emerald'}
                >
                  {tag.fullName}
                </FilterChip>
              );
            })}
          </div>
        </div>

        {/* Teams Table */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8 text-center">
            <LoaderIcon />
            <p className="text-stone-500 mt-2">Loading teams...</p>
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-stone-100 flex items-center justify-center">
              <UsersIcon />
            </div>
            <h3 className="text-lg font-medium text-stone-900 mb-2">
              {teams.length === 0 ? 'No teams yet' : 'No teams match filters'}
            </h3>
            <p className="text-stone-500 mb-6">
              {teams.length === 0 ? 'Create your first team to get started' : 'Try adjusting your filters'}
            </p>
            {teams.length === 0 && (
              <button
                onClick={handleCreate}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-tne-red hover:bg-tne-red-dark text-white font-medium transition-colors"
              >
                <PlusIcon />
                Create Team
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone-100 bg-stone-50/50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                      Team
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                      Program / Tags
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider hidden lg:table-cell">
                      Practice Schedule
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                      Players
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="w-12 px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredTeams.map((team) => {
                    const needsCoach = !team.head_coach;
                    const coachName = team.head_coach
                      ? `Coach ${team.head_coach.last_name || team.head_coach.first_name}`
                      : null;
                    const schedule = team.practice_days && team.practice_time
                      ? `${team.practice_days} ${team.practice_time}`
                      : team.practice_days || null;

                    return (
                      <tr
                        key={team.id}
                        className={`hover:bg-stone-50 cursor-pointer transition-colors ${needsCoach ? 'bg-red-50/30' : ''}`}
                        onClick={() => handleRowClick(team)}
                        data-testid={`team-row-${team.id}`}
                      >
                        {/* Team Column */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-11 h-11 rounded-xl ${getGradeBadgeClass(team.grade_level)} flex items-center justify-center text-white text-sm font-bold shadow-sm`}
                            >
                              {team.grade_level}
                            </div>
                            <div>
                              <div className="font-semibold text-stone-900">{team.name}</div>
                              <div className={`text-sm ${needsCoach ? 'text-red-600 flex items-center gap-1' : 'text-stone-500'}`}>
                                {needsCoach ? (
                                  <>
                                    <AlertTriangleIcon />
                                    Needs Coach
                                  </>
                                ) : (
                                  coachName
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Program / Tags Column */}
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <TierBadge tier={team.tier || 'express'} />
                            {(team.tags || []).map((tag) => (
                              <TagBadge key={tag} tag={tag} />
                            ))}
                            <button
                              onClick={(e) => handleEditTags(team, e)}
                              className="p-1 hover:bg-stone-100 rounded text-stone-400 hover:text-stone-600 transition-colors"
                              title="Edit tier and tags"
                            >
                              <PencilIcon />
                            </button>
                          </div>
                        </td>

                        {/* Practice Schedule Column */}
                        <td className="px-4 py-4 hidden lg:table-cell">
                          {schedule ? (
                            <>
                              <div className="text-sm text-stone-700">{schedule}</div>
                              <div className="text-xs text-stone-400">{team.practice_location}</div>
                            </>
                          ) : (
                            <span className="text-sm text-stone-400">Not set</span>
                          )}
                        </td>

                        {/* Players Column */}
                        <td className="px-4 py-4 text-center">
                          <div className="inline-flex items-center gap-1.5 text-stone-600">
                            <UsersIcon />
                            <span className="font-medium">{team.player_count || 0}</span>
                          </div>
                        </td>

                        {/* Status Column */}
                        <td className="px-4 py-4 text-center">
                          {needsCoach ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-xs font-medium border border-red-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                              Needs Coach
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Active
                            </span>
                          )}
                        </td>

                        {/* Actions Column */}
                        <td className="w-12 px-4 py-4">
                          <button className="p-2 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-stone-600 transition-colors">
                            <ChevronRightIcon />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tier Legend */}
        <TierLegend />
      </main>

      {/* Create/Edit Team Modal */}
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

      {/* Edit Tags Modal */}
      <EditTeamTagsModal
        key={editTagsTeam?.id}
        isOpen={!!editTagsTeam}
        onClose={() => setEditTagsTeam(null)}
        team={editTagsTeam}
        onSave={handleSaveTags}
        isSaving={isSavingTags}
      />

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
