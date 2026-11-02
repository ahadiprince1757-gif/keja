import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps protected routes. Redirects to /login if not authenticated,
 * and verifies allowedRoles if provided.
 */
export default function AuthGuard({ children, allowedRoles }) {
  const { user, isLoggedIn } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!user || !allowedRoles.includes(user.role)) {
      // Role not authorized - redirect to appropriate dashboard or home
      if (user?.role === 'super_admin') {
        return <Navigate to="/admin" replace />;
      }
      if (user?.role === 'owner') {
        return <Navigate to="/dashboard" replace />;
      }
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
