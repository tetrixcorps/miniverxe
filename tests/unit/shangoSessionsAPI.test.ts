import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, POST, PUT, DELETE } from '../../src/pages/api/v1/shango/sessions';

// Mock the shangoStorage
vi.mock('../../src/services/shangoStorage', () => ({
  shangoStorage: {
    getSession: vi.fn(),
    createSession: vi.fn(),
    updateSession: vi.fn(),
    deleteSession: vi.fn(),
    getAllSessions: vi.fn()
  }
}));

import { shangoStorage } from '../../src/services/shangoStorage';

describe('SHANGO Sessions API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/v1/shango/sessions', () => {
    it('should return available agents when no sessionId provided', async () => {
      const mockUrl = new URL('http://localhost:8080/api/v1/shango/sessions');
      const mockRequest = new Request(mockUrl);

      const response = await GET({ url: mockUrl, request: mockRequest } as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.agents).toBeDefined();
      expect(Array.isArray(data.agents)).toBe(true);
      expect(data.agents.length).toBeGreaterThan(0);
    });

    it('should return specific session when sessionId provided', async () => {
      const mockSession = {
        id: 'test-session-1',
        userId: 'user-123',
        agentId: 'shango-general',
        status: 'active',
        channel: 'chat',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: []
      };

      vi.mocked(shangoStorage.getSession).mockReturnValue(mockSession);

      const mockUrl = new URL('http://localhost:8080/api/v1/shango/sessions?sessionId=test-session-1');
      const mockRequest = new Request(mockUrl);

      const response = await GET({ url: mockUrl, request: mockRequest } as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.session).toEqual(mockSession);
      expect(shangoStorage.getSession).toHaveBeenCalledWith('test-session-1');
    });

    it('should return 404 when session not found', async () => {
      vi.mocked(shangoStorage.getSession).mockReturnValue(undefined);

      const mockUrl = new URL('http://localhost:8080/api/v1/shango/sessions?sessionId=non-existent');
      const mockRequest = new Request(mockUrl);

      const response = await GET({ url: mockUrl, request: mockRequest } as any);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Session not found');
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(shangoStorage.getSession).mockImplementation(() => {
        throw new Error('Database error');
      });

      const mockUrl = new URL('http://localhost:8080/api/v1/shango/sessions?sessionId=test-session-1');
      const mockRequest = new Request(mockUrl);

      const response = await GET({ url: mockUrl, request: mockRequest } as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('POST /api/v1/shango/sessions', () => {
    it('should create a new session successfully', async () => {
      const mockSession = {
        id: 'session-1234567890-abc123',
        userId: 'user-123',
        agentId: 'shango-general',
        status: 'active',
        channel: 'chat',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
        shangoAgent: {
          id: 'shango-general',
          name: 'SHANGO',
          description: 'Your AI Super Agent for general assistance and support'
        }
      };

      vi.mocked(shangoStorage.createSession).mockImplementation(() => {});
      vi.mocked(shangoStorage.addMessage).mockImplementation(() => {});

      const mockRequest = new Request('http://localhost:8080/api/v1/shango/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-123',
          agentId: 'shango-general',
          channel: 'chat'
        })
      });

      const response = await POST({ request: mockRequest } as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.session).toBeDefined();
      expect(data.session.userId).toBe('user-123');
      expect(data.session.agentId).toBe('shango-general');
      expect(data.session.status).toBe('active');
      expect(shangoStorage.createSession).toHaveBeenCalled();
    });

    it('should return 400 when userId is missing', async () => {
      const mockRequest = new Request('http://localhost:8080/api/v1/shango/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'shango-general',
          channel: 'chat'
        })
      });

      const response = await POST({ request: mockRequest } as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('User ID is required');
    });

    it('should use default values for optional parameters', async () => {
      vi.mocked(shangoStorage.createSession).mockImplementation(() => {});
      vi.mocked(shangoStorage.addMessage).mockImplementation(() => {});

      const mockRequest = new Request('http://localhost:8080/api/v1/shango/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-123'
        })
      });

      const response = await POST({ request: mockRequest } as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.session.agentId).toBe('shango-general');
      expect(data.session.channel).toBe('chat');
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(shangoStorage.createSession).mockImplementation(() => {
        throw new Error('Database error');
      });

      const mockRequest = new Request('http://localhost:8080/api/v1/shango/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-123',
          agentId: 'shango-general',
          channel: 'chat'
        })
      });

      const response = await POST({ request: mockRequest } as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('PUT /api/v1/shango/sessions', () => {
    it('should update session successfully', async () => {
      const mockSession = {
        id: 'test-session-1',
        userId: 'user-123',
        agentId: 'shango-general',
        status: 'active',
        channel: 'chat',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: []
      };

      vi.mocked(shangoStorage.getSession).mockReturnValue(mockSession);
      vi.mocked(shangoStorage.updateSession).mockImplementation(() => {});

      const mockUrl = new URL('http://localhost:8080/api/v1/shango/sessions?sessionId=test-session-1');
      const mockRequest = new Request('http://localhost:8080/api/v1/shango/sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'ended',
          agentId: 'shango-technical'
        })
      });

      const response = await PUT({ url: mockUrl, request: mockRequest } as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.session.status).toBe('ended');
      expect(data.session.agentId).toBe('shango-technical');
      expect(shangoStorage.updateSession).toHaveBeenCalledWith('test-session-1', {
        status: 'ended',
        agentId: 'shango-technical'
      });
    });

    it('should return 400 when sessionId is missing', async () => {
      const mockUrl = new URL('http://localhost:8080/api/v1/shango/sessions');
      const mockRequest = new Request('http://localhost:8080/api/v1/shango/sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ended' })
      });

      const response = await PUT({ url: mockUrl, request: mockRequest } as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Session ID is required');
    });

    it('should return 404 when session not found', async () => {
      vi.mocked(shangoStorage.getSession).mockReturnValue(undefined);

      const mockUrl = new URL('http://localhost:8080/api/v1/shango/sessions?sessionId=non-existent');
      const mockRequest = new Request('http://localhost:8080/api/v1/shango/sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ended' })
      });

      const response = await PUT({ url: mockUrl, request: mockRequest } as any);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Session not found');
    });
  });

  describe('DELETE /api/v1/shango/sessions', () => {
    it('should end session successfully', async () => {
      const mockSession = {
        id: 'test-session-1',
        userId: 'user-123',
        agentId: 'shango-general',
        status: 'active',
        channel: 'chat',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: []
      };

      vi.mocked(shangoStorage.getSession).mockReturnValue(mockSession);
      vi.mocked(shangoStorage.updateSession).mockImplementation(() => {});

      const mockUrl = new URL('http://localhost:8080/api/v1/shango/sessions?sessionId=test-session-1');
      const mockRequest = new Request('http://localhost:8080/api/v1/shango/sessions', {
        method: 'DELETE'
      });

      const response = await DELETE({ url: mockUrl, request: mockRequest } as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Session ended successfully');
      expect(shangoStorage.updateSession).toHaveBeenCalledWith('test-session-1', {
        status: 'ended'
      });
    });

    it('should return 400 when sessionId is missing', async () => {
      const mockUrl = new URL('http://localhost:8080/api/v1/shango/sessions');
      const mockRequest = new Request('http://localhost:8080/api/v1/shango/sessions', {
        method: 'DELETE'
      });

      const response = await DELETE({ url: mockUrl, request: mockRequest } as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Session ID is required');
    });

    it('should return 404 when session not found', async () => {
      vi.mocked(shangoStorage.getSession).mockReturnValue(undefined);

      const mockUrl = new URL('http://localhost:8080/api/v1/shango/sessions?sessionId=non-existent');
      const mockRequest = new Request('http://localhost:8080/api/v1/shango/sessions', {
        method: 'DELETE'
      });

      const response = await DELETE({ url: mockUrl, request: mockRequest } as any);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Session not found');
    });
  });
});
