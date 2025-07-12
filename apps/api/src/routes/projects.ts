import { Router } from 'express'
import { requirePermission } from '../middleware/rbac.js'
import { validateBody } from '../middleware/validation.js'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { Permissions, DataAnnotatorPermissions } from '@tetrix/rbac'
import { LabelStudioService } from '../services/labelStudioService'

const prisma = new PrismaClient()
const router = Router()
const labelStudioService = new LabelStudioService()

// GET /api/projects - List all projects
router.get('/', requirePermission(Permissions.ProjectRead), async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        organization: true,
        datasets: true,
        tasks: true,
        metrics: true,
        createdBy: true
      }
    });
    res.json(projects);
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/:id - Get project by ID
router.get('/:id', requirePermission(Permissions.ProjectRead), async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        organization: true,
        datasets: true,
        tasks: true,
        metrics: true,
        createdBy: true
      }
    });
    
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    
    res.json(project);
  } catch (err) {
    next(err);
  }
});

// POST /api/projects - Create new project
const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  organizationId: z.string().uuid(),
  status: z.enum(['active', 'paused', 'completed', 'archived']).default('active'),
  budget: z.number().positive().optional(),
  deadline: z.string().datetime().optional(),
});
router.post('/', requirePermission(DataAnnotatorPermissions.ProjectCreate), validateBody(createProjectSchema), async (req, res, next) => {
  try {
    const data = req.body;
    
    // 1. Create project in platform DB
    const project = await prisma.project.create({
      data: {
        ...data,
        createdById: req.user?.id || 'system', // TODO: Get from auth
      },
      include: {
        organization: true,
        datasets: true,
        tasks: true,
        metrics: true,
        createdBy: true
      }
    });
    
    // 2. Create project in Label Studio
    const lsResult = await labelStudioService.createProjectInLabelStudio(project);
    if (!lsResult.id) {
      // Option 1: Mark as sync_failed
      await prisma.project.update({ where: { id: project.id }, data: { status: 'sync_failed' } });
      res.status(201).json({ ...project, labelStudioSync: 'failed', labelStudioError: lsResult.error });
      return;
      // Option 2: Roll back (uncomment to use)
      // await prisma.project.delete({ where: { id: project.id } });
      // res.status(500).json({ error: 'Failed to sync with Label Studio', details: lsResult.error });
      // return;
    }
    
    // 3. Store LS project ID in DB (if schema supports it)
    try {
      await prisma.project.update({ where: { id: project.id }, data: { labelStudioProjectId: lsResult.id } });
    } catch (e) {
      // If the field does not exist, log and add a TODO for migration
      console.warn('labelStudioProjectId field missing in project schema. Please add it via migration.');
      // Optionally, store in a separate sync table or skip
    }
    res.status(201).json({ ...project, labelStudioSync: 'ok', labelStudioProjectId: lsResult.id });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/projects/:id - Update project
const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['active', 'paused', 'completed', 'archived']).optional(),
  budget: z.number().positive().optional(),
  deadline: z.string().datetime().optional(),
});
router.patch('/:id', requirePermission(DataAnnotatorPermissions.ProjectUpdate), validateBody(updateProjectSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    // Check if project exists
    const existingProject = await prisma.project.findUnique({ where: { id } });
    if (!existingProject) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    
    const project = await prisma.project.update({
      where: { id },
      data,
      include: {
        organization: true,
        datasets: true,
        tasks: true,
        metrics: true,
        createdBy: true
      }
    });
    
    res.json(project);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/projects/:id - Delete project
router.delete('/:id', requirePermission(DataAnnotatorPermissions.ProjectDelete), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if project exists
    const existingProject = await prisma.project.findUnique({ where: { id } });
    if (!existingProject) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    
    await prisma.project.delete({ where: { id } });
    
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router 