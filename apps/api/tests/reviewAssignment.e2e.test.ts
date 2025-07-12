// @ts-nocheck
const request = require('supertest');
const app = require('../src/index');
const { PrismaClient } = require('@prisma/client');

// Helper to create a test user, task, and label
async function setupTestData() {
  const owner = await prisma.user.create({ data: { email: 'owner@example.com', passwordHash: 'x' } });
  const reviewer = await prisma.user.create({ data: { email: 'reviewer@example.com', passwordHash: 'x' } });
  const project = await prisma.project.create({ data: { name: 'Test Project', organizationId: 'org1', createdById: owner.id } });
  const dataset = await prisma.dataset.create({ data: { name: 'Test Dataset', projectId: project.id, storageUrl: 's3://test' } });
  const task = await prisma.task.create({ data: { projectId: project.id, datasetId: dataset.id, inputData: {}, status: 'InProgress' } });
  const label = await prisma.label.create({ data: { taskId: task.id, userId: owner.id, data: {}, status: 'Submitted' } });
  return { owner, reviewer, project, dataset, task, label };
}

const prisma = new PrismaClient();

describe('Reviewer Assignment & Review Queue E2E', () => {
  let owner, reviewer, task, label;

  beforeAll(async () => {
    await prisma.reviewAssignment.deleteMany();
    await prisma.review.deleteMany();
    await prisma.label.deleteMany();
    await prisma.task.deleteMany();
    await prisma.dataset.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();
    ({ owner, reviewer, task, label } = await setupTestData());
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('assigns a reviewer to a task', async () => {
    const res = await request(app)
      .post('/api/review-assignments')
      .send({ taskId: task.id, reviewerIds: [reviewer.id] })
      .expect(201);
    expect(res.body.assignments).toHaveLength(1);
    expect(res.body.assignments[0].reviewerId).toBe(reviewer.id);
  });

  it('lists review assignments for a reviewer', async () => {
    const res = await request(app)
      .get(`/api/review-assignments?reviewerId=${reviewer.id}`)
      .expect(200);
    expect(res.body.assignments.length).toBeGreaterThan(0);
    expect(res.body.assignments[0].reviewerId).toBe(reviewer.id);
  });

  it('shows the review queue for the reviewer', async () => {
    // Mock auth middleware to set req.user.id = reviewer.id
    // You may need to mock or set a test token/session
    const agent = request.agent(app);
    // ...mock login or set user context...
    const res = await agent
      .get('/api/review-queue')
      .set('Authorization', `Bearer test-token-for-reviewer`)
      .expect(200);
    expect(res.body.assignments.some(a => a.reviewerId === reviewer.id)).toBe(true);
  });

  it('submits a review decision', async () => {
    // Mock auth as reviewer
    const agent = request.agent(app);
    // ...mock login or set user context...
    const res = await agent
      .post('/api/reviews')
      .send({ taskId: task.id, decision: 'approved', feedback: 'Looks good' })
      .set('Authorization', `Bearer test-token-for-reviewer`)
      .expect(201);
    expect(res.body.review.status).toBe('Approved');
  });
}); 