import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validation.js';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

const userUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  isActive: z.boolean().optional(),
  userGroup: z.enum(['data-annotator', 'academy', 'enterprise']).optional(),
});

const roleAssignmentSchema = z.object({
  userId: z.string(),
  roleId: z.number(),
  organizationId: z.number().optional(),
});

// GET /api/admin/users
router.get('/users', authenticateToken, requireRole('Admin'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, userGroup, isActive } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;
    const offset = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    if (userGroup) where.userGroup = userGroup as 'data-annotator' | 'academy' | 'enterprise' | undefined;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    // Get users with pagination
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limitNum,
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
          },
          wallet: true
        }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      users: users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        userGroup: user.userGroup,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        roles: user.userRoles.map(ur => ur.role.name),
        organizations: user.userOrganizations.map(uo => uo.organization.name),
        wallet: user.wallet ? {
          id: user.wallet.id,
          address: user.wallet.address,
          balance: user.wallet.balance,
          status: user.wallet.status
        } : null
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/users/:id
router.get('/users/:id', authenticateToken, requireRole('Admin'), async (req, res, next) => {
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
        },
        wallet: true,
        tasks: true,
        projects: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/users/:id
router.put('/users/:id', authenticateToken, requireRole('Admin'), validateBody(userUpdateSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, isActive, userGroup } = req.body;
    const typedUserGroup = userGroup as 'data-annotator' | 'academy' | 'enterprise' | undefined;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: name || undefined,
        email: email || undefined,
        isActive: isActive !== undefined ? isActive : undefined,
        userGroup: typedUserGroup
      },
      include: {
        userRoles: {
          include: {
            role: true,
            organization: true
          }
        }
      }
    });

    res.json({ 
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', authenticateToken, requireRole('Admin'), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Soft delete - just deactivate the user
    await prisma.user.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({ message: 'User deactivated successfully' });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/roles
router.get('/roles', authenticateToken, requireRole('Admin'), async (req, res, next) => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        permissions: true,
        userRoles: {
          include: {
            user: true
          }
        }
      }
    });

    res.json({ roles });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/assign-role
router.post('/assign-role', authenticateToken, requireRole('Admin'), validateBody(roleAssignmentSchema), async (req, res, next) => {
  try {
    const { userId, roleId, organizationId } = req.body;

    // Check if assignment already exists
    const existingAssignment = await prisma.userRole.findFirst({
      where: {
        userId,
        roleId,
        organizationId: organizationId || null
      }
    });

    if (existingAssignment) {
      return res.status(409).json({ error: 'Role assignment already exists' });
    }

    const userRole = await prisma.userRole.create({
      data: {
        userId,
        roleId,
        organizationId: organizationId || null
      },
      include: {
        user: true,
        role: true,
        organization: true
      }
    });

    res.status(201).json({ 
      message: 'Role assigned successfully',
      userRole
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/assign-role/:id
router.delete('/assign-role/:id', authenticateToken, requireRole('Admin'), async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.userRole.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Role assignment removed successfully' });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/organizations
router.get('/organizations', authenticateToken, requireRole('Admin'), async (req, res, next) => {
  try {
    const organizations = await prisma.organization.findMany({
      include: {
        userOrganizations: {
          include: {
            user: true
          }
        },
        userRoles: {
          include: {
            user: true,
            role: true
          }
        }
      }
    });

    res.json({ organizations });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/stats
router.get('/stats', authenticateToken, requireRole('Admin'), async (req, res, next) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalOrganizations,
      totalProjects,
      totalTasks,
      userGroupStats,
      recentSignups
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.organization.count(),
      prisma.project.count(),
      prisma.task.count(),
      prisma.user.groupBy({
        by: ['userGroup'],
        _count: { id: true }
      }),
      prisma.user.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers
      },
      organizations: totalOrganizations,
      projects: totalProjects,
      tasks: totalTasks,
      userGroups: userGroupStats.map(stat => ({
        userGroup: stat.userGroup,
        count: stat._count.id
      })),
      recentSignups
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/analytics
router.get('/analytics', authenticateToken, requireRole('Admin'), async (req, res, next) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period as string) || 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      userSignups,
      projectCreations,
      taskCompletions,
      contactSubmissions
    ] = await Promise.all([
      prisma.user.groupBy({
        by: ['createdAt'],
        where: { createdAt: { gte: startDate } },
        _count: { id: true }
      }),
      prisma.project.groupBy({
        by: ['createdAt'],
        where: { createdAt: { gte: startDate } },
        _count: { id: true }
      }),
      prisma.task.groupBy({
        by: ['completedAt'],
        where: { 
          completedAt: { gte: startDate },
          status: 'completed'
        },
        _count: { id: true }
      }),
      prisma.contactSubmission.groupBy({
        by: ['createdAt'],
        where: { createdAt: { gte: startDate } },
        _count: { id: true }
      })
    ]);

    res.json({
      period: `${days} days`,
      userSignups,
      projectCreations,
      taskCompletions,
      contactSubmissions
    });
  } catch (err) {
    next(err);
  }
});

export default router; 