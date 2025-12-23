import { useAuth } from '../hooks/useAuth';
import { useDashboardStats } from '../hooks/useDashboardStats';
import TeamsNavbar from '../components/TeamsNavbar';
import TeamsFooter from '../components/TeamsFooter';

function StatCard({ label, value, loading, icon }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">
          {label}
        </h3>
        {icon && <span className="text-white/40">{icon}</span>}
      </div>
      <p className="text-3xl font-bebas mt-2">
        {loading ? (
          <span className="animate-pulse bg-white/10 rounded w-12 h-8 inline-block" />
        ) : (
          value
        )}
      </p>
    </div>
  );
}

function QuickActionButton({ label, href, variant = 'default' }) {
  const baseClasses = 'px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2';
  const variants = {
    default: 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20',
    primary: 'bg-tne-red hover:bg-tne-red-dark text-white',
  };

  return (
    <a href={href} className={`${baseClasses} ${variants[variant]}`}>
      {label}
    </a>
  );
}

function AlertBadge({ count, label, type = 'warning' }) {
  if (count === 0) return null;

  const colors = {
    warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  return (
    <div className={`flex items-center justify-between px-4 py-3 rounded-xl border ${colors[type]}`}>
      <span className="text-sm">{label}</span>
      <span className="font-bebas text-lg">{count}</span>
    </div>
  );
}

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

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${statusColors[activity.status] || 'bg-white/40'}`} />
        <div>
          <p className="text-sm font-medium">
            {activity.player_first_name} {activity.player_last_name}
          </p>
          <p className="text-xs text-white/50 capitalize">{activity.status} registration</p>
        </div>
      </div>
      <span className="text-xs text-white/40">{timeAgo(activity.created_at)}</span>
    </div>
  );
}

function EventItem({ event }) {
  const typeColors = {
    practice: 'bg-blue-500/20 text-blue-400',
    game: 'bg-green-500/20 text-green-400',
    tournament: 'bg-purple-500/20 text-purple-400',
    tryout: 'bg-amber-500/20 text-amber-400',
    other: 'bg-white/10 text-white/60',
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
      <div className="text-center min-w-[60px]">
        <p className="text-xs text-white/50">{formatDate(event.date)}</p>
        <p className="text-sm font-medium">{formatTime(event.start_time)}</p>
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{event.title}</p>
        {event.location && <p className="text-xs text-white/50">{event.location}</p>}
      </div>
      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${typeColors[event.event_type]}`}>
        {event.event_type}
      </span>
    </div>
  );
}

export default function AdminDashboard() {
  const { profile } = useAuth();
  const { stats, recentActivity, upcomingEvents, loading, error, refetch } = useDashboardStats();

  return (
    <div className="bg-[#050505] text-white antialiased min-h-screen flex flex-col font-sans">
      <TeamsNavbar />

      <main className="flex-1 px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bebas tracking-tight">Admin Dashboard</h1>
              <p className="text-white/60 mt-1">
                Welcome back, {profile?.first_name || 'Admin'}
              </p>
            </div>
            <button
              onClick={refetch}
              className="px-3 py-1.5 text-xs font-medium rounded-full border border-white/15 text-white/80 hover:text-white hover:border-white/40 transition-colors"
            >
              Refresh
            </button>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
              Failed to load dashboard data: {error}
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Active Teams" value={stats.teams} loading={loading} />
            <StatCard label="Players" value={stats.players} loading={loading} />
            <StatCard label="Registrations" value={stats.registrations} loading={loading} />
            <StatCard label="Tryout Signups" value={stats.tryoutSignups} loading={loading} />
          </div>

          {/* Alerts Section */}
          {(stats.pendingRegistrations > 0 || stats.pendingPayments > 0) && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Requires Attention</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AlertBadge
                  count={stats.pendingRegistrations}
                  label="Pending Registrations"
                  type="warning"
                />
                <AlertBadge
                  count={stats.pendingPayments}
                  label="Pending Payments"
                  type="warning"
                />
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <QuickActionButton label="View Registrations" href="/admin/registrations" />
              <QuickActionButton label="Manage Teams" href="/admin/teams" />
              <QuickActionButton label="View Players" href="/admin/players" />
              <QuickActionButton label="Schedule Events" href="/admin/events" />
              <QuickActionButton label="Tryout Sessions" href="/admin/tryouts" />
              <QuickActionButton label="Create Announcement" href="/admin/announcements" variant="primary" />
            </div>
          </div>

          {/* Two Column Layout for Activity and Events */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-white/5 rounded animate-pulse" />
                  ))}
                </div>
              ) : recentActivity.length > 0 ? (
                <div>
                  {recentActivity.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              ) : (
                <p className="text-white/50 text-sm py-4 text-center">No recent activity</p>
              )}
            </div>

            {/* Upcoming Events */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <h2 className="text-lg font-semibold mb-4">Upcoming Events</h2>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-white/5 rounded animate-pulse" />
                  ))}
                </div>
              ) : upcomingEvents.length > 0 ? (
                <div>
                  {upcomingEvents.map((event) => (
                    <EventItem key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <p className="text-white/50 text-sm py-4 text-center">No upcoming events</p>
              )}
            </div>
          </div>
        </div>
      </main>

      <TeamsFooter />
    </div>
  );
}
