import { useState, useMemo } from 'react';
import { useCoaches } from '@/hooks/useCoaches';
import { getGradeColor, formatGradeShort } from '@/utils/gradeColors';
import AdminNavbar from '@/components/AdminNavbar';
import CoachDetailPanel from '@/components/admin/CoachDetailPanel';
import {
  CertBadge,
  StatusBadge,
  FilterPill,
} from '@/components/admin/AdminBadges';
import {
  Plus,
  Search,
  RefreshCw,
  Download,
  X,
  Loader2,
  ChevronDown,
  Mail,
  Phone,
  User,
  AlertCircle,
  Shield,
  Users,
  Clock,
  ChevronRight,
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

// Coach Status Badge (for table display)
function CoachStatusBadge({ isActive }) {
  return (
    <StatusBadge status={isActive ? 'active' : 'inactive'} />
  );
}

// Certification Legend Component
function CertificationLegend() {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4 mb-4">
      <div className="flex flex-wrap items-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-stone-700">Legend:</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded border bg-stone-100 text-stone-600 font-medium">USA</span>
          <span className="text-stone-500">= USA Basketball</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded border bg-stone-100 text-stone-600 font-medium">CPR</span>
          <span className="text-stone-500">= CPR/First Aid</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded border bg-stone-100 text-stone-600 font-medium">BG</span>
          <span className="text-stone-500">= Background Check</span>
        </div>
        <div className="h-4 border-l border-stone-200 mx-2" />
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-stone-500">Valid</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-stone-500">Expiring</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-stone-300" />
            <span className="text-stone-500">Missing</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stats Card Component
function StatsCard(props) {
  const { label, value, icon, color = 'stone' } = props;
  const IconComponent = icon;
  const colorClasses = {
    stone: 'bg-stone-50 border-stone-200 text-stone-600',
    green: 'bg-emerald-50 border-emerald-200 text-emerald-600',
    amber: 'bg-amber-50 border-amber-200 text-amber-600',
    orange: 'bg-orange-50 border-orange-200 text-orange-600',
    red: 'bg-red-50 border-red-200 text-red-600',
  };

  return (
    <div className={`p-4 rounded-xl border ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-1">
        <IconComponent className="w-4 h-4" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
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
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  // Quick Filter State
  const [quickFilters, setQuickFilters] = useState({
    missingCerts: false,
    expiringSoon: false,
    noTeam: false,
  });

  // Compute filter counts
  const filterCounts = useMemo(() => {
    const activeCoaches = coaches.filter((c) => c.is_active);
    return {
      active: activeCoaches.length,
      pending: coaches.filter((c) => !c.is_active).length,
      missingCerts: coaches.filter((c) =>
        !c.has_usa_cert || !c.has_cpr_cert || !c.has_background_check
      ).length,
      expiringSoon: coaches.filter((c) => {
        const now = new Date();
        const soon = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        return (c.usa_cert_expires && new Date(c.usa_cert_expires) <= soon) ||
               (c.cpr_cert_expires && new Date(c.cpr_cert_expires) <= soon);
      }).length,
      noTeam: coaches.filter((c) => !c.teams || c.teams.length === 0).length,
      teamsNeedCoach: 0, // Would need teams data to calculate
    };
  }, [coaches]);

  // Filter coaches
  const filteredCoaches = useMemo(() => {
    return coaches.filter((coach) => {
      // Quick Filters
      if (quickFilters.missingCerts) {
        if (coach.has_usa_cert && coach.has_cpr_cert && coach.has_background_check) return false;
      }
      if (quickFilters.expiringSoon) {
        const now = new Date();
        const soon = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const isExpiring = (coach.usa_cert_expires && new Date(coach.usa_cert_expires) <= soon) ||
                          (coach.cpr_cert_expires && new Date(coach.cpr_cert_expires) <= soon);
        if (!isExpiring) return false;
      }
      if (quickFilters.noTeam) {
        if (coach.teams && coach.teams.length > 0) return false;
      }

      // Status filter
      if (statusFilter === 'active' && !coach.is_active) return false;
      if (statusFilter === 'inactive' && coach.is_active) return false;

      // Role filter
      if (roleFilter !== 'all' && coach.role !== roleFilter) return false;

      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const fullName = `${coach.first_name} ${coach.last_name}`.toLowerCase();
        const email = coach.email?.toLowerCase() || '';
        const phone = coach.phone || '';

        if (!fullName.includes(search) && !email.includes(search) && !phone.includes(search)) {
          return false;
        }
      }

      return true;
    });
  }, [coaches, quickFilters, statusFilter, roleFilter, searchTerm]);

  const hasActiveFilters = statusFilter !== 'all' || roleFilter !== 'all' || searchTerm ||
    quickFilters.missingCerts || quickFilters.expiringSoon || quickFilters.noTeam;

  const toggleQuickFilter = (filterName) => {
    setQuickFilters((prev) => ({ ...prev, [filterName]: !prev[filterName] }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setRoleFilter('all');
    setQuickFilters({
      missingCerts: false,
      expiringSoon: false,
      noTeam: false,
    });
  };

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
    <div className="bg-stone-100 text-stone-900 antialiased min-h-screen font-sans">
      <AdminNavbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Coaches</h1>
            <p className="text-sm text-stone-500 mt-1">
              {filteredCoaches.length} of {coaches.length} coach{coaches.length !== 1 ? 'es' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
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
              className="flex items-center gap-2 px-5 py-2.5 bg-tne-red text-white text-sm font-semibold rounded-xl hover:bg-tne-red-dark transition-colors shadow-lg shadow-tne-red/20"
            >
              <Plus className="w-4 h-4" />
              Add Coach
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">Failed to load coaches: {error}</span>
            <button onClick={refetch} className="ml-auto text-red-800 underline hover:text-red-900 font-medium whitespace-nowrap">
              Retry
            </button>
          </div>
        )}

        {/* Filter Card */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 mb-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tne-maroon/20 focus:border-tne-maroon/50 transition-all"
              />
            </div>

            {/* Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              <FilterDropdown
                value={statusFilter}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
                onChange={setStatusFilter}
              />
              <FilterDropdown
                value={roleFilter}
                options={[
                  { value: 'all', label: 'All Roles' },
                  { value: 'head_coach', label: 'Head Coach' },
                  { value: 'assistant_coach', label: 'Assistant' },
                  { value: 'trainer', label: 'Skills Trainer' },
                ]}
                onChange={setRoleFilter}
              />
            </div>
          </div>

          {/* Quick Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-stone-100">
            <span className="text-xs text-stone-400 font-medium">Quick filters:</span>

            <FilterPill
              active={quickFilters.missingCerts}
              onClick={() => toggleQuickFilter('missingCerts')}
              variant="error"
              icon={<AlertCircle className="w-3.5 h-3.5" />}
              count={filterCounts.missingCerts}
            >
              Missing Certs
            </FilterPill>

            <FilterPill
              active={quickFilters.expiringSoon}
              onClick={() => toggleQuickFilter('expiringSoon')}
              variant="warning"
              icon={<Clock className="w-3.5 h-3.5" />}
              count={filterCounts.expiringSoon}
            >
              Expiring Soon
            </FilterPill>

            <FilterPill
              active={quickFilters.noTeam}
              onClick={() => toggleQuickFilter('noTeam')}
              variant="default"
              count={filterCounts.noTeam}
            >
              No Team
            </FilterPill>

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

        {/* Certification Legend */}
        <CertificationLegend />

        {/* Coaches Table */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
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
                  {hasActiveFilters
                    ? 'No coaches found'
                    : 'No coaches yet'}
                </h3>
                <p className="text-stone-500 mb-6">
                  {error
                    ? 'There was a problem loading data'
                    : hasActiveFilters
                      ? 'Try adjusting your filters'
                      : 'Add your first coach to get started'}
                </p>
                {error ? (
                  <button
                    onClick={refetch}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-tne-red hover:bg-tne-red-dark text-white font-medium transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Retry
                  </button>
                ) : !hasActiveFilters && (
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
              <div className="overflow-x-auto">
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
                    <th className="w-10 px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredCoaches.map((coach) => {
                    const hasMissingCerts = !coach.has_usa_cert || !coach.has_cpr_cert || !coach.has_background_check;
                    const isSelected = selectedCoach?.id === coach.id;

                    return (
                      <tr
                        key={coach.id}
                        onClick={() => handleRowClick(coach)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-red-50'
                            : hasMissingCerts
                              ? 'bg-red-50/30 hover:bg-red-50/50'
                              : 'hover:bg-stone-50'
                        }`}
                        data-testid={`coach-row-${coach.id}`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-tne-red flex items-center justify-center text-white text-xs font-semibold">
                              {coach.first_name[0]}
                              {coach.last_name[0]}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-stone-900">
                                  {coach.first_name} {coach.last_name}
                                </p>
                                {hasMissingCerts && (
                                  <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                                )}
                              </div>
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
                            <span className="text-sm text-stone-500">
                              Unassigned
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            <CertBadge label="USA" hasIt={coach.has_usa_cert} expiresAt={coach.usa_cert_expires} />
                            <CertBadge label="CPR" hasIt={coach.has_cpr_cert} expiresAt={coach.cpr_cert_expires} />
                            <CertBadge label="BG" hasIt={coach.has_background_check} />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <CoachStatusBadge isActive={coach.is_active} />
                        </td>
                        <td className="px-4 py-3">
                          <ChevronRight className="w-4 h-4 text-stone-400" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            )}
        </div>

        {/* Stats Cards */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            label="Active Coaches"
            value={filterCounts.active}
            icon={Users}
            color="green"
          />
          <StatsCard
            label="Pending Approval"
            value={filterCounts.pending}
            icon={Clock}
            color="amber"
          />
          <StatsCard
            label="Expiring Soon"
            value={filterCounts.expiringSoon}
            icon={AlertCircle}
            color="orange"
          />
          <StatsCard
            label="Missing Certs"
            value={filterCounts.missingCerts}
            icon={Shield}
            color="red"
          />
        </div>
      </main>

      {/* Detail Panel */}
      {selectedCoach && (
        <CoachDetailPanel
          coach={selectedCoach}
          onClose={() => setSelectedCoach(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

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
