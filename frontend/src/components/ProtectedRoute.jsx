import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Wraps a page; redirects to /login if unauthenticated, and optionally
// restricts to a list of roles (renders "Access denied" otherwise).
export default function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    return <div className="access-denied">You don't have permission to view this page.</div>;
  }
  return children;
}
