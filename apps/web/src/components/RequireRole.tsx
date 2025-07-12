import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { Role } from '@tetrix/rbac';

interface RequireRoleProps {
  role: Role;
  children: React.ReactNode;
}

export const RequireRole: React.FC<RequireRoleProps> = ({ role, children }) => {
  const { roles, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div>Loading...</div>;
  if (!roles.includes(role)) return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  return <>{children}</>;
}; 