import { useAuth } from '../hooks/useAuth';
import { useDashboardStats } from '../hooks/useDashboardStats';
import AdminNavbar from '../components/AdminNavbar';

function StatCard({ label, value, loading, icon }) {
  return (
    <div className="rounded-2xl bg-white border border-stone-200 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-stone-500 uppercase tracking-wider">
          {label}
        </h3>
        {icon && <span className="text-stone-400">{icon}</span>}
      </div>
      <p className="text-3xl font-bebas text-stone-900 mt-2">
        {loading ? (
          <span className="animate-pulse bg-stone-200 rounded w-12 h-8 inline-block" />
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
    default: 'bg-white border border-stone-200 hover:bg-stone-50 hover:border-stone-300 text-stone-700',
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
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
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
    <div className="flex items-center justify-between py-3 border-b border-stone-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${statusColors[activity.status] || 'bg-stone-300'}`} />
        <div>
          <p className="text-sm font-medium text-stone-900">
            {activity.player_first_name} {activity.player_last_name}
          </p>
          <p className="text-xs text-stone-500 capitalize">{activity.status} registration</p>
        </div>
      </div>
      <span className="text-xs text-stone-400">{timeAgo(activity.created_at)}</span>
    </div>
  );
}

function EventItem({ event }) {
  const typeColors = {
    practice: 'bg-blue-100 text-blue-700',
    game: 'bg-green-100 text-green-700',
    tournament: 'bg-purple-100 text-purple-700',
    tryout: 'bg-amber-100 text-amber-700',
    other: 'bg-stone-100 text-stone-600',
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
    <div className="flex items-center gap-4 py-3 border-b border-stone-100 last:border-0">
      <div className="text-center min-w-[60px]">
        <p className="text-xs text-stone-500">{formatDate(event.date)}</p>
        <p className="text-sm font-medium text-stone-900">{formatTime(event.start_time)}</p>
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-stone-900">{event.title}</p>
        {event.location && <p className="text-xs text-stone-500">{event.location}</p>}
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
    <div className="bg-stone-100 text-stone-900 antialiased min-h-screen flex flex-col font-sans">
      <AdminNavbar />

      <main className="flex-1 px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bebas tracking-tight text-stone-900">Admin Dashboard</h1>
              <p className="text-stone-500 mt-1">
                Welcome back, {profile?.first_name || 'Admin'}
              </p>
            </div>
            <button
              onClick={refetch}
              className="px-3 py-1.5 text-xs font-medium rounded-full border border-stone-300 text-stone-600 hover:text-stone-900 hover:border-stone-400 hover:bg-stone-50 transition-colors"
            >
              Refresh
            </button>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
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
              <h2 className="text-lg font-semibold text-stone-900 mb-4">Requires Attention</h2>
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
            <h2 className="text-lg font-semibold text-stone-900 mb-4">Quick Actions</h2>
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
            <div className="rounded-2xl bg-white border border-stone-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-stone-900 mb-4">Recent Activity</h2>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
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
                <p className="text-stone-500 text-sm py-4 text-center">No recent activity</p>
              )}
            </div>

            {/* Upcoming Events */}
            <div className="rounded-2xl bg-white border border-stone-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-stone-900 mb-4">Upcoming Events</h2>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
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
                <p className="text-stone-500 text-sm py-4 text-center">No upcoming events</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
