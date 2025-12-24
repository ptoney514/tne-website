import { useState } from 'react';
import { useTournaments } from '../hooks/useTournaments';
import { useTeams } from '../hooks/useTeams';
import AdminNavbar from '../components/AdminNavbar';

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

const CalendarIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const MapPinIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

const DollarIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Status badge colors
const statusColors = {
  upcoming: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-green-100 text-green-700',
  completed: 'bg-stone-100 text-stone-700',
  cancelled: 'bg-red-100 text-red-700',
};

// Format date for display
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Tournament Modal
function TournamentModal({ isOpen, onClose, tournament, onSave, isSaving }) {
  const [formData, setFormData] = useState(
    tournament || {
      name: '',
      description: '',
      location: '',
      address: '',
      start_date: '',
      end_date: '',
      registration_deadline: '',
      entry_fee: '',
      max_teams: '',
      age_groups: [],
      is_featured: false,
      status: 'upcoming',
      external_url: '',
      notes: '',
    }
  );

  const ageGroupOptions = ['3rd', '4th', '5th', '6th', '7th', '8th', 'HS'];

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(formData);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAgeGroup = (grade) => {
    setFormData((prev) => ({
      ...prev,
      age_groups: prev.age_groups?.includes(grade)
        ? prev.age_groups.filter((g) => g !== grade)
        : [...(prev.age_groups || []), grade],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
          <h2 className="text-lg font-semibold text-stone-900">
            {tournament ? 'Edit Tournament' : 'Create Tournament'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-stone-100 rounded-lg transition-colors text-stone-500">
            <XIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-stone-700 mb-1">Tournament Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
                placeholder="e.g., MLK Weekend Classic"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
                placeholder="Tournament details..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Location *</label>
              <input
                type="text"
                required
                value={formData.location || ''}
                onChange={(e) => handleChange('location', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
                placeholder="e.g., Omaha Sports Complex"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Address</label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
                placeholder="Full address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={formData.start_date || ''}
                onChange={(e) => handleChange('start_date', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">End Date</label>
              <input
                type="date"
                value={formData.end_date || ''}
                onChange={(e) => handleChange('end_date', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Registration Deadline</label>
              <input
                type="date"
                value={formData.registration_deadline || ''}
                onChange={(e) => handleChange('registration_deadline', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Entry Fee ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.entry_fee || ''}
                onChange={(e) => handleChange('entry_fee', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
                placeholder="350.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Max Teams</label>
              <input
                type="number"
                value={formData.max_teams || ''}
                onChange={(e) => handleChange('max_teams', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
                placeholder="16"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
              >
                <option value="upcoming">Upcoming</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-stone-700 mb-2">Age Groups</label>
              <div className="flex flex-wrap gap-2">
                {ageGroupOptions.map((grade) => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => toggleAgeGroup(grade)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      formData.age_groups?.includes(grade)
                        ? 'bg-tne-red text-white'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {grade === 'HS' ? 'High School' : `${grade} Grade`}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-stone-700 mb-1">Tournament Website URL</label>
              <input
                type="url"
                value={formData.external_url || ''}
                onChange={(e) => handleChange('external_url', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
                placeholder="https://..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-stone-700 mb-1">Notes</label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
                placeholder="Internal notes..."
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_featured"
                checked={formData.is_featured}
                onChange={(e) => handleChange('is_featured', e.target.checked)}
                className="rounded border-stone-300"
              />
              <label htmlFor="is_featured" className="text-sm text-stone-700">
                Featured tournament (show prominently on public site)
              </label>
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
              {isSaving && <LoaderIcon />}
              {tournament ? 'Update Tournament' : 'Create Tournament'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Registrations Modal
function RegistrationsModal({ isOpen, onClose, tournament, teams, onRegister, onUpdateRegistration, onRemoveRegistration }) {
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  if (!isOpen || !tournament) return null;

  const registeredTeamIds = tournament.registrations?.map((r) => r.team_id) || [];
  const availableTeams = teams.filter((t) => !registeredTeamIds.includes(t.id));

  const handleAddTeam = async () => {
    if (!selectedTeamId) return;
    setIsAdding(true);
    try {
      await onRegister(tournament.id, selectedTeamId);
      setSelectedTeamId('');
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsAdding(false);
    }
  };

  const paymentStatusColors = {
    pending: 'bg-amber-100 text-amber-700',
    paid: 'bg-green-100 text-green-700',
    waived: 'bg-blue-100 text-blue-700',
    refunded: 'bg-stone-100 text-stone-700',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
          <div>
            <h2 className="text-lg font-semibold text-stone-900">{tournament.name}</h2>
            <p className="text-sm text-stone-500">
              {tournament.registrations?.length || 0} teams registered
              {tournament.max_teams && ` / ${tournament.max_teams} max`}
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-stone-100 rounded-lg transition-colors text-stone-500">
            <XIcon />
          </button>
        </div>

        <div className="p-6">
          {/* Add Team */}
          <div className="flex gap-2 mb-6">
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
            >
              <option value="">Select a team to register...</option>
              {availableTeams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name} ({team.grade_level} - {team.gender === 'male' ? 'Boys' : 'Girls'})
                </option>
              ))}
            </select>
            <button
              onClick={handleAddTeam}
              disabled={!selectedTeamId || isAdding}
              className="px-4 py-2 rounded-lg bg-tne-red hover:bg-tne-red-dark text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isAdding ? <LoaderIcon /> : <PlusIcon />}
              Register
            </button>
          </div>

          {/* Registered Teams */}
          {tournament.registrations?.length > 0 ? (
            <div className="space-y-2">
              {tournament.registrations.map((reg) => (
                <div
                  key={reg.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200"
                >
                  <div>
                    <p className="font-medium text-stone-900">{reg.team?.name || 'Unknown Team'}</p>
                    <p className="text-sm text-stone-500">
                      {reg.team?.grade_level} - {reg.team?.gender === 'male' ? 'Boys' : 'Girls'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={reg.payment_status}
                      onChange={(e) => onUpdateRegistration(reg.id, { payment_status: e.target.value })}
                      className={`px-2 py-1 rounded text-xs font-medium border-0 ${paymentStatusColors[reg.payment_status]}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="waived">Waived</option>
                      <option value="refunded">Refunded</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Placement"
                      value={reg.placement || ''}
                      onChange={(e) => onUpdateRegistration(reg.id, { placement: e.target.value })}
                      className="w-28 px-2 py-1 rounded-lg border border-stone-300 text-sm text-stone-900"
                    />
                    <button
                      onClick={() => onRemoveRegistration(reg.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-stone-400 hover:text-red-500"
                      title="Remove registration"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-stone-500">
              No teams registered yet. Select a team above to register.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Tournament Card
function TournamentCard({ tournament, onEdit, onDelete, onManageRegistrations }) {
  const daysUntil = Math.ceil(
    (new Date(tournament.start_date) - new Date()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="rounded-2xl bg-white border border-stone-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="px-4 py-3 bg-stone-900 text-white">
        <div className="flex items-center justify-between">
          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${statusColors[tournament.status]}`}>
            {tournament.status.replace('_', ' ')}
          </span>
          {tournament.is_featured && (
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500 text-white">
              FEATURED
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-stone-900">{tournament.name}</h3>

        <div className="mt-3 space-y-2 text-sm text-stone-600">
          <div className="flex items-center gap-2">
            <CalendarIcon />
            <span>
              {formatDate(tournament.start_date)}
              {tournament.end_date && tournament.end_date !== tournament.start_date && (
                <> - {formatDate(tournament.end_date)}</>
              )}
            </span>
          </div>

          {tournament.location && (
            <div className="flex items-center gap-2">
              <MapPinIcon />
              <span>{tournament.location}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <UsersIcon />
            <span>
              {tournament.registered_teams_count} teams registered
              {tournament.max_teams && ` / ${tournament.max_teams}`}
            </span>
          </div>

          {tournament.entry_fee && (
            <div className="flex items-center gap-2">
              <DollarIcon />
              <span>${parseFloat(tournament.entry_fee).toFixed(2)} entry fee</span>
            </div>
          )}
        </div>

        {tournament.age_groups?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {tournament.age_groups.map((grade) => (
              <span
                key={grade}
                className="px-2 py-0.5 rounded bg-stone-100 text-stone-600 text-xs font-medium"
              >
                {grade}
              </span>
            ))}
          </div>
        )}

        {tournament.status === 'upcoming' && daysUntil > 0 && (
          <p className="mt-3 text-xs text-tne-red font-medium">
            {daysUntil} days until tournament
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-stone-100 flex items-center justify-between">
        <button
          onClick={() => onManageRegistrations(tournament)}
          className="text-sm text-tne-red hover:text-tne-red-dark font-medium transition-colors"
        >
          Manage Teams
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(tournament)}
            className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors text-stone-400 hover:text-stone-600"
            title="Edit tournament"
          >
            <EditIcon />
          </button>
          <button
            onClick={() => onDelete(tournament)}
            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-stone-400 hover:text-red-500"
            title="Delete tournament"
          >
            <TrashIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

// Create Tournament Placeholder Card
function CreateTournamentCard({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl border-2 border-dashed border-stone-300 bg-white/50 p-8 flex flex-col items-center justify-center gap-3 hover:border-stone-400 hover:bg-white transition-all min-h-[280px]"
    >
      <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center">
        <PlusIcon />
      </div>
      <span className="text-sm font-medium text-stone-600">Add Tournament</span>
    </button>
  );
}

export default function AdminTournamentsPage() {
  const { tournaments, loading, error, createTournament, updateTournament, deleteTournament, registerTeam, updateRegistration, removeRegistration } = useTournaments();
  const { teams } = useTeams();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTournament, setEditingTournament] = useState(null);
  const [registrationsModalOpen, setRegistrationsModalOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleCreate = () => {
    setEditingTournament(null);
    setModalOpen(true);
  };

  const handleEdit = (tournament) => {
    setEditingTournament(tournament);
    setModalOpen(true);
  };

  const handleSave = async (formData) => {
    setIsSaving(true);
    try {
      const cleanData = { ...formData };
      if (!cleanData.entry_fee) cleanData.entry_fee = null;
      if (!cleanData.max_teams) cleanData.max_teams = null;
      if (!cleanData.end_date) cleanData.end_date = null;
      if (!cleanData.registration_deadline) cleanData.registration_deadline = null;

      if (editingTournament) {
        await updateTournament(editingTournament.id, cleanData);
      } else {
        await createTournament(cleanData);
      }
      setModalOpen(false);
      setEditingTournament(null);
    } catch (err) {
      console.error('Error saving tournament:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (tournament) => {
    setDeleteConfirm(tournament);
  };

  const confirmDelete = async () => {
    try {
      await deleteTournament(deleteConfirm.id);
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting tournament:', err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleManageRegistrations = (tournament) => {
    setSelectedTournament(tournament);
    setRegistrationsModalOpen(true);
  };

  // Refresh selected tournament data when tournaments change
  const currentSelectedTournament = selectedTournament
    ? tournaments.find((t) => t.id === selectedTournament.id)
    : null;

  return (
    <div className="bg-stone-100 text-stone-900 antialiased min-h-screen">
      <AdminNavbar />

      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-stone-900 flex items-center gap-3">
                <TrophyIcon />
                Tournaments
              </h1>
              <p className="text-stone-500 mt-1">
                Manage tournament registrations and track results
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-tne-red hover:bg-tne-red-dark text-white font-medium transition-colors"
            >
              <PlusIcon />
              Add Tournament
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Error State */}
        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            Failed to load tournaments: {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-white border border-stone-200 h-72 animate-pulse" />
            ))}
          </div>
        ) : tournaments.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-stone-100 flex items-center justify-center">
              <TrophyIcon />
            </div>
            <h3 className="text-lg font-medium text-stone-900 mb-2">No tournaments yet</h3>
            <p className="text-stone-500 mb-6">Add your first tournament to get started</p>
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-tne-red hover:bg-tne-red-dark text-white font-medium transition-colors"
            >
              <PlusIcon />
              Add Tournament
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tournaments.map((tournament) => (
              <TournamentCard
                key={tournament.id}
                tournament={tournament}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onManageRegistrations={handleManageRegistrations}
              />
            ))}
            <CreateTournamentCard onClick={handleCreate} />
          </div>
        )}
      </main>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <TournamentModal
          key={editingTournament?.id || 'new'}
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingTournament(null);
          }}
          tournament={editingTournament}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}

      {/* Registrations Modal */}
      {registrationsModalOpen && currentSelectedTournament && (
        <RegistrationsModal
          isOpen={registrationsModalOpen}
          onClose={() => {
            setRegistrationsModalOpen(false);
            setSelectedTournament(null);
          }}
          tournament={currentSelectedTournament}
          teams={teams}
          onRegister={registerTeam}
          onUpdateRegistration={updateRegistration}
          onRemoveRegistration={removeRegistration}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-stone-900 mb-2">Delete Tournament?</h3>
            <p className="text-stone-600 mb-6">
              Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This will also remove all team registrations.
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
