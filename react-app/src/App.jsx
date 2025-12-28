import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SeasonProvider } from './contexts/SeasonContext';
import { ProtectedRoute } from './components/ProtectedRoute';
// AI Chat disabled for MVP - re-enable post-MVP (see issue #59)
// import { ChatWidget } from './components/chat';
import HomePage from './pages/HomePage';
import TeamsPage from './pages/TeamsPage';
import TeamDetailPage from './pages/TeamDetailPage';
import SchedulePage from './pages/SchedulePage';
import TournamentDetailPage from './pages/TournamentDetailPage';
import TryoutsPage from './pages/TryoutsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PaymentsPage from './pages/PaymentsPage';
import RegistrationPage from './pages/RegistrationPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import AdminTeamsPage from './pages/AdminTeamsPage';
import AdminPlayersPage from './pages/AdminPlayersPage';
import AdminTeamDetailPage from './pages/AdminTeamDetailPage';
import AdminCoachesPage from './pages/AdminCoachesPage';
import AdminSettingsLayout from './pages/AdminSettingsLayout';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminRegistrationSettings from './pages/AdminRegistrationSettings';
import AdminGamesPage from './pages/AdminGamesPage';
import AdminTournamentDetailPage from './pages/AdminTournamentDetailPage';
import AdminVenuesPage from './pages/AdminVenuesPage';
import AdminHotelsPage from './pages/AdminHotelsPage';
// AI Chat disabled for MVP - re-enable post-MVP (see issue #59)
// import AdminChatAnalyticsPage from './pages/AdminChatAnalyticsPage';

// AI Chat disabled for MVP - re-enable post-MVP (see issue #59)
// function ChatWidgetWrapper() {
//   const location = useLocation();
//   const isAdminPage = location.pathname.startsWith('/admin');
//   const isLoginPage = location.pathname === '/login';
//   if (isAdminPage || isLoginPage) {
//     return null;
//   }
//   return <ChatWidget />;
// }

function App() {
  return (
    <Router>
      <AuthProvider>
        {/* AI Chat disabled for MVP - re-enable post-MVP (see issue #59) */}
        {/* <ChatWidgetWrapper /> */}
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/teams/:teamId" element={<TeamDetailPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/tournaments/:tournamentId" element={<TournamentDetailPage />} />
          <Route path="/tryouts" element={<TryoutsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/register" element={<RegistrationPage />} />
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
          <Route
            path="/admin/games"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SeasonProvider>
                  <AdminGamesPage />
                </SeasonProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/games/:tournamentId"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SeasonProvider>
                  <AdminTournamentDetailPage />
                </SeasonProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/venues"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SeasonProvider>
                  <AdminVenuesPage />
                </SeasonProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/hotels"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SeasonProvider>
                  <AdminHotelsPage />
                </SeasonProvider>
              </ProtectedRoute>
            }
          />
          {/* Redirect old tournaments route to games */}
          <Route path="/admin/tournaments" element={<Navigate to="/admin/games" replace />} />
          {/* AI Chat disabled for MVP - re-enable post-MVP (see issue #59)
          <Route
            path="/admin/chat-analytics"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SeasonProvider>
                  <AdminChatAnalyticsPage />
                </SeasonProvider>
              </ProtectedRoute>
            }
          />
          */}

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
            <Route path="registration" element={<AdminRegistrationSettings />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
