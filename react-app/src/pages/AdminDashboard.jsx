import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useSeason } from '../contexts/SeasonContext';
import { supabase } from '../lib/supabase';
import { generateTemplateFile, exportToExcel } from '../lib/excelParser';
import AdminNavbar from '../components/AdminNavbar';
import ExcelUploadModal from '../components/admin/ExcelUploadModal';
import {
  Users,
  UserCheck,
  ClipboardList,
  CalendarCheck,
  AlertTriangle,
  ChevronRight,
  Radio,
  Power,
  Pencil,
  Check,
  X,
  ExternalLink,
  Zap,
  Activity,
  Clock,
  Upload,
  Download,
  FileSpreadsheet,
} from 'lucide-react';

// ============================================
// CONTROL PANEL COMPONENTS
// ============================================

function TryoutsControl({ season, onUpdate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [tempLabel, setTempLabel] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (season) {
      setIsOpen(season.tryouts_open || false);
      setLabel(season.tryouts_label || '');
    }
  }, [season]);

  const handleToggle = async () => {
    if (!season) return;
    setSaving(true);
    const newState = !isOpen;

    try {
      const { error } = await supabase
        .from('seasons')
        .update({ tryouts_open: newState })
        .eq('id', season.id);

      if (error) throw error;
      setIsOpen(newState);
      onUpdate?.();
    } catch (err) {
      console.error('Failed to update tryouts:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleLabelSave = async () => {
    if (!season) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from('seasons')
        .update({ tryouts_label: tempLabel })
        .eq('id', season.id);

      if (error) throw error;
      setLabel(tempLabel);
      setIsEditingLabel(false);
      onUpdate?.();
    } catch (err) {
      console.error('Failed to update label:', err);
    } finally {
      setSaving(false);
    }
  };

  const startEditingLabel = () => {
    setTempLabel(label);
    setIsEditingLabel(true);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-stone-900 via-stone-900 to-stone-800 border border-stone-700/50 p-6">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }} />
      </div>

      {/* Live indicator */}
      <div className="absolute top-4 right-4">
        <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest ${
          isOpen
            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            : 'bg-stone-700/50 text-stone-500 border border-stone-600/30'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-blue-400 animate-pulse' : 'bg-stone-500'}`} />
          {isOpen ? 'Live' : 'Off'}
        </div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-2 rounded-lg ${isOpen ? 'bg-blue-500/20' : 'bg-stone-700/50'}`}>
            <CalendarCheck className={`w-5 h-5 ${isOpen ? 'text-blue-400' : 'text-stone-500'}`} />
          </div>
          <div>
            <h3 className="text-white font-semibold">Tryouts</h3>
            <p className="text-stone-500 text-xs">Control tryout signup access</p>
          </div>
        </div>

        {/* Toggle Switch */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggle}
              disabled={saving || !season}
              className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
                isOpen
                  ? 'bg-blue-500 shadow-lg shadow-blue-500/30'
                  : 'bg-stone-700'
              } ${saving ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
            >
              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 flex items-center justify-center ${
                isOpen ? 'left-7' : 'left-1'
              }`}>
                <Power className={`w-3 h-3 ${isOpen ? 'text-blue-500' : 'text-stone-400'}`} />
              </div>
            </button>
            <span className={`text-sm font-medium ${isOpen ? 'text-blue-400' : 'text-stone-500'}`}>
              {isOpen ? 'Tryouts Open' : 'Tryouts Closed'}
            </span>
          </div>
        </div>

        {/* Label Editor */}
        <div className="bg-stone-800/50 rounded-xl p-4 border border-stone-700/50">
          <label className="text-[10px] font-mono text-stone-500 uppercase tracking-widest mb-2 block">
            Tryout Label
          </label>

          {isEditingLabel ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tempLabel}
                onChange={(e) => setTempLabel(e.target.value)}
                placeholder="e.g., Winter '25-26 Tryouts"
                className="flex-1 bg-stone-900 border border-stone-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                autoFocus
              />
              <button
                onClick={handleLabelSave}
                disabled={saving}
                className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsEditingLabel(false)}
                className="p-2 rounded-lg bg-stone-700 text-stone-400 hover:bg-stone-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className={`text-sm ${label ? 'text-white' : 'text-stone-600 italic'}`}>
                {label || 'No label set'}
              </span>
              <button
                onClick={startEditingLabel}
                disabled={!season}
                className="p-1.5 rounded-lg text-stone-500 hover:text-white hover:bg-stone-700 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Preview Link */}
        {isOpen && (
          <Link
            to="/tryouts"
            target="_blank"
            className="mt-4 flex items-center justify-center gap-2 text-xs text-stone-500 hover:text-blue-400 transition-colors"
          >
            <span>View tryouts page</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        )}
      </div>
    </div>
  );
}

function RegistrationControl({ season, onUpdate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [tempLabel, setTempLabel] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (season) {
      setIsOpen(season.registration_open || false);
      setLabel(season.registration_label || '');
    }
  }, [season]);

  const handleToggle = async () => {
    if (!season) return;
    setSaving(true);
    const newState = !isOpen;

    try {
      const { error } = await supabase
        .from('seasons')
        .update({ registration_open: newState })
        .eq('id', season.id);

      if (error) throw error;
      setIsOpen(newState);
      onUpdate?.();
    } catch (err) {
      console.error('Failed to update registration:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleLabelSave = async () => {
    if (!season) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from('seasons')
        .update({ registration_label: tempLabel })
        .eq('id', season.id);

      if (error) throw error;
      setLabel(tempLabel);
      setIsEditingLabel(false);
      onUpdate?.();
    } catch (err) {
      console.error('Failed to update label:', err);
    } finally {
      setSaving(false);
    }
  };

  const startEditingLabel = () => {
    setTempLabel(label);
    setIsEditingLabel(true);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-stone-900 via-stone-900 to-stone-800 border border-stone-700/50 p-6">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }} />
      </div>

      {/* Live indicator */}
      <div className="absolute top-4 right-4">
        <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest ${
          isOpen
            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
            : 'bg-stone-700/50 text-stone-500 border border-stone-600/30'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-green-400 animate-pulse' : 'bg-stone-500'}`} />
          {isOpen ? 'Live' : 'Off'}
        </div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-2 rounded-lg ${isOpen ? 'bg-green-500/20' : 'bg-stone-700/50'}`}>
            <Radio className={`w-5 h-5 ${isOpen ? 'text-green-400' : 'text-stone-500'}`} />
          </div>
          <div>
            <h3 className="text-white font-semibold">Registration</h3>
            <p className="text-stone-500 text-xs">Control public registration access</p>
          </div>
        </div>

        {/* Toggle Switch */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggle}
              disabled={saving || !season}
              className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
                isOpen
                  ? 'bg-green-500 shadow-lg shadow-green-500/30'
                  : 'bg-stone-700'
              } ${saving ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
            >
              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 flex items-center justify-center ${
                isOpen ? 'left-7' : 'left-1'
              }`}>
                <Power className={`w-3 h-3 ${isOpen ? 'text-green-500' : 'text-stone-400'}`} />
              </div>
            </button>
            <span className={`text-sm font-medium ${isOpen ? 'text-green-400' : 'text-stone-500'}`}>
              {isOpen ? 'Registration Open' : 'Registration Closed'}
            </span>
          </div>
        </div>

        {/* Label Editor */}
        <div className="bg-stone-800/50 rounded-xl p-4 border border-stone-700/50">
          <label className="text-[10px] font-mono text-stone-500 uppercase tracking-widest mb-2 block">
            Season Label
          </label>

          {isEditingLabel ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tempLabel}
                onChange={(e) => setTempLabel(e.target.value)}
                placeholder="e.g., Fall/Winter '25-26"
                className="flex-1 bg-stone-900 border border-stone-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-tne-red"
                autoFocus
              />
              <button
                onClick={handleLabelSave}
                disabled={saving}
                className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsEditingLabel(false)}
                className="p-2 rounded-lg bg-stone-700 text-stone-400 hover:bg-stone-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className={`text-sm ${label ? 'text-white' : 'text-stone-600 italic'}`}>
                {label || 'No label set'}
              </span>
              <button
                onClick={startEditingLabel}
                disabled={!season}
                className="p-1.5 rounded-lg text-stone-500 hover:text-white hover:bg-stone-700 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Preview Link */}
        {isOpen && (
          <Link
            to="/"
            target="_blank"
            className="mt-4 flex items-center justify-center gap-2 text-xs text-stone-500 hover:text-tne-red transition-colors"
          >
            <span>View on homepage</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        )}
      </div>
    </div>
  );
}

// ============================================
// STAT COMPONENTS
// ============================================

// eslint-disable-next-line no-unused-vars -- Icon is used in JSX
function StatCard({ label, value, loading, icon: Icon, trend, href }) {
  const content = (
    <div className="group relative rounded-xl bg-white border border-stone-200 p-5 hover:border-stone-300 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg bg-stone-100 text-stone-600 group-hover:bg-tne-red/10 group-hover:text-tne-red transition-colors`}>
          <Icon className="w-4 h-4" />
        </div>
        {href && (
          <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-500 group-hover:translate-x-0.5 transition-all" />
        )}
      </div>

      <p className="text-3xl font-bebas text-stone-900 tracking-tight">
        {loading ? (
          <span className="animate-pulse bg-stone-200 rounded w-12 h-8 inline-block" />
        ) : (
          value
        )}
      </p>
      <p className="text-xs text-stone-500 uppercase tracking-wider mt-1">{label}</p>

      {trend && (
        <div className={`absolute bottom-3 right-3 text-[10px] font-medium ${
          trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-stone-400'
        }`}>
          {trend > 0 ? '+' : ''}{trend}%
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link to={href}>{content}</Link>;
  }
  return content;
}

function AlertCard({ count, label, href, type = 'warning' }) {
  if (count === 0) return null;

  const styles = {
    warning: {
      bg: 'bg-amber-50 hover:bg-amber-100/80',
      border: 'border-amber-200 hover:border-amber-300',
      icon: 'text-amber-600',
      text: 'text-amber-900',
      count: 'text-amber-600'
    },
    danger: {
      bg: 'bg-red-50 hover:bg-red-100/80',
      border: 'border-red-200 hover:border-red-300',
      icon: 'text-red-600',
      text: 'text-red-900',
      count: 'text-red-600'
    }
  };

  const s = styles[type];

  return (
    <Link
      to={href}
      className={`flex items-center justify-between px-4 py-3 rounded-xl border ${s.bg} ${s.border} transition-all group`}
    >
      <div className="flex items-center gap-3">
        <AlertTriangle className={`w-4 h-4 ${s.icon}`} />
        <span className={`text-sm font-medium ${s.text}`}>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`font-bebas text-xl ${s.count}`}>{count}</span>
        <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  );
}

// ============================================
// ACTIVITY & EVENT COMPONENTS
// ============================================

function ActivityItem({ activity }) {
  const statusColors = {
    pending: 'bg-amber-500',
    approved: 'bg-green-500',
    rejected: 'bg-red-500',
  };

  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-stone-100 last:border-0 group">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${statusColors[activity.status] || 'bg-stone-300'}`} />
        <div>
          <p className="text-sm font-medium text-stone-900">
            {activity.player_first_name} {activity.player_last_name}
          </p>
          <p className="text-xs text-stone-500 capitalize">{activity.status}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-stone-400">{timeAgo(activity.created_at)}</span>
        <ChevronRight className="w-3 h-3 text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}

function EventItem({ event }) {
  const typeColors = {
    practice: 'bg-blue-500',
    game: 'bg-green-500',
    tournament: 'bg-purple-500',
    tryout: 'bg-amber-500',
    other: 'bg-stone-400',
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    return { day, month };
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'p' : 'a';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes}${ampm}`;
  };

  const { day, month } = formatDate(event.date);

  return (
    <div className="flex items-center gap-4 py-3 border-b border-stone-100 last:border-0 group">
      <div className="text-center w-12 shrink-0">
        <p className="text-[10px] text-stone-500 uppercase">{month}</p>
        <p className="text-xl font-bebas text-stone-900">{day}</p>
      </div>
      <div className={`w-1 h-10 rounded-full ${typeColors[event.event_type] || typeColors.other}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-stone-900 truncate">{event.title}</p>
        <div className="flex items-center gap-2 text-xs text-stone-500">
          {event.start_time && <span>{formatTime(event.start_time)}</span>}
          {event.location && <span className="truncate">• {event.location}</span>}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-stone-300 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

// ============================================
// MAIN DASHBOARD
// ============================================

export default function AdminDashboard() {
  const { profile } = useAuth();
  const { stats, recentActivity, upcomingEvents, loading, error, refetch } = useDashboardStats();
  const { selectedSeason, refetch: refetchSeasons } = useSeason();
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleControlUpdate = () => {
    refetchSeasons();
    refetch();
  };

  const handleUploadSuccess = () => {
    refetch();
  };

  const handleDownloadTemplate = () => {
    const blob = generateTemplateFile();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'team-data-template.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportCurrentData = async () => {
    try {
      const [teamsRes, coachesRes, rosterRes] = await Promise.all([
        supabase.from('teams').select('*'),
        supabase.from('coaches').select('*'),
        // Query team_roster with player and team info
        supabase.from('team_roster').select(`
          team_id,
          jersey_number,
          position,
          teams!inner(id, name),
          players!inner(id, first_name, last_name, date_of_birth, current_grade, graduating_year, gender)
        `).eq('is_active', true),
      ]);

      // Group roster entries by team name
      const rostersMap = new Map();
      rosterRes.data?.forEach(entry => {
        const teamName = entry.teams?.name;
        if (!teamName) return;

        const teamKey = teamName.toLowerCase();
        if (!rostersMap.has(teamKey)) {
          rostersMap.set(teamKey, { team_name: teamName, players: [] });
        }
        rostersMap.get(teamKey).players.push({
          ...entry.players,
          jersey_number: entry.jersey_number,
          position: entry.position,
        });
      });

      const data = {
        teams: teamsRes.data || [],
        coaches: coachesRes.data || [],
        rosters: Array.from(rostersMap.values()),
      };

      const blob = exportToExcel(data);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tne-team-data-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export data:', err);
    }
  };

  // Get current time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="bg-stone-100 text-stone-900 antialiased min-h-screen flex flex-col font-sans">
      <AdminNavbar />
      <ExcelUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={handleUploadSuccess}
        seasonId={selectedSeason?.id}
      />

      <main className="flex-1 px-4 py-6 lg:py-8">
        <div className="max-w-7xl mx-auto">

          {/* ============================================
              HEADER
              ============================================ */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-stone-500 text-xs font-mono mb-1">
                <Clock className="w-3 h-3" />
                <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bebas tracking-tight text-stone-900">
                {getGreeting()}, {profile?.first_name || 'Admin'}
              </h1>
            </div>
            <button
              onClick={refetch}
              className="self-start sm:self-auto px-4 py-2 text-xs font-medium rounded-lg border border-stone-300 text-stone-600 hover:text-stone-900 hover:border-stone-400 hover:bg-white transition-all flex items-center gap-2"
            >
              <Activity className="w-3 h-3" />
              Refresh Data
            </button>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              Failed to load dashboard data: {error}
            </div>
          )}

          {/* ============================================
              CONTROL PANEL + STATS
              ============================================ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">

            {/* Control Panel */}
            <div className="lg:col-span-5">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-tne-red" />
                <h2 className="text-xs font-mono text-stone-500 uppercase tracking-widest">Control Panel</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TryoutsControl
                  season={selectedSeason}
                  onUpdate={handleControlUpdate}
                />
                <RegistrationControl
                  season={selectedSeason}
                  onUpdate={handleControlUpdate}
                />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="lg:col-span-7">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-stone-400" />
                <h2 className="text-xs font-mono text-stone-500 uppercase tracking-widest">Overview</h2>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard
                  label="Teams"
                  value={stats.teams}
                  loading={loading}
                  icon={Users}
                  href="/admin/teams"
                />
                <StatCard
                  label="Players"
                  value={stats.players}
                  loading={loading}
                  icon={UserCheck}
                  href="/admin/players"
                />
                <StatCard
                  label="Registrations"
                  value={stats.registrations}
                  loading={loading}
                  icon={ClipboardList}
                  href="/admin/registrations"
                />
                <StatCard
                  label="Tryouts"
                  value={stats.tryoutSignups}
                  loading={loading}
                  icon={CalendarCheck}
                  href="/admin/tryouts"
                />
              </div>
            </div>
          </div>

          {/* ============================================
              QUICK ACTIONS
              ============================================ */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <FileSpreadsheet className="w-4 h-4 text-stone-400" />
              <h2 className="text-xs font-mono text-stone-500 uppercase tracking-widest">Quick Actions</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-tne-red text-white font-medium text-sm hover:bg-tne-red-dark transition-colors shadow-sm"
              >
                <Upload className="w-4 h-4" />
                Upload Team Data
              </button>
              <button
                onClick={handleExportCurrentData}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white border border-stone-200 text-stone-700 font-medium text-sm hover:bg-stone-50 hover:border-stone-300 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Current Data
              </button>
              <button
                onClick={handleDownloadTemplate}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white border border-stone-200 text-stone-700 font-medium text-sm hover:bg-stone-50 hover:border-stone-300 transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Download Template
              </button>
            </div>
          </div>

          {/* ============================================
              ALERTS
              ============================================ */}
          {stats.pendingRegistrations > 0 && (
            <div className="mb-8">
              <h2 className="text-xs font-mono text-stone-500 uppercase tracking-widest mb-3">
                Requires Attention
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <AlertCard
                  count={stats.pendingRegistrations}
                  label="Pending Registrations"
                  href="/admin/registrations?status=pending"
                  type="warning"
                />
              </div>
            </div>
          )}

          {/* ============================================
              ACTIVITY & EVENTS
              ============================================ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Recent Activity */}
            <div className="rounded-2xl bg-white border border-stone-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-stone-900">Recent Activity</h2>
                <Link
                  to="/admin/registrations"
                  className="text-xs text-stone-500 hover:text-tne-red transition-colors flex items-center gap-1"
                >
                  View all <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="px-5 py-2">
                {loading ? (
                  <div className="space-y-3 py-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-12 bg-stone-100 rounded animate-pulse" />
                    ))}
                  </div>
                ) : recentActivity.length > 0 ? (
                  <div>
                    {recentActivity.map((activity) => (
                      <ActivityItem key={activity.id} activity={activity} />
                    ))}
                  </div>
                ) : (
                  <p className="text-stone-400 text-sm py-8 text-center">No recent activity</p>
                )}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="rounded-2xl bg-white border border-stone-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-stone-900">Upcoming Events</h2>
                <Link
                  to="/admin/games"
                  className="text-xs text-stone-500 hover:text-tne-red transition-colors flex items-center gap-1"
                >
                  View all <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="px-5 py-2">
                {loading ? (
                  <div className="space-y-3 py-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-12 bg-stone-100 rounded animate-pulse" />
                    ))}
                  </div>
                ) : upcomingEvents.length > 0 ? (
                  <div>
                    {upcomingEvents.map((event) => (
                      <EventItem key={event.id} event={event} />
                    ))}
                  </div>
                ) : (
                  <p className="text-stone-400 text-sm py-8 text-center">No upcoming events</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
