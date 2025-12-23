import { useAuth } from '../hooks/useAuth';
import TeamsNavbar from '../components/TeamsNavbar';
import TeamsFooter from '../components/TeamsFooter';

export default function AdminDashboard() {
  const { profile } = useAuth();

  return (
    <div className="bg-[#050505] text-white antialiased min-h-screen flex flex-col font-sans">
      <TeamsNavbar />

      <main className="flex-1 px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bebas tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-white/60 mt-1">
              Welcome back, {profile?.first_name || 'Admin'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">
                Teams
              </h3>
              <p className="text-3xl font-bebas mt-2">--</p>
            </div>
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">
                Players
              </h3>
              <p className="text-3xl font-bebas mt-2">--</p>
            </div>
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">
                Registrations
              </h3>
              <p className="text-3xl font-bebas mt-2">--</p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl bg-white/5 border border-white/10 p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <p className="text-white/60 text-sm">
              Admin features coming soon. This dashboard will include team
              management, player registration, and tournament management.
            </p>
          </div>
        </div>
      </main>

      <TeamsFooter />
    </div>
  );
}
