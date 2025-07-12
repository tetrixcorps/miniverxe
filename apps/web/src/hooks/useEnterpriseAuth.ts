import { useAuth } from './useAuth';
import type { Role } from '../../../../packages/rbac';

export interface EnterpriseUser {
  uid: string;
  email?: string;
  userGroup: 'enterprise' | 'academy' | 'guest';
  department?: string;
  organizationId?: string;
}

export interface EnterpriseAuthResult {
  loading: boolean;
  error: Error | null;
  user: EnterpriseUser | null;
  roles: Role[];
  isEnterpriseUser: boolean;
  canAccessChat: boolean;
}

const ENTERPRISE_ROLES: Role[] = [
  'SuperAdmin',
  'TaskAdmin',
  'Reviewer',
  'Owner'
];

const CHAT_ACCESS_ROLES: Role[] = [
  'SuperAdmin',
  'TaskAdmin',
  'Owner'
];

export const useEnterpriseAuth = (): EnterpriseAuthResult => {
  const { user: authUser, roles, loading } = useAuth();

  const transformToEnterpriseUser = (user: any): EnterpriseUser | null => {
    if (!user) return null;

    return {
      uid: user.uid,
      email: user.email,
      userGroup: user.customClaims?.userGroup || 'guest',
      department: user.customClaims?.department,
      organizationId: user.customClaims?.organizationId,
    };
  };

  const enterpriseUser = transformToEnterpriseUser(authUser);
  const isEnterpriseUser = enterpriseUser?.userGroup === 'enterprise';
  const hasEnterpriseRole = roles.some((role: Role) => ENTERPRISE_ROLES.includes(role));
  const canAccessChat = roles.some((role: Role) => CHAT_ACCESS_ROLES.includes(role)) && isEnterpriseUser;

  return {
    loading,
    error: null,
    user: enterpriseUser,
    roles: roles.filter((role: Role) => ENTERPRISE_ROLES.includes(role)),
    isEnterpriseUser: isEnterpriseUser && hasEnterpriseRole,
    canAccessChat,
  };
};