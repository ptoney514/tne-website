import { useState, useMemo, useEffect } from 'react';
import { useTryoutSignups } from '@/hooks/useTryoutSignups';

import { GradeBadge, FilterPill } from '@/components/admin/AdminBadges';
import {
  Search,
  RefreshCw,
  Download,
  X,
  Loader2,
  ChevronDown,
  AlertCircle,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  UserPlus,
  ChevronRight,
  MapPin,
  GraduationCap,
} from 'lucide-react';

// Status badge styles
const STATUS_STYLES = {
  registered: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Registered' },
  attended: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Attended' },
  offered: { bg: 'bg-admin-red/10', text: 'text-admin-red', dot: 'bg-admin-red', label: 'Offered' },
  declined: { bg: 'bg-admin-content-bg', text: 'text-admin-text-secondary', dot: 'bg-stone-400', label: 'Declined' },
  no_show: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', label: 'No Show' },
};

function SignupStatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.registered;
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
        className="appearance-none pl-3 pr-8 py-1.5 rounded-lg border border-admin-card-border text-sm text-admin-text bg-white focus:outline-none focus:ring-2 focus:ring-admin-red/20 focus:border-admin-red/40 cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-admin-text-muted pointer-events-none" />
    </div>
  );
}

// Detail Panel for viewing signup details
function SignupDetailPanel({
  signup,
  sessions,
  onClose,
  onUpdateStatus,
  onUpdateSession,
  onConvert,
  onDelete,
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedSession, setSelectedSession] = useState(signup.session_id || '');

  const handleStatusChange = async (newStatus) => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(signup.id, newStatus);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSessionChange = async () => {
    if (!selectedSession) return;
    setIsUpdating(true);
    try {
      await onUpdateSession(signup.id, selectedSession);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConvert = async () => {
    if (!confirm('Convert this tryout signup to a player record? This will create a new player and parent in the system.')) return;
    setIsUpdating(true);
    try {
      await onConvert(signup);
      alert('Signup converted to player successfully!');
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

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div className="fixed right-0 top-0 h-full w-[480px] bg-white border-l border-admin-card-border shadow-xl z-[60] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-admin-card-border bg-admin-content-bg">
        <div>
          <h2 className="text-base font-bold text-admin-text">
            {signup.player_first_name} {signup.player_last_name}
          </h2>
          <p className="text-sm text-admin-text-secondary">
            Registered {formatDateTime(signup.created_at)}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-stone-100 rounded-lg transition-colors text-admin-text-secondary"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Status Row */}
        <div className="flex items-center gap-3">
          <SignupStatusBadge status={signup.status} />
          {signup.player_id && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
              <CheckCircle className="w-3 h-3" />
              Converted
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-admin-text uppercase tracking-wide">Actions</h3>

          {/* Status Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {signup.status === 'registered' && (
              <button
                onClick={() => handleStatusChange('attended')}
                disabled={isUpdating}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                Attended
              </button>
            )}
            {signup.status === 'registered' && (
              <button
                onClick={() => handleStatusChange('no_show')}
                disabled={isUpdating}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                No Show
              </button>
            )}
            {signup.status === 'attended' && (
              <>
                <button
                  onClick={() => handleStatusChange('offered')}
                  disabled={isUpdating}
                  className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-admin-red text-white text-sm font-medium hover:opacity-85 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  Offer
                </button>
                <button
                  onClick={() => handleStatusChange('declined')}
                  disabled={isUpdating}
                  className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-stone-600 text-white text-sm font-medium hover:bg-stone-700 disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Decline
                </button>
              </>
            )}
          </div>

          {/* Convert to Player */}
          {signup.status === 'offered' && !signup.player_id && (
            <button
              onClick={handleConvert}
              disabled={isUpdating}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-admin-red text-white text-sm font-medium hover:opacity-85 disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              Convert to Player
            </button>
          )}

          {/* Session Assignment */}
          <div className="flex gap-2">
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-admin-card-border text-sm focus:outline-none focus:ring-2 focus:ring-admin-red/20/20"
            >
              <option value="">Change session...</option>
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.name} - {session.date}
                </option>
              ))}
            </select>
            <button
              onClick={handleSessionChange}
              disabled={!selectedSession || selectedSession === signup.session_id || isUpdating}
              className="px-3 py-2 rounded-lg bg-stone-800 text-white text-sm font-medium hover:bg-stone-700 disabled:opacity-50"
            >
              Update
            </button>
          </div>
        </div>

        {/* Tryout Session Info */}
        {signup.session && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-admin-text uppercase tracking-wide">Tryout Session</h3>
            <div className="bg-admin-red/5 border border-admin-red/20 rounded-[12px] p-4">
              <p className="text-sm font-medium text-admin-text">{signup.session.name}</p>
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2 text-xs text-admin-text-secondary">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(signup.session.date)} at {formatTime(signup.session.start_time)} - {formatTime(signup.session.end_time)}
                </div>
                <div className="flex items-center gap-2 text-xs text-admin-text-secondary">
                  <MapPin className="w-3.5 h-3.5" />
                  {signup.session.location}
                </div>
                <div className="flex items-center gap-2 text-xs text-admin-text-secondary">
                  <GraduationCap className="w-3.5 h-3.5" />
                  {signup.session.gender === 'boys' ? 'Boys' : signup.session.gender === 'girls' ? 'Girls' : 'All'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Player Info */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-admin-text uppercase tracking-wide">Player Information</h3>
          <div className="bg-admin-content-bg rounded-[12px] p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-admin-text-secondary">Full Name</p>
                <p className="text-sm font-medium text-admin-text">
                  {signup.player_first_name} {signup.player_last_name}
                </p>
              </div>
              <div>
                <p className="text-xs text-admin-text-secondary">Date of Birth</p>
                <p className="text-sm font-medium text-admin-text">
                  {formatDate(signup.player_dob)}
                </p>
              </div>
              <div>
                <p className="text-xs text-admin-text-secondary">Grade</p>
                <GradeBadge grade={signup.player_grade} />
              </div>
              <div>
                <p className="text-xs text-admin-text-secondary">Gender</p>
                <p className="text-sm font-medium text-admin-text capitalize">
                  {signup.player_gender}
                </p>
              </div>
              {signup.player_school && (
                <div className="col-span-2">
                  <p className="text-xs text-admin-text-secondary">School</p>
                  <p className="text-sm font-medium text-admin-text">
                    {signup.player_school}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Parent/Guardian Info */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-admin-text uppercase tracking-wide">Parent/Guardian</h3>
          <div className="bg-admin-content-bg rounded-[12px] p-4 space-y-3">
            <div>
              <p className="text-xs text-admin-text-secondary">Name</p>
              <p className="text-sm font-medium text-admin-text">
                {signup.parent_first_name} {signup.parent_last_name}
                <span className="text-admin-text-secondary ml-2">({signup.relationship})</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-admin-text-muted" />
              <a href={`mailto:${signup.parent_email}`} className="text-sm text-admin-red hover:underline">
                {signup.parent_email}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-admin-text-muted" />
              <a href={`tel:${signup.parent_phone}`} className="text-sm text-admin-text">
                {signup.parent_phone}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-admin-card-border bg-admin-content-bg">
        <button
          onClick={() => {
            if (confirm('Are you sure you want to delete this signup?')) {
              onDelete(signup.id);
              onClose();
            }
          }}
          className="text-sm text-red-600 hover:text-red-700 font-medium"
        >
          Delete Signup
        </button>
      </div>
    </div>
  );
}

export default function AdminTryoutsPage() {
  const {
    signups,
    sessions,
    loading,
    error,
    refetch,
    updateStatus,
    updateSession,
    deleteSignup,
    convertToPlayer,
  } = useTryoutSignups();

  // UI State
  const [selectedSignup, setSelectedSignup] = useState(null);

  useEffect(() => {
    if (!selectedSignup?.id) return;
    const refreshed = signups.find((signup) => signup.id === selectedSignup.id);
    if (refreshed) {
      setSelectedSignup(refreshed);
    } else {
      setSelectedSignup(null);
    }
  }, [signups, selectedSignup?.id]);

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sessionFilter, setSessionFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');

  // Quick Filter State
  const [quickFilters, setQuickFilters] = useState({
    registered: false,
    attended: false,
    offered: false,
  });

  // Compute filter counts
  const filterCounts = useMemo(() => {
    return {
      registered: signups.filter((s) => s.status === 'registered').length,
      attended: signups.filter((s) => s.status === 'attended').length,
      offered: signups.filter((s) => s.status === 'offered').length,
    };
  }, [signups]);

  // Filter signups
  const filteredSignups = useMemo(() => {
    return signups.filter((signup) => {
      // Quick filters
      if (quickFilters.registered && signup.status !== 'registered') return false;
      if (quickFilters.attended && signup.status !== 'attended') return false;
      if (quickFilters.offered && signup.status !== 'offered') return false;

      // Dropdown filters
      if (statusFilter !== 'all' && signup.status !== statusFilter) return false;
      if (sessionFilter !== 'all' && signup.session_id !== sessionFilter) return false;
      if (gradeFilter !== 'all' && signup.player_grade !== gradeFilter) return false;

      // Search
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const playerName = `${signup.player_first_name} ${signup.player_last_name}`.toLowerCase();
        const parentName = `${signup.parent_first_name} ${signup.parent_last_name}`.toLowerCase();
        const email = signup.parent_email?.toLowerCase() || '';
        if (!playerName.includes(search) && !parentName.includes(search) && !email.includes(search)) {
          return false;
        }
      }

      return true;
    });
  }, [signups, quickFilters, statusFilter, sessionFilter, gradeFilter, searchTerm]);

  const hasActiveFilters = statusFilter !== 'all' || sessionFilter !== 'all' || gradeFilter !== 'all' || searchTerm ||
    quickFilters.registered || quickFilters.attended || quickFilters.offered;

  const toggleQuickFilter = (filterName) => {
    setQuickFilters((prev) => ({ ...prev, [filterName]: !prev[filterName] }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSessionFilter('all');
    setGradeFilter('all');
    setQuickFilters({ registered: false, attended: false, offered: false });
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
      'Player First Name', 'Player Last Name', 'Grade', 'Gender', 'DOB', 'School',
      'Parent Name', 'Parent Email', 'Parent Phone',
      'Session', 'Session Date', 'Status', 'Registered At'
    ];

    const rows = filteredSignups.map((s) => [
      s.player_first_name,
      s.player_last_name,
      s.player_grade,
      s.player_gender,
      s.player_dob,
      s.player_school || '',
      `${s.parent_first_name} ${s.parent_last_name}`,
      s.parent_email,
      s.parent_phone,
      s.session?.name || '',
      s.session?.date || '',
      s.status,
      s.created_at,
    ]);

    const csv = [headers, ...rows].map((row) => row.map(escapeCSV).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tne-tryout-signups.csv';
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

  // Build session options for filter
  const sessionOptions = useMemo(() => {
    const opts = [{ value: 'all', label: 'All Sessions' }];
    sessions.forEach((session) => {
      opts.push({ value: session.id, label: `${session.name} - ${session.date}` });
    });
    return opts;
  }, [sessions]);

  return (
    <>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[22px] font-extrabold text-admin-text tracking-[-0.02em]">Tryout Signups</h1>
            <p className="text-sm text-admin-text-secondary mt-1">
              {filteredSignups.length} of {signups.length} signup{signups.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refetch}
              className="p-2 text-admin-text-muted hover:text-admin-text-secondary hover:bg-stone-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleExport}
              className="p-2 text-admin-text-muted hover:text-admin-text-secondary hover:bg-stone-100 rounded-lg transition-colors"
              title="Export CSV"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-[12px] bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">Failed to load signups: {error}</span>
            <button onClick={refetch} className="ml-auto text-red-800 underline hover:text-red-900 font-medium whitespace-nowrap">
              Retry
            </button>
          </div>
        )}

        {/* Filter Card */}
        <div className="bg-white rounded-[14px] border-[1.5px] border-admin-card-border shadow-sm p-4 mb-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-admin-text-muted" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-admin-content-bg border-[1.5px] border-admin-card-border rounded-[12px] text-sm focus:outline-none focus:ring-2 focus:ring-tne-maroon/20 focus:border-tne-maroon/50 transition-all"
              />
            </div>

            {/* Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              <FilterDropdown
                value={statusFilter}
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'registered', label: 'Registered' },
                  { value: 'attended', label: 'Attended' },
                  { value: 'offered', label: 'Offered' },
                  { value: 'declined', label: 'Declined' },
                  { value: 'no_show', label: 'No Show' },
                ]}
                onChange={setStatusFilter}
              />
              <FilterDropdown
                value={sessionFilter}
                options={sessionOptions}
                onChange={setSessionFilter}
              />
              <FilterDropdown
                value={gradeFilter}
                options={[
                  { value: 'all', label: 'All Grades' },
                  { value: '4', label: '4th Grade' },
                  { value: '5', label: '5th Grade' },
                  { value: '6', label: '6th Grade' },
                  { value: '7', label: '7th Grade' },
                  { value: '8', label: '8th Grade' },
                ]}
                onChange={setGradeFilter}
              />
            </div>
          </div>

          {/* Quick Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-[#F2F2F0]">
            <span className="text-xs text-admin-text-muted font-medium">Quick filters:</span>

            <FilterPill
              active={quickFilters.registered}
              onClick={() => toggleQuickFilter('registered')}
              variant="warning"
              icon={<Clock className="w-3.5 h-3.5" />}
              count={filterCounts.registered}
            >
              Registered
            </FilterPill>

            <FilterPill
              active={quickFilters.attended}
              onClick={() => toggleQuickFilter('attended')}
              variant="success"
              icon={<CheckCircle className="w-3.5 h-3.5" />}
              count={filterCounts.attended}
            >
              Attended
            </FilterPill>

            <FilterPill
              active={quickFilters.offered}
              onClick={() => toggleQuickFilter('offered')}
              variant="primary"
              icon={<UserPlus className="w-3.5 h-3.5" />}
              count={filterCounts.offered}
            >
              Offered
            </FilterPill>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-admin-text-secondary hover:text-admin-text hover:bg-stone-100 transition-colors ml-2"
              >
                <X className="w-3 h-3" />
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Signups Table */}
        <div className="bg-white rounded-[14px] border-[1.5px] border-admin-card-border shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="h-14 bg-admin-content-bg rounded animate-pulse" />
                ))}
              </div>
            ) : filteredSignups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Calendar className="w-12 h-12 text-admin-text-muted mb-4" />
                <h3 className="text-lg font-medium text-admin-text mb-2">
                  {error ? 'Unable to load signups' : hasActiveFilters ? 'No signups found' : 'No tryout signups yet'}
                </h3>
                <p className="text-admin-text-secondary mb-6">
                  {error ? 'There was a problem loading data' : hasActiveFilters ? 'Try adjusting your filters' : 'Signups will appear here when submitted'}
                </p>
                {error && (
                  <button
                    onClick={refetch}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-[12px] bg-admin-red hover:opacity-85 text-white font-medium transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Retry
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-admin-content-bg sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-admin-text-secondary uppercase tracking-wider">
                      Player
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-admin-text-secondary uppercase tracking-wider">
                      Grade
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-admin-text-secondary uppercase tracking-wider">
                      Parent/Guardian
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-admin-text-secondary uppercase tracking-wider">
                      Session
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-admin-text-secondary uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-admin-text-secondary uppercase tracking-wider">
                      Registered
                    </th>
                    <th className="px-4 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredSignups.map((signup) => {
                    const isSelected = selectedSignup?.id === signup.id;
                    const isRegistered = signup.status === 'registered';

                    return (
                      <tr
                        key={signup.id}
                        onClick={() => setSelectedSignup(signup)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-red-50'
                            : isRegistered
                              ? 'bg-amber-50/30 hover:bg-amber-50/50'
                              : 'hover:bg-stone-50'
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-admin-red flex items-center justify-center text-white text-xs font-semibold">
                              {signup.player_first_name?.[0]}{signup.player_last_name?.[0]}
                            </div>
                            <div>
                              <p className="font-medium text-admin-text">
                                {signup.player_first_name} {signup.player_last_name}
                              </p>
                              <p className="text-xs text-admin-text-secondary capitalize">
                                {signup.player_gender}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <GradeBadge grade={signup.player_grade} />
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-admin-text">
                            {signup.parent_first_name} {signup.parent_last_name}
                          </p>
                          <p className="text-xs text-admin-text-secondary">{signup.parent_email}</p>
                        </td>
                        <td className="px-4 py-3">
                          {signup.session ? (
                            <div>
                              <span className="text-sm text-admin-text">{signup.session.name}</span>
                              <p className="text-xs text-admin-text-secondary">{formatDate(signup.session.date)}</p>
                            </div>
                          ) : (
                            <span className="text-sm text-admin-text-muted">No session</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <SignupStatusBadge status={signup.status} />
                        </td>
                        <td className="px-4 py-3 text-sm text-admin-text-secondary">
                          {formatDate(signup.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <ChevronRight className="w-4 h-4 text-admin-text-muted" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            )}
        </div>
      </div>

      {/* Detail Panel */}
      {selectedSignup && (
        <SignupDetailPanel
          signup={selectedSignup}
          sessions={sessions}
          onClose={() => setSelectedSignup(null)}
          onUpdateStatus={updateStatus}
          onUpdateSession={updateSession}
          onConvert={convertToPlayer}
          onDelete={deleteSignup}
        />
      )}
    </>
  );
}
