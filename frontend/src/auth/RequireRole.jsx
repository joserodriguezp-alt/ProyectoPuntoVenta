import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function RequireRole({ roles, children }) {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/sin-acceso" replace />;
  }
  return children;
}
