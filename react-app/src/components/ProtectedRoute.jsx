import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute({
  children,
  allowedRoles = [],
  redirectTo = '/login',
}) {
  const { user, profile, profileLoading, loading, error } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth or profile
  if (loading || (user && profileLoading)) {
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

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
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
