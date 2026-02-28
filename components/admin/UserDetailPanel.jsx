import { useState, useEffect, useRef } from 'react';
import {
  X,
  Mail,
  Calendar,
  Shield,
  User,
  Clock,
  Link as LinkIcon,
  ChevronDown,
  AlertTriangle,
  Key,
  UserX,
  UserCheck,
} from 'lucide-react';

// Tab Button
function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
        active
          ? 'border-admin-red text-admin-red'
          : 'border-transparent text-admin-text-secondary hover:text-admin-text hover:border-admin-card-border'
      }`}
    >
      {children}
    </button>
  );
}

// Info Row for displaying labeled data
function InfoRow({ label, value, icon: Icon }) {
  return (
    <div className="flex items-start gap-3 py-2">
      {Icon && <Icon className="w-4 h-4 text-admin-text-muted mt-0.5 flex-shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-admin-text-secondary">{label}</p>
        <p className="text-sm text-admin-text">{value || <span className="text-admin-text-muted italic">Not provided</span>}</p>
      </div>
    </div>
  );
}

// Role Badge with appropriate colors
function RoleBadge({ role }) {
  const styles = {
    admin: 'bg-purple-100 text-purple-700',
    director: 'bg-blue-100 text-blue-700',
    coach: 'bg-green-100 text-green-700',
    parent: 'bg-stone-100 text-stone-600',
  };

  const labels = {
    admin: 'Admin',
    director: 'Director',
    coach: 'Coach',
    parent: 'Parent',
  };

  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-semibold ${
        styles[role] || styles.parent
      }`}
    >
      {labels[role] || role}
    </span>
  );
}

// Status Badge
function StatusBadge({ isActive }) {
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-semibold ${
        isActive
          ? 'bg-green-100 text-green-700'
          : 'bg-stone-100 text-stone-500'
      }`}
    >
      {isActive ? 'Active' : 'Deactivated'}
    </span>
  );
}

// Format date for display
function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Role Select Dropdown
function RoleSelect({ currentRole, onChange, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const roles = [
    { value: 'admin', label: 'Admin', description: 'Full system access' },
    { value: 'director', label: 'Director', description: 'Program management' },
    { value: 'coach', label: 'Coach', description: 'Team management' },
    { value: 'parent', label: 'Parent', description: 'Player & registration access' },
  ];

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = (role) => {
    onChange(role);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border border-admin-card-border text-sm bg-white ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-stone-400 cursor-pointer'
        }`}
      >
        <span className="text-admin-text">{roles.find((r) => r.value === currentRole)?.label || currentRole}</span>
        <ChevronDown className="w-4 h-4 text-admin-text-muted" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-admin-card-border rounded-lg shadow-lg z-10">
          {roles.map((role) => (
            <button
              key={role.value}
              onClick={() => handleSelect(role.value)}
              className={`w-full px-3 py-2 text-left hover:bg-stone-50 first:rounded-t-lg last:rounded-b-lg ${
                currentRole === role.value ? 'bg-stone-50' : ''
              }`}
            >
              <p className="text-sm font-medium text-admin-text">{role.label}</p>
              <p className="text-xs text-admin-text-secondary">{role.description}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function UserDetailPanel({
  user,
  onClose,
  onEditRole,
  onDeactivate,
  onReactivate,
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditingRole, setIsEditingRole] = useState(false);

  // Close panel on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!user) return null;

  const handleRoleChange = async (newRole) => {
    if (newRole !== user.role) {
      await onEditRole(user.id, newRole);
    }
    setIsEditingRole(false);
  };

  return (
    <div className="fixed right-0 top-0 bottom-0 w-[480px] bg-white border-l border-admin-card-border shadow-xl flex flex-col z-[60]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-admin-card-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-tne-maroon to-tne-red flex items-center justify-center text-white text-lg font-bold">
            {user.first_name?.[0] || ''}{user.last_name?.[0] || ''}
          </div>
          <div>
            <h2 className="text-base font-bold text-admin-text">
              {user.first_name} {user.last_name}
            </h2>
            <p className="text-sm text-admin-text-secondary">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-stone-100 transition-colors text-admin-text-muted hover:text-admin-text-secondary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-admin-card-border px-4">
        <TabButton
          active={activeTab === 'overview'}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </TabButton>
        <TabButton
          active={activeTab === 'activity'}
          onClick={() => setActiveTab('activity')}
        >
          Activity
        </TabButton>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'overview' && (
          <div className="p-6 space-y-6">
            {/* Quick Actions */}
            <div>
              <h3 className="text-xs font-semibold text-admin-text-secondary uppercase tracking-wider mb-3">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <a
                  href={`mailto:${user.email}?subject=Password Reset - TNE Admin`}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg border border-admin-card-border hover:bg-stone-50 transition-colors text-left"
                >
                  <Key className="w-4 h-4 text-admin-text-secondary" />
                  <div>
                    <p className="text-sm font-medium text-admin-text">Reset Password</p>
                    <p className="text-xs text-admin-text-secondary">Send password reset email</p>
                  </div>
                </a>

                <button
                  onClick={() => setIsEditingRole(!isEditingRole)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg border border-admin-card-border hover:bg-stone-50 transition-colors text-left"
                >
                  <Shield className="w-4 h-4 text-admin-text-secondary" />
                  <div>
                    <p className="text-sm font-medium text-admin-text">Edit Role</p>
                    <p className="text-xs text-admin-text-secondary">Change user permissions</p>
                  </div>
                </button>

                {isEditingRole && (
                  <div className="ml-7 mt-2">
                    <RoleSelect
                      currentRole={user.role}
                      onChange={handleRoleChange}
                    />
                  </div>
                )}

                {user.is_active ? (
                  <button
                    onClick={() => onDeactivate(user)}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors text-left"
                  >
                    <UserX className="w-4 h-4 text-amber-600" />
                    <div>
                      <p className="text-sm font-medium text-amber-900">Deactivate Account</p>
                      <p className="text-xs text-amber-700">Disable user access</p>
                    </div>
                  </button>
                ) : (
                  <button
                    onClick={() => onReactivate(user.id)}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100 transition-colors text-left"
                  >
                    <UserCheck className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-900">Reactivate Account</p>
                      <p className="text-xs text-green-700">Re-enable user access</p>
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* Account Information */}
            <div>
              <h3 className="text-xs font-semibold text-admin-text-secondary uppercase tracking-wider mb-3">
                Account Information
              </h3>
              <div className="rounded-lg border border-admin-card-border divide-y divide-[#F2F2F0]">
                <div className="px-4">
                  <InfoRow label="Email" value={user.email} icon={Mail} />
                </div>
                <div className="px-4">
                  <InfoRow label="Display Name" value={`${user.first_name} ${user.last_name}`} icon={User} />
                </div>
                <div className="px-4 py-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-admin-text-muted" />
                      <span className="text-xs text-admin-text-secondary">Role</span>
                    </div>
                    <RoleBadge role={user.role} />
                  </div>
                </div>
                <div className="px-4 py-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-admin-text-muted" />
                      <span className="text-xs text-admin-text-secondary">Status</span>
                    </div>
                    <StatusBadge isActive={user.is_active} />
                  </div>
                </div>
              </div>
            </div>

            {/* Linked Profile */}
            <div>
              <h3 className="text-xs font-semibold text-admin-text-secondary uppercase tracking-wider mb-3">
                Linked Profile
              </h3>
              {user.linked_coach ? (
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center gap-3">
                    <LinkIcon className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-900">
                        Coach: {user.linked_coach.first_name} {user.linked_coach.last_name}
                      </p>
                      <p className="text-xs text-green-700">This user is linked to a coach profile</p>
                    </div>
                  </div>
                </div>
              ) : user.linked_parent ? (
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-center gap-3">
                    <LinkIcon className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        Parent: {user.linked_parent.first_name} {user.linked_parent.last_name}
                      </p>
                      <p className="text-xs text-blue-700">This user is linked to a parent profile</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-admin-content-bg border border-admin-card-border">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-admin-text-muted" />
                    <div>
                      <p className="text-sm font-medium text-admin-text-secondary">No linked profile</p>
                      <p className="text-xs text-admin-text-secondary">This user is not linked to a coach or parent record</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Session Information */}
            <div>
              <h3 className="text-xs font-semibold text-admin-text-secondary uppercase tracking-wider mb-3">
                Session Information
              </h3>
              <div className="rounded-lg border border-admin-card-border divide-y divide-[#F2F2F0]">
                <div className="px-4">
                  <InfoRow label="Created" value={formatDate(user.created_at)} icon={Calendar} />
                </div>
                <div className="px-4">
                  <InfoRow label="Last Updated" value={formatDate(user.updated_at)} icon={Clock} />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="p-6">
            <div className="text-center py-12">
              <Clock className="w-10 h-10 mx-auto text-admin-text-muted mb-3" />
              <h3 className="text-sm font-medium text-admin-text mb-1">Activity Log Coming Soon</h3>
              <p className="text-sm text-admin-text-secondary">
                User activity tracking will be available in a future update
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-admin-card-border bg-admin-content-bg">
        <div className="flex items-center justify-between text-xs text-admin-text-secondary">
          <span>User ID: {user.id?.slice(0, 8)}...</span>
          <span>Created {formatDate(user.created_at)}</span>
        </div>
      </div>
    </div>
  );
}
