import { Router } from 'express';
import { prisma } from '../db';
import { authGuard } from '../middleware/auth';
import { requireRole } from '../middleware/roles';

const router = Router();

// Get all tasks for data labeling
router.get('/tasks', authGuard, async (req, res) => {
  try {
    const { projectId, status, assignedTo } = req.query;
    
    const tasks = await prisma.task.findMany({
      where: {
        ...(projectId && { projectId: projectId as string }),
        ...(status && { status: status as any }),
        ...(assignedTo && { assignedTo: assignedTo as string }),
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            annotationType: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
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
        createdAt: 'desc',
      },
    });
    
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get a specific task for labeling
router.get('/tasks/:id', authGuard, async (req, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            annotationType: true,
            guidelineUrl: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// Create a new labeling task
router.post('/tasks', authGuard, requireRole('admin', 'project_manager'), async (req, res) => {
  try {
    const { title, description, projectId, priority, assignedTo } = req.body;
    
    const task = await prisma.task.create({
      data: {
        title,
        description,
        projectId,
        priority: priority || 'MEDIUM',
        assignedTo,
        status: 'PENDING',
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            annotationType: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task status and annotation
router.patch('/tasks/:id', authGuard, async (req, res) => {
  try {
    const { status, annotation } = req.body;
    const userId = (req as any).user.uid;
    
    const existingTask = await prisma.task.findUnique({
      where: { id: req.params.id },
    });
    
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Check if user is assigned to this task or has admin/reviewer privileges
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user || (existingTask.assignedTo !== userId && !['ADMIN', 'REVIEWER'].includes(user.role))) {
      return res.status(403).json({ error: 'Not authorized to update this task' });
    }
    
    const updatedTask = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        ...(status && { status }),
        ...(annotation && { annotation }),
        ...(status === 'SUBMITTED' && { submittedAt: new Date() }),
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            annotationType: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    
    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Get labeling statistics
router.get('/stats', authGuard, async (req, res) => {
  try {
    const { projectId, userId } = req.query;
    
    const whereClause = {
      ...(projectId && { projectId: projectId as string }),
      ...(userId && { assignedTo: userId as string }),
    };
    
    const [totalTasks, completedTasks, pendingTasks, approvedTasks] = await Promise.all([
      prisma.task.count({ where: whereClause }),
      prisma.task.count({ where: { ...whereClause, status: 'SUBMITTED' } }),
      prisma.task.count({ where: { ...whereClause, status: 'PENDING' } }),
      prisma.task.count({ where: { ...whereClause, status: 'APPROVED' } }),
    ]);
    
    const stats = {
      totalTasks,
      completedTasks,
      pendingTasks,
      approvedTasks,
      approvalRate: completedTasks > 0 ? approvedTasks / completedTasks : 0,
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Batch operations for tasks
router.post('/tasks/batch', authGuard, requireRole('admin', 'project_manager'), async (req, res) => {
  try {
    const { action, taskIds, data } = req.body;
    
    if (!action || !taskIds || !Array.isArray(taskIds)) {
      return res.status(400).json({ error: 'Invalid request data' });
    }
    
    let result;
    
    switch (action) {
      case 'assign':
        result = await prisma.task.updateMany({
          where: { id: { in: taskIds } },
          data: { assignedTo: data.assignedTo },
        });
        break;
      case 'updateStatus':
        result = await prisma.task.updateMany({
          where: { id: { in: taskIds } },
          data: { status: data.status },
        });
        break;
      case 'updatePriority':
        result = await prisma.task.updateMany({
          where: { id: { in: taskIds } },
          data: { priority: data.priority },
        });
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
    
    res.json({ success: true, updatedCount: result.count });
  } catch (error) {
    console.error('Error in batch operation:', error);
    res.status(500).json({ error: 'Failed to perform batch operation' });
  }
});

export default router;