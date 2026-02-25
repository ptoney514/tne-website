import { useState, useMemo } from 'react';
import { useRegistrations } from '@/hooks/useRegistrations';
import AdminNavbar from '@/components/AdminNavbar';
import {
  GradeBadge,
  PaymentBadge,
  FilterPill,
} from '@/components/admin/AdminBadges';
import {
  Search,
  RefreshCw,
  Download,
  X,
  Loader2,
  ChevronDown,
  AlertCircle,
  Filter,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  UserPlus,
  Eye,
  MoreHorizontal,
  ChevronRight,
} from 'lucide-react';

// Status badge styles
const STATUS_STYLES = {
  pending: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Pending' },
  approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Approved' },
  rejected: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', label: 'Rejected' },
  waitlisted: { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500', label: 'Waitlisted' },
};

function RegistrationStatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full ${style.bg} ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}

// Filter Dropdown component
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

// Detail Panel for viewing registration details
function RegistrationDetailPanel({
  registration,
  teams,
  onClose,
  onUpdateStatus,
  onUpdatePayment,
  onAssignTeam,
  onConvert,
  onDelete,
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(registration.team_id || '');

  const handleStatusChange = async (newStatus) => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(registration.id, newStatus);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePaymentChange = async (newStatus) => {
    setIsUpdating(true);
    try {
      await onUpdatePayment(registration.id, newStatus);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTeamAssign = async () => {
    if (!selectedTeam) return;
    setIsUpdating(true);
    try {
      await onAssignTeam(registration.id, selectedTeam);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConvert = async () => {
    if (!confirm('Convert this registration to a player record? This will create a new player and parent in the system.')) return;
    setIsUpdating(true);
    try {
      await onConvert(registration);
      alert('Registration converted to player successfully!');
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed right-0 top-0 h-full w-[480px] bg-white border-l border-stone-200 shadow-xl z-40 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
        <div>
          <h2 className="text-lg font-semibold text-stone-900">
            {registration.player_first_name} {registration.player_last_name}
          </h2>
          <p className="text-sm text-stone-500">
            Submitted {formatDateTime(registration.created_at)}
            {registration.ip_address && (
              <span className="ml-2 text-stone-400">({registration.ip_address})</span>
            )}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-stone-100 rounded-lg transition-colors text-stone-500"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Status & Payment Row */}
        <div className="flex items-center gap-3">
          <RegistrationStatusBadge status={registration.status} />
          <PaymentBadge status={registration.payment_status} />
          {registration.player_id && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
              <CheckCircle className="w-3 h-3" />
              Converted
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-stone-900 uppercase tracking-wide">Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {registration.status === 'pending' && (
              <>
                <button
                  onClick={() => handleStatusChange('approved')}
                  disabled={isUpdating}
                  className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={() => handleStatusChange('rejected')}
                  disabled={isUpdating}
                  className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </>
            )}
            {registration.status === 'approved' && !registration.player_id && (
              <button
                onClick={handleConvert}
                disabled={isUpdating}
                className="col-span-2 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-tne-red text-white text-sm font-medium hover:bg-tne-red-dark disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                Convert to Player
              </button>
            )}
          </div>

          {/* Payment Status */}
          <div className="flex gap-2">
            <select
              value={registration.payment_status}
              onChange={(e) => handlePaymentChange(e.target.value)}
              disabled={isUpdating}
              className="flex-1 px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-tne-red/20"
            >
              <option value="pending">Payment Pending</option>
              <option value="partial">Partial Payment</option>
              <option value="paid">Paid</option>
              <option value="waived">Waived</option>
            </select>
          </div>

          {/* Team Assignment */}
          <div className="flex gap-2">
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-tne-red/20"
            >
              <option value="">Assign to team...</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleTeamAssign}
              disabled={!selectedTeam || isUpdating}
              className="px-3 py-2 rounded-lg bg-stone-800 text-white text-sm font-medium hover:bg-stone-700 disabled:opacity-50"
            >
              Assign
            </button>
          </div>
        </div>

        {/* Player Info */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-stone-900 uppercase tracking-wide">Player Information</h3>
          <div className="bg-stone-50 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-stone-500">Full Name</p>
                <p className="text-sm font-medium text-stone-900">
                  {registration.player_first_name} {registration.player_last_name}
                </p>
              </div>
              <div>
                <p className="text-xs text-stone-500">Date of Birth</p>
                <p className="text-sm font-medium text-stone-900">
                  {formatDate(registration.player_date_of_birth)}
                </p>
              </div>
              <div>
                <p className="text-xs text-stone-500">Grade</p>
                <GradeBadge grade={registration.player_current_grade} />
              </div>
              <div>
                <p className="text-xs text-stone-500">Gender</p>
                <p className="text-sm font-medium text-stone-900 capitalize">
                  {registration.player_gender}
                </p>
              </div>
              <div>
                <p className="text-xs text-stone-500">Jersey Size</p>
                <p className="text-sm font-medium text-stone-900">
                  {registration.jersey_size || '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-stone-500">Position</p>
                <p className="text-sm font-medium text-stone-900 capitalize">
                  {registration.position || '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-stone-500">Desired Jersey #</p>
                <p className="text-sm font-medium text-stone-900">
                  {registration.desired_jersey_number || '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-stone-500">Last Team</p>
                <p className="text-sm font-medium text-stone-900">
                  {registration.last_team_played_for || '-'}
                </p>
              </div>
            </div>
            {registration.medical_notes && (
              <div>
                <p className="text-xs text-stone-500">Medical Notes</p>
                <p className="text-sm text-stone-700">{registration.medical_notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Parent/Guardian Info */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-stone-900 uppercase tracking-wide">Parent/Guardian</h3>
          <div className="bg-stone-50 rounded-xl p-4 space-y-3">
            <div>
              <p className="text-xs text-stone-500">Name</p>
              <p className="text-sm font-medium text-stone-900">
                {registration.parent_first_name} {registration.parent_last_name}
                <span className="text-stone-500 ml-2">({registration.parent_relationship})</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-stone-400" />
              <a href={`mailto:${registration.parent_email}`} className="text-sm text-tne-red hover:underline">
                {registration.parent_email}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-stone-400" />
              <a href={`tel:${registration.parent_phone}`} className="text-sm text-stone-700">
                {registration.parent_phone}
              </a>
              <span className="text-xs text-stone-400">Cell</span>
            </div>
            {registration.parent_home_phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-stone-400" />
                <span className="text-sm text-stone-700">{registration.parent_home_phone}</span>
                <span className="text-xs text-stone-400">Home</span>
              </div>
            )}
            {registration.parent_address_street && (
              <div>
                <p className="text-xs text-stone-500">Address</p>
                <p className="text-sm text-stone-700">
                  {registration.parent_address_street}<br />
                  {registration.parent_address_city}, {registration.parent_address_state} {registration.parent_address_zip}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Parent/Guardian 2 */}
        {registration.parent2_name && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-stone-900 uppercase tracking-wide">Parent/Guardian 2</h3>
            <div className="bg-stone-50 rounded-xl p-4 space-y-2">
              <p className="text-sm font-medium text-stone-900">{registration.parent2_name}</p>
              {registration.parent2_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-stone-400" />
                  <span className="text-sm text-stone-700">{registration.parent2_phone}</span>
                </div>
              )}
              {registration.parent2_email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-stone-400" />
                  <a href={`mailto:${registration.parent2_email}`} className="text-sm text-tne-red hover:underline">
                    {registration.parent2_email}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Emergency Contact */}
        {registration.emergency_contact_name && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-stone-900 uppercase tracking-wide">Emergency Contact</h3>
            <div className="bg-stone-50 rounded-xl p-4 space-y-2">
              <p className="text-sm font-medium text-stone-900">
                {registration.emergency_contact_name}
                {registration.emergency_contact_relationship && (
                  <span className="text-stone-500 ml-2">({registration.emergency_contact_relationship})</span>
                )}
              </p>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-stone-400" />
                <span className="text-sm text-stone-700">{registration.emergency_contact_phone}</span>
              </div>
            </div>
          </div>
        )}

        {/* Team Assignment */}
        {registration.team && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-stone-900 uppercase tracking-wide">Assigned Team</h3>
            <div className="bg-tne-red/5 border border-tne-red/20 rounded-xl p-4">
              <p className="text-sm font-medium text-stone-900">{registration.team.name}</p>
              <p className="text-xs text-stone-500">
                {registration.team.grade_level} • {registration.team.gender === 'male' ? 'Boys' : 'Girls'}
              </p>
            </div>
          </div>
        )}

        {/* Waiver */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-stone-900 uppercase tracking-wide">Waiver</h3>
          <div className={`rounded-xl p-4 ${registration.waiver_accepted ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center gap-2">
              {registration.waiver_accepted ? (
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ${registration.waiver_accepted ? 'text-emerald-700' : 'text-red-700'}`}>
                {registration.waiver_accepted ? 'Waiver Accepted' : 'Waiver Not Accepted'}
              </span>
            </div>
            {registration.waiver_accepted_at && (
              <p className="text-xs text-stone-500 mt-1">
                Accepted on {formatDateTime(registration.waiver_accepted_at)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-stone-200 bg-stone-50">
        <button
          onClick={() => {
            if (confirm('Are you sure you want to delete this registration?')) {
              onDelete(registration.id);
              onClose();
            }
          }}
          className="text-sm text-red-600 hover:text-red-700 font-medium"
        >
          Delete Registration
        </button>
      </div>
    </div>
  );
}

export default function AdminRegistrationsPage() {
  const {
    registrations,
    teams,
    loading,
    error,
    refetch,
    updateStatus,
    updatePaymentStatus,
    assignToTeam,
    deleteRegistration,
    convertToPlayer,
  } = useRegistrations();

  // UI State
  const [selectedRegistration, setSelectedRegistration] = useState(null);

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [teamFilter, setTeamFilter] = useState('all');

  // Quick Filter State
  const [quickFilters, setQuickFilters] = useState({
    pending: false,
    unpaid: false,
    unassigned: false,
  });

  // Compute filter counts
  const filterCounts = useMemo(() => {
    return {
      pending: registrations.filter((r) => r.status === 'pending').length,
      unpaid: registrations.filter((r) => r.payment_status === 'pending').length,
      unassigned: registrations.filter((r) => !r.team_id).length,
    };
  }, [registrations]);

  // Filter registrations
  const filteredRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      // Quick filters
      if (quickFilters.pending && reg.status !== 'pending') return false;
      if (quickFilters.unpaid && reg.payment_status !== 'pending') return false;
      if (quickFilters.unassigned && reg.team_id) return false;

      // Dropdown filters
      if (statusFilter !== 'all' && reg.status !== statusFilter) return false;
      if (paymentFilter !== 'all' && reg.payment_status !== paymentFilter) return false;
      if (teamFilter !== 'all') {
        if (teamFilter === 'unassigned' && reg.team_id) return false;
        if (teamFilter !== 'unassigned' && reg.team_id !== teamFilter) return false;
      }

      // Search
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const playerName = `${reg.player_first_name} ${reg.player_last_name}`.toLowerCase();
        const parentName = `${reg.parent_first_name} ${reg.parent_last_name}`.toLowerCase();
        const email = reg.parent_email?.toLowerCase() || '';
        if (!playerName.includes(search) && !parentName.includes(search) && !email.includes(search)) {
          return false;
        }
      }

      return true;
    });
  }, [registrations, quickFilters, statusFilter, paymentFilter, teamFilter, searchTerm]);

  const hasActiveFilters = statusFilter !== 'all' || paymentFilter !== 'all' || teamFilter !== 'all' || searchTerm ||
    quickFilters.pending || quickFilters.unpaid || quickFilters.unassigned;

  const toggleQuickFilter = (filterName) => {
    setQuickFilters((prev) => ({ ...prev, [filterName]: !prev[filterName] }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPaymentFilter('all');
    setTeamFilter('all');
    setQuickFilters({ pending: false, unpaid: false, unassigned: false });
  };

  const handleExport = () => {
    const escapeCSV = (val) => {
      const str = String(val ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = [
      'Player First Name', 'Player Last Name', 'Grade', 'Gender', 'DOB',
      'Desired Jersey #', 'Last Team Played For',
      'Parent Name', 'Parent Email', 'Parent Cell Phone', 'Parent Home Phone', 'Address',
      'Parent 2 Name', 'Parent 2 Phone', 'Parent 2 Email',
      'Team', 'Status', 'Payment Status', 'IP Address', 'Submitted At'
    ];

    const rows = filteredRegistrations.map((r) => [
      r.player_first_name,
      r.player_last_name,
      r.player_current_grade,
      r.player_gender,
      r.player_date_of_birth,
      r.desired_jersey_number || '',
      r.last_team_played_for || '',
      `${r.parent_first_name} ${r.parent_last_name}`,
      r.parent_email,
      r.parent_phone,
      r.parent_home_phone || '',
      `${r.parent_address_street || ''}, ${r.parent_address_city || ''}, ${r.parent_address_state || ''} ${r.parent_address_zip || ''}`,
      r.parent2_name || '',
      r.parent2_phone || '',
      r.parent2_email || '',
      r.team?.name || '',
      r.status,
      r.payment_status,
      r.ip_address || '',
      r.created_at,
    ]);

    const csv = [headers, ...rows].map((row) => row.map(escapeCSV).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tne-registrations.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Build team options for filter
  const teamOptions = useMemo(() => {
    const opts = [
      { value: 'all', label: 'All Teams' },
      { value: 'unassigned', label: 'Unassigned' },
    ];
    teams.forEach((team) => {
      opts.push({ value: team.id, label: team.name });
    });
    return opts;
  }, [teams]);

  return (
    <div className="bg-stone-100 text-stone-900 antialiased min-h-screen font-sans">
      <AdminNavbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Registrations</h1>
            <p className="text-sm text-stone-500 mt-1">
              {filteredRegistrations.length} of {registrations.length} registration{registrations.length !== 1 ? 's' : ''}
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
              title="Export CSV"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Card */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 mb-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
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
                  { value: 'all', label: 'All Statuses' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'approved', label: 'Approved' },
                  { value: 'rejected', label: 'Rejected' },
                  { value: 'waitlisted', label: 'Waitlisted' },
                ]}
                onChange={setStatusFilter}
              />
              <FilterDropdown
                value={paymentFilter}
                options={[
                  { value: 'all', label: 'All Payments' },
                  { value: 'pending', label: 'Unpaid' },
                  { value: 'partial', label: 'Partial' },
                  { value: 'paid', label: 'Paid' },
                  { value: 'waived', label: 'Waived' },
                ]}
                onChange={setPaymentFilter}
              />
              <FilterDropdown
                value={teamFilter}
                options={teamOptions}
                onChange={setTeamFilter}
              />
            </div>
          </div>

          {/* Quick Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-stone-100">
            <span className="text-xs text-stone-400 font-medium">Quick filters:</span>

            <FilterPill
              active={quickFilters.pending}
              onClick={() => toggleQuickFilter('pending')}
              variant="warning"
              icon={<Clock className="w-3.5 h-3.5" />}
              count={filterCounts.pending}
            >
              Pending Review
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
              active={quickFilters.unassigned}
              onClick={() => toggleQuickFilter('unassigned')}
              variant="error"
              icon={<AlertCircle className="w-3.5 h-3.5" />}
              count={filterCounts.unassigned}
            >
              Unassigned
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

        {/* Registrations Table */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            {error && (
              <div className="m-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Failed to load registrations: {error}
              </div>
            )}

            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="h-14 bg-stone-100 rounded animate-pulse" />
                ))}
              </div>
            ) : filteredRegistrations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Calendar className="w-12 h-12 text-stone-300 mb-4" />
                <h3 className="text-lg font-medium text-stone-900 mb-2">
                  {hasActiveFilters ? 'No registrations found' : 'No registrations yet'}
                </h3>
                <p className="text-stone-500 mb-6">
                  {hasActiveFilters ? 'Try adjusting your filters' : 'Registrations will appear here when submitted'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-stone-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Player
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Grade
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Parent/Guardian
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Team
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-4 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredRegistrations.map((reg) => {
                    const isSelected = selectedRegistration?.id === reg.id;
                    const isPending = reg.status === 'pending';

                    return (
                      <tr
                        key={reg.id}
                        onClick={() => setSelectedRegistration(reg)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-red-50'
                            : isPending
                              ? 'bg-amber-50/30 hover:bg-amber-50/50'
                              : 'hover:bg-stone-50'
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-tne-red flex items-center justify-center text-white text-xs font-semibold">
                              {reg.player_first_name[0]}{reg.player_last_name[0]}
                            </div>
                            <div>
                              <p className="font-medium text-stone-900">
                                {reg.player_first_name} {reg.player_last_name}
                              </p>
                              <p className="text-xs text-stone-500 capitalize">
                                {reg.player_gender}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <GradeBadge grade={reg.player_current_grade} />
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-stone-900">
                            {reg.parent_first_name} {reg.parent_last_name}
                          </p>
                          <p className="text-xs text-stone-500">{reg.parent_email}</p>
                        </td>
                        <td className="px-4 py-3">
                          {reg.team ? (
                            <span className="text-sm text-stone-700">{reg.team.name}</span>
                          ) : (
                            <span className="text-sm text-stone-400">Unassigned</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <RegistrationStatusBadge status={reg.status} />
                        </td>
                        <td className="px-4 py-3">
                          <PaymentBadge status={reg.payment_status} />
                        </td>
                        <td className="px-4 py-3 text-sm text-stone-500">
                          {formatDate(reg.created_at)}
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
      </main>

      {/* Detail Panel */}
      {selectedRegistration && (
        <RegistrationDetailPanel
          registration={selectedRegistration}
          teams={teams}
          onClose={() => setSelectedRegistration(null)}
          onUpdateStatus={updateStatus}
          onUpdatePayment={updatePaymentStatus}
          onAssignTeam={assignToTeam}
          onConvert={convertToPlayer}
          onDelete={deleteRegistration}
        />
      )}
    </div>
  );
}
