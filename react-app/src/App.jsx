import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SeasonProvider } from './contexts/SeasonContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import TeamsPage from './pages/TeamsPage';
import TeamDetailPage from './pages/TeamDetailPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import AdminTeamsPage from './pages/AdminTeamsPage';
import AdminPlayersPage from './pages/AdminPlayersPage';
import AdminTeamDetailPage from './pages/AdminTeamDetailPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/teams/:teamId" element={<TeamDetailPage />} />
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
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
