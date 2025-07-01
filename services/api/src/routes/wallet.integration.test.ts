import request from 'supertest';
import express from 'express';
import walletRouter from './wallet'; // The router we are testing
import axios from 'axios'; // To mock axios.post

// --- Mocks ---
jest.mock('../middleware/auth');
jest.mock('../middleware/roles');
jest.mock('../firebase');
jest.mock('axios'); // Mock axios

import { authGuard } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { db } from '../firebase';

const mockedAxiosPost = axios.post as jest.Mock;

// --- Test Setup ---
const app = express();
app.use(express.json());
app.use('/wallet', walletRouter);

jest.setTimeout(30000);

describe('Wallet API - /wallet', () => {
  const mockedAuthGuard = authGuard as jest.Mock;
  const mockedRequireRole = requireRole as jest.Mock;

  const mockDbUpdate = jest.fn();
  const mockDbAdd = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (db.collection as jest.Mock).mockImplementation((collectionName: string) => {
      if (collectionName === 'users') {
        return {
          doc: jest.fn(() => ({
            update: mockDbUpdate,
          })),
        };
      }
      if (collectionName === 'payments') {
        return {
          add: mockDbAdd,
        };
      }
      return {}; // Fallback
    });

    // Default authGuard: successful authentication
    mockedAuthGuard.mockImplementation((req: any, res: any, next: any) => {
      req.user = { uid: 'test-user-uid', role: 'user' };
      next();
    });

    // Default requireRole mock (for payout endpoint)
    mockedRequireRole.mockImplementation((...roles: string[]) => {
      return (req: any, res: any, next: any) => {
        if (req.user && roles.includes(req.user.role)) {
          next();
        } else {
          res.status(403).json({ error: 'Forbidden by mock role' });
        }
      };
    });
  });

  // --- POST /wallet/create ---
  describe('POST /create', () => {
    it('should create a wallet and update user profile', async () => {
      const walletServiceResponse = { walletId: 'new-wallet-123' };
      mockedAxiosPost.mockResolvedValueOnce({ data: walletServiceResponse });
      mockDbUpdate.mockResolvedValueOnce(undefined); // Firestore update

      const response = await request(app).post('/wallet/create').send();

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ walletId: 'new-wallet-123' });
      expect(mockedAuthGuard).toHaveBeenCalledTimes(1);
      expect(mockedAxiosPost).toHaveBeenCalledWith('http://wallet-svc:4100/wallet/create', { uid: 'test-user-uid' });
      expect(db.collection).toHaveBeenCalledWith('users');
      const usersCollectionMock = (db.collection as jest.Mock).mock.results[0].value;
      expect(usersCollectionMock.doc).toHaveBeenCalledWith('test-user-uid');
      expect(mockDbUpdate).toHaveBeenCalledWith({ walletId: 'new-wallet-123' });
    });

    it('should return 500 if wallet service call fails', async () => {
      mockedAxiosPost.mockRejectedValueOnce(new Error('Wallet service unavailable'));
      const response = await request(app).post('/wallet/create').send();
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Wallet creation failed');
    });

     it('should return 500 if db update fails after successful wallet service call', async () => {
      const walletServiceResponse = { walletId: 'new-wallet-123' };
      mockedAxiosPost.mockResolvedValueOnce({ data: walletServiceResponse });
      mockDbUpdate.mockRejectedValueOnce(new Error('DB update failed')); // Firestore update fails

      const response = await request(app).post('/wallet/create').send();

      // The route currently doesn't distinguish this error, it will also be 500
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Wallet creation failed');
      // Ideally, the error message or code might be more specific in a real app
    });


    it('should return 401 if user is not authenticated', async () => {
      mockedAuthGuard.mockImplementationOnce((req: any, res: any, next: any) => {
        res.status(401).json({ error: 'Unauthorized' });
      });
      const response = await request(app).post('/wallet/create').send();
      expect(response.status).toBe(401);
    });
  });

  // --- POST /wallet/payout ---
  describe('POST /payout', () => {
    const payoutPayload = { uid: 'annotator-to-payout-uid', amountUSD: 100 };

    beforeEach(() => {
      // Payout requires admin role
      mockedAuthGuard.mockImplementation((req: any, res: any, next: any) => {
        req.user = { uid: 'test-admin-uid', role: 'admin' };
        next();
      });
    });

    it('should process payout for an admin and record payment', async () => {
      const payoutServiceResponse = { txHash: 'tx-hash-456' };
      mockedAxiosPost.mockResolvedValueOnce({ data: payoutServiceResponse });
      mockDbAdd.mockResolvedValueOnce({ id: 'payment-record-id' }); // Firestore add

      const response = await request(app)
        .post('/wallet/payout')
        .send(payoutPayload);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ txHash: 'tx-hash-456' });
      expect(mockedAuthGuard).toHaveBeenCalledTimes(1);
      expect(mockedRequireRole).toHaveBeenCalledWith('admin');
      expect(mockedAxiosPost).toHaveBeenCalledWith('http://wallet-svc:4100/wallet/payout', payoutPayload);
      expect(db.collection).toHaveBeenCalledWith('payments');
      expect(mockDbAdd).toHaveBeenCalledWith(expect.objectContaining({
        uid: payoutPayload.uid,
        amountUSD: payoutPayload.amountUSD,
        txHash: 'tx-hash-456',
        createdAt: expect.any(Date),
      }));
    });

    it('should return 403 if requester is not an admin', async () => {
      // Set user to non-admin
      mockedAuthGuard.mockImplementationOnce((req: any, res: any, next: any) => {
        req.user = { uid: 'test-user-uid', role: 'user' };
        next();
      });
      const response = await request(app).post('/wallet/payout').send(payoutPayload);
      expect(response.status).toBe(403);
    });

    it('should return 500 if payout service call fails', async () => {
      mockedAxiosPost.mockRejectedValueOnce(new Error('Payout service error'));
      const response = await request(app).post('/wallet/payout').send(payoutPayload);
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Payout failed');
    });
  });
});
