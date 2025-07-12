import { Router } from 'express';
import { firebaseAuthMiddleware } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { validateBody } from '../middleware/validation.js';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// Apply auth middleware to all organization routes
router.use(firebaseAuthMiddleware);

// GET /api/organizations - List all organizations (admin only)
router.get('/', requirePermission('organization:read'), async (req, res, next) => {
  try {
    const organizations = await prisma.organization.findMany({
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                isActive: true
              }
            }
          }
        },
        projects: {
          select: {
            id: true,
            name: true,
            status: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            users: true,
            projects: true
          }
        }
      }
    });
    res.json(organizations);
  } catch (err) {
    next(err);
  }
});

// GET /api/organizations/:id - Get organization by ID
router.get('/:id', requirePermission('organization:read'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                isActive: true,
                userRoles: {
                  include: {
                    role: true
                  }
                }
              }
            }
          }
        },
        projects: {
          include: {
            datasets: true,
            tasks: true,
            metrics: true,
            createdBy: true
          }
        },
        _count: {
          select: {
            users: true,
            projects: true
          }
        }
      }
    });
    
    if (!organization) {
      res.status(404).json({ error: 'Organization not found' });
      return;
    }
    
    res.json(organization);
  } catch (err) {
    next(err);
  }
});

// POST /api/organizations - Create new organization
const createOrganizationSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  website: z.string().url().optional(),
  industry: z.string().optional(),
  size: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']).optional(),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
});
router.post('/', requirePermission('organization:create'), validateBody(createOrganizationSchema), async (req, res, next) => {
  try {
    const data = req.body;
    
    const organization = await prisma.organization.create({
      data: {
        ...data,
        createdById: req.user?.id || 'system', // TODO: Get from auth
      },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                isActive: true
              }
            }
          }
        },
        projects: true,
        _count: {
          select: {
            users: true,
            projects: true
          }
        }
      }
    });
    
    res.status(201).json(organization);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/organizations/:id - Update organization
const updateOrganizationSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  website: z.string().url().optional(),
  industry: z.string().optional(),
  size: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']).optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
});
router.patch('/:id', requirePermission('organization:update'), validateBody(updateOrganizationSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    // Check if organization exists
    const existingOrganization = await prisma.organization.findUnique({ where: { id } });
    if (!existingOrganization) {
      res.status(404).json({ error: 'Organization not found' });
      return;
    }
    
    const organization = await prisma.organization.update({
      where: { id },
      data,
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                isActive: true
              }
            }
          }
        },
        projects: true,
        _count: {
          select: {
            users: true,
            projects: true
          }
        }
      }
    });
    
    res.json(organization);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/organizations/:id - Delete organization
router.delete('/:id', requirePermission('organization:delete'), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if organization exists
    const existingOrganization = await prisma.organization.findUnique({ where: { id } });
    if (!existingOrganization) {
      res.status(404).json({ error: 'Organization not found' });
      return;
    }
    
    // Check if organization has active projects
    const activeProjects = await prisma.project.count({
      where: {
        organizationId: id,
        status: { in: ['active', 'paused'] }
      }
    });
    
    if (activeProjects > 0) {
      res.status(400).json({ 
        error: 'Cannot delete organization with active projects',
        activeProjects 
      });
      return;
    }
    
    await prisma.organization.delete({ where: { id } });
    
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// POST /api/organizations/:id/users - Add user to organization
const addUserToOrganizationSchema = z.object({
  userId: z.string().uuid(),
  role: z.string().optional(),
});
router.post('/:id/users', requirePermission('organization:manage_users'), validateBody(addUserToOrganizationSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.body;
    
    // Check if organization exists
    const existingOrganization = await prisma.organization.findUnique({ where: { id } });
    if (!existingOrganization) {
      res.status(404).json({ error: 'Organization not found' });
      return;
    }
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    // Add user to organization
    const userOrganization = await prisma.userOrganization.create({
      data: {
        userId,
        organizationId: id,
        role: role || 'member'
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            isActive: true
          }
        },
        organization: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    res.status(201).json(userOrganization);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/organizations/:id/users/:userId - Remove user from organization
router.delete('/:id/users/:userId', requirePermission('organization:manage_users'), async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    
    // Check if organization exists
    const existingOrganization = await prisma.organization.findUnique({ where: { id } });
    if (!existingOrganization) {
      res.status(404).json({ error: 'Organization not found' });
      return;
    }
    
    // Check if user is in organization
    const existingUserOrg = await prisma.userOrganization.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: id
        }
      }
    });
    
    if (!existingUserOrg) {
      res.status(404).json({ error: 'User not found in organization' });
      return;
    }
    
    await prisma.userOrganization.delete({
      where: {
        userId_organizationId: {
          userId,
          organizationId: id
        }
      }
    });
    
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router; 