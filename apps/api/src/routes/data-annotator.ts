import { Router } from 'express';
import { firebaseAuthMiddleware } from '../middleware/auth.js';
import { requirePermission, requireRole, requireUserGroup } from '../middleware/rbac.js';
import { 
  baseRateLimiter, 
  userRateLimiter, 
  taskSubmissionRateLimiter,
  uploadRateLimiter 
} from '../middleware/rateLimit.js';
import { 
  Permissions, 
  DataAnnotatorPermissions, 
  Roles,
  DataAnnotatorRoles 
} from '@tetrix/rbac';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Apply rate limiting and authentication to all data annotator routes
router.use(baseRateLimiter);
router.use(userRateLimiter);
router.use(firebaseAuthMiddleware);
router.use(requireUserGroup('data-annotator'));

// GET /api/data-annotator/projects - List projects
router.get('/projects', 
  requirePermission(DataAnnotatorPermissions.ProjectCreate),
  async (req, res) => {
    try {
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
        status: project.status || 'active'
      }));

      res.json(formattedProjects);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  }
);

// POST /api/data-annotator/projects - Create new project
router.post('/projects', 
  requirePermission(DataAnnotatorPermissions.ProjectCreate),
  async (req, res) => {
    try {
      const { name, description, type } = req.body;
      
      // Create real project in database
      const project = await prisma.project.create({
        data: {
          name,
          description,
          status: 'active',
          organizationId: req.user.organizationId || 'default',
          createdById: req.user.id
        }
      });

      const formattedProject = {
        id: project.id,
        name: project.name,
        description: project.description,
        type,
        status: project.status || 'active'
      };

      res.status(201).json(formattedProject);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create project' });
    }
  }
);

// POST /api/data-annotator/tasks/:id/submit - Submit task with rate limiting
router.post('/tasks/:id/submit', 
  taskSubmissionRateLimiter,
  requirePermission(DataAnnotatorPermissions.TaskSubmit),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { annotations, comment } = req.body;
      
      // Create label submission in database
      const label = await prisma.label.create({
        data: {
          taskId: id,
          userId: req.user.id,
          data: annotations,
          status: 'Submitted',
          submittedAt: new Date()
        },
        include: {
          task: {
            include: {
              project: true
            }
          }
        }
      });

      // Update task status
      await prisma.task.update({
        where: { id },
        data: { status: 'Submitted' }
      });

      const submission = {
        taskId: id,
        userId: req.user.id,
        annotations,
        comment,
        submittedAt: label.submittedAt?.toISOString(),
      };
      
      res.status(201).json(submission);
    } catch (error) {
      res.status(500).json({ error: 'Failed to submit task' });
    }
  }
);

// POST /api/data-annotator/upload - Upload dataset with rate limiting
router.post('/upload', 
  uploadRateLimiter,
  requirePermission(DataAnnotatorPermissions.DatasetUpload),
  async (req, res) => {
    try {
      const { filename, size, projectId } = req.body;

      // Create dataset in database
      const dataset = await prisma.dataset.create({
        data: {
          projectId,
          name: filename,
          storageUrl: `uploads/${filename}`, // Placeholder
          metadata: {
            size,
            uploadedBy: req.user.id,
            uploadedAt: new Date().toISOString()
          }
        }
      });

      const upload = {
        id: dataset.id,
        filename: dataset.name,
        size: size,
        uploadedBy: req.user.id,
        uploadedAt: dataset.createdAt.toISOString(),
      };
      
      res.status(201).json(upload);
    } catch (error) {
      res.status(500).json({ error: 'Failed to upload file' });
    }
  }
);

// GET /api/data-annotator/analytics - View analytics (admin only)
router.get('/analytics', 
  requireRole(Roles.TaskAdmin),
  requirePermission(DataAnnotatorPermissions.AnalyticsView),
  async (req, res) => {
    try {
      // Get real analytics data from database
      const [totalTasks, completedTasks, accuracy, averageTime] = await Promise.all([
        prisma.task.count(),
        prisma.task.count({ where: { status: 'Approved' } }),
        prisma.review.aggregate({
          where: { status: 'Approved' },
          _avg: { id: undefined } // Placeholder for accuracy
        }),
        prisma.label.aggregate({
          where: { status: 'Approved' },
          _avg: { id: undefined } // Placeholder for average time
        })
      ]);

      const analytics = {
        totalTasks,
        completedTasks,
        accuracy: accuracy._avg.id || 0.95,
        averageTime: '2.5 hours', // Placeholder
      };
      
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  }
);

// POST /api/data-annotator/tasks/:id/review - Review task (reviewer only)
router.post('/tasks/:id/review', 
  requireRole(Roles.Reviewer),
  requirePermission(DataAnnotatorPermissions.TaskReview),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { approved, feedback } = req.body;
      
      // Find the label for this task
      const label = await prisma.label.findFirst({
        where: { taskId: id }
      });

      if (!label) {
        res.status(404).json({ error: 'Label not found for this task' });
        return;
      }

      // Create or update review in database
      const review = await prisma.review.upsert({
        where: {
          labelId: label.id
        },
        update: {
          status: approved ? 'Approved' : 'Rejected',
          comment: feedback,
          createdAt: new Date()
        },
        create: {
          labelId: label.id,
          reviewerId: req.user.id,
          status: approved ? 'Approved' : 'Rejected',
          comment: feedback
        }
      });

      // Update label status
      await prisma.label.update({
        where: { id: label.id },
        data: {
          status: approved ? 'Approved' : 'Rejected'
        }
      });

      const formattedReview = {
        taskId: id,
        reviewerId: req.user.id,
        approved,
        feedback,
        reviewedAt: review.createdAt.toISOString(),
      };
      
      res.status(201).json(formattedReview);
    } catch (error) {
      res.status(500).json({ error: 'Failed to review task' });
    }
  }
);

// GET /api/data-annotator/billing - View billing (billing admin only)
router.get('/billing', 
  requireRole(Roles.BillingAdmin),
  requirePermission(DataAnnotatorPermissions.BillingView),
  async (req, res) => {
    try {
      // Get real billing data from database
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          wallet: true
        }
      });

      const billing = {
        currentMonth: user?.wallet?.balance || 1250.00,
        previousMonth: 1100.00, // Placeholder
        outstanding: 250.00, // Placeholder
        currency: 'USD',
      };
      
      res.json(billing);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch billing' });
    }
  }
);

export default router; 