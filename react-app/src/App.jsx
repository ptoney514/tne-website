import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SeasonProvider } from './contexts/SeasonContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import TeamsPage from './pages/TeamsPage';
import TeamDetailPage from './pages/TeamDetailPage';
import SchedulePage from './pages/SchedulePage';
import TryoutsPage from './pages/TryoutsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import AdminTeamsPage from './pages/AdminTeamsPage';
import AdminPlayersPage from './pages/AdminPlayersPage';
import AdminTeamDetailPage from './pages/AdminTeamDetailPage';
import AdminCoachesPage from './pages/AdminCoachesPage';
import AdminSettingsLayout from './pages/AdminSettingsLayout';
import AdminUsersPage from './pages/AdminUsersPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/teams/:teamId" element={<TeamDetailPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/tryouts" element={<TryoutsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Protected admin routes - wrapped with SeasonProvider */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SeasonProvider>
                  <AdminDashboard />
                </SeasonProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/teams"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SeasonProvider>
                  <AdminTeamsPage />
                </SeasonProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/teams/:teamId/roster"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SeasonProvider>
                  <AdminTeamDetailPage />
                </SeasonProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/players"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SeasonProvider>
                  <AdminPlayersPage />
                </SeasonProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/coaches"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SeasonProvider>
                  <AdminCoachesPage />
                </SeasonProvider>
              </ProtectedRoute>
            }
          />

          {/* Settings routes - redirect /admin/settings to /admin/settings/users */}
          <Route
            path="/admin/settings"
            element={<Navigate to="/admin/settings/users" replace />}
          />
          <Route
            path="/admin/settings/*"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SeasonProvider>
                  <AdminSettingsLayout />
                </SeasonProvider>
              </ProtectedRoute>
            }
          >
            <Route path="users" element={<AdminUsersPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
