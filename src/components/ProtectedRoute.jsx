import React from 'react';
import { Navigate } from 'react-router-dom';
import { getUser } from '../auth';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const user = getUser();
  if (!user) return <Navigate to="/auth" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
};

export default ProtectedRoute;
