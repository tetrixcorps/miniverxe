import request from 'supertest';
import express from 'express';
import projectsRouter from './projects'; // The router we are testing

// --- Mocks ---
jest.mock('../middleware/auth');
jest.mock('../middleware/roles');
jest.mock('../firebase');

// Import the mocked versions
import { authGuard } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { db } from '../firebase';

// --- Test Setup ---
const app = express();
app.use(express.json());
app.use('/projects', projectsRouter); // Mount the router under test

// Increase timeout for async operations if needed
jest.setTimeout(30000); // 30 seconds

describe('Projects API - /projects', () => {
  // Typedef for mocked functions
  const mockedAuthGuard = authGuard as jest.Mock;
  const mockedRequireRole = requireRole as jest.Mock;

  const mockGet = jest.fn();
  const mockAdd = jest.fn();
  const mockUpdate = jest.fn();
  const mockDoc = jest.fn(() => ({ update: mockUpdate }));

  beforeEach(() => {
    jest.clearAllMocks();

    // Configure the db mock
    (db.collection as jest.Mock).mockReturnValue({
      get: mockGet,
      add: mockAdd,
      doc: mockDoc,
    });
    // Ensure other db properties like 'auth' are also mocked if they exist on 'db' and are used by routes
    // For this test, we assume 'db' is primarily 'collection'

    mockedAuthGuard.mockImplementation((req: any, res: any, next: any) => {
      req.user = { uid: 'test-admin-uid', role: 'admin' };
      next();
    });

    mockedRequireRole.mockImplementation((...roles: string[]) => {
      return (req: any, res: any, next: any) => {
        if (req.user && roles.includes(req.user.role)) {
          next();
        } else if (!req.user) {
          // This situation implies authGuard should have already sent a 401.
          // To avoid double response, this mock shouldn't send a response here.
          // For robustness, tests for authGuard failing should ensure it sends 401.
          // If authGuard calls next() without a user (which it shouldn't), then this is a fallback.
          res.status(401).json({ error: 'Access denied by mock role - no user' });
        }
         else {
          res.status(403).json({ error: 'Forbidden by mock role - role mismatch' });
        }
      };
    });
  });

  // --- GET /projects ---
  describe('GET /', () => {
    it('should return a list of projects for an authorized user (admin)', async () => {
      const mockProjectsData = [
        { id: 'proj1', name: 'Project 1', status: 'draft' },
        { id: 'proj2', name: 'Project 2', status: 'active' },
      ];
      mockGet.mockResolvedValueOnce({
        docs: mockProjectsData.map(p => ({ id: p.id, data: () => ({ name: p.name, status: p.status }) })),
      });

      const response = await request(app).get('/projects');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProjectsData);
      expect(mockedAuthGuard).toHaveBeenCalledTimes(1);
      expect(mockedRequireRole).toHaveBeenCalledWith('admin', 'project_manager');
      expect(db.collection).toHaveBeenCalledWith('projects');
      expect(mockGet).toHaveBeenCalledTimes(1);
    });

    it('should return 403 if user is authenticated but not an admin or project_manager', async () => {
      mockedAuthGuard.mockImplementationOnce((req: any, res: any, next: any) => {
        req.user = { uid: 'test-user-uid', role: 'user' };
        next();
      });

      const response = await request(app).get('/projects');
      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Forbidden by mock role - role mismatch');
    });

    it('should return 401 if user is not authenticated (authGuard fails)', async () => {
      mockedAuthGuard.mockImplementationOnce((req: any, res: any, next: any) => {
        res.status(401).json({ error: 'Unauthorized by mock authGuard' });
        // No next() call
      });

      // requireRole should ideally not be called or its effect should be pre-empted
      mockedRequireRole.mockImplementationOnce((...roles: string[]) => (req: any, res: any, nextInner: any) => {
         // This middleware should not interfere if authGuard already responded.
         nextInner();
      });


      const response = await request(app).get('/projects');
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized by mock authGuard');
      // Check that requireRole was not effective in sending a different response
      expect(mockedRequireRole).toHaveBeenCalledTimes(1); // It's still called by Express
    });
  });

  // --- POST /projects ---
  describe('POST /', () => {
    const projectData = {
      name: 'New Project',
      description: 'A cool new project',
      annotationType: 'bbox',
      guidelineUrl: 'http://example.com/guidelines',
      dueDate: '2024-12-31',
    };

    it('should create a new project for an authorized user (admin) and return 201', async () => {
      const newProjectId = 'newProjId';
      mockAdd.mockResolvedValueOnce({ id: newProjectId });

      const response = await request(app)
        .post('/projects')
        .send(projectData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ id: newProjectId });
      expect(mockedAuthGuard).toHaveBeenCalledTimes(1);
      expect(mockedRequireRole).toHaveBeenCalledWith('admin', 'project_manager');
      expect(db.collection).toHaveBeenCalledWith('projects');
      expect(mockAdd).toHaveBeenCalledWith(expect.objectContaining({
        name: projectData.name,
        description: projectData.description,
        status: 'draft',
        createdBy: 'test-admin-uid',
        createdAt: expect.any(Date),
      }));
    });

    it('should return 403 if user is authenticated but not an admin or project_manager for POST', async () => {
      mockedAuthGuard.mockImplementationOnce((req: any, res: any, next: any) => {
        req.user = { uid: 'test-user-uid', role: 'user' };
        next();
      });

      const response = await request(app).post('/projects').send(projectData);
      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Forbidden by mock role - role mismatch');
    });
  });

  // --- PATCH /projects/:id ---
  describe('PATCH /:id', () => {
    const projectId = 'projToUpdate';
    const updateData = {
      name: 'Updated Project Name',
      status: 'active',
    };

    it('should update a project for an authorized user (admin) and return 200', async () => {
      mockUpdate.mockResolvedValueOnce(undefined);

      const response = await request(app)
        .patch(`/projects/${projectId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ok: true });
      expect(mockedAuthGuard).toHaveBeenCalledTimes(1);
      expect(mockedRequireRole).toHaveBeenCalledWith('admin', 'project_manager');
      expect(db.collection).toHaveBeenCalledWith('projects');
      expect(mockDoc).toHaveBeenCalledWith(projectId);
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
        name: updateData.name,
        status: updateData.status,
      }));
    });

    it('should return 403 if user is authenticated but not an admin or project_manager for PATCH', async () => {
       mockedAuthGuard.mockImplementationOnce((req: any, res: any, next: any) => {
        req.user = { uid: 'test-user-uid', role: 'user' };
        next();
      });
      const response = await request(app).patch(`/projects/${projectId}`).send(updateData);
      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Forbidden by mock role - role mismatch');
    });

    it('should return 400 if firestore update fails', async () => {
      mockUpdate.mockRejectedValueOnce(new Error('Firestore update failed'));
      const response = await request(app)
        .patch(`/projects/${projectId}`)
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Firestore update failed');
    });
  });
});
