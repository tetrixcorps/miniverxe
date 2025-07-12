import request from 'supertest';
import express from 'express';
import admin from 'firebase-admin';

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
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
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

import usersRouter from '../users';
import projectsRouter from '../projects';

const app = express();
app.use(express.json());
app.use('/api/users', usersRouter);
app.use('/api/projects', projectsRouter);

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Firebase Authentication', () => {
    it('should authenticate valid Firebase token', async () => {
      const mockUser = {
        uid: 'user-123',
        email: 'test@example.com',
        roles: ['admin'],
        permissions: ['user:list', 'user:write'],
        userGroup: 'enterprise',
        metadata: { rateLimit: 1000 }
      };

      mockFirebaseAuth.verifyIdToken.mockResolvedValue(mockUser);
      mockPrisma.user.findMany.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockFirebaseAuth.verifyIdToken).toHaveBeenCalledWith('valid-token');
      expect(response.body).toEqual([]);
    });

    it('should reject invalid Firebase token', async () => {
      mockFirebaseAuth.verifyIdToken.mockRejectedValue(new Error('Invalid token'));

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toEqual({ error: 'Invalid or expired token' });
    });

    it('should reject missing authorization header', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(401);

      expect(response.body).toEqual({ error: 'Missing or invalid Authorization header' });
    });

    it('should reject malformed authorization header', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', 'InvalidFormat token')
        .expect(401);

      expect(response.body).toEqual({ error: 'Missing or invalid Authorization header' });
    });
  });

  describe('RBAC Permission Tests', () => {
    it('should allow access with correct permission', async () => {
      const mockUser = {
        uid: 'user-123',
        email: 'admin@example.com',
        roles: ['admin'],
        permissions: ['user:list', 'user:write', 'project:read'],
        userGroup: 'enterprise'
      };

      mockFirebaseAuth.verifyIdToken.mockResolvedValue(mockUser);
      mockPrisma.user.findMany.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should deny access with insufficient permissions', async () => {
      const mockUser = {
        uid: 'user-123',
        email: 'user@example.com',
        roles: ['user'],
        permissions: ['user:list'], // Missing project:read
        userGroup: 'data-annotator'
      };

      mockFirebaseAuth.verifyIdToken.mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', 'Bearer valid-token')
        .expect(403);

      expect(response.body).toEqual({ 
        error: 'Forbidden: missing permission project:read' 
      });
    });

    it('should handle user with no permissions', async () => {
      const mockUser = {
        uid: 'user-123',
        email: 'newuser@example.com',
        roles: [],
        permissions: [],
        userGroup: 'data-annotator'
      };

      mockFirebaseAuth.verifyIdToken.mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer valid-token')
        .expect(403);

      expect(response.body).toEqual({ 
        error: 'Forbidden: missing permission user:list' 
      });
    });
  });

  describe('User Group Access Control', () => {
    it('should allow enterprise users to access all endpoints', async () => {
      const mockUser = {
        uid: 'enterprise-user',
        email: 'enterprise@example.com',
        roles: ['admin'],
        permissions: ['user:list', 'user:write', 'project:read', 'project:write'],
        userGroup: 'enterprise'
      };

      mockFirebaseAuth.verifyIdToken.mockResolvedValue(mockUser);
      mockPrisma.user.findMany.mockResolvedValue([]);
      mockPrisma.project.findMany.mockResolvedValue([]);

      // Test users endpoint
      const usersResponse = await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      // Test projects endpoint
      const projectsResponse = await request(app)
        .get('/api/projects')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(usersResponse.body).toEqual([]);
      expect(projectsResponse.body).toEqual([]);
    });

    it('should restrict data-annotator users appropriately', async () => {
      const mockUser = {
        uid: 'annotator-user',
        email: 'annotator@example.com',
        roles: ['annotator'],
        permissions: ['project:read'], // Limited permissions
        userGroup: 'data-annotator'
      };

      mockFirebaseAuth.verifyIdToken.mockResolvedValue(mockUser);
      mockPrisma.project.findMany.mockResolvedValue([]);

      // Should be able to read projects
      const projectsResponse = await request(app)
        .get('/api/projects')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      // Should not be able to read users
      const usersResponse = await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer valid-token')
        .expect(403);

      expect(projectsResponse.body).toEqual([]);
      expect(usersResponse.body).toEqual({ 
        error: 'Forbidden: missing permission user:list' 
      });
    });
  });

  describe('Complex Business Logic Tests', () => {
    it('should handle user with multiple roles and permissions', async () => {
      const mockUser = {
        uid: 'multi-role-user',
        email: 'multi@example.com',
        roles: ['admin', 'manager', 'annotator'],
        permissions: ['user:list', 'user:write', 'project:read', 'project:write', 'task:read'],
        userGroup: 'enterprise',
        metadata: { 
          rateLimit: 2000,
          features: ['advanced-analytics', 'bulk-operations']
        }
      };

      mockFirebaseAuth.verifyIdToken.mockResolvedValue(mockUser);
      mockPrisma.user.findMany.mockResolvedValue([
        { id: 'user-1', email: 'user1@example.com', roles: ['user'] }
      ]);

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('id', 'user-1');
    });

    it('should handle rate limiting metadata', async () => {
      const mockUser = {
        uid: 'rate-limited-user',
        email: 'rate@example.com',
        roles: ['user'],
        permissions: ['user:list'],
        userGroup: 'data-annotator',
        metadata: { 
          rateLimit: 100, // Low rate limit
          apiRateLimit: 50
        }
      };

      mockFirebaseAuth.verifyIdToken.mockResolvedValue(mockUser);
      mockPrisma.user.findMany.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      // Verify user metadata is properly set
      expect(mockFirebaseAuth.verifyIdToken).toHaveBeenCalledWith('valid-token');
    });

    it('should handle user with custom claims', async () => {
      const mockUser = {
        uid: 'custom-claims-user',
        email: 'custom@example.com',
        roles: ['admin'],
        permissions: ['user:list', 'user:write'],
        userGroup: 'enterprise',
        metadata: {
          customField: 'customValue',
          organizationId: 'org-123',
          subscription: 'premium'
        }
      };

      mockFirebaseAuth.verifyIdToken.mockResolvedValue(mockUser);
      mockPrisma.user.findMany.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle Firebase token expiration', async () => {
      mockFirebaseAuth.verifyIdToken.mockRejectedValue(new Error('Token expired'));

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer expired-token')
        .expect(401);

      expect(response.body).toEqual({ error: 'Invalid or expired token' });
    });

    it('should handle malformed user data from Firebase', async () => {
      const mockUser = {
        uid: 'malformed-user',
        // Missing required fields
      };

      mockFirebaseAuth.verifyIdToken.mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer valid-token')
        .expect(403); // Should fail due to missing permissions

      expect(response.body).toHaveProperty('error');
    });

    it('should handle concurrent authentication requests', async () => {
      const mockUser = {
        uid: 'concurrent-user',
        email: 'concurrent@example.com',
        roles: ['user'],
        permissions: ['user:list'],
        userGroup: 'data-annotator'
      };

      mockFirebaseAuth.verifyIdToken.mockResolvedValue(mockUser);
      mockPrisma.user.findMany.mockResolvedValue([]);

      // Make multiple concurrent requests
      const promises = Array(5).fill(null).map(() =>
        request(app)
          .get('/api/users')
          .set('Authorization', 'Bearer valid-token')
      );

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      expect(mockFirebaseAuth.verifyIdToken).toHaveBeenCalledTimes(5);
    });
  });
}); 