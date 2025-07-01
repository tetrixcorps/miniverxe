import request from 'supertest';
import express from 'express';
import ticketsRouter from './tickets'; // The router we are testing

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
app.use('/tickets', ticketsRouter);

// Increase timeout for async operations if needed, though tests may not run
jest.setTimeout(30000);

describe('Tickets API - /tickets', () => {
  const mockedAuthGuard = authGuard as jest.Mock;
  const mockedRequireRole = requireRole as jest.Mock;

  const mockGet = jest.fn();
  const mockUpdate = jest.fn();
  const mockRunTransaction = jest.fn();
  const mockDoc = jest.fn((docId: string) => ({
    update: mockUpdate,
    // For transactions, the transaction object has get/update methods
    // We'll mock db.runTransaction to provide a mock transaction object
  }));

  const mockCollection = jest.fn(() => ({
    get: mockGet,
    doc: mockDoc,
    where: jest.fn(() => mockCollection()), // Chainable where
  }));

  beforeEach(() => {
    jest.clearAllMocks();

    (db.collection as jest.Mock).mockImplementation(mockCollection);
    (db.runTransaction as jest.Mock).mockImplementation(mockRunTransaction);


    // Default authGuard: successful authentication
    mockedAuthGuard.mockImplementation((req: any, res: any, next: any) => {
      // Default to a regular user/annotator for ticket tests
      req.user = { uid: 'test-annotator-uid', role: 'annotator' };
      next();
    });

    // Default requireRole mock (relevant for review endpoint)
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

  // --- GET /tickets ---
  describe('GET /', () => {
    it('should return a list of tickets assigned to the authenticated user', async () => {
      const mockTickets = [
        { id: 'ticket1', status: 'pending', data: 'task data 1' },
        { id: 'ticket2', status: 'in_progress', data: 'task data 2' },
      ];
      // Simulate the chained where().where().get()
      (db.collection('task_items').where as jest.Mock).mockReturnValue({
          where: jest.fn().mockReturnValue({
              get: mockGet.mockResolvedValueOnce({
                docs: mockTickets.map(t => ({ id: t.id, data: () => t })),
              })
          })
      });


      const response = await request(app).get('/tickets');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTickets);
      expect(mockedAuthGuard).toHaveBeenCalledTimes(1);
      expect(db.collection).toHaveBeenCalledWith('task_items');
      expect(db.collection('task_items').where).toHaveBeenCalledWith('assignedTo', '==', 'test-annotator-uid');
      // Check second where call on the result of the first
      const firstWhereResult = (db.collection('task_items').where as jest.Mock).mock.results[0].value;
      expect(firstWhereResult.where).toHaveBeenCalledWith('status', 'in', ['pending', 'in_progress']);
      expect(mockGet).toHaveBeenCalledTimes(1);
    });

    it('should return 401 if user is not authenticated', async () => {
      mockedAuthGuard.mockImplementationOnce((req: any, res: any, next: any) => {
        res.status(401).json({ error: 'Unauthorized' });
      });
      const response = await request(app).get('/tickets');
      expect(response.status).toBe(401);
    });
  });

  // --- POST /tickets/:id/claim ---
  describe('POST /:id/claim', () => {
    const ticketId = 'ticketToClaim';

    it('should allow a user to claim a pending ticket', async () => {
      mockRunTransaction.mockImplementation(async (updateFunction: any) => {
        const mockTransaction = {
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => ({ status: 'pending' })
          }),
          update: jest.fn(),
        };
        await updateFunction(mockTransaction);
        return { ok: true }; // Simulate successful transaction
      });

      const response = await request(app).post(`/tickets/${ticketId}/claim`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ok: true });
      expect(mockedAuthGuard).toHaveBeenCalledTimes(1);
      expect(db.runTransaction).toHaveBeenCalledTimes(1);

      // Check transaction logic (this is a bit more involved to assert)
      const transactionCallback = mockRunTransaction.mock.calls[0][0];
      const mockT = { get: jest.fn().mockResolvedValue({exists:true, data: () => ({status: 'pending'})}), update: jest.fn() };
      await transactionCallback(mockT);
      expect(mockT.get).toHaveBeenCalledWith(db.collection('task_items').doc(ticketId));
      expect(mockT.update).toHaveBeenCalledWith(db.collection('task_items').doc(ticketId), { assignedTo: 'test-annotator-uid', status: 'in_progress' });
    });

    it('should return 400 if ticket is not found or not pending', async () => {
      mockRunTransaction.mockImplementation(async (updateFunction: any) => {
         await updateFunction({
            get: jest.fn().mockResolvedValue({
                exists: false, // Simulate not found
                data: () => ({})
            }),
            update: jest.fn()
        });
      });
      // This relies on the transaction throwing an error, which is caught by the route
      const response = await request(app).post(`/tickets/${ticketId}/claim`);
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('already claimed or not found');
    });
  });

  // --- POST /tickets/:id/submit ---
  describe('POST /:id/submit', () => {
    const ticketId = 'ticketToSubmit';
    const annotationData = { result: 'some annotation' };

    it('should allow a user to submit an annotation for their in_progress ticket', async () => {
      mockRunTransaction.mockImplementation(async (updateFunction: any) => {
        await updateFunction({
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => ({ status: 'in_progress', assignedTo: 'test-annotator-uid' })
          }),
          update: jest.fn(),
        });
      });

      const response = await request(app)
        .post(`/tickets/${ticketId}/submit`)
        .send({ ann: annotationData });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ok: true });
      expect(db.runTransaction).toHaveBeenCalledTimes(1);

      const transactionCallback = mockRunTransaction.mock.calls[0][0];
      const mockT = { get: jest.fn().mockResolvedValue({exists:true, data: () => ({ status: 'in_progress', assignedTo: 'test-annotator-uid' })}), update: jest.fn() };
      await transactionCallback(mockT);
      expect(mockT.update).toHaveBeenCalledWith(db.collection('task_items').doc(ticketId), {
        status: 'submitted',
        annotation: annotationData,
        submittedAt: expect.any(Date),
      });
    });

    it('should return 400 if ticket is not assigned to user or not in_progress', async () => {
       mockRunTransaction.mockImplementation(async (updateFunction: any) => {
         await updateFunction({
            get: jest.fn().mockResolvedValue({
                exists: true,
                data: () => ({ status: 'pending', assignedTo: 'another-user-uid' }) // Not in_progress or wrong user
            }),
            update: jest.fn()
        });
      });
      const response = await request(app)
        .post(`/tickets/${ticketId}/submit`)
        .send({ ann: annotationData });
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('not allowed');
    });
  });

  // --- PATCH /tickets/:id/review ---
  describe('PATCH /:id/review', () => {
    const ticketId = 'ticketToReview';

    beforeEach(() => {
      // For review endpoint, default user should be admin/reviewer
      mockedAuthGuard.mockImplementation((req: any, res: any, next: any) => {
        req.user = { uid: 'test-reviewer-uid', role: 'reviewer' };
        next();
      });
    });

    it('should allow an admin/reviewer to approve a ticket', async () => {
      mockUpdate.mockResolvedValueOnce(undefined); // doc().update()

      const response = await request(app)
        .patch(`/tickets/${ticketId}/review`)
        .send({ status: 'approved', reviewComment: 'Good job!' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ok: true });
      expect(mockedRequireRole).toHaveBeenCalledWith('admin', 'reviewer');
      expect(db.collection).toHaveBeenCalledWith('task_items');
      expect(mockDoc).toHaveBeenCalledWith(ticketId);
      expect(mockUpdate).toHaveBeenCalledWith({
        status: 'approved',
        reviewComment: 'Good job!',
        reviewedAt: expect.any(Date),
      });
    });

    it('should return 403 if user is not an admin/reviewer', async () => {
      mockedAuthGuard.mockImplementationOnce((req: any, res: any, next: any) => {
        req.user = { uid: 'test-annotator-uid', role: 'annotator' }; // Not a reviewer
        next();
      });
      const response = await request(app)
        .patch(`/tickets/${ticketId}/review`)
        .send({ status: 'approved' });
      expect(response.status).toBe(403);
    });

    it('should return 400 for invalid status', async () => {
      const response = await request(app)
        .patch(`/tickets/${ticketId}/review`)
        .send({ status: 'invalid_status' });
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid status');
    });
  });
});
