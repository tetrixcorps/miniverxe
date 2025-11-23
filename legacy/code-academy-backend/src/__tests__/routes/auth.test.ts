import request from 'supertest';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import authRoutes from '../../routes/auth';

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

const prisma = new PrismaClient();

describe('Authentication Routes', () => {
  beforeEach(async () => {
    // Clean up test data
    await prisma.$executeRaw`TRUNCATE TABLE "sessions", "user_profiles", "users" RESTART IDENTITY CASCADE;`;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        experienceLevel: 'BEGINNER',
        learningGoals: ['JavaScript', 'React']
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('tokens');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.username).toBe(userData.username);
      expect(response.body.tokens).toHaveProperty('accessToken');
      expect(response.body.tokens).toHaveProperty('refreshToken');
    });

    it('should return 400 for duplicate email', async () => {
      // Create existing user
      await prisma.user.create({
        data: {
          email: 'existing@example.com',
          username: 'existing',
          passwordHash: 'hashedpassword',
        }
      });

      const userData = {
        email: 'existing@example.com',
        username: 'newuser',
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe('User already exists');
      expect(response.body.message).toBe('Email already registered');
    });

    it('should return 400 for duplicate username', async () => {
      // Create existing user
      await prisma.user.create({
        data: {
          email: 'existing@example.com',
          username: 'existing',
          passwordHash: 'hashedpassword',
        }
      });

      const userData = {
        email: 'new@example.com',
        username: 'existing',
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe('User already exists');
      expect(response.body.message).toBe('Username already taken');
    });

    it('should return 400 for invalid email format', async () => {
      const userData = {
        email: 'invalid-email',
        username: 'testuser',
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    it('should return 400 for weak password', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: '123'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Create test user
      const passwordHash = await bcrypt.hash('password123', 12);
      await prisma.user.create({
        data: {
          email: 'test@example.com',
          username: 'testuser',
          passwordHash,
          isActive: true,
        }
      });
    });

    it('should login user successfully and return 2FA token', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Login successful, 2FA required');
      expect(response.body).toHaveProperty('twoFAToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(loginData.email);
    });

    it('should return 401 for invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should return 401 for invalid password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should return 401 for inactive user', async () => {
      // Create inactive user
      const passwordHash = await bcrypt.hash('password123', 12);
      await prisma.user.create({
        data: {
          email: 'inactive@example.com',
          username: 'inactive',
          passwordHash,
          isActive: false,
        }
      });

      const loginData = {
        email: 'inactive@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.error).toBe('Account disabled');
    });
  });

  describe('POST /auth/verify-2fa', () => {
    it('should verify 2FA successfully', async () => {
      // Create test user
      const passwordHash = await bcrypt.hash('password123', 12);
      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          username: 'testuser',
          passwordHash,
          isActive: true,
        }
      });

      // Create 2FA token
      const twoFAToken = jwt.sign(
        { userId: user.id, type: '2fa' },
        process.env.JWT_SECRET!,
        { expiresIn: '5m' }
      );

      const verifyData = {
        token: twoFAToken,
        code: '123456'
      };

      const response = await request(app)
        .post('/auth/verify-2fa')
        .send(verifyData)
        .expect(200);

      expect(response.body).toHaveProperty('message', '2FA verification successful');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('tokens');
    });

    it('should return 400 for invalid 2FA token', async () => {
      const verifyData = {
        token: 'invalid-token',
        code: '123456'
      };

      const response = await request(app)
        .post('/auth/verify-2fa')
        .send(verifyData)
        .expect(400);

      expect(response.body.error).toBe('Invalid token');
    });

    it('should return 400 for invalid 2FA code', async () => {
      // Create test user
      const passwordHash = await bcrypt.hash('password123', 12);
      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          username: 'testuser',
          passwordHash,
          isActive: true,
        }
      });

      // Create 2FA token
      const twoFAToken = jwt.sign(
        { userId: user.id, type: '2fa' },
        process.env.JWT_SECRET!,
        { expiresIn: '5m' }
      );

      const verifyData = {
        token: twoFAToken,
        code: '000000'
      };

      const response = await request(app)
        .post('/auth/verify-2fa')
        .send(verifyData)
        .expect(400);

      expect(response.body.error).toBe('2FA verification failed');
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh tokens successfully', async () => {
      // Create test user and session
      const passwordHash = await bcrypt.hash('password123', 12);
      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          username: 'testuser',
          passwordHash,
          isActive: true,
        }
      });

      const refreshToken = jwt.sign(
        { userId: user.id, type: 'refresh' },
        process.env.REFRESH_TOKEN_SECRET!,
        { expiresIn: '30d' }
      );

      await prisma.session.create({
        data: {
          userId: user.id,
          token: 'access-token',
          refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          isActive: true,
        }
      });

      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Tokens refreshed successfully');
      expect(response.body).toHaveProperty('tokens');
      expect(response.body.tokens).toHaveProperty('accessToken');
      expect(response.body.tokens).toHaveProperty('refreshToken');
    });

    it('should return 401 for invalid refresh token', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body.error).toBe('Invalid session');
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout successfully', async () => {
      // Create test user and session
      const passwordHash = await bcrypt.hash('password123', 12);
      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          username: 'testuser',
          passwordHash,
          isActive: true,
        }
      });

      const accessToken = jwt.sign(
        { userId: user.id, type: 'access' },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      await prisma.session.create({
        data: {
          userId: user.id,
          token: accessToken,
          refreshToken: 'refresh-token',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          isActive: true,
        }
      });

      const response = await request(app)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.message).toBe('Logout successful');
    });

    it('should return 401 for missing token', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .expect(401);

      expect(response.body.error).toBe('Unauthorized');
    });
  });

  describe('GET /auth/me', () => {
    it('should return current user', async () => {
      // Create test user and session
      const passwordHash = await bcrypt.hash('password123', 12);
      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          username: 'testuser',
          passwordHash,
          firstName: 'Test',
          lastName: 'User',
          isActive: true,
        }
      });

      const accessToken = jwt.sign(
        { userId: user.id, type: 'access' },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      await prisma.session.create({
        data: {
          userId: user.id,
          token: accessToken,
          refreshToken: 'refresh-token',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          isActive: true,
        }
      });

      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(user.email);
      expect(response.body.user.username).toBe(user.username);
    });

    it('should return 401 for invalid token', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.error).toBe('Invalid token');
    });
  });
});
