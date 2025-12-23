import { useState } from 'react';
import { useCoaches } from '../hooks/useCoaches';
import { getGradeColor, formatGradeShort } from '../utils/gradeColors';
import AdminNavbar from '../components/AdminNavbar';
import CoachDetailPanel from '../components/admin/CoachDetailPanel';
import {
  Plus,
  Search,
  RefreshCw,
  Download,
  X,
  Loader2,
  ChevronDown,
  User,
  Mail,
  Phone,
  Check,
  AlertCircle,
} from 'lucide-react';

const EMPTY_COACH_FORM = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  role: 'head_coach',
  years_with_org: 0,
  specialty: '',
  bio: '',
  has_usa_cert: false,
  has_cpr_cert: false,
  has_background_check: false,
  is_active: true,
};

// Coach Modal for Add/Edit
function CoachModal({ isOpen, onClose, coach, onSave, isSaving }) {
  // Use key prop on component to reset state when coach changes
  const initialData = coach || EMPTY_COACH_FORM;
  const [formData, setFormData] = useState(initialData);

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
          <h2 className="text-xl font-semibold text-stone-900">
            {coach ? 'Edit Coach' : 'Add Coach'}
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
              <label className="block text-sm font-medium text-stone-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => handleChange('first_name', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => handleChange('last_name', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Role
              </label>
              <select
                value={formData.role || 'head_coach'}
                onChange={(e) => handleChange('role', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
              >
                <option value="head_coach">Head Coach</option>
                <option value="assistant_coach">Assistant Coach</option>
                <option value="trainer">Trainer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Years with TNE
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={formData.years_with_org || 0}
                onChange={(e) =>
                  handleChange('years_with_org', parseInt(e.target.value) || 0)
                }
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Specialty
              </label>
              <input
                type="text"
                value={formData.specialty || ''}
                onChange={(e) => handleChange('specialty', e.target.value)}
                placeholder="e.g., Offense, Defense, Skills Development"
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Bio
              </label>
              <textarea
                value={formData.bio || ''}
                onChange={(e) => handleChange('bio', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red resize-none"
                placeholder="Brief coaching background and philosophy..."
              />
            </div>
          </div>

          {/* Certifications */}
          <div className="border-t border-stone-200 pt-4 mt-4">
            <h3 className="text-sm font-medium text-stone-900 mb-3">
              Certifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-stone-200 cursor-pointer hover:bg-stone-50 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.has_usa_cert}
                  onChange={(e) => handleChange('has_usa_cert', e.target.checked)}
                  className="rounded border-stone-300 text-tne-red focus:ring-tne-red"
                />
                <div>
                  <p className="text-sm font-medium text-stone-900">USA Basketball</p>
                  <p className="text-xs text-stone-500">Coaching certification</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border border-stone-200 cursor-pointer hover:bg-stone-50 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.has_cpr_cert}
                  onChange={(e) => handleChange('has_cpr_cert', e.target.checked)}
                  className="rounded border-stone-300 text-tne-red focus:ring-tne-red"
                />
                <div>
                  <p className="text-sm font-medium text-stone-900">CPR/First Aid</p>
                  <p className="text-xs text-stone-500">Medical certification</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border border-stone-200 cursor-pointer hover:bg-stone-50 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.has_background_check}
                  onChange={(e) =>
                    handleChange('has_background_check', e.target.checked)
                  }
                  className="rounded border-stone-300 text-tne-red focus:ring-tne-red"
                />
                <div>
                  <p className="text-sm font-medium text-stone-900">Background Check</p>
                  <p className="text-xs text-stone-500">Verified clear</p>
                </div>
              </label>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => handleChange('is_active', e.target.checked)}
              className="rounded border-stone-300 text-tne-red focus:ring-tne-red"
            />
            <label htmlFor="is_active" className="text-sm text-stone-700">
              Coach is active
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
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {coach ? 'Update Coach' : 'Add Coach'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Certification Badge
function CertBadge({ label, hasIt }) {
  return (
    <span
      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
        hasIt
          ? 'bg-green-100 text-green-700'
          : 'bg-stone-100 text-stone-400'
      }`}
    >
      {label}
    </span>
  );
}

// Team Grade Badge
function TeamGradeBadge({ grade }) {
  const color = getGradeColor(grade);
  return (
    <span
      className="px-2 py-0.5 rounded text-[10px] font-semibold text-white"
      style={{ backgroundColor: color.hex }}
    >
      {formatGradeShort(grade)}
    </span>
  );
}

// Status Badge
function StatusBadge({ isActive }) {
  return (
    <span
      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
        isActive
          ? 'bg-green-100 text-green-700'
          : 'bg-stone-100 text-stone-500'
      }`}
    >
      {isActive ? 'Active' : 'Inactive'}
    </span>
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

export default function AdminCoachesPage() {
  const {
    coaches,
    loading,
    error,
    refetch,
    createCoach,
    updateCoach,
    deleteCoach,
  } = useCoaches();

  // UI State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoach, setEditingCoach] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedCoach, setSelectedCoach] = useState(null);

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('name');
  const [statusFilter, setStatusFilter] = useState('all');
  const [certFilter, setCertFilter] = useState('all');

  // Filter coaches
  const filteredCoaches = coaches.filter((coach) => {
    // Status filter
    if (statusFilter === 'active' && !coach.is_active) return false;
    if (statusFilter === 'inactive' && coach.is_active) return false;

    // Certification filter
    if (certFilter === 'usa' && !coach.has_usa_cert) return false;
    if (certFilter === 'cpr' && !coach.has_cpr_cert) return false;
    if (certFilter === 'bg' && !coach.has_background_check) return false;

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      if (searchField === 'name') {
        const fullName = `${coach.first_name} ${coach.last_name}`.toLowerCase();
        if (!fullName.includes(search)) return false;
      } else if (searchField === 'email') {
        if (!coach.email?.toLowerCase().includes(search)) return false;
      } else if (searchField === 'phone') {
        if (!coach.phone?.includes(search)) return false;
      }
    }

    return true;
  });

  const handleCreate = () => {
    setEditingCoach(null);
    setModalOpen(true);
  };

  const handleEdit = (coach) => {
    setEditingCoach(coach);
    setModalOpen(true);
  };

  const handleSave = async (formData) => {
    setIsSaving(true);
    try {
      const cleanData = { ...formData };
      // Clean up empty strings
      Object.keys(cleanData).forEach((key) => {
        if (cleanData[key] === '') cleanData[key] = null;
      });

      if (editingCoach) {
        await updateCoach(editingCoach.id, cleanData);
      } else {
        await createCoach(cleanData);
      }
      setModalOpen(false);
      setEditingCoach(null);
    } catch (err) {
      console.error('Error saving coach:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (coach) => {
    if (coach.team_count > 0) {
      alert(
        `Cannot delete coach. They are assigned to ${coach.team_count} team(s). Remove them from all teams first.`
      );
      return;
    }
    setDeleteConfirm(coach);
  };

  const confirmDelete = async () => {
    try {
      await deleteCoach(deleteConfirm.id);
      setDeleteConfirm(null);
      if (selectedCoach?.id === deleteConfirm.id) {
        setSelectedCoach(null);
      }
    } catch (err) {
      console.error('Error deleting coach:', err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleRowClick = (coach) => {
    setSelectedCoach(coach);
  };

  const handleExport = () => {
    // Simple CSV export
    const headers = [
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Role',
      'Years with TNE',
      'USA Cert',
      'CPR Cert',
      'Background Check',
      'Status',
    ];
    const rows = filteredCoaches.map((c) => [
      c.first_name,
      c.last_name,
      c.email || '',
      c.phone || '',
      c.role || '',
      c.years_with_org || 0,
      c.has_usa_cert ? 'Yes' : 'No',
      c.has_cpr_cert ? 'Yes' : 'No',
      c.has_background_check ? 'Yes' : 'No',
      c.is_active ? 'Active' : 'Inactive',
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tne-coaches.csv';
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
            selectedCoach ? 'mr-[480px]' : ''
          }`}
        >
          {/* Toolbar */}
          <div className="bg-white border-b border-stone-200 px-4 py-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              {/* Left: Search and Filters */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Search */}
                <div className="flex items-center">
                  <FilterDropdown
                    label="Search by"
                    value={searchField}
                    options={[
                      { value: 'name', label: 'Name' },
                      { value: 'email', label: 'Email' },
                      { value: 'phone', label: 'Phone' },
                    ]}
                    onChange={setSearchField}
                  />
                  <div className="relative ml-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      placeholder={`Search by ${searchField}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64 pl-9 pr-4 py-1.5 rounded-lg border border-stone-300 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <FilterDropdown
                  label="Status"
                  value={statusFilter}
                  options={[
                    { value: 'all', label: 'All Status' },
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                  ]}
                  onChange={setStatusFilter}
                />

                {/* Certifications Filter */}
                <FilterDropdown
                  label="Certifications"
                  value={certFilter}
                  options={[
                    { value: 'all', label: 'All Certs' },
                    { value: 'usa', label: 'USA Basketball' },
                    { value: 'cpr', label: 'CPR/First Aid' },
                    { value: 'bg', label: 'Background Check' },
                  ]}
                  onChange={setCertFilter}
                />
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={refetch}
                  className="p-2 rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-50 transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={handleExport}
                  className="p-2 rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-50 transition-colors"
                  title="Export CSV"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCreate}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-tne-red hover:bg-tne-red-dark text-white font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Coach
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto bg-white">
            {error && (
              <div className="m-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Failed to load coaches: {error}
              </div>
            )}

            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="h-14 bg-stone-100 rounded animate-pulse"
                  />
                ))}
              </div>
            ) : filteredCoaches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <User className="w-12 h-12 text-stone-300 mb-4" />
                <h3 className="text-lg font-medium text-stone-900 mb-2">
                  {searchTerm || statusFilter !== 'all' || certFilter !== 'all'
                    ? 'No coaches found'
                    : 'No coaches yet'}
                </h3>
                <p className="text-stone-500 mb-6">
                  {searchTerm || statusFilter !== 'all' || certFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Add your first coach to get started'}
                </p>
                {!searchTerm && statusFilter === 'all' && certFilter === 'all' && (
                  <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-tne-red hover:bg-tne-red-dark text-white font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Coach
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-stone-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Coach
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Teams
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Certifications
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCoaches.map((coach) => (
                    <tr
                      key={coach.id}
                      onClick={() => handleRowClick(coach)}
                      className={`border-b border-stone-100 cursor-pointer transition-colors ${
                        selectedCoach?.id === coach.id
                          ? 'bg-tne-red/5'
                          : 'hover:bg-stone-50'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-tne-maroon to-tne-red flex items-center justify-center text-white text-xs font-bold">
                            {coach.first_name[0]}
                            {coach.last_name[0]}
                          </div>
                          <div>
                            <p className="font-medium text-stone-900">
                              {coach.first_name} {coach.last_name}
                            </p>
                            <p className="text-xs text-stone-500">
                              {coach.role === 'head_coach'
                                ? 'Head Coach'
                                : coach.role === 'assistant_coach'
                                ? 'Assistant'
                                : 'Trainer'}
                              {coach.years_with_org > 0 &&
                                ` \u2022 ${coach.years_with_org} yr${
                                  coach.years_with_org !== 1 ? 's' : ''
                                }`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {coach.email ? (
                          <div className="flex items-center gap-1.5 text-sm text-stone-600">
                            <Mail className="w-3.5 h-3.5 text-stone-400" />
                            {coach.email}
                          </div>
                        ) : (
                          <span className="text-sm text-stone-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {coach.phone ? (
                          <div className="flex items-center gap-1.5 text-sm text-stone-600">
                            <Phone className="w-3.5 h-3.5 text-stone-400" />
                            {coach.phone}
                          </div>
                        ) : (
                          <span className="text-sm text-stone-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {coach.teams?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {coach.teams.map((team) => (
                              <TeamGradeBadge
                                key={team.id}
                                grade={team.grade_level}
                              />
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-stone-400">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          <CertBadge label="USA" hasIt={coach.has_usa_cert} />
                          <CertBadge label="CPR" hasIt={coach.has_cpr_cert} />
                          <CertBadge label="BG" hasIt={coach.has_background_check} />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge isActive={coach.is_active} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer */}
          <div className="bg-white border-t border-stone-200 px-4 py-2">
            <p className="text-sm text-stone-500">
              {filteredCoaches.length} of {coaches.length} coach
              {coaches.length !== 1 ? 'es' : ''}
            </p>
          </div>
        </div>

        {/* Detail Panel */}
        {selectedCoach && (
          <CoachDetailPanel
            coach={selectedCoach}
            onClose={() => setSelectedCoach(null)}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Add/Edit Modal */}
      <CoachModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingCoach(null);
        }}
        coach={editingCoach}
        onSave={handleSave}
        isSaving={isSaving}
      />

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-stone-900 mb-2">
              Delete Coach?
            </h3>
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
