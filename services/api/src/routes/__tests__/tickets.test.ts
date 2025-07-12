import request from 'supertest';
import { app } from '../../index'; // Adjust as needed
import { getTestToken } from './testUtils';

let annotatorToken: string;
let reviewerToken: string;
const taskId = 'test-task-1';

beforeAll(async () => {
  annotatorToken = await getTestToken('annotator-uid', { roles: ['Labeler'] });
  reviewerToken = await getTestToken('reviewer-uid', { roles: ['Reviewer'] });
});

describe('Tickets Endpoints', () => {
  const auth = (t: string) => ({ Authorization: `Bearer ${t}` });

  it('rejects invalid annotation payload', async () => {
    const res = await request(app)
      .post(`/api/tickets/${taskId}/submit`)
      .set(auth(annotatorToken))
      .send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body).toHaveProperty('details');
  });

  it('submits a valid annotation', async () => {
    const res = await request(app)
      .post(`/api/tickets/${taskId}/submit`)
      .set(auth(annotatorToken))
      .send({ labels: ['cat'], notes: 'Test annotation' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
  });

  it('rejects review from non-reviewer', async () => {
    const res = await request(app)
      .patch(`/api/tickets/${taskId}/review`)
      .set(auth(annotatorToken))
      .send({ status: 'approved' });
    expect(res.status).toBe(403);
  });

  it('reviews an annotation as reviewer', async () => {
    const res = await request(app)
      .patch(`/api/tickets/${taskId}/review`)
      .set(auth(reviewerToken))
      .send({ status: 'approved', reviewComment: 'Looks good' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
  });
}); 