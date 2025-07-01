import request from 'supertest';
import express from 'express';
import usersRouter from './users'; // The router we are testing

// --- Mocks ---
jest.mock('../middleware/auth');
jest.mock('../middleware/roles');
jest.mock('../firebase');

import { authGuard } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { db } from '../firebase';

// --- Test Setup ---
const app = express();
app.use(express.json());
app.use('/users', usersRouter);

jest.setTimeout(30000);

describe('Users API - /users', () => {
  const mockedAuthGuard = authGuard as jest.Mock;
  const mockedRequireRole = requireRole as jest.Mock;

  const mockUserListGet = jest.fn(); // For GET /
  const mockUserDocGet = jest.fn();   // For GET /me

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock for db.collection('users').get()
    (db.collection as jest.Mock).mockImplementation((collectionName: string) => {
      if (collectionName === 'users') {
        return {
          get: mockUserListGet,
          doc: jest.fn((docId: string) => ({
            get: mockUserDocGet,
          })),
        };
      }
      return { // Default fallback for other collections if any
        get: jest.fn(),
        doc: jest.fn(() => ({ get: jest.fn() })),
      };
    });

    // Default authGuard: successful authentication with a regular user
    mockedAuthGuard.mockImplementation((req: any, res: any, next: any) => {
      req.user = { uid: 'test-user-uid', role: 'user' };
      next();
    });

    // Default requireRole mock (relevant for GET /)
    mockedRequireRole.mockImplementation((...roles: string[]) => {
      return (req: any, res: any, next: any) => {
        if (req.user && roles.includes(req.user.role)) {
          next();
        } else {
          res.status(403).json({ error: 'Forbidden by mock role - role mismatch' });
        }
      };
    });
  });

  // --- GET /users ---
  describe('GET /', () => {
    it('should return a list of users for an admin', async () => {
      // Override authGuard for admin user
      mockedAuthGuard.mockImplementationOnce((req: any, res: any, next: any) => {
        req.user = { uid: 'test-admin-uid', role: 'admin' };
        next();
      });

      const mockUsers = [
        { id: 'user1', name: 'User One', role: 'admin' },
        { id: 'user2', name: 'User Two', role: 'user' },
      ];
      mockUserListGet.mockResolvedValueOnce({
        docs: mockUsers.map(u => ({ id: u.id, data: () => u })),
      });

      const response = await request(app).get('/users');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUsers);
      expect(mockedAuthGuard).toHaveBeenCalledTimes(1);
      expect(mockedRequireRole).toHaveBeenCalledWith('admin');
      expect(db.collection).toHaveBeenCalledWith('users');
      expect(mockUserListGet).toHaveBeenCalledTimes(1);
    });

    it('should return 403 if user is not an admin', async () => {
      // Default authGuard provides a 'user', requireRole for 'admin' will deny
      const response = await request(app).get('/users');
      expect(response.status).toBe(403);
    });

    it('should return 401 if user is not authenticated', async () => {
      mockedAuthGuard.mockImplementationOnce((req: any, res: any, next: any) => {
        res.status(401).json({ error: 'Unauthorized' });
      });
      const response = await request(app).get('/users');
      expect(response.status).toBe(401);
    });
  });

  // --- GET /users/me ---
  describe('GET /me', () => {
    it('should return the current authenticated user profile', async () => {
      const currentUser = { uid: 'test-user-uid', role: 'user', email: 'test@example.com' };
      // authGuard mock already sets req.user = { uid: 'test-user-uid', role: 'user' }

      mockUserDocGet.mockResolvedValueOnce({
        exists: true,
        id: currentUser.uid,
        data: () => ({ role: currentUser.role, email: currentUser.email }),
      });

      const response = await request(app).get('/users/me');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: currentUser.uid,
        role: currentUser.role,
        email: currentUser.email
      });
      expect(mockedAuthGuard).toHaveBeenCalledTimes(1);
      expect(db.collection).toHaveBeenCalledWith('users');
      // Check that usersCollection.doc(currentUser.uid).get() was called
      const usersCollectionMock = (db.collection as jest.Mock).mock.results[0].value;
      expect(usersCollectionMock.doc).toHaveBeenCalledWith(currentUser.uid);
      expect(mockUserDocGet).toHaveBeenCalledTimes(1);
    });

    it('should return 404 if current user profile not found in DB', async () => {
      mockUserDocGet.mockResolvedValueOnce({ exists: false });
      const response = await request(app).get('/users/me');
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User not found');
    });

    it('should return 401 if user is not authenticated for /me', async () => {
      mockedAuthGuard.mockImplementationOnce((req: any, res: any, next: any) => {
        res.status(401).json({ error: 'Unauthorized' });
      });
      const response = await request(app).get('/users/me');
      expect(response.status).toBe(401);
    });
  });
});
