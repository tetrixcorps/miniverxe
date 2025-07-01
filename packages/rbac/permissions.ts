export const Permissions = {
  AssignTask: 'task.assign',
  ReviewTask: 'task.review',
  AdminContactRead: 'admin:contact:read',
  AdminContactUpdate: 'admin:contact:update',
  AdminLogout: 'admin:logout',
  UserList: 'user:list',
  UserRead: 'user:read',
  UserUpdate: 'user:update',
  UserRoleUpdate: 'user:role:update',
  ProjectRead: 'project:read',
  // Add more permissions as needed
} as const;
export type Permission = typeof Permissions[keyof typeof Permissions]; 