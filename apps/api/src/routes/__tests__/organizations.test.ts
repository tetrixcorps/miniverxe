import request from 'supertest';
import express from 'express';

// Mock Firebase Admin
const mockFirebaseAuth = {
  verifyIdToken: jest.fn(),
};

jest.mock('firebase-admin', () => ({
  auth: () => mockFirebaseAuth,
  initializeApp: jest.fn(),
}));

// Mock Prisma Client
const mockPrisma = {
  organization: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
  userOrganization: {
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
  project: {
    count: jest.fn(),
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

import organizationsRouter from '../organizations';

const app = express();
app.use(express.json());
app.use('/api/organizations', organizationsRouter);

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

describe('Organizations API - Database Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/organizations', () => {
    it('should return all organizations with related data', async () => {
      const mockOrganizations = [
        {
          id: 'org-1',
          name: 'Test Organization',
          description: 'A test organization',
          website: 'https://test.org',
          industry: 'Technology',
          size: 'medium',
          status: 'active',
          users: [
            {
              user: {
                id: 'user-1',
                email: 'user1@test.org',
                name: 'Test User',
                isActive: true
              }
            }
          ],
          projects: [
            {
              id: 'project-1',
              name: 'Test Project',
              status: 'active',
              createdAt: '2024-01-01T00:00:00Z'
            }
          ],
          _count: {
            users: 1,
            projects: 1
          }
        }
      ];

      mockPrisma.organization.findMany.mockResolvedValue(mockOrganizations);

      const response = await request(app)
        .get('/api/organizations')
        .expect(200);

      expect(response.body).toEqual(mockOrganizations);
      expect(mockPrisma.organization.findMany).toHaveBeenCalledWith({
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
    });

    it('should handle database errors gracefully', async () => {
      mockPrisma.organization.findMany.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/organizations')
        .expect(500);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Database error');
    });
  });

  describe('GET /api/organizations/:id', () => {
    it('should return organization by ID with detailed data', async () => {
      const mockOrganization = {
        id: 'org-1',
        name: 'Test Organization',
        description: 'A test organization',
        users: [
          {
            user: {
              id: 'user-1',
              email: 'user1@test.org',
              name: 'Test User',
              isActive: true,
              userRoles: [
                {
                  role: { id: 'role-1', name: 'Admin' }
                }
              ]
            }
          }
        ],
        projects: [
          {
            id: 'project-1',
            name: 'Test Project',
            datasets: [],
            tasks: [],
            metrics: [],
            createdBy: { id: 'user-1', name: 'Test User' }
          }
        ],
        _count: {
          users: 1,
          projects: 1
        }
      };

      mockPrisma.organization.findUnique.mockResolvedValue(mockOrganization);

      const response = await request(app)
        .get('/api/organizations/org-1')
        .expect(200);

      expect(response.body).toEqual(mockOrganization);
    });

    it('should return 404 for non-existent organization', async () => {
      mockPrisma.organization.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/organizations/non-existent')
        .expect(404);

      expect(response.body).toEqual({ error: 'Organization not found' });
    });
  });

  describe('POST /api/organizations', () => {
    it('should create a new organization successfully', async () => {
      const organizationData = {
        name: 'New Organization',
        description: 'A new test organization',
        website: 'https://neworg.com',
        industry: 'Finance',
        size: 'large',
        status: 'active'
      };

      const createdOrganization = {
        id: 'org-2',
        ...organizationData,
        users: [],
        projects: [],
        _count: {
          users: 0,
          projects: 0
        }
      };

      mockPrisma.organization.create.mockResolvedValue(createdOrganization);

      const response = await request(app)
        .post('/api/organizations')
        .send(organizationData)
        .expect(201);

      expect(response.body).toEqual(createdOrganization);
      expect(mockPrisma.organization.create).toHaveBeenCalledWith({
        data: {
          ...organizationData,
          createdById: 'system'
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
    });

    it('should fail with invalid website URL', async () => {
      const response = await request(app)
        .post('/api/organizations')
        .send({
          name: 'New Organization',
          website: 'not-a-url'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail with invalid size enum', async () => {
      const response = await request(app)
        .post('/api/organizations')
        .send({
          name: 'New Organization',
          size: 'invalid-size'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PATCH /api/organizations/:id', () => {
    it('should update organization successfully', async () => {
      const existingOrganization = { id: 'org-1', name: 'Old Name', status: 'active' };
      const updateData = { name: 'Updated Name', status: 'inactive' };
      const updatedOrganization = { ...existingOrganization, ...updateData };

      mockPrisma.organization.findUnique.mockResolvedValue(existingOrganization);
      mockPrisma.organization.update.mockResolvedValue(updatedOrganization);

      const response = await request(app)
        .patch('/api/organizations/org-1')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual(updatedOrganization);
    });

    it('should return 404 for non-existent organization', async () => {
      mockPrisma.organization.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .patch('/api/organizations/non-existent')
        .send({ name: 'Updated Name' })
        .expect(404);

      expect(response.body).toEqual({ error: 'Organization not found' });
    });
  });

  describe('DELETE /api/organizations/:id', () => {
    it('should delete organization successfully when no active projects', async () => {
      const existingOrganization = { id: 'org-1', name: 'Test Organization' };

      mockPrisma.organization.findUnique.mockResolvedValue(existingOrganization);
      mockPrisma.project.count.mockResolvedValue(0);
      mockPrisma.organization.delete.mockResolvedValue(existingOrganization);

      const response = await request(app)
        .delete('/api/organizations/org-1')
        .expect(204);

      expect(response.body).toEqual({});
      expect(mockPrisma.organization.delete).toHaveBeenCalledWith({
        where: { id: 'org-1' }
      });
    });

    it('should prevent deletion when organization has active projects', async () => {
      const existingOrganization = { id: 'org-1', name: 'Test Organization' };

      mockPrisma.organization.findUnique.mockResolvedValue(existingOrganization);
      mockPrisma.project.count.mockResolvedValue(3);

      const response = await request(app)
        .delete('/api/organizations/org-1')
        .expect(400);

      expect(response.body).toEqual({
        error: 'Cannot delete organization with active projects',
        activeProjects: 3
      });
    });

    it('should return 404 for non-existent organization', async () => {
      mockPrisma.organization.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/organizations/non-existent')
        .expect(404);

      expect(response.body).toEqual({ error: 'Organization not found' });
    });
  });

  describe('POST /api/organizations/:id/users', () => {
    it('should add user to organization successfully', async () => {
      const existingOrganization = { id: 'org-1', name: 'Test Organization' };
      const existingUser = { id: 'user-1', email: 'user@test.org', name: 'Test User' };
      const userOrgData = {
        userId: 'user-1',
        role: 'member'
      };

      const createdUserOrg = {
        userId: 'user-1',
        organizationId: 'org-1',
        role: 'member',
        user: {
          id: 'user-1',
          email: 'user@test.org',
          name: 'Test User',
          isActive: true
        },
        organization: {
          id: 'org-1',
          name: 'Test Organization'
        }
      };

      mockPrisma.organization.findUnique.mockResolvedValue(existingOrganization);
      mockPrisma.user.findUnique.mockResolvedValue(existingUser);
      mockPrisma.userOrganization.create.mockResolvedValue(createdUserOrg);

      const response = await request(app)
        .post('/api/organizations/org-1/users')
        .send(userOrgData)
        .expect(201);

      expect(response.body).toEqual(createdUserOrg);
    });

    it('should return 404 for non-existent organization', async () => {
      mockPrisma.organization.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/organizations/non-existent/users')
        .send({ userId: 'user-1' })
        .expect(404);

      expect(response.body).toEqual({ error: 'Organization not found' });
    });

    it('should return 404 for non-existent user', async () => {
      const existingOrganization = { id: 'org-1', name: 'Test Organization' };

      mockPrisma.organization.findUnique.mockResolvedValue(existingOrganization);
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/organizations/org-1/users')
        .send({ userId: 'non-existent-user' })
        .expect(404);

      expect(response.body).toEqual({ error: 'User not found' });
    });
  });

  describe('DELETE /api/organizations/:id/users/:userId', () => {
    it('should remove user from organization successfully', async () => {
      const existingOrganization = { id: 'org-1', name: 'Test Organization' };
      const existingUserOrg = {
        userId: 'user-1',
        organizationId: 'org-1',
        role: 'member'
      };

      mockPrisma.organization.findUnique.mockResolvedValue(existingOrganization);
      mockPrisma.userOrganization.findUnique.mockResolvedValue(existingUserOrg);
      mockPrisma.userOrganization.delete.mockResolvedValue(existingUserOrg);

      const response = await request(app)
        .delete('/api/organizations/org-1/users/user-1')
        .expect(204);

      expect(response.body).toEqual({});
      expect(mockPrisma.userOrganization.delete).toHaveBeenCalledWith({
        where: {
          userId_organizationId: {
            userId: 'user-1',
            organizationId: 'org-1'
          }
        }
      });
    });

    it('should return 404 for non-existent organization', async () => {
      mockPrisma.organization.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/organizations/non-existent/users/user-1')
        .expect(404);

      expect(response.body).toEqual({ error: 'Organization not found' });
    });

    it('should return 404 for user not in organization', async () => {
      const existingOrganization = { id: 'org-1', name: 'Test Organization' };

      mockPrisma.organization.findUnique.mockResolvedValue(existingOrganization);
      mockPrisma.userOrganization.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/organizations/org-1/users/user-1')
        .expect(404);

      expect(response.body).toEqual({ error: 'User not found in organization' });
    });
  });

  describe('Complex Business Logic Tests', () => {
    it('should handle organization with multiple users and projects', async () => {
      const mockOrganization = {
        id: 'org-1',
        name: 'Large Organization',
        users: [
          {
            user: {
              id: 'user-1',
              email: 'admin@org.com',
              name: 'Admin User',
              isActive: true
            }
          },
          {
            user: {
              id: 'user-2',
              email: 'member@org.com',
              name: 'Member User',
              isActive: true
            }
          }
        ],
        projects: [
          {
            id: 'project-1',
            name: 'Active Project',
            status: 'active'
          },
          {
            id: 'project-2',
            name: 'Completed Project',
            status: 'completed'
          }
        ],
        _count: {
          users: 2,
          projects: 2
        }
      };

      mockPrisma.organization.findUnique.mockResolvedValue(mockOrganization);

      const response = await request(app)
        .get('/api/organizations/org-1')
        .expect(200);

      expect(response.body.users).toHaveLength(2);
      expect(response.body.projects).toHaveLength(2);
      expect(response.body._count.users).toBe(2);
      expect(response.body._count.projects).toBe(2);
    });

    it('should handle organization deletion with mixed project statuses', async () => {
      const existingOrganization = { id: 'org-1', name: 'Test Organization' };

      mockPrisma.organization.findUnique.mockResolvedValue(existingOrganization);
      // Only count active and paused projects
      mockPrisma.project.count.mockResolvedValue(1);

      const response = await request(app)
        .delete('/api/organizations/org-1')
        .expect(400);

      expect(response.body).toEqual({
        error: 'Cannot delete organization with active projects',
        activeProjects: 1
      });
    });

    it('should handle user addition with default role', async () => {
      const existingOrganization = { id: 'org-1', name: 'Test Organization' };
      const existingUser = { id: 'user-1', email: 'user@test.org', name: 'Test User' };

      const createdUserOrg = {
        userId: 'user-1',
        organizationId: 'org-1',
        role: 'member', // Default role
        user: {
          id: 'user-1',
          email: 'user@test.org',
          name: 'Test User',
          isActive: true
        },
        organization: {
          id: 'org-1',
          name: 'Test Organization'
        }
      };

      mockPrisma.organization.findUnique.mockResolvedValue(existingOrganization);
      mockPrisma.user.findUnique.mockResolvedValue(existingUser);
      mockPrisma.userOrganization.create.mockResolvedValue(createdUserOrg);

      const response = await request(app)
        .post('/api/organizations/org-1/users')
        .send({ userId: 'user-1' }) // No role specified
        .expect(201);

      expect(response.body.role).toBe('member');
    });
  });
}); 