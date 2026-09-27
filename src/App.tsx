import type { ReactNode } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AppShell } from './components/AppShell'
import { LoadingScreen } from './components/LoadingScreen'
import { useAuth } from './contexts/AuthContext'
import type { UserRole } from './lib/types'
import { WelcomePage } from './pages/auth/WelcomePage'
import { RoleSelectionPage } from './pages/auth/RoleSelectionPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage'
import { AlumniLayout } from './pages/alumni/AlumniLayout'
import { AlumniEventsPage } from './pages/alumni/AlumniEventsPage'
import { AlumniDocumentsPage } from './pages/alumni/AlumniDocumentsPage'
import { AlumniExperiencesPage } from './pages/alumni/AlumniExperiencesPage'
import { AddExperiencePage } from './pages/alumni/AddExperiencePage'
import { CareerMentorshipPage } from './pages/alumni/CareerMentorshipPage'
import { AlumniProfilePage } from './pages/alumni/AlumniProfilePage'
import { EditProfilePage } from './pages/alumni/EditProfilePage'
import { AlumniSettingsPage } from './pages/alumni/AlumniSettingsPage'
import { SsdLayout } from './pages/ssd/SsdLayout'
import { SsdRequestsPage } from './pages/ssd/SsdRequestsPage'
import { SsdRequestDetailsPage } from './pages/ssd/SsdRequestDetailsPage'
import { SsdCreateEventPage } from './pages/ssd/SsdCreateEventPage'
import { SsdAlertsPage } from './pages/ssd/SsdAlertsPage'
import { SsdSettingsPage } from './pages/ssd/SsdSettingsPage'
import { DepartmentLayout } from './pages/department/DepartmentLayout'
import { DepartmentDashboardPage } from './pages/department/DepartmentDashboardPage'
import { DepartmentAlumniPage } from './pages/department/DepartmentAlumniPage'
import { DepartmentCreateEventPage } from './pages/department/DepartmentCreateEventPage'
import { DepartmentCommunicationPage } from './pages/department/DepartmentCommunicationPage'
import { DepartmentSettingsPage } from './pages/department/DepartmentSettingsPage'

function homeForRole(role: UserRole): string {
  if (role === 'ssd') return '/ssd/requests'
  if (role === 'dept') return '/department/dashboard'
  return '/alumni/events'
}

function ProtectedRoute({ role }: { role: UserRole }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingScreen />
  if (!user) {
    const portal = role === 'ssd' ? 'ssd' : role === 'dept' ? 'dept' : 'alumni'
    return <Navigate to={`/login/${portal}`} replace state={{ from: location }} />
  }
  if (user.role !== role) {
    return <Navigate to={homeForRole(user.role)} replace />
  }
  return <Outlet />
}

function PublicOnly({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (user) return <Navigate to={homeForRole(user.role)} replace />
  return children
}

export default function App() {
  const location = useLocation()

  return (
    <AppShell>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname.split('/').slice(0, 3).join('/')}>
          <Route
            path="/"
            element={
              <PublicOnly>
                <WelcomePage />
              </PublicOnly>
            }
          />
          <Route
            path="/role"
            element={
              <PublicOnly>
                <RoleSelectionPage />
              </PublicOnly>
            }
          />
          <Route path="/login/:roleKey" element={<LoginPage />} />
          <Route path="/register/:roleKey" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          <Route element={<ProtectedRoute role="alumni" />}>
            <Route path="/alumni" element={<AlumniLayout />}>
              <Route index element={<Navigate to="events" replace />} />
              <Route path="events" element={<AlumniEventsPage />} />
              <Route path="documents" element={<AlumniDocumentsPage />} />
              <Route path="experiences" element={<AlumniExperiencesPage />} />
              <Route path="experiences/add" element={<AddExperiencePage />} />
              <Route path="career" element={<CareerMentorshipPage />} />
              <Route path="profile" element={<AlumniProfilePage />} />
              <Route path="edit-profile" element={<EditProfilePage />} />
              <Route path="settings" element={<AlumniSettingsPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute role="ssd" />}>
            <Route path="/ssd" element={<SsdLayout />}>
              <Route index element={<Navigate to="requests" replace />} />
              <Route path="requests" element={<SsdRequestsPage />} />
              <Route path="requests/:id" element={<SsdRequestDetailsPage />} />
              <Route path="events" element={<SsdCreateEventPage />} />
              <Route path="alerts" element={<SsdAlertsPage />} />
              <Route path="settings" element={<SsdSettingsPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute role="dept" />}>
            <Route path="/department" element={<DepartmentLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DepartmentDashboardPage />} />
              <Route path="alumni" element={<DepartmentAlumniPage />} />
              <Route path="events" element={<DepartmentCreateEventPage />} />
              <Route path="communication" element={<DepartmentCommunicationPage />} />
              <Route path="settings" element={<DepartmentSettingsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </AppShell>
  )
}
