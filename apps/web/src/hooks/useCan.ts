import { usePermissions } from 'react-admin';

/**
 * useCan - RBAC helper for conditional UI rendering
 * @param action - permission string, e.g., 'task.assign'
 * @returns boolean indicating if the user has the permission
 */
export const useCan = (action: string): boolean => {
  const { permissions } = usePermissions();
  return Array.isArray(permissions) && permissions.includes(action);
}; 