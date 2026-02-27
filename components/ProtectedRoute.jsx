import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export function ProtectedRoute({
  children,
  allowedRoles = [],
  redirectTo = '/login',
}) {
  const { user, profile, profileLoading, loading, error } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Grace period prevents flash-redirects when session cookie hasn't resolved yet.
  // Middleware already handles server-side protection; this is a client-side safety net.
  const [graceExpired, setGraceExpired] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setGraceExpired(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (graceExpired && !loading && !profileLoading && !user && !error) {
      router.replace(`${redirectTo}?from=${encodeURIComponent(pathname)}`);
    }
  }, [graceExpired, loading, profileLoading, user, error, router, redirectTo, pathname]);

  // Show loading state while checking auth, profile, or during grace period (when no user yet)
  if (loading || (user && profileLoading) || (!graceExpired && !user)) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <span className="text-white/60 text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  // Show error state if auth initialization failed
  if (error && !user) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h1 className="text-2xl font-semibold text-white mb-2">
            Connection Error
          </h1>
          <p className="text-white/60 mb-4">
            Unable to connect to authentication service. Please check your connection and try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#8B1F3A] text-white rounded-lg hover:bg-[#8B1F3A]/80 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Not authenticated - show nothing while redirecting
  if (!user) {
    return null;
  }

  // Check role-based access
  if (allowedRoles.length > 0 && !allowedRoles.includes(profile?.role)) {
    // User authenticated but lacks required role
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-white mb-2">
            Access Denied
          </h1>
          <p className="text-white/60">
            You don&apos;t have permission to view this page.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
