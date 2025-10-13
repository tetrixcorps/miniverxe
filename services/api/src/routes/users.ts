import { Router } from 'express';
import { prisma } from '../db';
import { authGuard } from '../middleware/auth';
import { requireRole } from '../middleware/roles';

const router = Router();

// List all users (admin only)
router.get('/', authGuard, requireRole('admin'), async (req, res) => {
  try {
    const { role, status, orgId, limit = 50, offset = 0 } = req.query;
    
    const users = await prisma.user.findMany({
      where: {
        ...(role && { role: role as any }),
        ...(status && { status: status as any }),
        ...(orgId && { orgId: orgId as string }),
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            assignedTasks: true,
            reviews: true,
            academyAssignments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: Number(limit),
      skip: Number(offset),
    });
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get current user profile
router.get('/me', authGuard, async (req, res) => {
  try {
    const uid = (req as any).user.uid;
    
    const user = await prisma.user.findUnique({
      where: { id: uid },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        wallet: {
          select: {
            id: true,
            address: true,
            balance: true,
            currency: true,
            status: true,
          },
        },
        _count: {
          select: {
            assignedTasks: true,
            reviews: true,
            academyAssignments: true,
          },
        },
      },
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Get a specific user (admin only)
router.get('/:id', authGuard, requireRole('admin'), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        wallet: {
          select: {
            id: true,
            address: true,
            balance: true,
            currency: true,
            status: true,
          },
        },
        assignedTasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            createdAt: true,
            submittedAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        _count: {
          select: {
            assignedTasks: true,
            reviews: true,
            academyAssignments: true,
          },
        },
      },
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user (admin only)
router.patch('/:id', authGuard, requireRole('admin'), async (req, res) => {
  try {
    const { name, email, role, status, orgId } = req.body;
    const userId = req.params.id;
    
    // Validate role and status
    const validRoles = ['ADMIN', 'PROJECT_MANAGER', 'REVIEWER', 'ANNOTATOR', 'ACADEMY_STUDENT'];
    const validStatuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];
    
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if email is already taken by another user
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findFirst({
        where: {
          email,
          id: { not: userId },
        },
      });
      
      if (emailExists) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }
    
    // Check if organization exists
    if (orgId) {
      const organization = await prisma.organization.findUnique({
        where: { id: orgId },
      });
      
      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(role && { role }),
        ...(status && { status }),
        ...(orgId && { orgId }),
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            assignedTasks: true,
            reviews: true,
            academyAssignments: true,
          },
        },
      },
    });
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Create new user (admin only)
router.post('/', authGuard, requireRole('admin'), async (req, res) => {
  try {
    const { id, email, name, role, orgId } = req.body;
    
    if (!id || !email || !name) {
      return res.status(400).json({ error: 'ID, email, and name are required' });
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Check if email is already taken
    const emailExists = await prisma.user.findFirst({
      where: { email },
    });
    
    if (emailExists) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    
    // Check if organization exists
    if (orgId) {
      const organization = await prisma.organization.findUnique({
        where: { id: orgId },
      });
      
      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }
    }
    
    const user = await prisma.user.create({
      data: {
        id,
        email,
        name,
        role: role || 'ANNOTATOR',
        status: 'ACTIVE',
        orgId,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Delete user (admin only)
router.delete('/:id', authGuard, requireRole('admin'), async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            assignedTasks: true,
            reviews: true,
          },
        },
      },
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if user has assigned tasks or reviews
    if (user._count.assignedTasks > 0 || user._count.reviews > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete user with assigned tasks or reviews. Please reassign or complete them first.' 
      });
    }
    
    await prisma.user.delete({
      where: { id: userId },
    });
    
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get user statistics (admin only)
router.get('/stats/overview', authGuard, requireRole('admin'), async (req, res) => {
  try {
    const [totalUsers, activeUsers, suspendedUsers, roleStats] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ where: { status: 'SUSPENDED' } }),
      prisma.user.groupBy({
        by: ['role'],
        _count: {
          id: true,
        },
      }),
    ]);
    
    const stats = {
      totalUsers,
      activeUsers,
      suspendedUsers,
      roleDistribution: roleStats.reduce((acc, curr) => {
        acc[curr.role] = curr._count.id;
        return acc;
      }, {} as Record<string, number>),
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

export default router; 