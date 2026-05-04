import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Redirects to /login if no authenticated user.
 * Optionally restricts to a specific role.
 */
export const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    // Redirect to the user's own dashboard if accessing wrong role
    const roleRoutes = { admin: '/admin', doctor: '/doctor', patient: '/patient' };
    return <Navigate to={roleRoutes[user.role] ?? '/login'} replace />;
  }

  return children;
};

export default ProtectedRoute;
