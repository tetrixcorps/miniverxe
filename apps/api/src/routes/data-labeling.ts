import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { DataAnnotatorPermissions, DataAnnotatorRoles, Permissions } from '@tetrix/rbac';
import { PrismaClient } from '@prisma/client';
import { LabelStudioService } from '../services/labelStudioService';

const router = express.Router();
const prisma = new PrismaClient();
const labelStudioService = new LabelStudioService();

// Dashboard endpoint
router.get('/dashboard', authMiddleware, async (req, res): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRoles = req.user?.roles || [];
    const userGroup = req.user?.userGroup;

    // Get real stats from database
    const [totalProjects, activeTasks, completedTasks, pendingReviews, totalEarnings, qualityScore] = await Promise.all([
      prisma.project.count(),
      prisma.task.count({ where: { status: 'InProgress' } }),
      prisma.task.count({ where: { status: 'Approved' } }),
      prisma.review.count({ where: { status: 'Approved' } }),
      prisma.label.aggregate({
        where: { status: 'Approved' },
        _sum: { id: undefined } // Placeholder for earnings calculation
      }),
      prisma.review.aggregate({
        where: { status: 'Approved' },
        _avg: { id: undefined } // Placeholder for quality score calculation
      })
    ]);

    const stats = {
      totalProjects,
      activeTasks,
      completedTasks,
      pendingReviews,
      totalEarnings: totalEarnings._sum.id || 0, // Placeholder
      qualityScore: qualityScore._avg.id || 94.2 // Placeholder
    };

    // Get real projects from database
    const projects = await prisma.project.findMany({
      where: { createdById: userId },
      include: {
        tasks: {
          include: {
            assignedTo: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const formattedProjects = projects.map(project => ({
      id: project.id,
      name: project.name,
      status: project.status || 'active',
      progress: project.tasks.length > 0 
        ? Math.round((project.tasks.filter(t => t.status === 'Approved').length / project.tasks.length) * 100)
        : 0,
      totalTasks: project.tasks.length,
      completedTasks: project.tasks.filter(t => t.status === 'Approved').length,
      assignedMembers: new Set(project.tasks.map(t => t.assignedToId).filter(Boolean)).size,
      createdAt: project.createdAt.toISOString()
    }));

    res.json({ stats, projects: formattedProjects });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Projects endpoints
router.get('/projects', authMiddleware, async (req, res): Promise<void> => {
  try {
    // Check if user can read projects
    if (!req.user?.permissions?.includes(Permissions.ProjectRead)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    // Get real projects from database
    const projects = await prisma.project.findMany({
      where: { createdById: req.user.id },
      include: {
        tasks: {
          include: {
            assignedTo: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedProjects = projects.map(project => ({
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status || 'active',
      progress: project.tasks.length > 0 
        ? Math.round((project.tasks.filter(t => t.status === 'Approved').length / project.tasks.length) * 100)
        : 0,
      totalTasks: project.tasks.length,
      completedTasks: project.tasks.filter(t => t.status === 'Approved').length,
      assignedMembers: new Set(project.tasks.map(t => t.assignedToId).filter(Boolean)).size,
      createdAt: project.createdAt.toISOString(),
      deadline: project.updatedAt.toISOString(), // Placeholder
      budget: 5000, // Placeholder
      guidelines: 'https://docs.example.com/guidelines/image-classification' // Placeholder
    }));

    res.json({ projects: formattedProjects });
  } catch (error) {
    console.error('Projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

router.post('/projects', authMiddleware, requirePermission(DataAnnotatorPermissions.ProjectCreate), async (req, res): Promise<void> => {
  try {
    const { name, description, deadline, budget, guidelines } = req.body;
    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required' });
    }
    const newProject = await prisma.project.create({
      data: {
        name,
        description,
        status: 'active',
        organizationId: req.user.organizationId,
        createdById: req.user.id,
        budget: budget ? Number(budget) : undefined,
        guidelines,
        deadline: deadline ? new Date(deadline) : undefined,
      }
    });
    res.status(201).json({ project: newProject });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Tasks endpoints
router.get('/tasks', authMiddleware, async (req, res): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRoles = req.user?.roles || [];

    // Get real tasks from database
    const tasks = await prisma.task.findMany({
      where: { assignedToId: userId },
      include: {
        project: true,
        dataset: true,
        assignedTo: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedTasks = tasks.map(task => ({
      id: task.id,
      projectId: task.projectId,
      projectName: task.project.name,
      title: `Task ${task.id}`, // Placeholder
      description: `Label data for ${task.project.name}`,
      status: task.status,
      priority: 'medium', // Placeholder
      assignedTo: task.assignedToId,
      createdAt: task.createdAt.toISOString(),
      deadline: task.updatedAt.toISOString(), // Placeholder
      estimatedHours: 2, // Placeholder
      payment: 15.00 // Placeholder
    }));

    res.json({ tasks: formattedTasks });
  } catch (error) {
    console.error('Tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

router.post('/tasks', authMiddleware, requirePermission(DataAnnotatorPermissions.TaskCreate), async (req, res): Promise<void> => {
  try {
    const { projectId, datasetId, inputData, assignedToId, estimatedHours, payment, priority } = req.body;
    if (!projectId || !datasetId || !inputData) {
      return res.status(400).json({ error: 'projectId, datasetId, and inputData are required' });
    }
    const task = await prisma.task.create({
      data: {
        projectId,
        datasetId,
        inputData,
        assignedToId,
        status: 'InProgress',
        estimatedHours: estimatedHours ? Number(estimatedHours) : undefined,
        payment: payment ? Number(payment) : undefined,
        priority,
      }
    });
    res.status(201).json({ task });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

router.post('/tasks/:id/claim', authMiddleware, requirePermission(DataAnnotatorPermissions.TaskSubmit), async (req, res): Promise<void> => {
  try {
    const taskId = req.params.id;
    const userId = req.user?.id;

    // Update task assignment in database
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'InProgress',
        assignedToId: userId
      },
      include: {
        project: true,
        assignedTo: true
      }
    });

    const formattedTask = {
      id: updatedTask.id,
      status: updatedTask.status,
      assignedTo: updatedTask.assignedToId,
      claimedAt: updatedTask.updatedAt.toISOString()
    };

    res.json({ task: formattedTask });
  } catch (error) {
    console.error('Claim task error:', error);
    res.status(500).json({ error: 'Failed to claim task' });
  }
});

router.post('/tasks/:id/submit', authMiddleware, requirePermission(DataAnnotatorPermissions.TaskSubmit), async (req, res): Promise<void> => {
  try {
    const taskId = req.params.id;
    const { annotations, payout } = req.body;
    if (!annotations) {
      return res.status(400).json({ error: 'Annotations are required' });
    }
    const label = await prisma.label.create({
      data: {
        taskId,
        userId: req.user.id,
        data: annotations,
        status: 'Submitted',
        submittedAt: new Date(),
        payout: payout ? Number(payout) : undefined
      }
    });
    await prisma.task.update({
      where: { id: taskId },
      data: { status: 'Submitted' }
    });
    res.json({ label });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit label' });
  }
});

// Review endpoints
router.get('/reviews', authMiddleware, requirePermission(DataAnnotatorPermissions.TaskReview), async (req, res): Promise<void> => {
  try {
    // Get real reviews from database
    const reviews = await prisma.review.findMany({
      where: { reviewerId: req.user.id },
      include: {
        label: {
          include: {
            task: {
              include: {
                project: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedReviews = reviews.map(review => ({
      id: review.id,
      taskId: review.label.taskId,
      projectName: review.label.task.project.name,
      submittedBy: review.label.userId,
      submittedAt: review.label.submittedAt?.toISOString(),
      status: review.status,
      annotations: review.label.data,
      comments: review.comment
    }));

    res.json({ reviews: formattedReviews });
  } catch (error) {
    console.error('Reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

router.patch('/reviews/:id', authMiddleware, requirePermission(DataAnnotatorPermissions.TaskApprove), async (req, res): Promise<void> => {
  try {
    const reviewId = req.params.id;
    const { action, comments, rating } = req.body;
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        status: action === 'approve' ? 'Approved' : 'Rejected',
        comment: comments,
        rating: rating ? Number(rating) : undefined,
        createdAt: new Date()
      }
    });
    await prisma.label.update({
      where: { id: updatedReview.labelId },
      data: { status: action === 'approve' ? 'Approved' : 'Rejected' }
    });
    res.json({ review: updatedReview });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// Analytics endpoints
router.get('/analytics', authMiddleware, requirePermission(DataAnnotatorPermissions.AnalyticsView), async (req, res): Promise<void> => {
  try {
    const totalTasks = await prisma.task.count();
    const completedTasks = await prisma.task.count({ where: { status: 'Approved' } });
    const avgCompletionTime = await prisma.task.aggregate({ _avg: { estimatedHours: true } });
    const avgQualityScore = await prisma.review.aggregate({ _avg: { rating: true } });
    const totalEarnings = await prisma.label.aggregate({ _sum: { payout: true } });
    const dailyCompletions = await prisma.task.groupBy({
      by: ['completedAt'],
      _count: { id: true },
      where: {
        status: 'Approved',
        completedAt: { not: null, gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }
    });
    res.json({
      metrics: {
        totalTasks,
        completedTasks,
        avgCompletionTime: avgCompletionTime._avg.estimatedHours,
        qualityScore: avgQualityScore._avg.rating,
        totalEarnings: totalEarnings._sum.payout
      },
      trends: {
        dailyCompletions: dailyCompletions.map(dc => ({
          date: dc.completedAt?.toISOString().slice(0, 10),
          completions: dc._count.id
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Billing endpoints
router.get('/billing', authMiddleware, requirePermission(DataAnnotatorPermissions.BillingView), async (req, res): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { wallet: true, payouts: true }
    });
    const totalEarned = user?.payouts.reduce((sum, p) => sum + p.amount, 0) || 0;
    const pendingPayouts = user?.payouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0) || 0;
    res.json({
      currentBalance: user?.wallet?.balance || 0,
      pendingPayouts,
      totalEarned,
      paymentHistory: user?.payouts.map(p => ({
        id: p.id,
        amount: p.amount,
        status: p.status,
        date: p.createdAt.toISOString(),
        method: p.method
      })) || []
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch billing data' });
  }
});

// Wallet endpoints
router.post('/wallet/create', authMiddleware, async (req, res): Promise<void> => {
  try {
    const userId = req.user.id;

    // Check if wallet already exists
    const existingWallet = await prisma.wallet.findUnique({
      where: { userId }
    });

    if (existingWallet) {
      res.status(400).json({ error: 'Wallet already exists' });
      return;
    }

    // Create wallet in database
    const wallet = await prisma.wallet.create({
      data: {
        userId,
        address: `0x${Math.random().toString(16).substr(2, 40)}`, // Generate random address
        balance: 0,
        status: 'Active'
      }
    });

    res.status(201).json({ wallet });
  } catch (error) {
    console.error('Wallet creation error:', error);
    res.status(500).json({ error: 'Failed to create wallet' });
  }
});

router.post('/wallet/payout', authMiddleware, requirePermission(DataAnnotatorPermissions.BillingManage), async (req, res): Promise<void> => {
  try {
    const { userId, amount } = req.body;

    if (!userId || !amount) {
      res.status(400).json({ error: 'User ID and amount are required' });
      return;
    }

    // Update wallet balance
    const wallet = await prisma.wallet.update({
      where: { userId },
      data: {
        balance: {
          decrement: amount
        }
      }
    });

    const payout = {
      id: `payout_${Date.now()}`,
      userId,
      amount,
      status: 'processing',
      createdAt: new Date().toISOString(),
      processedBy: req.user.id
    };

    res.json({ payout });
  } catch (error) {
    console.error('Payout error:', error);
    res.status(500).json({ error: 'Failed to process payout' });
  }
});

export default router; 