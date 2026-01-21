import { useAuth } from '../hooks/useAuth';
import TeamsNavbar from '../components/TeamsNavbar';
import TeamsFooter from '../components/TeamsFooter';

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-white/5 last:border-0">
      <span className="text-sm text-white/50 sm:w-32 mb-1 sm:mb-0">{label}</span>
      <span className="text-sm font-medium">{value || '—'}</span>
    </div>
  );
}

function RoleBadge({ role }) {
  const colors = {
    admin: 'bg-tne-red/20 text-tne-red border-tne-red/30',
    coach: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    parent: 'bg-green-500/20 text-green-400 border-green-500/30',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider border ${colors[role] || 'bg-white/10 text-white/60 border-white/20'}`}>
      {role}
    </span>
  );
}

export default function ProfilePage() {
  const { user, profile, loading, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="bg-[#050505] text-white antialiased min-h-screen flex flex-col font-sans">
        <TeamsNavbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-white/50">Loading...</div>
        </main>
        <TeamsFooter />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-[#050505] text-white antialiased min-h-screen flex flex-col font-sans">
        <TeamsNavbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bebas mb-2">Not Logged In</h1>
            <p className="text-white/60 mb-4">Please log in to view your profile.</p>
            <a
              href="/login"
              className="inline-block px-4 py-2 bg-tne-red hover:bg-tne-red-dark rounded-xl text-sm font-medium transition-colors"
            >
              Log In
            </a>
          </div>
        </main>
        <TeamsFooter />
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-[#050505] text-white antialiased min-h-screen flex flex-col font-sans">
      <TeamsNavbar />

      <main className="flex-1 px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bebas tracking-tight">My Profile</h1>
            <p className="text-white/60 mt-1">View and manage your account information</p>
          </div>

          {/* Profile Card */}
          <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
            {/* Profile Header */}
            <div className="p-6 border-b border-white/10 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-tne-maroon to-tne-red flex items-center justify-center text-2xl font-bebas">
                {profile?.first_name?.[0] || user.email?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold">
                  {profile?.first_name} {profile?.last_name}
                </h2>
                <p className="text-white/60 text-sm">{user.email}</p>
              </div>
              <RoleBadge role={profile?.role} />
            </div>

            {/* Profile Details */}
            <div className="p-6">
              <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">
                Account Details
              </h3>
              <InfoRow label="Email" value={profile?.email || user.email} />
              <InfoRow label="First Name" value={profile?.first_name} />
              <InfoRow label="Last Name" value={profile?.last_name} />
              <InfoRow label="Phone" value={profile?.phone} />
              <InfoRow label="Role" value={profile?.role} />
              <InfoRow label="Member Since" value={formatDate(profile?.created_at)} />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            {profile?.role === 'admin' && (
              <a
                href="/admin"
                className="px-4 py-2.5 rounded-xl text-sm font-medium bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-colors text-center"
              >
                Go to Admin Dashboard
              </a>
            )}
            <button
              onClick={handleSignOut}
              className="px-4 py-2.5 rounded-xl text-sm font-medium bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </main>

      <TeamsFooter />
    </div>
  );
}
