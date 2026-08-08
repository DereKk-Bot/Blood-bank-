import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" replace />;
}

export function RoleRoute({ allowedRoles, children }) {
  const { userProfile } = useAuth();
  if (!userProfile) return <div style={{ padding: '20px' }}>Loading permissions...</div>;
  if (allowedRoles.includes(userProfile.role)) {
    return children;
  }
  return <div style={{ padding: '20px' }}>Access Denied for role: {userProfile.role}</div>;
}
