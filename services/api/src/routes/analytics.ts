import { Router } from 'express';
import { prisma } from '../db';
import { authGuard } from '../middleware/auth';
import { requireRole } from '../middleware/roles';

const router = Router();

// Get metrics for analytics dashboard
router.get('/metrics', authGuard, async (req, res) => {
  try {
    const { period = 'MONTHLY', userId, projectId } = req.query;
    
    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    let dateFormat: string;
    
    switch (period) {
      case 'DAILY':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
        dateFormat = 'YYYY-MM-DD';
        break;
      case 'WEEKLY':
        startDate = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000); // Last 12 weeks
        dateFormat = 'YYYY-WW';
        break;
      case 'MONTHLY':
      default:
        startDate = new Date(now.getTime() - 12 * 30 * 24 * 60 * 60 * 1000); // Last 12 months
        dateFormat = 'YYYY-MM';
        break;
    }
    
    // Get task completion and approval data
    const tasks = await prisma.task.findMany({
      where: {
        ...(userId && { assignedTo: userId as string }),
        ...(projectId && { projectId: projectId as string }),
        submittedAt: {
          gte: startDate,
        },
      },
      include: {
        reviews: {
          select: {
            status: true,
            reviewedAt: true,
          },
        },
      },
      orderBy: {
        submittedAt: 'asc',
      },
    });
    
    // Group tasks by date and calculate approval rates
    const metricsMap = new Map<string, { total: number; approved: number; rejected: number }>();
    
    tasks.forEach(task => {
      if (!task.submittedAt) return;
      
      const date = task.submittedAt.toISOString().split('T')[0];
      const key = period === 'DAILY' ? date : 
                  period === 'WEEKLY' ? `${date.slice(0, 4)}-W${Math.ceil(task.submittedAt.getDate() / 7)}` :
                  date.slice(0, 7); // Monthly
      
      if (!metricsMap.has(key)) {
        metricsMap.set(key, { total: 0, approved: 0, rejected: 0 });
      }
      
      const metrics = metricsMap.get(key)!;
      metrics.total++;
      
      // Check if task is approved or rejected
      const latestReview = task.reviews
        .filter(review => review.reviewedAt)
        .sort((a, b) => b.reviewedAt!.getTime() - a.reviewedAt!.getTime())[0];
      
      if (latestReview) {
        if (latestReview.status === 'APPROVED') {
          metrics.approved++;
        } else if (latestReview.status === 'REJECTED') {
          metrics.rejected++;
        }
      }
    });
    
    // Convert to array format expected by the frontend
    const metricsArray = Array.from(metricsMap.entries())
      .map(([date, metrics]) => ({
        date,
        approvedRate: metrics.total > 0 ? metrics.approved / metrics.total : 0,
        rejectedRate: metrics.total > 0 ? metrics.rejected / metrics.total : 0,
        totalTasks: metrics.total,
        approvedTasks: metrics.approved,
        rejectedTasks: metrics.rejected,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    res.json(metricsArray);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Get overall system statistics
router.get('/stats', authGuard, async (req, res) => {
  try {
    const [
      totalUsers,
      totalProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      approvedTasks,
      rejectedTasks,
      totalOrganizations,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.task.count(),
      prisma.task.count({ where: { status: 'SUBMITTED' } }),
      prisma.task.count({ where: { status: 'PENDING' } }),
      prisma.task.count({ where: { status: 'APPROVED' } }),
      prisma.task.count({ where: { status: 'REJECTED' } }),
      prisma.organization.count(),
    ]);
    
    const stats = {
      totalUsers,
      totalProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      approvedTasks,
      rejectedTasks,
      totalOrganizations,
      approvalRate: completedTasks > 0 ? approvedTasks / completedTasks : 0,
      rejectionRate: completedTasks > 0 ? rejectedTasks / completedTasks : 0,
      completionRate: totalTasks > 0 ? completedTasks / totalTasks : 0,
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get user performance analytics
router.get('/user-performance', authGuard, async (req, res) => {
  try {
    const { userId, period = 'MONTHLY', limit = 10 } = req.query;
    
    const whereClause = userId ? { assignedTo: userId as string } : {};
    
    // Get top performers
    const userStats = await prisma.user.findMany({
      where: {
        role: {
          in: ['ANNOTATOR', 'REVIEWER'],
        },
      },
      include: {
        assignedTasks: {
          where: whereClause,
          include: {
            reviews: {
              select: {
                status: true,
                rating: true,
              },
            },
          },
        },
        _count: {
          select: {
            assignedTasks: {
              where: {
                ...whereClause,
                status: 'SUBMITTED',
              },
            },
          },
        },
      },
      take: Number(limit),
    });
    
    const performanceData = userStats.map(user => {
      const completedTasks = user.assignedTasks.filter(task => task.status === 'SUBMITTED');
      const approvedTasks = user.assignedTasks.filter(task => task.status === 'APPROVED');
      const avgRating = user.assignedTasks
        .flatMap(task => task.reviews)
        .filter(review => review.rating)
        .reduce((sum, review, _, arr) => sum + review.rating! / arr.length, 0);
      
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        completedTasks: completedTasks.length,
        approvedTasks: approvedTasks.length,
        approvalRate: completedTasks.length > 0 ? approvedTasks.length / completedTasks.length : 0,
        averageRating: avgRating || 0,
        totalTasks: user.assignedTasks.length,
      };
    });
    
    // Sort by performance score (combination of completion rate and approval rate)
    performanceData.sort((a, b) => {
      const scoreA = (a.approvalRate * 0.6) + (a.completedTasks / Math.max(a.totalTasks, 1) * 0.4);
      const scoreB = (b.approvalRate * 0.6) + (b.completedTasks / Math.max(b.totalTasks, 1) * 0.4);
      return scoreB - scoreA;
    });
    
    res.json(performanceData);
  } catch (error) {
    console.error('Error fetching user performance:', error);
    res.status(500).json({ error: 'Failed to fetch user performance' });
  }
});

// Get project analytics
router.get('/project-performance', authGuard, async (req, res) => {
  try {
    const { projectId } = req.query;
    
    const projects = await prisma.project.findMany({
      where: {
        ...(projectId && { id: projectId as string }),
      },
      include: {
        tasks: {
          include: {
            reviews: {
              select: {
                status: true,
                rating: true,
              },
            },
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });
    
    const projectStats = projects.map(project => {
      const completedTasks = project.tasks.filter(task => task.status === 'SUBMITTED');
      const approvedTasks = project.tasks.filter(task => task.status === 'APPROVED');
      const rejectedTasks = project.tasks.filter(task => task.status === 'REJECTED');
      const pendingTasks = project.tasks.filter(task => task.status === 'PENDING');
      
      const avgTimeToCompletion = project.tasks
        .filter(task => task.submittedAt && task.createdAt)
        .reduce((sum, task) => {
          const timeDiff = task.submittedAt!.getTime() - task.createdAt.getTime();
          return sum + timeDiff / (1000 * 60 * 60 * 24); // Convert to days
        }, 0) / Math.max(completedTasks.length, 1);
      
      return {
        id: project.id,
        name: project.name,
        status: project.status,
        annotationType: project.annotationType,
        totalTasks: project.tasks.length,
        completedTasks: completedTasks.length,
        approvedTasks: approvedTasks.length,
        rejectedTasks: rejectedTasks.length,
        pendingTasks: pendingTasks.length,
        approvalRate: completedTasks.length > 0 ? approvedTasks.length / completedTasks.length : 0,
        completionRate: project.tasks.length > 0 ? completedTasks.length / project.tasks.length : 0,
        avgTimeToCompletion,
        createdAt: project.createdAt,
        dueDate: project.dueDate,
      };
    });
    
    res.json(projectStats);
  } catch (error) {
    console.error('Error fetching project performance:', error);
    res.status(500).json({ error: 'Failed to fetch project performance' });
  }
});

// Get annotation quality metrics
router.get('/quality-metrics', authGuard, async (req, res) => {
  try {
    const { userId, projectId, period = 'MONTHLY' } = req.query;
    
    const reviews = await prisma.review.findMany({
      where: {
        ...(userId && { 
          task: { 
            assignedTo: userId as string 
          } 
        }),
        ...(projectId && { 
          task: { 
            projectId: projectId as string 
          } 
        }),
        reviewedAt: {
          not: null,
        },
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            assignedTo: true,
            projectId: true,
            submittedAt: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        reviewedAt: 'desc',
      },
    });
    
    const qualityMetrics = {
      totalReviews: reviews.length,
      approvedReviews: reviews.filter(r => r.status === 'APPROVED').length,
      rejectedReviews: reviews.filter(r => r.status === 'REJECTED').length,
      needsRevisionReviews: reviews.filter(r => r.status === 'NEEDS_REVISION').length,
      averageRating: reviews
        .filter(r => r.rating)
        .reduce((sum, r) => sum + r.rating!, 0) / Math.max(reviews.filter(r => r.rating).length, 1),
      ratingDistribution: {
        1: reviews.filter(r => r.rating === 1).length,
        2: reviews.filter(r => r.rating === 2).length,
        3: reviews.filter(r => r.rating === 3).length,
        4: reviews.filter(r => r.rating === 4).length,
        5: reviews.filter(r => r.rating === 5).length,
      },
      recentReviews: reviews.slice(0, 20),
    };
    
    res.json(qualityMetrics);
  } catch (error) {
    console.error('Error fetching quality metrics:', error);
    res.status(500).json({ error: 'Failed to fetch quality metrics' });
  }
});

// Create or update analytics record
router.post('/analytics', authGuard, async (req, res) => {
  try {
    const { userId, projectId, period, metrics } = req.body;
    
    if (!userId || !period || !metrics) {
      return res.status(400).json({ error: 'User ID, period, and metrics are required' });
    }
    
    const analytics = await prisma.analytics.upsert({
      where: {
        userId_period_projectId: {
          userId,
          period,
          projectId: projectId || null,
        },
      },
      update: {
        metrics,
        tasksCompleted: metrics.tasksCompleted,
        approvalRate: metrics.approvalRate,
        avgTimeToComplete: metrics.avgTimeToComplete,
        accuracyScore: metrics.accuracyScore,
      },
      create: {
        userId,
        projectId,
        period,
        metrics,
        tasksCompleted: metrics.tasksCompleted,
        approvalRate: metrics.approvalRate,
        avgTimeToComplete: metrics.avgTimeToComplete,
        accuracyScore: metrics.accuracyScore,
      },
    });
    
    res.json(analytics);
  } catch (error) {
    console.error('Error creating/updating analytics:', error);
    res.status(500).json({ error: 'Failed to create/update analytics' });
  }
});

export default router;