import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ToasterProvider } from './context/ToasterContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Layout } from './components/Layout';

// ─── Lazy-loaded pages ────────────────────────────────────────────────────────
const Login            = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const PatientDashboard = lazy(() => import('./pages/PatientDashboard'));
const DoctorDashboard  = lazy(() => import('./pages/DoctorDashboard'));
const AdminDashboard   = lazy(() => import('./pages/AdminDashboard'));
const AdminDoctors     = lazy(() => import('./pages/admin/Doctors'));
const AdminPatients    = lazy(() => import('./pages/admin/Patients'));
const AdminAvailability= lazy(() => import('./pages/admin/Availability'));
const NotFound         = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));

// ─── Page loader ──────────────────────────────────────────────────────────────
const PageLoader = () => (
  <Box display="flex" alignItems="center" justifyContent="center" height="100vh">
    <CircularProgress color="primary" />
  </Box>
);

// ─── Role-based root redirect ─────────────────────────────────────────────────
const RootRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const routes = { admin: '/admin', doctor: '/doctor', patient: '/patient' };
  return <Navigate to={routes[user.role] ?? '/login'} replace />;
};

// ─── Protected shell with layout ─────────────────────────────────────────────
const AppShell = ({ children, role }) => (
  <ProtectedRoute role={role}>
    <Layout>{children}</Layout>
  </ProtectedRoute>
);

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <ToasterProvider>
        <Router>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public */}
              <Route path="/login" element={<Login />} />

              {/* Root → role-based redirect */}
              <Route path="/" element={<RootRedirect />} />

              {/* Patient */}
              <Route
                path="/patient"
                element={
                  <AppShell role="patient">
                    <PatientDashboard />
                  </AppShell>
                }
              />

              {/* Doctor */}
              <Route
                path="/doctor"
                element={
                  <AppShell role="doctor">
                    <DoctorDashboard />
                  </AppShell>
                }
              />

              {/* Admin — appointments overview */}
              <Route
                path="/admin"
                element={
                  <AppShell role="admin">
                    <AdminDashboard />
                  </AppShell>
                }
              />

              {/* Admin sub-pages */}
              <Route
                path="/admin/doctors"
                element={
                  <AppShell role="admin">
                    <AdminDoctors />
                  </AppShell>
                }
              />
              <Route
                path="/admin/patients"
                element={
                  <AppShell role="admin">
                    <AdminPatients />
                  </AppShell>
                }
              />
              <Route
                path="/admin/availability"
                element={
                  <AppShell role="admin">
                    <AdminAvailability />
                  </AppShell>
                }
              />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Router>
      </ToasterProvider>
    </AuthProvider>
  );
}

export default App;
