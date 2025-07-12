import request from 'supertest';
import express from 'express';

// Mock Prisma Client
const mockPrisma = {
  project: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

// Mock the auth and RBAC middleware to always allow
jest.mock('../../middleware/auth.js', () => ({
  firebaseAuthMiddleware: (_req: any, _res: any, next: any) => next(),
}));
jest.mock('../../middleware/rbac.js', () => ({
  requirePermission: () => (_req: any, _res: any, next: any) => next(),
}));

import projectsRouter from '../projects';

const app = express();
app.use(express.json());
app.use('/api/projects', projectsRouter);

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

describe('Projects API - Database Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/projects', () => {
    it('should return all projects with related data', async () => {
      const mockProjects = [
        {
          id: 'project-1',
          name: 'Test Project 1',
          description: 'A test project',
          status: 'active',
          budget: 5000,
          deadline: '2024-12-31T23:59:59Z',
          organization: { id: 'org-1', name: 'TestOrg' },
          datasets: [],
          tasks: [],
          metrics: [],
          createdBy: { id: 'user-1', name: 'Test User' }
        }
      ];

      mockPrisma.project.findMany.mockResolvedValue(mockProjects);

      const response = await request(app)
        .get('/api/projects')
        .expect(200);

      expect(response.body).toEqual(mockProjects);
      expect(mockPrisma.project.findMany).toHaveBeenCalledWith({
        include: {
          organization: true,
          datasets: true,
          tasks: true,
          metrics: true,
          createdBy: true
        }
      });
    });

    it('should handle database errors gracefully', async () => {
      mockPrisma.project.findMany.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/projects')
        .expect(500);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Database error');
    });
  });

  describe('GET /api/projects/:id', () => {
    it('should return project by ID with related data', async () => {
      const mockProject = {
        id: 'project-1',
        name: 'Test Project',
        description: 'A test project',
        status: 'active',
        budget: 5000,
        deadline: '2024-12-31T23:59:59Z',
        organization: { id: 'org-1', name: 'TestOrg' },
        datasets: [],
        tasks: [],
        metrics: [],
        createdBy: { id: 'user-1', name: 'Test User' }
      };

      mockPrisma.project.findUnique.mockResolvedValue(mockProject);

      const response = await request(app)
        .get('/api/projects/project-1')
        .expect(200);

      expect(response.body).toEqual(mockProject);
      expect(mockPrisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: 'project-1' },
        include: {
          organization: true,
          datasets: true,
          tasks: true,
          metrics: true,
          createdBy: true
        }
      });
    });

    it('should return 404 for non-existent project', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/projects/non-existent')
        .expect(404);

      expect(response.body).toEqual({ error: 'Project not found' });
    });
  });

  describe('POST /api/projects', () => {
    it('should create a new project successfully', async () => {
      const projectData = {
        name: 'New Project',
        description: 'A new test project',
        organizationId: '550e8400-e29b-41d4-a716-446655440000',
        status: 'active',
        budget: 3000,
        deadline: '2024-12-31T23:59:59Z'
      };

      const createdProject = {
        id: 'project-2',
        ...projectData,
        organization: { id: '550e8400-e29b-41d4-a716-446655440000', name: 'TestOrg' },
        datasets: [],
        tasks: [],
        metrics: [],
        createdBy: { id: 'user-1', name: 'Test User' }
      };

      mockPrisma.project.create.mockResolvedValue(createdProject);

      const response = await request(app)
        .post('/api/projects')
        .send(projectData)
        .expect(201);

      expect(response.body).toEqual(createdProject);
      expect(mockPrisma.project.create).toHaveBeenCalledWith({
        data: {
          ...projectData,
          createdById: 'system'
        },
        include: {
          organization: true,
          datasets: true,
          tasks: true,
          metrics: true,
          createdBy: true
        }
      });
    });

    it('should fail with invalid organizationId format', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({
          name: 'New Project',
          organizationId: 'not-a-uuid'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail with missing required fields', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({
          description: 'A project without name'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PATCH /api/projects/:id', () => {
    it('should update project successfully', async () => {
      const existingProject = { id: 'project-1', name: 'Old Name', status: 'active' };
      const updateData = { name: 'Updated Name', status: 'paused' };
      const updatedProject = { ...existingProject, ...updateData };

      mockPrisma.project.findUnique.mockResolvedValue(existingProject);
      mockPrisma.project.update.mockResolvedValue(updatedProject);

      const response = await request(app)
        .patch('/api/projects/project-1')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual(updatedProject);
      expect(mockPrisma.project.update).toHaveBeenCalledWith({
        where: { id: 'project-1' },
        data: updateData,
        include: {
          organization: true,
          datasets: true,
          tasks: true,
          metrics: true,
          createdBy: true
        }
      });
    });

    it('should return 404 for non-existent project', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .patch('/api/projects/non-existent')
        .send({ name: 'Updated Name' })
        .expect(404);

      expect(response.body).toEqual({ error: 'Project not found' });
    });

    it('should fail with invalid status', async () => {
      const response = await request(app)
        .patch('/api/projects/project-1')
        .send({ status: 'invalid-status' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/projects/:id', () => {
    it('should delete project successfully', async () => {
      const existingProject = { id: 'project-1', name: 'Test Project' };

      mockPrisma.project.findUnique.mockResolvedValue(existingProject);
      mockPrisma.project.delete.mockResolvedValue(existingProject);

      const response = await request(app)
        .delete('/api/projects/project-1')
        .expect(204);

      expect(response.body).toEqual({});
      expect(mockPrisma.project.delete).toHaveBeenCalledWith({
        where: { id: 'project-1' }
      });
    });

    it('should return 404 for non-existent project', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/projects/non-existent')
        .expect(404);

      expect(response.body).toEqual({ error: 'Project not found' });
    });
  });
}); 