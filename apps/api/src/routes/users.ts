import { Router } from 'express';
import { firebaseAuthMiddleware } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { Permissions } from '@tetrix/rbac';
import { validateBody } from '../middleware/validation.js';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// Apply auth middleware to all user routes
router.use(firebaseAuthMiddleware);

// GET /api/users - List all users (admin only)
router.get('/', requirePermission(Permissions.UserList), async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        createdAt: true,
        lastLogin: true,
        userRoles: {
          include: {
            role: true,
            organization: true
          }
        }
      }
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// GET /api/users/:id - Get user profile (self or admin)
router.get('/:id', requirePermission(Permissions.UserRead), async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ 
      where: { id },
      include: {
        userRoles: {
          include: {
            role: true,
            organization: true
          }
        },
        userOrganizations: {
          include: {
            organization: true
          }
        }
      }
    });
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    // TODO: Add proper authorization check when auth is implemented
    // if (req.user.id !== id && !req.user.roles.includes('admin')) return res.status(403).json({ error: 'Forbidden' });
    
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/users/:id - Update user profile (name, etc.)
const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
});
router.patch('/:id', requirePermission(Permissions.UserUpdate), validateBody(updateUserSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    // Update user
    const user = await prisma.user.update({ 
      where: { id }, 
      data,
      include: {
        userRoles: {
          include: {
            role: true,
            organization: true
          }
        }
      }
    });
    
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/users/:id/role - Update user role (admin only)
const updateUserRoleSchema = z.object({
  roleId: z.string().uuid(),
  organizationId: z.string().uuid().optional(),
});
router.patch('/:id/role', requirePermission(Permissions.UserRoleUpdate), validateBody(updateUserRoleSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { roleId, organizationId } = req.body;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    // Check if role exists
    const existingRole = await prisma.role.findUnique({ where: { id: roleId } });
    if (!existingRole) {
      res.status(404).json({ error: 'Role not found' });
      return;
    }
    
    // Upsert user role (create or update)
    const userRole = await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: id,
          roleId: roleId
        }
      },
      update: {
        organizationId: organizationId || null
      },
      create: {
        userId: id,
        roleId: roleId,
        organizationId: organizationId || null
      },
      include: {
        role: true,
        organization: true
      }
    });
    
    res.json(userRole);
  } catch (err) {
    next(err);
  }
});

export default router; 