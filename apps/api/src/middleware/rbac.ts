import type { Request, Response, NextFunction } from 'express'

export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Debug: Log user and required permission
    console.log('RBAC DEBUG:', {
      user: req.user,
      required: permission,
      userPermissions: req.user?.permissions
    });
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    // Defensive: ensure permissions is an array of strings
    const perms = Array.isArray(req.user.permissions)
      ? req.user.permissions.map(String)
      : [];
    if (!perms.includes(permission)) {
      res.status(403).json({ error: 'Forbidden: missing permission ' + permission });
      return;
    }
    next();
  };
}

export function requireRole(role: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    
    const userRoles = Array.isArray(req.user.roles)
      ? req.user.roles.map(String)
      : [];
      
    if (!userRoles.includes(role)) {
      res.status(403).json({ 
        error: 'Forbidden: missing role ' + role,
        required: role,
        userRoles: userRoles
      });
      return;
    }
    
    next();
  };
}

export function requireUserGroup(userGroup: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    
    if (req.user.userGroup !== userGroup) {
      res.status(403).json({ 
        error: 'Forbidden: wrong user group',
        required: userGroup,
        userGroup: req.user.userGroup
      });
      return;
    }
    
    next();
  };
} 