"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePermission = requirePermission;
exports.requireRole = requireRole;
exports.requireUserGroup = requireUserGroup;
function requirePermission(permission) {
    return (req, res, next) => {
        var _a;
        // Debug: Log user and required permission
        console.log('RBAC DEBUG:', {
            user: req.user,
            required: permission,
            userPermissions: (_a = req.user) === null || _a === void 0 ? void 0 : _a.permissions
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
function requireRole(role) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const userRoles = Array.isArray(req.user.roles)
            ? req.user.roles.map(String)
            : [];
        if (!userRoles.includes(role)) {
            return res.status(403).json({
                error: 'Forbidden: missing role ' + role,
                required: role,
                userRoles: userRoles
            });
        }
        next();
    };
}
function requireUserGroup(userGroup) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        if (req.user.userGroup !== userGroup) {
            return res.status(403).json({
                error: 'Forbidden: wrong user group',
                required: userGroup,
                userGroup: req.user.userGroup
            });
        }
        next();
    };
}
