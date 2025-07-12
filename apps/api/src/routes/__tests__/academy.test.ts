import request from 'supertest';
import app from '../../index'; // Adjust if your Express app entry point is elsewhere
import { getTestToken } from './testUtils';

let studentToken: string;
let reviewerToken: string;
const assignmentId = 'test-assignment-1';

beforeAll(async () => {
  studentToken = await getTestToken('student-uid', { roles: ['CodingStudent'] });
  reviewerToken = await getTestToken('reviewer-uid', { roles: ['AcademyReviewer'] });
});

describe('Academy Endpoints', () => {
  // Helper to set auth header
  const auth = (t: string) => ({ Authorization: `Bearer ${t}` });

  it('rejects invalid assignment submission payload', async () => {
    const res = await request(app)
      .post('/api/academy/assignments')
      .set(auth(studentToken))
      .send({}); // Missing required fields
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body).toHaveProperty('details');
  });

  it('submits a valid assignment', async () => {
    const res = await request(app)
      .post('/api/academy/assignments')
      .set(auth(studentToken))
      .send({
        fileUrl: 'https://example.com/file.zip',
        comment: 'My work',
        assignmentId,
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('ok', true);
    expect(res.body).toHaveProperty('assignmentId', assignmentId);
  });

  it('lists assignments for the student', async () => {
    const res = await request(app)
      .get('/api/academy/assignments')
      .set(auth(studentToken));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((a: any) => a.id === assignmentId)).toBe(true);
  });

  it('lists assignments needing review (reviewer only)', async () => {
    const res = await request(app)
      .get('/api/academy/review-queue')
      .set(auth(reviewerToken));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((a: any) => a.id === assignmentId)).toBe(true);
  });

  it('rejects invalid review payload', async () => {
    const res = await request(app)
      .patch(`/api/academy/review/${assignmentId}`)
      .set(auth(reviewerToken))
      .send({}); // Missing required fields
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body).toHaveProperty('details');
  });

  it('reviews an assignment', async () => {
    const res = await request(app)
      .patch(`/api/academy/review/${assignmentId}`)
      .set(auth(reviewerToken))
      .send({
        status: 'approved',
        reviewComment: 'Looks good!',
      });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
    expect(res.body).toHaveProperty('id', assignmentId);
    expect(res.body).toHaveProperty('status', 'approved');
  });

  it('lists CI results for the user', async () => {
    const res = await request(app)
      .get('/api/academy/ci')
      .set(auth(studentToken));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('Jest is running', () => {
    expect(true).toBe(true);
  });
}); 