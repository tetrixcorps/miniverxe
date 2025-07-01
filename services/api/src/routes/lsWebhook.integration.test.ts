import request from 'supertest';
import express from 'express';
import lsWebhookRouter from './lsWebhook'; // The router we are testing

// --- Mocks ---
jest.mock('../firebase'); // Mock Firebase

import { db } from '../firebase';

// --- Test Setup ---
const app = express();
app.use(express.json());
// Webhooks are often at a specific path, e.g., /ls/webhook as per index.ts
// For this test, we mount it at the root to match how it might be tested directly
// However, in index.ts it's app.use('/ls/webhook', lsWebhookRouter);
// So, requests should be to /ls/webhook in a full app context.
// For isolated router testing, we can mount it at root of test app.
app.use('/', lsWebhookRouter);

jest.setTimeout(30000);

describe('Lemon Squeezy Webhook API - /ls/webhook', () => {
  const mockDbUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (db.collection as jest.Mock).mockImplementation((collectionName: string) => {
      if (collectionName === 'task_items') {
        return {
          doc: jest.fn(() => ({
            update: mockDbUpdate,
          })),
        };
      }
      return {}; // Fallback
    });
  });

  // --- POST / ---
  describe('POST /', () => {
    const validWebhookPayload = {
      task: { id: 'task-123' },
      annotation: { result: 'some data' },
      status: 'completed', // Optional status
    };

    const minimalWebhookPayload = {
        task: { id: 'task-456' },
        annotation: { result: 'other data' },
    };


    it('should process a valid webhook event and update task_item', async () => {
      mockDbUpdate.mockResolvedValueOnce(undefined); // Firestore update success

      const response = await request(app)
        .post('/') // Assuming mounted at root for this test file
        .send(validWebhookPayload);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ok: true });
      expect(db.collection).toHaveBeenCalledWith('task_items');
      const taskItemsCollectionMock = (db.collection as jest.Mock).mock.results[0].value;
      expect(taskItemsCollectionMock.doc).toHaveBeenCalledWith('task-123');
      expect(mockDbUpdate).toHaveBeenCalledWith({
        annotation: validWebhookPayload.annotation,
        status: validWebhookPayload.status,
        updatedAt: expect.any(Date),
      });
    });

    it('should process a valid webhook event with default status if not provided', async () => {
      mockDbUpdate.mockResolvedValueOnce(undefined);

      const response = await request(app)
        .post('/')
        .send(minimalWebhookPayload);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ok: true });
      expect(db.collection).toHaveBeenCalledWith('task_items');
      const taskItemsCollectionMock = (db.collection as jest.Mock).mock.results[0].value;
      expect(taskItemsCollectionMock.doc).toHaveBeenCalledWith('task-456');
      expect(mockDbUpdate).toHaveBeenCalledWith({
        annotation: minimalWebhookPayload.annotation,
        status: 'submitted', // Default status
        updatedAt: expect.any(Date),
      });
    });

    it('should return 400 for invalid webhook payload (missing task)', async () => {
      const invalidPayload = { annotation: { result: 'data' } };
      const response = await request(app)
        .post('/')
        .send(invalidPayload);
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid event payload');
    });

    it('should return 400 for invalid webhook payload (missing annotation)', async () => {
      const invalidPayload = { task: { id: 'task-789' } };
      const response = await request(app)
        .post('/')
        .send(invalidPayload);
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid event payload');
    });

    it('should return 500 if Firestore update fails', async () => {
      mockDbUpdate.mockRejectedValueOnce(new Error('DB update failed'));
      const response = await request(app)
        .post('/')
        .send(validWebhookPayload);
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Webhook handling failed');
    });
  });
});
