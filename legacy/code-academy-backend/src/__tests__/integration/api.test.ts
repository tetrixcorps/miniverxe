import request from 'supertest';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/client';
import authRoutes from '../../routes/auth';
import courseRoutes from '../../routes/courses';
import { authenticateToken } from '../../middleware/auth';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

const prisma = new PrismaClient();

describe('API Integration Tests', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    // Clean up test data
    await prisma.$executeRaw`TRUNCATE TABLE "sessions", "user_profiles", "users" RESTART IDENTITY CASCADE;`;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Authentication Flow', () => {
    it('should complete full authentication flow', async () => {
      // 1. Register user
      const registerData = {
        email: 'integration@example.com',
        username: 'integrationuser',
        password: 'password123',
        firstName: 'Integration',
        lastName: 'Test',
        experienceLevel: 'BEGINNER',
        learningGoals: ['JavaScript', 'React']
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(registerData)
        .expect(201);

      expect(registerResponse.body).toHaveProperty('user');
      expect(registerResponse.body).toHaveProperty('tokens');
      userId = registerResponse.body.user.id;
      authToken = registerResponse.body.tokens.accessToken;

      // 2. Get current user
      const meResponse = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(meResponse.body.user.id).toBe(userId);
      expect(meResponse.body.user.email).toBe(registerData.email);

      // 3. Refresh tokens
      const refreshResponse = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: registerResponse.body.tokens.refreshToken })
        .expect(200);

      expect(refreshResponse.body).toHaveProperty('tokens');

      // 4. Logout
      const logoutResponse = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(logoutResponse.body.message).toBe('Logout successful');
    });

    it('should handle 2FA authentication flow', async () => {
      // 1. Login (should require 2FA)
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'integration@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('twoFAToken');
      expect(loginResponse.body).toHaveProperty('user');

      // 2. Verify 2FA (mock successful verification)
      const twoFAToken = loginResponse.body.twoFAToken;
      const verifyResponse = await request(app)
        .post('/api/auth/verify-2fa')
        .send({
          token: twoFAToken,
          code: '123456'
        })
        .expect(200);

      expect(verifyResponse.body).toHaveProperty('tokens');
      expect(verifyResponse.body).toHaveProperty('user');
    });
  });

  describe('Course Management Flow', () => {
    let courseId: string;

    it('should create and manage courses', async () => {
      // 1. Create a course
      const courseData = {
        title: 'JavaScript Fundamentals',
        description: 'Learn the basics of JavaScript programming',
        shortDescription: 'JavaScript basics course',
        slug: 'javascript-fundamentals',
        difficulty: 'BEGINNER',
        duration: 120,
        price: 0,
        isFree: true,
        isPublished: true,
        tags: ['JavaScript', 'Programming', 'Beginner'],
        prerequisites: [],
        learningOutcomes: ['Understand JavaScript syntax', 'Write basic programs'],
        instructorName: 'TETRIX Academy',
        instructorBio: 'Expert JavaScript instructor'
      };

      const createResponse = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(courseData)
        .expect(201);

      expect(createResponse.body).toHaveProperty('course');
      courseId = createResponse.body.course.id;

      // 2. Get course details
      const getResponse = await request(app)
        .get(`/api/courses/${courseId}`)
        .expect(200);

      expect(getResponse.body.course.title).toBe(courseData.title);
      expect(getResponse.body.course.slug).toBe(courseData.slug);

      // 3. List all courses
      const listResponse = await request(app)
        .get('/api/courses')
        .expect(200);

      expect(listResponse.body.courses).toHaveLength(1);
      expect(listResponse.body.courses[0].title).toBe(courseData.title);

      // 4. Update course
      const updateData = {
        title: 'Advanced JavaScript Fundamentals',
        description: 'Updated description'
      };

      const updateResponse = await request(app)
        .put(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.course.title).toBe(updateData.title);

      // 5. Delete course
      const deleteResponse = await request(app)
        .delete(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(deleteResponse.body.message).toBe('Course deleted successfully');
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 errors', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body.error).toBe('Route not found');
    });

    it('should handle validation errors', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: '123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });

    it('should handle authentication errors', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.error).toBe('Access token required');
    });

    it('should handle server errors gracefully', async () => {
      // Mock a server error by using invalid database connection
      const originalPrisma = prisma;
      jest.spyOn(prisma, 'user').mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123'
        })
        .expect(500);

      expect(response.body.error).toBe('Registration failed');

      // Restore original prisma
      jest.restoreAllMocks();
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limiting', async () => {
      const requests = Array(10).fill(null).map(() =>
        request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'wrongpassword'
          })
      );

      const responses = await Promise.all(requests);
      
      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('CORS Headers', () => {
    it('should include CORS headers', async () => {
      const response = await request(app)
        .options('/api/auth/login')
        .expect(204);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
      expect(response.headers['access-control-allow-methods']).toBeDefined();
    });
  });

  describe('Security Headers', () => {
    it('should include security headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBeDefined();
      expect(response.headers['x-xss-protection']).toBeDefined();
    });
  });
});
