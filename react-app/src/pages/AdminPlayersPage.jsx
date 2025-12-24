import { useState, useMemo, useEffect } from 'react';
import { usePlayers } from '../hooks/usePlayers';
import { getGradeColor, formatGradeShort } from '../utils/gradeColors';
import AdminNavbar from '../components/AdminNavbar';
import PlayerDetailPanel from '../components/admin/PlayerDetailPanel';
import {
  GradeBadge,
  PaymentBadge,
  FilterPill,
  QuickFilterGroup,
} from '../components/admin/AdminBadges';
import {
  Plus,
  Search,
  RefreshCw,
  Download,
  X,
  Loader2,
  ChevronDown,
  User,
  AlertCircle,
  Filter,
  Phone,
} from 'lucide-react';

const EMPTY_PLAYER_FORM = {
  first_name: '',
  last_name: '',
  date_of_birth: '',
  graduating_year: new Date().getFullYear() + 8,
  current_grade: '',
  gender: 'male',
  jersey_number: '',
  jersey_size: '',
  position: '',
  years_experience: '',
  prior_tne_player: false,
  medical_notes: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  emergency_contact_relationship: '',
  notes: '',
};

const GRADES = ['3rd', '4th', '5th', '6th', '7th', '8th'];

// Player Modal for Add/Edit
function PlayerModal({ isOpen, onClose, player, teams, onSave, onAssignTeam, onRemoveTeam, isSaving }) {
  const initialData = player || EMPTY_PLAYER_FORM;
  const [formData, setFormData] = useState(initialData);
  const [selectedTeamToAdd, setSelectedTeamToAdd] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Get teams the player is NOT already on
  const availableTeams = (teams || []).filter(
    (team) => !player?.teams?.some((t) => t.id === team.id)
  );

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(formData);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAssignTeam = async () => {
    if (!selectedTeamToAdd || !player?.id) return;
    setIsAssigning(true);
    try {
      await onAssignTeam(player.id, selectedTeamToAdd);
      setSelectedTeamToAdd('');
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveTeam = async (teamId) => {
    if (!player?.id) return;
    setIsAssigning(true);
    try {
      await onRemoveTeam(player.id, teamId);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsAssigning(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const graduatingYears = Array.from({ length: 12 }, (_, i) => currentYear + i);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
          <h2 className="text-xl font-semibold text-stone-900">
            {player ? 'Edit Player' : 'Add Player'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-stone-100 rounded-lg transition-colors text-stone-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => handleChange('first_name', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => handleChange('last_name', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Date of Birth *</label>
              <input
                type="date"
                required
                value={formData.date_of_birth}
                onChange={(e) => handleChange('date_of_birth', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Gender *</label>
              <select
                required
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Current Grade *</label>
              <select
                required
                value={formData.current_grade}
                onChange={(e) => handleChange('current_grade', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
              >
                <option value="">Select Grade</option>
                <option value="K">Kindergarten</option>
                <option value="1st">1st Grade</option>
                <option value="2nd">2nd Grade</option>
                <option value="3rd">3rd Grade</option>
                <option value="4th">4th Grade</option>
                <option value="5th">5th Grade</option>
                <option value="6th">6th Grade</option>
                <option value="7th">7th Grade</option>
                <option value="8th">8th Grade</option>
                <option value="9th">9th Grade</option>
                <option value="10th">10th Grade</option>
                <option value="11th">11th Grade</option>
                <option value="12th">12th Grade</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Graduating Year *</label>
              <select
                required
                value={formData.graduating_year}
                onChange={(e) => handleChange('graduating_year', parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
              >
                {graduatingYears.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Basketball Info */}
          <div className="border-t border-stone-200 pt-4 mt-4">
            <h3 className="text-sm font-medium text-stone-900 mb-3">Basketball Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Jersey #</label>
                <input
                  type="text"
                  value={formData.jersey_number || ''}
                  onChange={(e) => handleChange('jersey_number', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
                  placeholder="23"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Jersey Size</label>
                <select
                  value={formData.jersey_size || ''}
                  onChange={(e) => handleChange('jersey_size', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
                >
                  <option value="">Select</option>
                  <option value="YS">Youth Small</option>
                  <option value="YM">Youth Medium</option>
                  <option value="YL">Youth Large</option>
                  <option value="YXL">Youth XL</option>
                  <option value="AS">Adult Small</option>
                  <option value="AM">Adult Medium</option>
                  <option value="AL">Adult Large</option>
                  <option value="AXL">Adult XL</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Position</label>
                <select
                  value={formData.position || ''}
                  onChange={(e) => handleChange('position', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
                >
                  <option value="">Select</option>
                  <option value="PG">Point Guard</option>
                  <option value="SG">Shooting Guard</option>
                  <option value="SF">Small Forward</option>
                  <option value="PF">Power Forward</option>
                  <option value="C">Center</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Years Exp</label>
                <input
                  type="number"
                  min="0"
                  max="15"
                  value={formData.years_experience || ''}
                  onChange={(e) => handleChange('years_experience', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3">
              <input
                type="checkbox"
                id="prior_tne"
                checked={formData.prior_tne_player}
                onChange={(e) => handleChange('prior_tne_player', e.target.checked)}
                className="rounded border-stone-300"
              />
              <label htmlFor="prior_tne" className="text-sm text-stone-700">
                Prior TNE Player
              </label>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="border-t border-stone-200 pt-4 mt-4">
            <h3 className="text-sm font-medium text-stone-900 mb-3">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.emergency_contact_name || ''}
                  onChange={(e) => handleChange('emergency_contact_name', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.emergency_contact_phone || ''}
                  onChange={(e) => handleChange('emergency_contact_phone', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Relationship</label>
                <input
                  type="text"
                  value={formData.emergency_contact_relationship || ''}
                  onChange={(e) => handleChange('emergency_contact_relationship', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
                  placeholder="e.g., Mother, Father, Uncle"
                />
              </div>
            </div>
          </div>

          {/* Team Assignment (only show when editing existing player) */}
          {player?.id && (
            <div className="border-t border-stone-200 pt-4 mt-4">
              <h3 className="text-sm font-medium text-stone-900 mb-3">Team Assignment</h3>

              {/* Current Teams */}
              {player.teams?.length > 0 ? (
                <div className="mb-3">
                  <p className="text-xs text-stone-500 mb-2">Current Teams:</p>
                  <div className="flex flex-wrap gap-2">
                    {player.teams.map((team) => (
                      <span
                        key={team.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 text-sm text-stone-700"
                      >
                        {team.name}
                        <button
                          type="button"
                          onClick={() => handleRemoveTeam(team.id)}
                          disabled={isAssigning}
                          className="text-stone-400 hover:text-red-500 transition-colors disabled:opacity-50"
                          title="Remove from team"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-stone-500 mb-3">Not assigned to any team</p>
              )}

              {/* Add to Team */}
              {availableTeams.length > 0 && (
                <div className="flex items-center gap-2">
                  <select
                    value={selectedTeamToAdd}
                    onChange={(e) => setSelectedTeamToAdd(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-stone-300 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
                  >
                    <option value="">Select a team to add...</option>
                    {availableTeams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name} ({team.grade_level})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAssignTeam}
                    disabled={!selectedTeamToAdd || isAssigning}
                    className="px-3 py-2 rounded-lg bg-stone-800 text-white text-sm font-medium hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    {isAssigning ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    Add
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="border-t border-stone-200 pt-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Medical Notes</label>
                <textarea
                  value={formData.medical_notes || ''}
                  onChange={(e) => handleChange('medical_notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red resize-none"
                  placeholder="Any allergies, conditions, or medications..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Notes</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red resize-none"
                  placeholder="Any additional notes..."
                />
              </div>
            </div>
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
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {player ? 'Update Player' : 'Add Player'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Filter Dropdown
function FilterDropdown({ value, options, onChange }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-3 pr-8 py-1.5 rounded-lg border border-stone-300 text-sm text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
    </div>
  );
}

// Team Badge with Color (used in table)
function TeamBadge({ team }) {
  const color = getGradeColor(team.grade_level);
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium text-white"
      style={{ backgroundColor: color.hex }}
    >
      {formatGradeShort(team.grade_level)}
    </span>
  );
}

// Calculate age helper
function calculateAge(dob) {
  if (!dob) return null;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export default function AdminPlayersPage() {
  const { players, teams, loading, error, refetch, createPlayer, updatePlayer, deletePlayer, assignPlayerToTeam, removePlayerFromTeam } = usePlayers();

  // UI State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedRows, setSelectedRows] = useState(new Set());

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [teamFilter, setTeamFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  // Quick Filter State
  const [quickFilters, setQuickFilters] = useState({
    unassigned: false,
    unpaid: false,
    newPlayers: false,
    tournamentRoster: false,
  });

  // Keep editingPlayer in sync with players list (for team assignment updates)
  useEffect(() => {
    if (editingPlayer?.id) {
      const updated = players.find((p) => p.id === editingPlayer.id);
      if (updated) {
        setEditingPlayer(updated);
      }
    }
  }, [players, editingPlayer?.id]);

  // Build team options for filter
  const teamOptions = useMemo(() => {
    const opts = [{ value: 'all', label: 'All Teams' }];
    teams.forEach((team) => {
      opts.push({ value: team.id, label: team.name });
    });
    opts.push({ value: 'unassigned', label: 'Unassigned' });
    return opts;
  }, [teams]);

  // Compute quick filter counts
  const filterCounts = useMemo(() => {
    return {
      unassigned: players.filter((p) => !p.teams || p.teams.length === 0).length,
      unpaid: players.filter((p) => p.payment_status === 'pending' || p.payment_status === 'unpaid').length,
      newPlayers: players.filter((p) => p.prior_tne_player === false).length,
      tournamentRoster: players.filter((p) => p.tags?.includes('tournament')).length,
    };
  }, [players]);

  // Filter players
  const filteredPlayers = useMemo(() => {
    let result = players.filter((player) => {
      // Quick Filters (applied first)
      if (quickFilters.unassigned && player.teams?.length > 0) return false;
      if (quickFilters.unpaid && player.payment_status !== 'pending' && player.payment_status !== 'unpaid') return false;
      if (quickFilters.newPlayers && player.prior_tne_player !== false) return false;
      if (quickFilters.tournamentRoster && !player.tags?.includes('tournament')) return false;

      // Team filter
      if (teamFilter === 'unassigned') {
        if (player.teams?.length > 0) return false;
      } else if (teamFilter !== 'all') {
        if (!player.teams?.some((t) => t.id === teamFilter)) return false;
      }

      // Grade filter
      if (gradeFilter !== 'all') {
        if (player.current_grade !== gradeFilter) return false;
      }

      // Payment filter
      if (paymentFilter !== 'all') {
        if (player.payment_status !== paymentFilter) return false;
      }

      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const fullName = `${player.first_name} ${player.last_name}`.toLowerCase();
        const parentName = player.primary_parent
          ? `${player.primary_parent.first_name} ${player.primary_parent.last_name}`.toLowerCase()
          : '';
        const phone = player.primary_parent?.phone || '';

        if (!fullName.includes(search) && !parentName.includes(search) && !phone.includes(search)) {
          return false;
        }
      }

      return true;
    });

    // Sort players
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
        case 'grade':
          return (a.current_grade || '').localeCompare(b.current_grade || '');
        case 'team': {
          const aTeam = a.teams?.[0]?.name || 'ZZZ';
          const bTeam = b.teams?.[0]?.name || 'ZZZ';
          return aTeam.localeCompare(bTeam);
        }
        default:
          return 0;
      }
    });

    return result;
  }, [players, teamFilter, gradeFilter, paymentFilter, searchTerm, sortBy, quickFilters]);

  const hasActiveFilters = teamFilter !== 'all' || gradeFilter !== 'all' || paymentFilter !== 'all' || searchTerm ||
    quickFilters.unassigned || quickFilters.unpaid || quickFilters.newPlayers || quickFilters.tournamentRoster;

  const toggleQuickFilter = (filterName) => {
    setQuickFilters((prev) => ({ ...prev, [filterName]: !prev[filterName] }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTeamFilter('all');
    setGradeFilter('all');
    setPaymentFilter('all');
    setQuickFilters({
      unassigned: false,
      unpaid: false,
      newPlayers: false,
      tournamentRoster: false,
    });
  };

  const handleCreate = () => {
    setEditingPlayer(null);
    setModalOpen(true);
  };

  const handleEdit = (player) => {
    setEditingPlayer(player);
    setModalOpen(true);
  };

  const handleSave = async (formData) => {
    setIsSaving(true);
    try {
      const cleanData = { ...formData };
      Object.keys(cleanData).forEach((key) => {
        if (cleanData[key] === '') cleanData[key] = null;
      });

      if (editingPlayer) {
        await updatePlayer(editingPlayer.id, cleanData);
      } else {
        await createPlayer(cleanData);
      }
      setModalOpen(false);
      setEditingPlayer(null);
    } catch (err) {
      console.error('Error saving player:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (player) => {
    if (player.teams?.length > 0) {
      alert(`Remove ${player.first_name} from all teams before deleting.`);
      return;
    }
    setDeleteConfirm(player);
  };

  const confirmDelete = async () => {
    try {
      await deletePlayer(deleteConfirm.id);
      setDeleteConfirm(null);
      if (selectedPlayer?.id === deleteConfirm.id) {
        setSelectedPlayer(null);
      }
    } catch (err) {
      console.error('Error deleting player:', err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleRowClick = (player) => {
    setSelectedPlayer(player);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(new Set(filteredPlayers.map((p) => p.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (playerId, e) => {
    e.stopPropagation();
    const newSet = new Set(selectedRows);
    if (newSet.has(playerId)) {
      newSet.delete(playerId);
    } else {
      newSet.add(playerId);
    }
    setSelectedRows(newSet);
  };

  const handleExport = () => {
    // Escape CSV values to handle commas, quotes, and newlines
    const escapeCSV = (val) => {
      const str = String(val ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = [
      'First Name',
      'Last Name',
      'Grade',
      'Date of Birth',
      'Gender',
      'Jersey #',
      'Position',
      'Team(s)',
      'Payment Status',
      'Parent Name',
      'Parent Email',
      'Parent Phone',
    ];

    const rows = filteredPlayers.map((p) => [
      p.first_name,
      p.last_name,
      p.current_grade || '',
      p.date_of_birth || '',
      p.gender || '',
      p.jersey_number || '',
      p.position || '',
      p.teams?.map((t) => t.name).join('; ') || '',
      p.payment_status || '',
      p.primary_parent ? `${p.primary_parent.first_name} ${p.primary_parent.last_name}` : '',
      p.primary_parent?.email || '',
      p.primary_parent?.phone || '',
    ]);

    const csv = [headers, ...rows].map((row) => row.map(escapeCSV).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tne-players.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-stone-100 text-stone-900 antialiased min-h-screen flex flex-col font-sans">
      <AdminNavbar />

      <div className="flex-1 flex overflow-hidden">
        {/* Main Table Panel */}
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${
            selectedPlayer ? 'mr-[480px]' : ''
          }`}
        >
          {/* Filter Bar */}
          <div className="bg-white border-b border-stone-200 px-4 py-4">
            {/* Search + Dropdowns + Actions Row */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              {/* Sort dropdown */}
              <FilterDropdown
                value={sortBy}
                options={[
                  { value: 'name', label: 'Name' },
                  { value: 'grade', label: 'Grade' },
                  { value: 'team', label: 'Team' },
                ]}
                onChange={setSortBy}
              />

              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
                />
              </div>

              {/* Team Filter */}
              <FilterDropdown
                value={teamFilter}
                options={teamOptions}
                onChange={setTeamFilter}
              />

              {/* Grade Filter */}
              <FilterDropdown
                value={gradeFilter}
                options={[
                  { value: 'all', label: 'All Grades' },
                  ...GRADES.map((g) => ({ value: g, label: `${g} Grade` })),
                ]}
                onChange={setGradeFilter}
              />

              {/* Payment Filter */}
              <FilterDropdown
                value={paymentFilter}
                options={[
                  { value: 'all', label: 'All Payments' },
                  { value: 'paid', label: 'Paid' },
                  { value: 'partial', label: 'Partial' },
                  { value: 'pending', label: 'Unpaid' },
                  { value: 'waived', label: 'Waived' },
                ]}
                onChange={setPaymentFilter}
              />

              {/* Actions */}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={refetch}
                  className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={handleExport}
                  className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                  title="Export"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCreate}
                  className="flex items-center gap-2 px-4 py-2 bg-tne-red text-white text-sm font-medium rounded-lg hover:bg-tne-red-dark transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Player
                </button>
              </div>
            </div>

            {/* Quick Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-stone-500 uppercase tracking-wide mr-1">Quick filters:</span>

              <FilterPill
                active={quickFilters.unassigned}
                onClick={() => toggleQuickFilter('unassigned')}
                variant="error"
                icon={<AlertCircle className="w-3.5 h-3.5" />}
                count={filterCounts.unassigned}
              >
                Unassigned
              </FilterPill>

              <FilterPill
                active={quickFilters.unpaid}
                onClick={() => toggleQuickFilter('unpaid')}
                variant="error"
                count={filterCounts.unpaid}
              >
                Unpaid
              </FilterPill>

              <FilterPill
                active={quickFilters.newPlayers}
                onClick={() => toggleQuickFilter('newPlayers')}
                variant="warning"
              >
                New Players
              </FilterPill>

              <FilterPill
                active={quickFilters.tournamentRoster}
                onClick={() => toggleQuickFilter('tournamentRoster')}
                variant="default"
              >
                Tournament Roster
              </FilterPill>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-stone-500 hover:text-stone-700 hover:bg-stone-100 transition-colors ml-2"
                >
                  <X className="w-3 h-3" />
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto bg-white">
            {error && (
              <div className="m-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Failed to load players: {error}
              </div>
            )}

            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="h-14 bg-stone-100 rounded animate-pulse" />
                ))}
              </div>
            ) : filteredPlayers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <User className="w-12 h-12 text-stone-300 mb-4" />
                <h3 className="text-lg font-medium text-stone-900 mb-2">
                  {hasActiveFilters ? 'No players found' : 'No players yet'}
                </h3>
                <p className="text-stone-500 mb-6">
                  {hasActiveFilters ? 'Try adjusting your filters' : 'Add your first player to get started'}
                </p>
                {!hasActiveFilters && (
                  <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-tne-red hover:bg-tne-red-dark text-white font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Player
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-stone-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left w-10">
                      <input
                        type="checkbox"
                        checked={selectedRows.size === filteredPlayers.length && filteredPlayers.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-stone-300 text-tne-red focus:ring-tne-red"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Player
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Grade
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Team
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Parent/Guardian
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Payment
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredPlayers.map((player) => {
                    const age = calculateAge(player.date_of_birth);
                    const isUnassigned = !player.teams || player.teams.length === 0;
                    const isSelected = selectedPlayer?.id === player.id;

                    return (
                      <tr
                        key={player.id}
                        onClick={() => handleRowClick(player)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-red-50'
                            : isUnassigned
                              ? 'bg-red-50/30 hover:bg-red-50/50'
                              : 'hover:bg-stone-50'
                        }`}
                        data-testid={`player-row-${player.id}`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedRows.has(player.id)}
                            onChange={(e) => handleSelectRow(player.id, e)}
                            onClick={(e) => e.stopPropagation()}
                            className="rounded border-stone-300 text-tne-red focus:ring-tne-red"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-tne-red flex items-center justify-center text-white text-xs font-semibold">
                              {player.first_name[0]}{player.last_name[0]}
                            </div>
                            <div>
                              <p className="font-medium text-stone-900">
                                {player.first_name} {player.last_name}
                              </p>
                              <p className="text-xs text-stone-500">
                                {age && `${age} yrs`}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <GradeBadge grade={player.current_grade} />
                        </td>
                        <td className="px-4 py-3">
                          {player.teams?.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {player.teams.map((team) => (
                                <TeamBadge key={team.id} team={team} />
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm text-stone-500">Unassigned</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-stone-600">
                          {player.primary_parent ? (
                            `${player.primary_parent.first_name} ${player.primary_parent.last_name}`
                          ) : (
                            <span className="text-stone-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {player.primary_parent?.phone ? (
                            <div className="flex items-center gap-1.5 text-sm text-stone-600">
                              <Phone className="w-3.5 h-3.5 text-stone-400" />
                              {player.primary_parent.phone}
                            </div>
                          ) : (
                            <span className="text-sm text-stone-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {player.payment_status ? (
                            <PaymentBadge status={player.payment_status} />
                          ) : (
                            <span className="text-sm text-stone-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer */}
          <div className="bg-white border-t border-stone-200 px-4 py-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-stone-500">
                {selectedRows.size > 0
                  ? `${selectedRows.size} selected`
                  : `${filteredPlayers.length} of ${players.length} player${players.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
        </div>

        {/* Detail Panel */}
        {selectedPlayer && (
          <PlayerDetailPanel
            player={selectedPlayer}
            onClose={() => setSelectedPlayer(null)}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Add/Edit Modal */}
      <PlayerModal
        key={editingPlayer?.id || 'new'}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingPlayer(null);
        }}
        player={editingPlayer}
        teams={teams}
        onSave={handleSave}
        onAssignTeam={assignPlayerToTeam}
        onRemoveTeam={removePlayerFromTeam}
        isSaving={isSaving}
      />

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-stone-900 mb-2">Delete Player?</h3>
            <p className="text-stone-600 mb-6">
              Are you sure you want to delete{' '}
              <strong>
                {deleteConfirm.first_name} {deleteConfirm.last_name}
              </strong>
              ? This action cannot be undone.
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
