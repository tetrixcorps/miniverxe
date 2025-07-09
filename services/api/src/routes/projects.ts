import { Router } from 'express';
import { prisma } from '../db';
import { authGuard } from '../middleware/auth';
import { requireRole } from '../middleware/roles';

const router = Router();

// List all projects (admin/pm)
router.get('/', authGuard, requireRole('admin', 'project_manager'), async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Create a new project (admin/pm)
router.post('/', authGuard, requireRole('admin', 'project_manager'), async (req, res) => {
  try {
    const { name, description, annotationType, guidelineUrl, dueDate, orgId } = req.body;
    const userId = (req as any).user.uid;
    
    // Validate required fields
    if (!name || !annotationType || !orgId) {
      return res.status(400).json({ error: 'Name, annotation type, and organization ID are required' });
    }
    
    // Check if organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
    });
    
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    
    // Check for duplicate project name in the same organization
    const existingProject = await prisma.project.findFirst({
      where: {
        name,
        orgId,
      },
    });
    
    if (existingProject) {
      return res.status(400).json({ error: 'Project name already exists in this organization' });
    }
    
    const project = await prisma.project.create({
      data: {
        name,
        description,
        annotationType,
        guidelineUrl,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: 'DRAFT',
        createdBy: userId,
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
    
    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update project (admin/pm)
router.patch('/:id', authGuard, requireRole('admin', 'project_manager'), async (req, res) => {
  try {
    const { name, description, status, guidelineUrl, dueDate } = req.body;
    const projectId = req.params.id;
    
    // Validate status transitions
    const validStatuses = ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Check for duplicate name if updating name
    if (name && name !== project.name) {
      const existingProject = await prisma.project.findFirst({
        where: {
          name,
          orgId: project.orgId,
          id: { not: projectId },
        },
      });
      
      if (existingProject) {
        return res.status(400).json({ error: 'Project name already exists in this organization' });
      }
    }
    
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(status && { status }),
        ...(guidelineUrl && { guidelineUrl }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
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
            tasks: true,
          },
        },
      },
    });
    
    res.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Get a specific project
router.get('/:id', authGuard, async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            assignedTo: true,
            createdAt: true,
            submittedAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Delete project (admin only)
router.delete('/:id', authGuard, requireRole('admin'), async (req, res) => {
  try {
    const projectId = req.params.id;
    
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Check if project has tasks
    if (project._count.tasks > 0) {
      return res.status(400).json({ error: 'Cannot delete project with existing tasks' });
    }
    
    await prisma.project.delete({
      where: { id: projectId },
    });
    
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router; 