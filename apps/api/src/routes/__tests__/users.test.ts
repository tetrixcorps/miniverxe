import request from 'supertest';
import express from 'express';

// Mock Prisma Client
const mockPrisma = {
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  role: {
    findUnique: jest.fn(),
  },
  userRole: {
    upsert: jest.fn(),
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

import usersRouter from '../users';

const app = express();
app.use(express.json());
app.use('/api/users', usersRouter);

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

describe('Users API - Database Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/users', () => {
    it('should return all users with roles and organizations', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          email: 'admin@test.com',
          name: 'Admin User',
          isActive: true,
          createdAt: '2025-07-06T18:33:55.531Z',
          lastLogin: null,
          userRoles: [
            {
              role: { id: 'role-1', name: 'Admin' },
              organization: { id: 'org-1', name: 'TestOrg' }
            }
          ]
        }
      ];

      mockPrisma.user.findMany.mockResolvedValue(mockUsers);

      const response = await request(app)
        .get('/api/users')
        .expect(200);

      expect(response.body).toEqual(mockUsers);
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          email: true,
          name: true,
          isActive: true,
          createdAt: true,
          lastLogin: true,
          userRoles: {
            include: {
              role: true,
              organization: true
            }
          }
        }
      });
    });

    it('should handle database errors gracefully', async () => {
      mockPrisma.user.findMany.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/users')
        .expect(500);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Database error');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return user profile with roles and organizations', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@test.com',
        name: 'Test User',
        isActive: true,
        userRoles: [
          {
            role: { id: 'role-1', name: 'User' },
            organization: { id: 'org-1', name: 'TestOrg' }
          }
        ],
        userOrganizations: [
          {
            organization: { id: 'org-1', name: 'TestOrg' }
          }
        ]
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/users/user-1')
        .expect(200);

      expect(response.body).toEqual(mockUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        include: {
          userRoles: {
            include: {
              role: true,
              organization: true
            }
          },
          userOrganizations: {
            include: {
              organization: true
            }
          }
        }
      });
    });

    it('should return 404 for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/users/non-existent')
        .expect(404);

      expect(response.body).toEqual({ error: 'User not found' });
    });
  });

  describe('PATCH /api/users/:id', () => {
    it('should update user profile successfully', async () => {
      const existingUser = { id: 'user-1', email: 'test@test.com', name: 'Old Name' };
      const updatedUser = { 
        ...existingUser, 
        name: 'New Name',
        userRoles: []
      };

      mockPrisma.user.findUnique.mockResolvedValue(existingUser);
      mockPrisma.user.update.mockResolvedValue(updatedUser);

      const response = await request(app)
        .patch('/api/users/user-1')
        .send({ name: 'New Name' })
        .expect(200);

      expect(response.body).toEqual(updatedUser);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { name: 'New Name' },
        include: {
          userRoles: {
            include: {
              role: true,
              organization: true
            }
          }
        }
      });
    });

    it('should return 404 for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .patch('/api/users/non-existent')
        .send({ name: 'New Name' })
        .expect(404);

      expect(response.body).toEqual({ error: 'User not found' });
    });

    it('should fail with invalid email', async () => {
      const response = await request(app)
        .patch('/api/users/user-1')
        .send({ email: 'not-an-email' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PATCH /api/users/:id/role', () => {
    it('should assign role to user successfully', async () => {
      const existingUser = { id: 'user-1', email: 'test@test.com' };
      const existingRole = { id: '550e8400-e29b-41d4-a716-446655440000', name: 'Admin' };
      const userRole = {
        userId: 'user-1',
        roleId: '550e8400-e29b-41d4-a716-446655440000',
        organizationId: '550e8400-e29b-41d4-a716-446655440001',
        role: existingRole,
        organization: { id: '550e8400-e29b-41d4-a716-446655440001', name: 'TestOrg' }
      };

      mockPrisma.user.findUnique.mockResolvedValue(existingUser);
      mockPrisma.role.findUnique.mockResolvedValue(existingRole);
      mockPrisma.userRole.upsert.mockResolvedValue(userRole);

      const response = await request(app)
        .patch('/api/users/user-1/role')
        .send({ 
          roleId: '550e8400-e29b-41d4-a716-446655440000', 
          organizationId: '550e8400-e29b-41d4-a716-446655440001' 
        })
        .expect(200);

      expect(response.body).toEqual(userRole);
      expect(mockPrisma.userRole.upsert).toHaveBeenCalledWith({
        where: {
          userId_roleId: {
            userId: 'user-1',
            roleId: '550e8400-e29b-41d4-a716-446655440000'
          }
        },
        update: {
          organizationId: '550e8400-e29b-41d4-a716-446655440001'
        },
        create: {
          userId: 'user-1',
          roleId: '550e8400-e29b-41d4-a716-446655440000',
          organizationId: '550e8400-e29b-41d4-a716-446655440001'
        },
        include: {
          role: true,
          organization: true
        }
      });
    });

    it('should return 404 for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .patch('/api/users/non-existent/role')
        .send({ roleId: '550e8400-e29b-41d4-a716-446655440000' })
        .expect(404);

      expect(response.body).toEqual({ error: 'User not found' });
    });

    it('should return 404 for non-existent role', async () => {
      const existingUser = { id: 'user-1', email: 'test@test.com' };

      mockPrisma.user.findUnique.mockResolvedValue(existingUser);
      mockPrisma.role.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .patch('/api/users/user-1/role')
        .send({ roleId: '550e8400-e29b-41d4-a716-446655440000' })
        .expect(404);

      expect(response.body).toEqual({ error: 'Role not found' });
    });

    it('should fail with invalid roleId format', async () => {
      const response = await request(app)
        .patch('/api/users/user-1/role')
        .send({ roleId: 'not-a-uuid' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });
}); 