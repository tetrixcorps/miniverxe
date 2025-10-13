import { Router } from 'express';
import { prisma } from '../db';
import { authGuard } from '../middleware/auth';
import { requireRole } from '../middleware/roles';

const router = Router();

// Get tasks assigned to the current annotator
router.get('/my-tasks', authGuard, async (req, res) => {
  try {
    const userId = (req as any).user.uid;
    const { status, limit = 20, offset = 0 } = req.query;
    
    const tasks = await prisma.task.findMany({
      where: {
        assignedTo: userId,
        ...(status && { status: status as any }),
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            annotationType: true,
            guidelineUrl: true,
          },
        },
        reviews: {
          select: {
            id: true,
            status: true,
            rating: true,
            comments: true,
            reviewedAt: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' },
      ],
      take: Number(limit),
      skip: Number(offset),
    });
    
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching annotator tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Claim an available task
router.post('/claim-task/:id', authGuard, async (req, res) => {
  try {
    const userId = (req as any).user.uid;
    const taskId = req.params.id;
    
    // Use transaction to ensure atomic claim
    const result = await prisma.$transaction(async (tx) => {
      const task = await tx.task.findUnique({
        where: { id: taskId },
      });
      
      if (!task) {
        throw new Error('Task not found');
      }
      
      if (task.assignedTo && task.assignedTo !== userId) {
        throw new Error('Task already assigned to another user');
      }
      
      if (task.status !== 'PENDING') {
        throw new Error('Task is not available for claiming');
      }
      
      // Check if user has reached max concurrent tasks limit
      const userActiveTasks = await tx.task.count({
        where: {
          assignedTo: userId,
          status: {
            in: ['PENDING', 'IN_PROGRESS'],
          },
        },
      });
      
      if (userActiveTasks >= 10) { // Configurable limit
        throw new Error('Maximum concurrent tasks limit reached');
      }
      
      return tx.task.update({
        where: { id: taskId },
        data: {
          assignedTo: userId,
          status: 'IN_PROGRESS',
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              annotationType: true,
              guidelineUrl: true,
            },
          },
        },
      });
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error claiming task:', error);
    res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to claim task' });
  }
});

// Submit annotation for a task
router.post('/submit-annotation/:id', authGuard, async (req, res) => {
  try {
    const userId = (req as any).user.uid;
    const taskId = req.params.id;
    const { annotation } = req.body;
    
    if (!annotation) {
      return res.status(400).json({ error: 'Annotation data is required' });
    }
    
    const result = await prisma.$transaction(async (tx) => {
      const task = await tx.task.findUnique({
        where: { id: taskId },
      });
      
      if (!task) {
        throw new Error('Task not found');
      }
      
      if (task.assignedTo !== userId) {
        throw new Error('Task not assigned to you');
      }
      
      if (task.status !== 'IN_PROGRESS') {
        throw new Error('Task is not in progress');
      }
      
      return tx.task.update({
        where: { id: taskId },
        data: {
          annotation,
          status: 'SUBMITTED',
          submittedAt: new Date(),
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              annotationType: true,
            },
          },
        },
      });
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error submitting annotation:', error);
    res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to submit annotation' });
  }
});

// Get available tasks for claiming
router.get('/available-tasks', authGuard, async (req, res) => {
  try {
    const userId = (req as any).user.uid;
    const { projectId, annotationType, limit = 10 } = req.query;
    
    const tasks = await prisma.task.findMany({
      where: {
        status: 'PENDING',
        assignedTo: null,
        ...(projectId && { projectId: projectId as string }),
        ...(annotationType && {
          project: {
            annotationType: annotationType as any,
          },
        }),
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            annotationType: true,
            guidelineUrl: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' },
      ],
      take: Number(limit),
    });
    
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching available tasks:', error);
    res.status(500).json({ error: 'Failed to fetch available tasks' });
  }
});

// Get annotator performance metrics
router.get('/performance', authGuard, async (req, res) => {
  try {
    const userId = (req as any).user.uid;
    const { period = 'MONTHLY' } = req.query;
    
    // Get existing analytics or create new ones
    const analytics = await prisma.analytics.findFirst({
      where: {
        userId,
        period: period as any,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // Calculate real-time metrics
    const [totalTasks, completedTasks, approvedTasks, rejectedTasks] = await Promise.all([
      prisma.task.count({
        where: { assignedTo: userId },
      }),
      prisma.task.count({
        where: {
          assignedTo: userId,
          status: 'SUBMITTED',
        },
      }),
      prisma.task.count({
        where: {
          assignedTo: userId,
          status: 'APPROVED',
        },
      }),
      prisma.task.count({
        where: {
          assignedTo: userId,
          status: 'REJECTED',
        },
      }),
    ]);
    
    const approvalRate = completedTasks > 0 ? approvedTasks / completedTasks : 0;
    const rejectionRate = completedTasks > 0 ? rejectedTasks / completedTasks : 0;
    
    const performance = {
      totalTasks,
      completedTasks,
      approvedTasks,
      rejectedTasks,
      approvalRate,
      rejectionRate,
      analytics: analytics || null,
    };
    
    res.json(performance);
  } catch (error) {
    console.error('Error fetching performance:', error);
    res.status(500).json({ error: 'Failed to fetch performance metrics' });
  }
});

// Get annotation guidelines for a project
router.get('/guidelines/:projectId', authGuard, async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.projectId },
      select: {
        id: true,
        name: true,
        description: true,
        annotationType: true,
        guidelineUrl: true,
      },
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    console.error('Error fetching guidelines:', error);
    res.status(500).json({ error: 'Failed to fetch guidelines' });
  }
});

// Update task progress (for partial saves)
router.patch('/tasks/:id/progress', authGuard, async (req, res) => {
  try {
    const userId = (req as any).user.uid;
    const taskId = req.params.id;
    const { annotation, progress } = req.body;
    
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    if (task.assignedTo !== userId) {
      return res.status(403).json({ error: 'Task not assigned to you' });
    }
    
    if (task.status !== 'IN_PROGRESS') {
      return res.status(400).json({ error: 'Task is not in progress' });
    }
    
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(annotation && { annotation }),
        // Store progress in the task metadata if needed
      },
    });
    
    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task progress:', error);
    res.status(500).json({ error: 'Failed to update task progress' });
  }
});

// Get task history for annotator
router.get('/history', authGuard, async (req, res) => {
  try {
    const userId = (req as any).user.uid;
    const { limit = 50, offset = 0, status } = req.query;
    
    const tasks = await prisma.task.findMany({
      where: {
        assignedTo: userId,
        ...(status && { status: status as any }),
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            annotationType: true,
          },
        },
        reviews: {
          select: {
            id: true,
            status: true,
            rating: true,
            comments: true,
            reviewedAt: true,
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
      take: Number(limit),
      skip: Number(offset),
    });
    
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching task history:', error);
    res.status(500).json({ error: 'Failed to fetch task history' });
  }
});

export default router;