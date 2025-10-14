import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, POST } from '../../src/pages/api/v1/shango/sessions/[sessionId]/messages';

// Mock the shangoStorage
vi.mock('../../../../services/shangoStorage', () => ({
  shangoStorage: {
    getMessages: vi.fn(),
    addMessage: vi.fn()
  }
}));

import { shangoStorage } from '../../../../services/shangoStorage';

describe('SHANGO Messages API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/v1/shango/sessions/{sessionId}/messages', () => {
    it('should return messages for a session', async () => {
      const mockMessages = [
        {
          id: 'msg-1',
          role: 'assistant',
          content: 'Hello! I\'m SHANGO, your AI Super Agent. How can I help you today?',
          timestamp: new Date().toISOString(),
          type: 'text'
        },
        {
          id: 'msg-2',
          role: 'user',
          content: 'Hello SHANGO!',
          timestamp: new Date().toISOString(),
          type: 'text'
        }
      ];

      vi.mocked(shangoStorage.getMessages).mockReturnValue(mockMessages);

      const mockParams = { sessionId: 'test-session-1' };
      const mockRequest = new Request('http://localhost:8080/api/v1/shango/sessions/test-session-1/messages');

      const response = await GET({ params: mockParams, request: mockRequest } as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.messages).toEqual(mockMessages);
      expect(shangoStorage.getMessages).toHaveBeenCalledWith('test-session-1');
    });

    it('should return empty array when no messages exist', async () => {
      vi.mocked(shangoStorage.getMessages).mockReturnValue([]);

      const mockParams = { sessionId: 'test-session-1' };
      const mockRequest = new Request('http://localhost:8080/api/v1/shango/sessions/test-session-1/messages');

      const response = await GET({ params: mockParams, request: mockRequest } as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.messages).toEqual([]);
    });

    it('should return 400 when sessionId is missing', async () => {
      const mockParams = {};
      const mockRequest = new Request('http://localhost:8080/api/v1/shango/sessions//messages');

      const response = await GET({ params: mockParams, request: mockRequest } as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Session ID is required');
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(shangoStorage.getMessages).mockImplementation(() => {
        throw new Error('Database error');
      });

      const mockParams = { sessionId: 'test-session-1' };
      const mockRequest = new Request('http://localhost:8080/api/v1/shango/sessions/test-session-1/messages');

      const response = await GET({ params: mockParams, request: mockRequest } as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('POST /api/v1/shango/sessions/{sessionId}/messages', () => {
    it('should send a message and return AI response', async () => {
      const mockUserMessage = {
        id: 'msg-user-1234567890-abc123',
        role: 'user',
        content: 'Hello SHANGO!',
        timestamp: new Date().toISOString(),
        type: 'text'
      };

      const mockAIMessage = {
        id: 'msg-ai-1234567890-abc123',
        role: 'assistant',
        content: 'Hello! I\'m SHANGO, your AI Super Agent. I\'m here to help you with any questions about our enterprise communication platform, technical support, pricing, or general inquiries. How can I assist you today?',
        timestamp: new Date().toISOString(),
        type: 'text',
        agentId: 'shango-general'
      };

      vi.mocked(shangoStorage.addMessage).mockImplementation(() => {});

      const mockParams = { sessionId: 'test-session-1' };
      const mockRequest = new Request('http://localhost:8080/api/v1/shango/sessions/test-session-1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Hello SHANGO!',
          role: 'user',
          agentId: 'shango-general'
        })
      });

      const response = await POST({ params: mockParams, request: mockRequest } as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBeDefined();
      expect(data.message.role).toBe('user');
      expect(data.message.content).toBe('Hello SHANGO!');
      expect(data.aiResponse).toBeDefined();
      expect(data.aiResponse.role).toBe('assistant');
      expect(data.aiResponse.content).toContain('SHANGO');
      expect(shangoStorage.addMessage).toHaveBeenCalledTimes(2); // User message + AI response
    });

    it('should handle pricing-related messages', async () => {
      vi.mocked(shangoStorage.addMessage).mockImplementation(() => {});

      const mockParams = { sessionId: 'test-session-1' };
      const mockRequest = new Request('http://localhost:8080/api/v1/shango/sessions/test-session-1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'What is your pricing?',
          role: 'user',
          agentId: 'shango-general'
        })
      });

      const response = await POST({ params: mockParams, request: mockRequest } as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.aiResponse.content).toContain('$299/month');
      expect(data.aiResponse.content).toContain('pricing');
    });

    it('should handle technical-related messages', async () => {
      vi.mocked(shangoStorage.addMessage).mockImplementation(() => {});

      const mockParams = { sessionId: 'test-session-1' };
      const mockRequest = new Request('http://localhost:8080/api/v1/shango/sessions/test-session-1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'I have a technical issue',
          role: 'user',
          agentId: 'shango-general'
        })
      });

      const response = await POST({ params: mockParams, request: mockRequest } as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.aiResponse.content).toContain('technical');
      expect(data.aiResponse.content).toContain('support');
    });

    it('should handle demo-related messages', async () => {
      vi.mocked(shangoStorage.addMessage).mockImplementation(() => {});

      const mockParams = { sessionId: 'test-session-1' };
      const mockRequest = new Request('http://localhost:8080/api/v1/shango/sessions/test-session-1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Can I get a demo?',
          role: 'user',
          agentId: 'shango-general'
        })
      });

      const response = await POST({ params: mockParams, request: mockRequest } as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.aiResponse.content).toContain('demo');
      expect(data.aiResponse.content).toContain('demonstration');
    });

    it('should handle billing-related messages', async () => {
      vi.mocked(shangoStorage.addMessage).mockImplementation(() => {});

      const mockParams = { sessionId: 'test-session-1' };
      const mockRequest = new Request('http://localhost:8080/api/v1/shango/sessions/test-session-1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'I have a billing question',
          role: 'user',
          agentId: 'shango-general'
        })
      });

      const response = await POST({ params: mockParams, request: mockRequest } as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.aiResponse.content).toContain('billing');
      expect(data.aiResponse.content).toContain('payment');
    });

    it('should return 400 when sessionId is missing', async () => {
      const mockParams = {};
      const mockRequest = new Request('http://localhost:8080/api/v1/shango/sessions//messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Hello SHANGO!',
          role: 'user',
          agentId: 'shango-general'
        })
      });

      const response = await POST({ params: mockParams, request: mockRequest } as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Session ID is required');
    });

    it('should return 400 when message content is missing', async () => {
      const mockParams = { sessionId: 'test-session-1' };
      const mockRequest = new Request('http://localhost:8080/api/v1/shango/sessions/test-session-1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'user',
          agentId: 'shango-general'
        })
      });

      const response = await POST({ params: mockParams, request: mockRequest } as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Message content is required');
    });

    it('should use default values for optional parameters', async () => {
      vi.mocked(shangoStorage.addMessage).mockImplementation(() => {});

      const mockParams = { sessionId: 'test-session-1' };
      const mockRequest = new Request('http://localhost:8080/api/v1/shango/sessions/test-session-1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Hello SHANGO!'
        })
      });

      const response = await POST({ params: mockParams, request: mockRequest } as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message.role).toBe('user');
      expect(data.aiResponse.agentId).toBe('shango-general');
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(shangoStorage.addMessage).mockImplementation(() => {
        throw new Error('Database error');
      });

      const mockParams = { sessionId: 'test-session-1' };
      const mockRequest = new Request('http://localhost:8080/api/v1/shango/sessions/test-session-1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Hello SHANGO!',
          role: 'user',
          agentId: 'shango-general'
        })
      });

      const response = await POST({ params: mockParams, request: mockRequest } as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Internal server error');
    });
  });
});
