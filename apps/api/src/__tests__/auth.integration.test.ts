import request from 'supertest';
import app from '../src/index.js';
import * as Prisma from '@prisma/client';

jest.mock('firebase-admin', () => {
  const actual = jest.requireActual('firebase-admin');
  return {
    ...actual,
    auth: () => ({
      createUser: jest.fn(async ({ email, password, displayName }) => ({
        uid: 'test-uid',
        email,
        displayName,
      })),
      createCustomToken: jest.fn(async (uid, claims) => `custom-token-for-${uid}`),
      verifyIdToken: jest.fn(async (token) => {
        if (token === 'valid-token') {
          return { uid: 'test-uid', email: 'test@example.com', userGroup: 'data-annotator', roles: ['User'] };
        }
        throw new Error('Invalid token');
      }),
      generatePasswordResetLink: jest.fn(async (email) => `https://reset-link/${email}`),
      generateEmailVerificationLink: jest.fn(async (email) => `https://verify-link/${email}`),
      updateUser: jest.fn(async (uid, data) => ({ uid, ...data })),
    })
  };
});

const prisma = new Prisma.PrismaClient();

describe('Auth Integration', () => {
  beforeAll(async () => {
    // Optionally: run migrations, seed DB, etc.
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { contains: 'test' } } });
    await prisma.$disconnect();
  });

  describe('POST /api/auth/signup', () => {
    it('should create a new user and return a custom token', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test User',
          email: 'testuser@example.com',
          password: 'password123',
          userGroup: 'data-annotator'
        });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('customToken');
      expect(res.body.user.email).toBe('testuser@example.com');
    });

    it('should not allow duplicate email', async () => {
      await prisma.user.create({
        data: {
          id: 'test-uid-dup',
          name: 'Dup User',
          email: 'dup@example.com',
          passwordHash: 'firebase-auth',
          isActive: true
        }
      });
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Dup User',
          email: 'dup@example.com',
          password: 'password123',
        });
      expect(res.status).toBe(409);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/signin', () => {
    it('should sign in an existing user and return a custom token', async () => {
      await prisma.user.create({
        data: {
          id: 'test-uid-signin',
          name: 'Signin User',
          email: 'signin@example.com',
          passwordHash: 'firebase-auth',
          isActive: true
        }
      });
      const res = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'signin@example.com',
          password: 'password123',
        });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('customToken');
      expect(res.body.user.email).toBe('signin@example.com');
    });

    it('should not sign in with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        });
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });
  });
}); 