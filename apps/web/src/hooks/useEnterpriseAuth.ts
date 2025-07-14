import { useAuth } from './useAuth';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ALLOWED_ENTERPRISE_ROLES = [
  'SuperAdmin',
  'ClientAdmin',
  'Owner',
  'BillingAdmin',
];

export function useEnterpriseAuth() {
  const { user, userGroup, roles, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check if user is an allowed enterprise user
  const isEnterpriseUser =
    userGroup === 'enterprise' &&
    roles.some((role) => ALLOWED_ENTERPRISE_ROLES.includes(role));

  useEffect(() => {
    if (!loading && user) {
      if (userGroup !== 'enterprise') {
        setError('Access denied: Only Enterprise users can access this area.');
        navigate('/Landing', { state: { error: 'not-enterprise' } });
      } else if (!isEnterpriseUser) {
        setError('Access denied: Your role does not permit access to the Enterprise dashboard.');
        navigate('/Landing', { state: { error: 'not-authorized' } });
      }
    }
  }, [user, userGroup, roles, loading, navigate, isEnterpriseUser]);

  return {
    isEnterpriseUser,
    error,
    loading,
    user,
    userGroup,
    roles,
  };
} 