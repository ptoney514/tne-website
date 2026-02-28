import { useState } from 'react';
import { useUsers } from '@/hooks/useUsers';
import UserDetailPanel from '@/components/admin/UserDetailPanel';
import InviteUserModal from '@/components/admin/InviteUserModal';
import {
  Plus,
  Search,
  RefreshCw,
  Download,
  ChevronDown,
  Mail,
  Users,
  UserCheck,
  Clock,
  UserX,
  AlertCircle,
  Link as LinkIcon,
} from 'lucide-react';

// Role Badge with appropriate colors
function RoleBadge({ role }) {
  const styles = {
    admin: 'bg-purple-100 text-purple-700',
    director: 'bg-blue-100 text-blue-700',
    coach: 'bg-green-100 text-green-700',
    parent: 'bg-stone-100 text-admin-text-secondary',
  };

  const labels = {
    admin: 'Admin',
    director: 'Director',
    coach: 'Coach',
    parent: 'Parent',
  };

  return (
    <span
      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
        styles[role] || styles.parent
      }`}
    >
      {labels[role] || role}
    </span>
  );
}

// Status Badge
function StatusBadge({ isActive, isPending }) {
  if (isPending) {
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-700">
        Pending
      </span>
    );
  }

  return (
    <span
      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
        isActive
          ? 'bg-green-100 text-green-700'
          : 'bg-stone-100 text-admin-text-secondary'
      }`}
    >
      {isActive ? 'Active' : 'Deactivated'}
    </span>
  );
}

// Stat Card
function StatCard({ icon, label, value, color }) {
  const Icon = icon;
  const colorStyles = {
    default: 'bg-stone-50 text-admin-text-secondary',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    stone: 'bg-stone-50 text-admin-text-muted',
  };

  return (
    <div className="bg-white rounded-xl border-[1.5px] border-admin-card-border p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-lg ${colorStyles[color] || colorStyles.default}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[22px] font-extrabold text-admin-text tracking-[-0.02em]">{value}</p>
          <p className="text-sm text-admin-text-secondary">{label}</p>
        </div>
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

export default function AdminUsersPage() {
  const {
    users,
    invites,
    stats,
    loading,
    error,
    refetch,
    updateUser,
    deactivateUser,
    reactivateUser,
  } = useUsers();

  // UI State
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deactivateConfirm, setDeactivateConfirm] = useState(null);

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('name');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter users
  const filteredUsers = users.filter((user) => {
    // Role filter
    if (roleFilter !== 'all' && user.role !== roleFilter) return false;

    // Status filter
    if (statusFilter === 'active' && !user.is_active) return false;
    if (statusFilter === 'deactivated' && user.is_active) return false;

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      if (searchField === 'name') {
        const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
        if (!fullName.includes(search)) return false;
      } else if (searchField === 'email') {
        if (!user.email?.toLowerCase().includes(search)) return false;
      }
    }

    return true;
  });

  const handleRowClick = (user) => {
    setSelectedUser(user);
  };

  const handleEditRole = async (userId, newRole) => {
    try {
      await updateUser(userId, { role: newRole });
      // Update selected user if it's the one being edited
      if (selectedUser?.id === userId) {
        setSelectedUser((prev) => ({ ...prev, role: newRole }));
      }
    } catch (err) {
      console.error('Error updating role:', err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleDeactivate = (user) => {
    // Show confirmation dialog instead of immediately deactivating
    setDeactivateConfirm(user);
  };

  const confirmDeactivate = async () => {
    if (!deactivateConfirm) return;
    try {
      await deactivateUser(deactivateConfirm.id);
      if (selectedUser?.id === deactivateConfirm.id) {
        setSelectedUser((prev) => ({ ...prev, is_active: false }));
      }
      setDeactivateConfirm(null);
    } catch (err) {
      console.error('Error deactivating user:', err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleReactivate = async (userId) => {
    try {
      await reactivateUser(userId);
      if (selectedUser?.id === userId) {
        setSelectedUser((prev) => ({ ...prev, is_active: true }));
      }
    } catch (err) {
      console.error('Error reactivating user:', err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleExport = () => {
    const escapeCSV = (val) => {
      const str = String(val ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = ['First Name', 'Last Name', 'Email', 'Role', 'Status', 'Created'];
    const rows = filteredUsers.map((u) => [
      escapeCSV(u.first_name),
      escapeCSV(u.last_name),
      escapeCSV(u.email),
      escapeCSV(u.role),
      u.is_active ? 'Active' : 'Deactivated',
      new Date(u.created_at).toLocaleDateString(),
    ]);

    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tne-users.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-admin-card-border px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-extrabold text-admin-text tracking-[-0.02em]">User Management</h1>
            <p className="text-sm text-admin-text-secondary mt-1">
              Manage user accounts, roles, and access permissions
            </p>
          </div>
          <button
            onClick={() => setInviteModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-admin-red hover:opacity-85 text-white font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Invite User
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 py-4 bg-admin-content-bg border-b border-admin-card-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total Users" value={stats.total} color="default" />
          <StatCard icon={UserCheck} label="Active" value={stats.active} color="green" />
          <StatCard icon={Clock} label="Pending Invites" value={stats.pending} color="amber" />
          <StatCard icon={UserX} label="Deactivated" value={stats.deactivated} color="stone" />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Table Panel */}
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${
            selectedUser ? 'mr-[480px]' : ''
          }`}
        >
          {/* Toolbar */}
          <div className="bg-white border-b border-admin-card-border px-4 py-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              {/* Left: Search and Filters */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Search */}
                <div className="flex items-center">
                  <FilterDropdown
                    value={searchField}
                    options={[
                      { value: 'name', label: 'Name' },
                      { value: 'email', label: 'Email' },
                    ]}
                    onChange={setSearchField}
                  />
                  <div className="relative ml-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-admin-text-muted" />
                    <input
                      type="text"
                      placeholder={`Search by ${searchField}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64 pl-9 pr-4 py-1.5 rounded-lg border border-admin-card-border text-sm text-admin-text placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-admin-red/20 focus:border-admin-red/40"
                    />
                  </div>
                </div>

                {/* Role Filter */}
                <FilterDropdown
                  value={roleFilter}
                  options={[
                    { value: 'all', label: 'All Roles' },
                    { value: 'admin', label: 'Admin' },
                    { value: 'director', label: 'Director' },
                    { value: 'coach', label: 'Coach' },
                    { value: 'parent', label: 'Parent' },
                  ]}
                  onChange={setRoleFilter}
                />

                {/* Status Filter */}
                <FilterDropdown
                  value={statusFilter}
                  options={[
                    { value: 'all', label: 'All Status' },
                    { value: 'active', label: 'Active' },
                    { value: 'deactivated', label: 'Deactivated' },
                  ]}
                  onChange={setStatusFilter}
                />
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={refetch}
                  className="p-2 rounded-lg border border-admin-card-border text-admin-text-secondary hover:bg-stone-50 transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={handleExport}
                  className="p-2 rounded-lg border border-admin-card-border text-admin-text-secondary hover:bg-stone-50 transition-colors"
                  title="Export CSV"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mx-4 mt-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">Failed to load users: {error}</span>
              <button onClick={refetch} className="ml-auto text-red-800 underline hover:text-red-900 font-medium whitespace-nowrap">
                Retry
              </button>
            </div>
          )}

          {/* Table */}
          <div className="flex-1 overflow-auto bg-white">
            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-14 bg-stone-100 rounded animate-pulse" />
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Users className="w-12 h-12 text-admin-text-muted mb-4" />
                <h3 className="text-base font-bold text-admin-text mb-2">
                  {error
                    ? 'Unable to load users'
                    : searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                      ? 'No users found'
                      : 'No users yet'}
                </h3>
                <p className="text-admin-text-secondary mb-6">
                  {error
                    ? 'There was a problem loading data'
                    : searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                      ? 'Try adjusting your filters'
                      : 'Invite your first user to get started'}
                </p>
                {error ? (
                  <button
                    onClick={refetch}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-admin-red hover:opacity-85 text-white font-medium transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Retry
                  </button>
                ) : !searchTerm && roleFilter === 'all' && statusFilter === 'all' && (
                  <button
                    onClick={() => setInviteModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-admin-red hover:opacity-85 text-white font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Invite User
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-admin-content-bg sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-admin-text-secondary uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-admin-text-secondary uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-admin-text-secondary uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-admin-text-secondary uppercase tracking-wider">
                      Linked Profile
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-admin-text-secondary uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      onClick={() => handleRowClick(user)}
                      className={`border-b border-[#F2F2F0] cursor-pointer transition-colors ${
                        selectedUser?.id === user.id
                          ? 'bg-admin-red/5'
                          : 'hover:bg-stone-50'
                      } ${!user.is_active ? 'opacity-60' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-tne-maroon to-tne-red flex items-center justify-center text-white text-xs font-bold">
                            {user.first_name?.[0] || ''}
                            {user.last_name?.[0] || ''}
                          </div>
                          <div>
                            <p className="font-medium text-admin-text">
                              {user.first_name} {user.last_name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-sm text-admin-text-secondary">
                          <Mail className="w-3.5 h-3.5 text-admin-text-muted" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-4 py-3">
                        {user.linked_coach ? (
                          <div className="flex items-center gap-1.5 text-sm text-green-600">
                            <LinkIcon className="w-3.5 h-3.5" />
                            Coach
                          </div>
                        ) : user.linked_parent ? (
                          <div className="flex items-center gap-1.5 text-sm text-blue-600">
                            <LinkIcon className="w-3.5 h-3.5" />
                            Parent
                          </div>
                        ) : (
                          <span className="text-sm text-admin-text-muted">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge isActive={user.is_active} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer */}
          <div className="bg-white border-t border-admin-card-border px-4 py-2">
            <p className="text-sm text-admin-text-secondary">
              {filteredUsers.length} of {users.length} user
              {users.length !== 1 ? 's' : ''}
              {invites.length > 0 && ` • ${invites.length} pending invite${invites.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        {/* Detail Panel */}
        {selectedUser && (
          <UserDetailPanel
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
            onEditRole={handleEditRole}
            onDeactivate={handleDeactivate}
            onReactivate={handleReactivate}
          />
        )}
      </div>

      {/* Invite Modal */}
      <InviteUserModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onSuccess={() => {
          setInviteModalOpen(false);
          refetch();
        }}
      />

      {/* Deactivate Confirmation */}
      {deactivateConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h3 className="text-base font-bold text-admin-text mb-2">
              Deactivate User?
            </h3>
            <p className="text-admin-text-secondary mb-6">
              Are you sure you want to deactivate{' '}
              <strong>
                {deactivateConfirm.first_name} {deactivateConfirm.last_name}
              </strong>
              ? They will no longer be able to sign in until reactivated.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeactivateConfirm(null)}
                className="px-4 py-2 rounded-lg border border-admin-card-border text-admin-text hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeactivate}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
