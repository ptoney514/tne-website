import { useState, useEffect } from 'react';
import { useCoaches } from '../../hooks/useCoaches';
import { getGradeColor, formatGradeShort } from '../../utils/gradeColors';
import {
  X,
  Edit,
  Trash2,
  Mail,
  Phone,
  User,
  Calendar,
  Users,
  Award,
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';

// Tab Button
function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
        active
          ? 'border-tne-red text-tne-red'
          : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
      }`}
    >
      {children}
    </button>
  );
}

// Certification Card
function CertCard({ label, description, hasIt }) {
  return (
    <div
      className={`p-3 rounded-lg border ${
        hasIt ? 'border-green-200 bg-green-50' : 'border-stone-200 bg-stone-50'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p
            className={`text-sm font-medium ${
              hasIt ? 'text-green-900' : 'text-stone-500'
            }`}
          >
            {label}
          </p>
          <p className="text-xs text-stone-500 mt-0.5">{description}</p>
        </div>
        {hasIt ? (
          <CheckCircle className="w-5 h-5 text-green-600" />
        ) : (
          <XCircle className="w-5 h-5 text-stone-300" />
        )}
      </div>
    </div>
  );
}

// Team Card in Detail Panel
function TeamCard({ team }) {
  const color = getGradeColor(team.grade_level);
  return (
    <div className="p-3 rounded-lg border border-stone-200 bg-white">
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: color.hex }}
        >
          {formatGradeShort(team.grade_level)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-stone-900 truncate">
            {team.name}
          </p>
          <p className="text-xs text-stone-500">
            {team.role === 'head' ? 'Head Coach' : 'Assistant Coach'}
          </p>
        </div>
      </div>
    </div>
  );
}

// History Item
function HistoryItem({ team }) {
  const color = getGradeColor(team.grade_level);
  const seasonName = team.season?.name || 'Unknown Season';
  const isCurrentSeason = team.season?.is_active;

  return (
    <div className="flex items-start gap-3 py-3 border-b border-stone-100 last:border-0">
      <div
        className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
        style={{ backgroundColor: color.hex }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-stone-900">{team.name}</p>
          {isCurrentSeason && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-green-100 text-green-700">
              CURRENT
            </span>
          )}
        </div>
        <p className="text-xs text-stone-500">
          {team.role} \u2022 {seasonName}
        </p>
      </div>
    </div>
  );
}

// Stat Box
function StatBox({ label, value, icon }) {
  const IconComponent = icon;
  return (
    <div className="p-3 rounded-lg bg-stone-50 border border-stone-100">
      <div className="flex items-center gap-2 mb-1">
        <IconComponent className="w-4 h-4 text-stone-400" />
        <span className="text-xs text-stone-500">{label}</span>
      </div>
      <p className="text-xl font-bold text-stone-900">{value}</p>
    </div>
  );
}

export default function CoachDetailPanel({ coach, onClose, onEdit, onDelete }) {
  const { getCoachingHistory, getPlayersCoached } = useCoaches();
  const [activeTab, setActiveTab] = useState('overview');
  const [history, setHistory] = useState([]);
  const [playersCount, setPlayersCount] = useState(0);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadCoachDetails() {
      if (!coach?.id) return;

      try {
        const [historyData, count] = await Promise.all([
          getCoachingHistory(coach.id),
          getPlayersCoached(coach.id),
        ]);

        if (isMounted) {
          setHistory(historyData || []);
          setPlayersCount(count || 0);
          setLoadingHistory(false);
        }
      } catch (err) {
        console.error('Error loading coach details:', err);
        if (isMounted) {
          setLoadingHistory(false);
        }
      }
    }

    loadCoachDetails();

    return () => {
      isMounted = false;
    };
  }, [coach?.id, getCoachingHistory, getPlayersCoached]);

  if (!coach) return null;

  const roleLabel =
    coach.role === 'head_coach'
      ? 'Head Coach'
      : coach.role === 'assistant_coach'
      ? 'Assistant Coach'
      : 'Trainer';

  // Group history by season
  const seasons = [...new Set(history.map((h) => h.season?.name))].filter(Boolean);

  return (
    <div className="fixed right-0 top-14 bottom-0 w-[480px] bg-white border-l border-stone-200 shadow-xl flex flex-col z-40">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-tne-maroon to-tne-red flex items-center justify-center text-white text-lg font-bold">
            {coach.first_name[0]}
            {coach.last_name[0]}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-stone-900">
              {coach.first_name} {coach.last_name}
            </h2>
            <p className="text-sm text-stone-500">
              {roleLabel}
              {coach.years_with_org > 0 &&
                ` \u2022 ${coach.years_with_org} year${
                  coach.years_with_org !== 1 ? 's' : ''
                } with TNE`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(coach)}
            className="p-2 rounded-lg hover:bg-stone-100 transition-colors text-stone-400 hover:text-stone-600"
            title="Edit coach"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(coach)}
            className="p-2 rounded-lg hover:bg-red-50 transition-colors text-stone-400 hover:text-red-500"
            title="Delete coach"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-stone-100 transition-colors text-stone-400 hover:text-stone-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 px-4">
        <TabButton
          active={activeTab === 'overview'}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </TabButton>
        <TabButton
          active={activeTab === 'teams'}
          onClick={() => setActiveTab('teams')}
        >
          Teams ({coach.teams?.length || 0})
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
            {/* Contact Info */}
            <div>
              <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">
                Contact Information
              </h3>
              <div className="space-y-2">
                {coach.email && (
                  <a
                    href={`mailto:${coach.email}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-stone-50 hover:bg-stone-100 transition-colors"
                  >
                    <Mail className="w-4 h-4 text-stone-400" />
                    <span className="text-sm text-stone-700">{coach.email}</span>
                  </a>
                )}
                {coach.phone && (
                  <a
                    href={`tel:${coach.phone}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-stone-50 hover:bg-stone-100 transition-colors"
                  >
                    <Phone className="w-4 h-4 text-stone-400" />
                    <span className="text-sm text-stone-700">{coach.phone}</span>
                  </a>
                )}
                {!coach.email && !coach.phone && (
                  <p className="text-sm text-stone-400 italic">
                    No contact information
                  </p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div>
              <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">
                Stats
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <StatBox
                  label="Teams"
                  value={coach.teams?.length || 0}
                  icon={Briefcase}
                />
                <StatBox
                  label="Players"
                  value={loadingHistory ? '...' : playersCount}
                  icon={Users}
                />
                <StatBox
                  label="Seasons"
                  value={loadingHistory ? '...' : seasons.length}
                  icon={Calendar}
                />
              </div>
            </div>

            {/* Certifications */}
            <div>
              <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">
                Certifications
              </h3>
              <div className="space-y-2">
                <CertCard
                  label="USA Basketball"
                  description="Coaching certification"
                  hasIt={coach.has_usa_cert}
                />
                <CertCard
                  label="CPR/First Aid"
                  description="Medical certification"
                  hasIt={coach.has_cpr_cert}
                />
                <CertCard
                  label="Background Check"
                  description="Verified clear"
                  hasIt={coach.has_background_check}
                />
              </div>
            </div>

            {/* Specialty */}
            {coach.specialty && (
              <div>
                <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">
                  Specialty
                </h3>
                <p className="text-sm text-stone-700">{coach.specialty}</p>
              </div>
            )}

            {/* Bio */}
            {coach.bio && (
              <div>
                <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">
                  Bio
                </h3>
                <p className="text-sm text-stone-700 whitespace-pre-wrap">
                  {coach.bio}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'teams' && (
          <div className="p-6">
            {coach.teams?.length > 0 ? (
              <div className="space-y-3">
                {coach.teams.map((team) => (
                  <TeamCard key={team.id} team={team} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Briefcase className="w-10 h-10 mx-auto text-stone-300 mb-3" />
                <p className="text-sm text-stone-500">
                  Not assigned to any teams
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
                  <div
                    key={i}
                    className="h-12 bg-stone-100 rounded animate-pulse"
                  />
                ))}
              </div>
            ) : history.length > 0 ? (
              <div>
                {history.map((item) => (
                  <HistoryItem key={`${item.id}-${item.season?.id}`} team={item} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="w-10 h-10 mx-auto text-stone-300 mb-3" />
                <p className="text-sm text-stone-500">No coaching history yet</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-stone-200 bg-stone-50">
        <div className="flex items-center justify-between text-xs text-stone-500">
          <span>
            Status:{' '}
            <span
              className={
                coach.is_active
                  ? 'text-green-600 font-medium'
                  : 'text-stone-400'
              }
            >
              {coach.is_active ? 'Active' : 'Inactive'}
            </span>
          </span>
          <span>
            Added{' '}
            {new Date(coach.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
