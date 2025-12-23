import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePlayers } from '../hooks/usePlayers';
import TeamsNavbar from '../components/TeamsNavbar';
import TeamsFooter from '../components/TeamsFooter';
import { Plus, Edit, Trash2, User, ChevronLeft, X, Loader2, Search } from 'lucide-react';

function PlayerModal({ isOpen, onClose, player, onSave, isSaving }) {
  const [formData, setFormData] = useState(
    player || {
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

  const currentYear = new Date().getFullYear();
  const graduatingYears = Array.from({ length: 12 }, (_, i) => currentYear + i);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-neutral-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-xl font-bebas">{player ? 'Edit Player' : 'Add Player'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => handleChange('first_name', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-tne-red/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => handleChange('last_name', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-tne-red/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">Date of Birth *</label>
              <input
                type="date"
                required
                value={formData.date_of_birth}
                onChange={(e) => handleChange('date_of_birth', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-tne-red/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">Gender *</label>
              <select
                required
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-tne-red/50"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">Current Grade *</label>
              <select
                required
                value={formData.current_grade}
                onChange={(e) => handleChange('current_grade', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-tne-red/50"
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
              <label className="block text-sm font-medium text-white/60 mb-1">Graduating Year *</label>
              <select
                required
                value={formData.graduating_year}
                onChange={(e) => handleChange('graduating_year', parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-tne-red/50"
              >
                {graduatingYears.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Basketball Info */}
          <div className="border-t border-white/10 pt-4 mt-4">
            <h3 className="text-sm font-medium text-white/80 mb-3">Basketball Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Jersey #</label>
                <input
                  type="text"
                  value={formData.jersey_number || ''}
                  onChange={(e) => handleChange('jersey_number', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-tne-red/50"
                  placeholder="23"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Jersey Size</label>
                <select
                  value={formData.jersey_size || ''}
                  onChange={(e) => handleChange('jersey_size', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-tne-red/50"
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
                <label className="block text-sm font-medium text-white/60 mb-1">Position</label>
                <select
                  value={formData.position || ''}
                  onChange={(e) => handleChange('position', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-tne-red/50"
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
                <label className="block text-sm font-medium text-white/60 mb-1">Years Exp</label>
                <input
                  type="number"
                  min="0"
                  max="15"
                  value={formData.years_experience || ''}
                  onChange={(e) => handleChange('years_experience', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-tne-red/50"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3">
              <input
                type="checkbox"
                id="prior_tne"
                checked={formData.prior_tne_player}
                onChange={(e) => handleChange('prior_tne_player', e.target.checked)}
                className="rounded border-white/20"
              />
              <label htmlFor="prior_tne" className="text-sm text-white/80">
                Prior TNE Player
              </label>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="border-t border-white/10 pt-4 mt-4">
            <h3 className="text-sm font-medium text-white/80 mb-3">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.emergency_contact_name || ''}
                  onChange={(e) => handleChange('emergency_contact_name', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-tne-red/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.emergency_contact_phone || ''}
                  onChange={(e) => handleChange('emergency_contact_phone', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-tne-red/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Relationship</label>
                <input
                  type="text"
                  value={formData.emergency_contact_relationship || ''}
                  onChange={(e) => handleChange('emergency_contact_relationship', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-tne-red/50"
                  placeholder="e.g., Mother, Father, Uncle"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="border-t border-white/10 pt-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Medical Notes</label>
                <textarea
                  value={formData.medical_notes || ''}
                  onChange={(e) => handleChange('medical_notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-tne-red/50 resize-none"
                  placeholder="Any allergies, conditions, or medications..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Notes</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-tne-red/50 resize-none"
                  placeholder="Any additional notes..."
                />
              </div>
            </div>
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
              {player ? 'Update Player' : 'Add Player'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PlayerRow({ player, onEdit, onDelete }) {
  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-medium">
            {player.first_name[0]}{player.last_name[0]}
          </div>
          <div>
            <p className="font-medium">{player.first_name} {player.last_name}</p>
            <p className="text-xs text-white/50">{player.current_grade} • {calculateAge(player.date_of_birth)} yrs</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-white/70">
        {player.position || '-'}
      </td>
      <td className="px-4 py-3 text-sm text-white/70">
        {player.jersey_number || '-'}
      </td>
      <td className="px-4 py-3">
        {player.teams?.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {player.teams.map((team) => (
              <span
                key={team.id}
                className="px-2 py-0.5 rounded-full text-xs bg-tne-red/20 text-tne-red"
              >
                {team.name}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-sm text-white/40">Unassigned</span>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-white/70">
        {player.primary_parent ? (
          <div>
            <p>{player.primary_parent.first_name} {player.primary_parent.last_name}</p>
            <p className="text-xs text-white/50">{player.primary_parent.phone}</p>
          </div>
        ) : (
          <span className="text-white/40">-</span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onEdit(player)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
            title="Edit player"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(player)}
            className="p-2 rounded-lg hover:bg-red-500/20 transition-colors text-white/60 hover:text-red-400"
            title="Delete player"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function AdminPlayersPage() {
  const { players, loading, error, createPlayer, updatePlayer, deletePlayer } = usePlayers();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPlayers = players.filter((player) => {
    const search = searchTerm.toLowerCase();
    return (
      player.first_name.toLowerCase().includes(search) ||
      player.last_name.toLowerCase().includes(search) ||
      player.current_grade.toLowerCase().includes(search) ||
      player.teams?.some((t) => t.name.toLowerCase().includes(search))
    );
  });

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
      // Clean up empty values
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
    } catch (err) {
      console.error('Error deleting player:', err);
      alert(`Error: ${err.message}`);
    }
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
                <h1 className="text-3xl font-bebas tracking-tight">Player Management</h1>
                <p className="text-white/60 mt-1">
                  {players.length} player{players.length !== 1 ? 's' : ''} registered
                </p>
              </div>
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-tne-red hover:bg-tne-red-dark text-white font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Player
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-tne-red/50"
              />
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
              Failed to load players: {error}
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
              <div className="space-y-3 p-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-white/5 rounded animate-pulse" />
                ))}
              </div>
            </div>
          ) : filteredPlayers.length === 0 ? (
            <div className="text-center py-16">
              <User className="w-12 h-12 mx-auto text-white/30 mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {searchTerm ? 'No players found' : 'No players yet'}
              </h3>
              <p className="text-white/60 mb-6">
                {searchTerm ? 'Try a different search term' : 'Add your first player to get started'}
              </p>
              {!searchTerm && (
                <button
                  onClick={handleCreate}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-tne-red hover:bg-tne-red-dark text-white font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Player
                </button>
              )}
            </div>
          ) : (
            <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Player</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Position</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Jersey</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Team(s)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Parent</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-white/60 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlayers.map((player) => (
                    <PlayerRow
                      key={player.id}
                      player={player}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <TeamsFooter />

      {/* Create/Edit Modal */}
      <PlayerModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingPlayer(null);
        }}
        player={editingPlayer}
        onSave={handleSave}
        isSaving={isSaving}
      />

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-neutral-900 rounded-2xl w-full max-w-md p-6 border border-white/10">
            <h3 className="text-lg font-semibold mb-2">Delete Player?</h3>
            <p className="text-white/70 mb-6">
              Are you sure you want to delete <strong>{deleteConfirm.first_name} {deleteConfirm.last_name}</strong>? This action cannot be undone.
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
