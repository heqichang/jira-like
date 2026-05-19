import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import SprintsPage from './pages/SprintsPage';
import SprintDetailPage from './pages/SprintDetailPage';
import BacklogPage from './pages/BacklogPage';
import EpicsPage from './pages/EpicsPage';
import EpicDetailPage from './pages/EpicDetailPage';
import StoriesPage from './pages/StoriesPage';
import TimeTrackingPage from './pages/TimeTrackingPage';
import GanttPage from './pages/GanttPage';
import NotificationsPage from './pages/NotificationsPage';
import ProjectSettingsPage from './pages/ProjectSettingsPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAppStore();
  const token = localStorage.getItem('token');
  if (!user && !token) return <Navigate to="/login" />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user, fetchProfile } = useAppStore();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token && !user) {
      fetchProfile();
    }
  }, [token, user, fetchProfile]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <ProjectsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/projects/:projectId"
        element={
          <PrivateRoute>
            <ProjectDetailPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/projects/:projectId/sprints"
        element={
          <PrivateRoute>
            <SprintsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/projects/:projectId/sprints/:sprintId"
        element={
          <PrivateRoute>
            <SprintDetailPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/projects/:projectId/backlog"
        element={
          <PrivateRoute>
            <BacklogPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/projects/:projectId/epics"
        element={
          <PrivateRoute>
            <EpicsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/projects/:projectId/epics/:epicId"
        element={
          <PrivateRoute>
            <EpicDetailPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/projects/:projectId/stories"
        element={
          <PrivateRoute>
            <StoriesPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/projects/:projectId/time-tracking"
        element={
          <PrivateRoute>
            <TimeTrackingPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/projects/:projectId/gantt"
        element={
          <PrivateRoute>
            <GanttPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/projects/:projectId/settings"
        element={
          <PrivateRoute>
            <ProjectSettingsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <PrivateRoute>
            <NotificationsPage />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
