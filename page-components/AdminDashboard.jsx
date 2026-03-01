import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardStats } from '@/contexts/DashboardStatsContext';
import { useSeason } from '@/contexts/SeasonContext';
import { api } from '@/lib/api-client';
import { generateTemplateFile, exportToExcel } from '@/lib/excelParser';
import ExcelUploadModal from '@/components/admin/ExcelUploadModal';
import {
  ChevronRight,
  Power,
  Pencil,
  Check,
  X,
  ExternalLink,
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
      await api.patch(`/admin/seasons?id=${season.id}`, { tryoutsOpen: newState });
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
      await api.patch(`/admin/seasons?id=${season.id}`, { tryoutsLabel: tempLabel });
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
    <div className="bg-white rounded-[14px] p-5 border-[1.5px] border-admin-card-border">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-admin-text">Tryouts</h3>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
          isOpen
            ? 'bg-admin-success-bg text-admin-success'
            : 'bg-stone-100 text-admin-text-muted'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-[#4CAF50]' : 'bg-admin-text-muted'}`} />
          {isOpen ? 'Live' : 'Off'}
        </div>
      </div>

      {/* Description */}
      <p className="text-[13px] text-admin-text-secondary mb-4">
        {isOpen ? 'Open' : 'Closed'} · {season?.name || 'No season'} · {label || 'No label'}
      </p>

      {/* Toggle */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={handleToggle}
          disabled={saving || !season}
          className={`relative w-12 h-7 rounded-full transition-all duration-300 ${
            isOpen ? 'bg-admin-success' : 'bg-stone-300'
          } ${saving ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
        >
          <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-all duration-300 flex items-center justify-center ${
            isOpen ? 'left-[22px]' : 'left-0.5'
          }`}>
            <Power className={`w-3 h-3 ${isOpen ? 'text-admin-success' : 'text-stone-400'}`} />
          </div>
        </button>
        <span className={`text-sm font-medium ${isOpen ? 'text-admin-success' : 'text-admin-text-muted'}`}>
          {isOpen ? 'Open' : 'Closed'}
        </span>
      </div>

      {/* Label Editor */}
      <div className="bg-admin-content-bg rounded-[10px] p-3 border border-admin-card-border mb-4">
        <label className="text-[10px] font-admin-mono text-admin-text-muted uppercase tracking-[0.05em] mb-1.5 block">
          Tryout Label
        </label>
        {isEditingLabel ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={tempLabel}
              onChange={(e) => setTempLabel(e.target.value)}
              placeholder="e.g., Winter '25-26 Tryouts"
              className="flex-1 bg-white border border-admin-card-border rounded-[10px] px-3 py-2 text-admin-text text-sm focus:outline-none focus:border-admin-red/40"
              autoFocus
            />
            <button onClick={handleLabelSave} disabled={saving} className="p-2 rounded-lg text-admin-success hover:bg-admin-success-bg transition-colors">
              <Check className="w-4 h-4" />
            </button>
            <button onClick={() => setIsEditingLabel(false)} className="p-2 rounded-lg text-admin-text-muted hover:bg-stone-100 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className={`text-sm ${label ? 'text-admin-text' : 'text-admin-text-muted italic'}`}>
              {label || 'No label set'}
            </span>
            <button onClick={startEditingLabel} disabled={!season} className="p-1.5 rounded-lg text-admin-text-muted hover:text-admin-text hover:bg-stone-100 transition-colors">
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Link
          href="/admin/tryouts"
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-[10px] border-[1.5px] border-admin-card-border text-sm font-medium text-admin-text hover:bg-stone-50 transition-colors"
        >
          View Signups
        </Link>
        <button
          onClick={startEditingLabel}
          className="flex items-center justify-center px-3 py-2.5 rounded-[10px] border-[1.5px] border-admin-card-border text-admin-text-secondary hover:bg-stone-50 transition-colors"
        >
          <Pencil className="w-4 h-4" />
        </button>
      </div>

      {isOpen && (
        <Link
          href="/tryouts"
          target="_blank"
          className="mt-3 flex items-center justify-center gap-1.5 text-xs text-admin-text-muted hover:text-admin-red transition-colors"
        >
          View tryouts page <ExternalLink className="w-3 h-3" />
        </Link>
      )}
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
      await api.patch(`/admin/seasons?id=${season.id}`, { registrationOpen: newState });
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
      await api.patch(`/admin/seasons?id=${season.id}`, { registrationLabel: tempLabel });
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
    <div className="bg-white rounded-[14px] p-5 border-[1.5px] border-admin-card-border">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-admin-text">Registration</h3>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
          isOpen
            ? 'bg-admin-success-bg text-admin-success'
            : 'bg-stone-100 text-admin-text-muted'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-[#4CAF50]' : 'bg-admin-text-muted'}`} />
          {isOpen ? 'Live' : 'Off'}
        </div>
      </div>

      {/* Description */}
      <p className="text-[13px] text-admin-text-secondary mb-4">
        {isOpen ? 'Open' : 'Closed'} · {season?.name || 'No season'} · {label || 'No label'}
      </p>

      {/* Toggle */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={handleToggle}
          disabled={saving || !season}
          className={`relative w-12 h-7 rounded-full transition-all duration-300 ${
            isOpen ? 'bg-admin-success' : 'bg-stone-300'
          } ${saving ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
        >
          <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-all duration-300 flex items-center justify-center ${
            isOpen ? 'left-[22px]' : 'left-0.5'
          }`}>
            <Power className={`w-3 h-3 ${isOpen ? 'text-admin-success' : 'text-stone-400'}`} />
          </div>
        </button>
        <span className={`text-sm font-medium ${isOpen ? 'text-admin-success' : 'text-admin-text-muted'}`}>
          {isOpen ? 'Open' : 'Closed'}
        </span>
      </div>

      {/* Label Editor */}
      <div className="bg-admin-content-bg rounded-[10px] p-3 border border-admin-card-border mb-4">
        <label className="text-[10px] font-admin-mono text-admin-text-muted uppercase tracking-[0.05em] mb-1.5 block">
          Season Label
        </label>
        {isEditingLabel ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={tempLabel}
              onChange={(e) => setTempLabel(e.target.value)}
              placeholder="e.g., Fall/Winter '25-26"
              className="flex-1 bg-white border border-admin-card-border rounded-[10px] px-3 py-2 text-admin-text text-sm focus:outline-none focus:border-admin-red/40"
              autoFocus
            />
            <button onClick={handleLabelSave} disabled={saving} className="p-2 rounded-lg text-admin-success hover:bg-admin-success-bg transition-colors">
              <Check className="w-4 h-4" />
            </button>
            <button onClick={() => setIsEditingLabel(false)} className="p-2 rounded-lg text-admin-text-muted hover:bg-stone-100 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className={`text-sm ${label ? 'text-admin-text' : 'text-admin-text-muted italic'}`}>
              {label || 'No label set'}
            </span>
            <button onClick={startEditingLabel} disabled={!season} className="p-1.5 rounded-lg text-admin-text-muted hover:text-admin-text hover:bg-stone-100 transition-colors">
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Link
          href="/admin/registrations"
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-[10px] border-[1.5px] border-admin-card-border text-sm font-medium text-admin-text hover:bg-stone-50 transition-colors"
        >
          View Signups
        </Link>
        <button
          onClick={startEditingLabel}
          className="flex items-center justify-center px-3 py-2.5 rounded-[10px] border-[1.5px] border-admin-card-border text-admin-text-secondary hover:bg-stone-50 transition-colors"
        >
          <Pencil className="w-4 h-4" />
        </button>
      </div>

      {isOpen && (
        <Link
          href="/"
          target="_blank"
          className="mt-3 flex items-center justify-center gap-1.5 text-xs text-admin-text-muted hover:text-admin-red transition-colors"
        >
          View on homepage <ExternalLink className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}

// ============================================
// STAT COMPONENTS
// ============================================

// Stat card — 4-column grid per design spec
// eslint-disable-next-line no-unused-vars -- Icon is used in JSX
function StatCard({ label, value, subtitle, loading, accent, href }) {
  const content = (
    <div className={`relative bg-white rounded-[12px] p-5 border-[1.5px] border-admin-card-border overflow-hidden hover:bg-stone-50/50 transition-colors ${accent ? '' : ''}`}>
      {accent && (
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-admin-red" />
      )}
      <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-admin-text-secondary mb-2">
        {label}
      </p>
      <p className="text-[36px] md:text-[36px] font-admin-mono font-extrabold text-admin-text leading-none tracking-[-0.03em]">
        {loading ? (
          <span className="animate-pulse bg-stone-200 rounded w-12 h-9 inline-block" />
        ) : (
          value
        )}
      </p>
      {subtitle && (
        <p className="text-xs text-admin-text-muted mt-1.5">{subtitle}</p>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

// ============================================
// ACTIVITY & EVENT COMPONENTS
// ============================================

function ActivityItem({ activity }) {
  const isTryout = activity.type === 'tryout_signup';

  const iconConfig = isTryout
    ? { bg: 'bg-blue-50', emoji: '\u{1F3C0}' }
    : { bg: 'bg-red-50', emoji: '\u{1F4B2}' };

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
    <div className="flex items-center gap-3 py-3 border-b border-[#F2F2F0] last:border-0 group">
      <div className={`w-10 h-10 rounded-[10px] ${iconConfig.bg} flex items-center justify-center shrink-0 text-lg`}>
        {iconConfig.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-admin-text truncate">
          {activity.player_first_name} {activity.player_last_name}
        </p>
        <div className="flex items-center gap-1.5">
          <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold rounded ${
            isTryout ? 'bg-blue-50 text-blue-700' : 'bg-[#FFF3F0] text-admin-red'
          }`}>
            {isTryout ? 'Tryout' : 'Reg'}
          </span>
          <span className="text-xs text-admin-text-secondary capitalize">{activity.status}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[11px] text-admin-text-muted">{timeAgo(activity.created_at)}</span>
      </div>
    </div>
  );
}

function EventItem({ event }) {
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
    <div className="flex items-center gap-3 py-3 border-b border-[#F2F2F0] last:border-0 group">
      <div className="w-10 h-10 rounded-[10px] bg-blue-50 flex flex-col items-center justify-center shrink-0">
        <p className="text-[9px] text-admin-text-secondary uppercase leading-none">{month}</p>
        <p className="text-base font-admin-mono font-bold text-admin-text leading-none">{day}</p>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-admin-text truncate">{event.title}</p>
        <div className="flex items-center gap-2 text-xs text-admin-text-secondary">
          {event.start_time && <span>{formatTime(event.start_time)}</span>}
          {event.location && <span className="truncate">{event.location}</span>}
        </div>
      </div>
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
  const isAdmin = profile?.role === 'admin';

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
      const params = selectedSeason?.id ? `?seasonId=${selectedSeason.id}` : '';
      // Fetch data from API endpoints
      const [teamsData, coachesData, playersData] = await Promise.all([
        api.get(`/admin/teams${params}`),
        api.get('/admin/coaches'),
        api.get(`/admin/players${params}`),
      ]);

      // Group players by team name for rosters
      const rostersMap = new Map();
      (playersData || []).forEach(player => {
        const teamName = player.team?.name || player.teamName;
        if (!teamName) return;

        const teamKey = teamName.toLowerCase();
        if (!rostersMap.has(teamKey)) {
          rostersMap.set(teamKey, { team_name: teamName, players: [] });
        }
        rostersMap.get(teamKey).players.push({
          id: player.id,
          first_name: player.firstName || player.first_name,
          last_name: player.lastName || player.last_name,
          date_of_birth: player.dateOfBirth || player.date_of_birth,
          current_grade: player.currentGrade || player.current_grade,
          graduating_year: player.graduatingYear || player.graduating_year,
          gender: player.gender,
          jersey_number: player.jerseyNumber || player.jersey_number,
          position: player.position,
        });
      });

      const data = {
        teams: teamsData || [],
        coaches: coachesData || [],
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
    <>
      <ExcelUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={handleUploadSuccess}
        seasonId={selectedSeason?.id}
      />

      <div className="max-w-7xl mx-auto">

        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-[22px] md:text-[22px] font-extrabold text-admin-text tracking-[-0.02em] leading-tight">
            {getGreeting()}, {profile?.first_name || (isAdmin ? 'Admin' : 'Coach')}
          </h1>
          <div className="flex items-center gap-2 text-admin-text-muted text-[11px] mt-1">
            <Clock className="w-3 h-3" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-[12px] bg-red-50 border-[1.5px] border-red-200 text-red-700 text-sm flex items-center gap-2">
            <span className="flex-1">Failed to load dashboard data: {error}</span>
            <button onClick={refetch} className="ml-auto text-red-800 underline hover:text-red-900 font-medium whitespace-nowrap">
              Retry
            </button>
          </div>
        )}

        {/* Stat Cards — 4-column grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
          <StatCard
            label="Events"
            value={upcomingEvents.length}
            subtitle={upcomingEvents.length === 0 ? 'No upcoming' : `${upcomingEvents.length} upcoming`}
            loading={loading}
            href="/admin/games"
          />
          <StatCard
            label="Active Players"
            value={stats.players}
            subtitle={stats.players > 0 ? `${stats.players} on roster` : 'No active players'}
            loading={loading}
            href="/admin/players"
          />
          <StatCard
            label="Registrations"
            value={stats.registrations}
            subtitle={stats.pendingRegistrations > 0 ? `${stats.pendingRegistrations} pending` : 'All processed'}
            loading={loading}
            href="/admin/registrations"
          />
          {isAdmin && (
            <StatCard
              label="Tryout Signups"
              value={stats.tryoutSignups}
              subtitle={stats.tryoutSignups > 0 ? `+${stats.tryoutSignups} new` : 'None yet'}
              loading={loading}
              accent
              href="/admin/tryouts"
            />
          )}
        </div>

        {/* Two-column: Activity feed (wider) + right column */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5">

          {/* Left: Recent Activity */}
          <div className="bg-white rounded-[14px] border-[1.5px] border-admin-card-border overflow-hidden">
            <div className="px-5 py-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-admin-text">Recent Activity</h2>
              <Link
                href="/admin/registrations"
                className="text-xs text-admin-text-muted hover:text-admin-red transition-colors flex items-center gap-0.5"
              >
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="px-5 pb-4">
              {loading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-stone-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : recentActivity.length > 0 ? (
                <div>
                  {recentActivity.slice(0, 5).map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-2xl opacity-50 mb-1">📋</p>
                  <p className="text-[13px] text-admin-text-muted">No recent activity</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Control panels + Upcoming Events stacked */}
          <div className="space-y-4">
            {/* Control Panels */}
            {isAdmin && (
              <>
                <TryoutsControl
                  season={selectedSeason}
                  onUpdate={handleControlUpdate}
                />
                <RegistrationControl
                  season={selectedSeason}
                  onUpdate={handleControlUpdate}
                />
              </>
            )}

            {/* Upcoming Events */}
            <div className="bg-white rounded-[14px] border-[1.5px] border-admin-card-border overflow-hidden">
              <div className="px-5 py-4 flex items-center justify-between">
                <h2 className="text-base font-bold text-admin-text">Upcoming Events</h2>
                <Link
                  href="/admin/games"
                  className="text-xs text-admin-text-muted hover:text-admin-red transition-colors flex items-center gap-0.5"
                >
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="px-5 pb-4">
                {loading ? (
                  <div className="space-y-2">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="h-12 bg-stone-100 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : upcomingEvents.length > 0 ? (
                  <div>
                    {upcomingEvents.slice(0, 4).map((event) => (
                      <EventItem key={event.id} event={event} />
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center">
                    <p className="text-2xl opacity-50 mb-1">📅</p>
                    <p className="text-[13px] text-admin-text-muted">No upcoming events</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            {isAdmin && (
              <div className="bg-white rounded-[14px] border-[1.5px] border-admin-card-border p-5">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.05em] text-admin-text-secondary mb-3">Quick Actions</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-admin-red text-white text-xs font-medium hover:opacity-85 transition-opacity"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload Data
                  </button>
                  <button
                    onClick={handleExportCurrentData}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border-[1.5px] border-admin-card-border text-admin-text-secondary text-xs font-medium hover:bg-stone-50 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export Data
                  </button>
                  <button
                    onClick={handleDownloadTemplate}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border-[1.5px] border-admin-card-border text-admin-text-secondary text-xs font-medium hover:bg-stone-50 transition-colors"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    Template
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
}
