import { useAuth } from './useAuth';
import type { Permission } from '../../../../packages/rbac';

/**
 * useCan - RBAC helper for conditional UI rendering
 * @param permission - permission string, e.g., 'task.assign'
 * @returns boolean indicating if the user has the permission
 */
export const useCan = (permission: Permission) => {
  const { permissions } = useAuth();
  return permissions.includes(permission);
}; 