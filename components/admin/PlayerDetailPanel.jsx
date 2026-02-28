import { useState, useEffect } from 'react';
import { usePlayers } from '@/hooks/usePlayers';
import { getGradeColor, formatGradeShort } from '@/utils/gradeColors';
import {
  X,
  Edit,
  Trash2,
  UserCog,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Users,
  Shield,
  Clock,
  Heart,
  User,
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

// Team Badge
function TeamBadge({ team }) {
  const color = getGradeColor(team.grade_level);
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-admin-content-bg border border-[#F2F2F0]">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold"
        style={{ backgroundColor: color.hex }}
      >
        {formatGradeShort(team.grade_level)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-admin-text truncate">{team.name}</p>
      </div>
    </div>
  );
}

// Payment Status Badge
function PaymentBadge({ status }) {
  const statusConfig = {
    paid: { bg: 'bg-green-100', text: 'text-green-700', label: 'Paid' },
    partial: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Partial' },
    pending: { bg: 'bg-red-100', text: 'text-red-700', label: 'Unpaid' },
    waived: { bg: 'bg-stone-100', text: 'text-stone-600', label: 'Waived' },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}

// Stat Box
function StatBox({ label, value, icon }) {
  const Icon = icon;
  return (
    <div className="p-3 rounded-lg bg-admin-content-bg border border-[#F2F2F0]">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-admin-text-muted" />
        <span className="text-xs text-admin-text-secondary">{label}</span>
      </div>
      <p className="text-xl font-bold text-admin-text">{value}</p>
    </div>
  );
}

// Season History Item
function SeasonHistoryItem({ entry }) {
  const color = getGradeColor(entry.team?.grade_level);
  const seasonName = entry.season?.name || 'Unknown Season';
  const isCurrentSeason = entry.season?.is_active;

  return (
    <div className="flex items-start gap-3 py-3 border-b border-[#F2F2F0] last:border-0">
      <div
        className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
        style={{ backgroundColor: color.hex }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-admin-text">{entry.team?.name || 'Unknown Team'}</p>
          {isCurrentSeason && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-green-100 text-green-700">
              CURRENT
            </span>
          )}
        </div>
        <p className="text-xs text-admin-text-secondary">
          #{entry.jersey_number || '-'} {entry.position && `\u2022 ${entry.position}`} \u2022 {seasonName}
        </p>
        <div className="mt-1">
          <PaymentBadge status={entry.payment_status} />
        </div>
      </div>
    </div>
  );
}

// Calculate age from date of birth
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

// Format date for display
function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Format phone number
function formatPhone(phone) {
  if (!phone) return null;
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

export default function PlayerDetailPanel({ player, onClose, onEdit, onDelete, onMoveTeam }) {
  const { getPlayerHistory } = usePlayers();
  const [activeTab, setActiveTab] = useState('overview');
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadPlayerHistory() {
      if (!player?.id) return;

      try {
        setLoadingHistory(true);
        const historyData = await getPlayerHistory(player.id);
        if (isMounted) {
          setHistory(historyData || []);
        }
      } catch (err) {
        console.error('Error loading player history:', err);
      } finally {
        if (isMounted) {
          setLoadingHistory(false);
        }
      }
    }

    loadPlayerHistory();

    return () => {
      isMounted = false;
    };
  }, [player?.id, getPlayerHistory]);

  // Close panel on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!player) return null;

  const age = calculateAge(player.date_of_birth);
  const parent = player.primary_parent;
  const currentTeams = player.teams || [];
  const seasonsPlayed = [...new Set(history.map((h) => h.season?.name))].filter(Boolean).length;

  return (
    <div className="fixed right-0 top-0 bottom-0 w-[480px] bg-white border-l border-admin-card-border shadow-xl flex flex-col z-[60]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-admin-card-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-tne-maroon to-tne-red flex items-center justify-center text-white text-lg font-bold">
            {player.first_name[0]}{player.last_name[0]}
          </div>
          <div>
            <h2 className="text-base font-bold text-admin-text">
              {player.first_name} {player.last_name}
            </h2>
            <p className="text-sm text-admin-text-secondary">
              {player.current_grade && `${player.current_grade} Grade`}
              {age && ` \u2022 ${age} years old`}
              {player.jersey_number && ` \u2022 #${player.jersey_number}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(player)}
            className="p-2 rounded-lg hover:bg-stone-100 transition-colors text-admin-text-muted hover:text-admin-text-secondary"
            title="Edit player"
          >
            <Edit className="w-4 h-4" />
          </button>
          {onMoveTeam && (
            <button
              onClick={() => onMoveTeam(player)}
              className="p-2 rounded-lg hover:bg-stone-100 transition-colors text-admin-text-muted hover:text-admin-text-secondary"
              title="Move team"
            >
              <UserCog className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onDelete(player)}
            className="p-2 rounded-lg hover:bg-red-50 transition-colors text-admin-text-muted hover:text-red-500"
            title="Delete player"
          >
            <Trash2 className="w-4 h-4" />
          </button>
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
          active={activeTab === 'parent'}
          onClick={() => setActiveTab('parent')}
        >
          Parent Info
        </TabButton>
        <TabButton
          active={activeTab === 'history'}
          onClick={() => setActiveTab('history')}
        >
          History
        </TabButton>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'overview' && (
          <div className="p-6 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <StatBox label="Teams" value={currentTeams.length} icon={Users} />
              <StatBox label="Seasons" value={loadingHistory ? '...' : seasonsPlayed} icon={Calendar} />
              <StatBox label="Years Exp" value={player.years_experience || 0} icon={Clock} />
            </div>

            {/* Current Teams */}
            <div>
              <h3 className="text-xs font-semibold text-admin-text-secondary uppercase tracking-wider mb-3">
                Current Team{currentTeams.length !== 1 ? 's' : ''}
              </h3>
              {currentTeams.length > 0 ? (
                <div className="space-y-2">
                  {currentTeams.map((team) => (
                    <TeamBadge key={team.id} team={team} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-admin-text-muted italic">Not assigned to any team</p>
              )}
            </div>

            {/* Player Info */}
            <div>
              <h3 className="text-xs font-semibold text-admin-text-secondary uppercase tracking-wider mb-3">
                Player Information
              </h3>
              <div className="space-y-1 bg-admin-content-bg rounded-lg p-4">
                <InfoRow label="Date of Birth" value={formatDate(player.date_of_birth)} icon={Calendar} />
                <InfoRow label="Gender" value={player.gender === 'male' ? 'Male' : 'Female'} icon={User} />
                <InfoRow label="Position" value={player.position} icon={MapPin} />
                <InfoRow label="Jersey Size" value={player.jersey_size} />
                <InfoRow label="Graduating Year" value={player.graduating_year} />
                {player.prior_tne_player && (
                  <div className="pt-2">
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-admin-red/10 text-admin-red">
                      Prior TNE Player
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <h3 className="text-xs font-semibold text-admin-text-secondary uppercase tracking-wider mb-3">
                Emergency Contact
              </h3>
              <div className="space-y-1 bg-admin-content-bg rounded-lg p-4">
                <InfoRow label="Name" value={player.emergency_contact_name} icon={Shield} />
                <InfoRow label="Phone" value={formatPhone(player.emergency_contact_phone)} icon={Phone} />
                <InfoRow label="Relationship" value={player.emergency_contact_relationship} />
              </div>
            </div>

            {/* Medical Notes */}
            {player.medical_notes && (
              <div>
                <h3 className="text-xs font-semibold text-admin-text-secondary uppercase tracking-wider mb-3">
                  Medical Notes
                </h3>
                <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                  <div className="flex gap-2">
                    <Heart className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-900 whitespace-pre-wrap">{player.medical_notes}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {player.notes && (
              <div>
                <h3 className="text-xs font-semibold text-admin-text-secondary uppercase tracking-wider mb-3">
                  Notes
                </h3>
                <p className="text-sm text-admin-text whitespace-pre-wrap">{player.notes}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'parent' && (
          <div className="p-6 space-y-6">
            {parent ? (
              <>
                {/* Parent Header */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center text-admin-text-secondary text-lg font-bold">
                    {parent.first_name?.[0]}{parent.last_name?.[0]}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-admin-text">
                      {parent.first_name} {parent.last_name}
                    </h3>
                    <p className="text-sm text-admin-text-secondary">Primary Parent/Guardian</p>
                  </div>
                </div>

                {/* Contact Info */}
                <div>
                  <h3 className="text-xs font-semibold text-admin-text-secondary uppercase tracking-wider mb-3">
                    Contact Information
                  </h3>
                  <div className="space-y-2">
                    {parent.email && (
                      <a
                        href={`mailto:${parent.email}`}
                        className="flex items-center gap-3 p-3 rounded-lg bg-admin-content-bg hover:bg-stone-100 transition-colors"
                      >
                        <Mail className="w-4 h-4 text-admin-text-muted" />
                        <span className="text-sm text-admin-text">{parent.email}</span>
                      </a>
                    )}
                    {parent.phone && (
                      <a
                        href={`tel:${parent.phone}`}
                        className="flex items-center gap-3 p-3 rounded-lg bg-admin-content-bg hover:bg-stone-100 transition-colors"
                      >
                        <Phone className="w-4 h-4 text-admin-text-muted" />
                        <span className="text-sm text-admin-text">{formatPhone(parent.phone)}</span>
                      </a>
                    )}
                    {!parent.email && !parent.phone && (
                      <p className="text-sm text-admin-text-muted italic">No contact information</p>
                    )}
                  </div>
                </div>

                {/* Additional Parent Fields (if available) */}
                {(parent.address || parent.city || parent.state || parent.zip) && (
                  <div>
                    <h3 className="text-xs font-semibold text-admin-text-secondary uppercase tracking-wider mb-3">
                      Address
                    </h3>
                    <div className="p-4 rounded-lg bg-admin-content-bg">
                      {parent.address && <p className="text-sm text-admin-text">{parent.address}</p>}
                      {(parent.city || parent.state || parent.zip) && (
                        <p className="text-sm text-admin-text">
                          {[parent.city, parent.state, parent.zip].filter(Boolean).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Users className="w-10 h-10 mx-auto text-admin-text-muted mb-3" />
                <h3 className="text-sm font-medium text-admin-text mb-1">No Parent Linked</h3>
                <p className="text-sm text-admin-text-secondary">
                  This player doesn&apos;t have a parent/guardian linked yet.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="p-6">
            {loadingHistory ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-admin-content-bg rounded animate-pulse" />
                ))}
              </div>
            ) : history.length > 0 ? (
              <div>
                {history.map((entry) => (
                  <SeasonHistoryItem key={entry.id} entry={entry} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="w-10 h-10 mx-auto text-admin-text-muted mb-3" />
                <h3 className="text-sm font-medium text-admin-text mb-1">No History Yet</h3>
                <p className="text-sm text-admin-text-secondary">
                  Player history will appear here once assigned to teams.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-admin-card-border bg-admin-content-bg">
        <div className="flex items-center justify-between text-xs text-admin-text-secondary">
          <span>
            ID: <span className="font-admin-mono">{player.id?.slice(0, 8)}</span>
          </span>
          <span>
            Added {formatDate(player.created_at)}
          </span>
        </div>
      </div>
    </div>
  );
}
