import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Roles } from '@tetrix/rbac';
import type { Role, Permission } from '@tetrix/rbac';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserGroup?: 'data-annotator' | 'academy' | 'enterprise';
  requiredRoles?: Role[];
  requiredPermissions?: Permission[];
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredUserGroup,
  requiredRoles = [],
  requiredPermissions = [],
  fallbackPath = '/unauthorized'
}) => {
  const { user, userGroup, roles, permissions, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-red"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login with return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check user group access
  if (requiredUserGroup && userGroup !== requiredUserGroup) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Check role access
  if (requiredRoles.length > 0 && !requiredRoles.some(role => roles.includes(role))) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Check permission access
  if (requiredPermissions.length > 0 && !requiredPermissions.some(permission => permissions.includes(permission))) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

// Specific route components for each user group
export const DataAnnotatorRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredUserGroup="data-annotator" fallbackPath="/unauthorized">
    {children}
  </ProtectedRoute>
);

export const AcademyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredUserGroup="academy" fallbackPath="/unauthorized">
    {children}
  </ProtectedRoute>
);

export const EnterpriseRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute 
    requiredUserGroup="enterprise" 
    requiredRoles={[Roles.SuperAdmin, Roles.ClientAdmin]}
    fallbackPath="/unauthorized"
  >
    {children}
  </ProtectedRoute>
);

export const ClientLoginRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute 
    requiredUserGroup="enterprise" 
    requiredRoles={[Roles.SuperAdmin, Roles.ClientAdmin]}
    fallbackPath="/unauthorized"
  >
    {children}
  </ProtectedRoute>
); 