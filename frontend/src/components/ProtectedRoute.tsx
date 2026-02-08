import React from 'react';
import { Navigate } from 'react-router-dom';
import { IProtectedRouteProps } from '../types/components';
import { useAuth } from '../contexts/AuthContext';

// Protected Route component with TypeScript
const ProtectedRoute: React.FC<IProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;