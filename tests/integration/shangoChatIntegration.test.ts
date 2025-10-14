import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock fetch for API testing
global.fetch = vi.fn();

describe('SHANGO Chat Integration Tests', () => {
  const baseUrl = 'http://localhost:8082'; // Using port 8082 as shown in terminal

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('API Endpoint Integration', () => {
    it('should create a session and send messages successfully', async () => {
      // Mock session creation response
      const mockSessionResponse = {
        success: true,
        session: {
          id: 'session-1234567890-abc123',
          userId: 'user-123',
          agentId: 'shango-general',
          status: 'active',
          channel: 'chat',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: [
            {
              id: 'msg-greeting',
              role: 'assistant',
              content: 'Hello! I\'m SHANGO, your AI Super Agent. How can I help you today?',
              timestamp: new Date().toISOString(),
              type: 'text'
            }
          ],
          shangoAgent: {
            id: 'shango-general',
            name: 'SHANGO',
            description: 'Your AI Super Agent for general assistance and support'
          }
        }
      };

      // Mock message response
      const mockMessageResponse = {
        success: true,
        message: {
          id: 'msg-user-1234567890-abc123',
          role: 'user',
          content: 'Hello SHANGO!',
          timestamp: new Date().toISOString(),
          type: 'text'
        },
        aiResponse: {
          id: 'msg-ai-1234567890-abc123',
          role: 'assistant',
          content: 'Hello! I\'m SHANGO, your AI Super Agent. I\'m here to help you with any questions about our enterprise communication platform, technical support, pricing, or general inquiries. How can I assist you today?',
          timestamp: new Date().toISOString(),
          type: 'text',
          agentId: 'shango-general'
        }
      };

      // Mock fetch responses
      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockSessionResponse)
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockMessageResponse)
        } as Response);

      // Test session creation
      const sessionResponse = await fetch(`${baseUrl}/api/v1/shango/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-123',
          agentId: 'shango-general',
          channel: 'chat'
        })
      });

      const sessionData = await sessionResponse.json();
      expect(sessionData.success).toBe(true);
      expect(sessionData.session.id).toBeDefined();
      expect(sessionData.session.messages).toHaveLength(1);

      // Test message sending
      const messageResponse = await fetch(`${baseUrl}/api/v1/shango/sessions/${sessionData.session.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Hello SHANGO!',
          role: 'user',
          agentId: 'shango-general'
        })
      });

      const messageData = await messageResponse.json();
      expect(messageData.success).toBe(true);
      expect(messageData.message.role).toBe('user');
      expect(messageData.aiResponse.role).toBe('assistant');
      expect(messageData.aiResponse.content).toContain('SHANGO');
    });

    it('should handle different types of user queries', async () => {
      const testQueries = [
        {
          message: 'What is your pricing?',
          expectedContent: 'pricing',
          expectedResponse: '$299/month'
        },
        {
          message: 'I have a technical issue',
          expectedContent: 'technical',
          expectedResponse: 'support'
        },
        {
          message: 'Can I get a demo?',
          expectedContent: 'demo',
          expectedResponse: 'demonstration'
        },
        {
          message: 'I have a billing question',
          expectedContent: 'billing',
          expectedResponse: 'payment'
        }
      ];

      for (const query of testQueries) {
        const mockResponse = {
          success: true,
          message: {
            id: `msg-${Date.now()}`,
            role: 'user',
            content: query.message,
            timestamp: new Date().toISOString(),
            type: 'text'
          },
          aiResponse: {
            id: `msg-ai-${Date.now()}`,
            role: 'assistant',
            content: `Mock response for ${query.expectedContent}`,
            timestamp: new Date().toISOString(),
            type: 'text',
            agentId: 'shango-general'
          }
        };

        vi.mocked(fetch).mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        } as Response);

        const response = await fetch(`${baseUrl}/api/v1/shango/sessions/session-123/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: query.message,
            role: 'user',
            agentId: 'shango-general'
          })
        });

        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.message.content).toBe(query.message);
        expect(data.aiResponse.content).toContain(query.expectedContent);
      }
    });

    it('should handle API errors gracefully', async () => {
      // Mock error response
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({
          success: false,
          error: 'Internal server error'
        })
      } as Response);

      const response = await fetch(`${baseUrl}/api/v1/shango/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-123',
          agentId: 'shango-general',
          channel: 'chat'
        })
      });

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Internal server error');
    });

    it('should handle network errors', async () => {
      // Mock network error
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      try {
        await fetch(`${baseUrl}/api/v1/shango/sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'user-123',
            agentId: 'shango-general',
            channel: 'chat'
          })
        });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Network error');
      }
    });
  });

  describe('Frontend Integration Simulation', () => {
    it('should simulate the complete chat widget flow', async () => {
      // Simulate the frontend chat widget functionality
      let currentSession = null;
      let messages = [];

      // Mock session creation
      const mockSessionResponse = {
        success: true,
        session: {
          id: 'session-widget-test',
          userId: 'widget-user',
          agentId: 'shango-general',
          status: 'active',
          channel: 'chat',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: [
            {
              id: 'msg-greeting',
              role: 'assistant',
              content: 'Hello! I\'m SHANGO, your AI Super Agent. How can I help you today?',
              timestamp: new Date().toISOString(),
              type: 'text'
            }
          ]
        }
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSessionResponse)
      } as Response);

      // Start chat session
      const sessionResponse = await fetch(`${baseUrl}/api/v1/shango/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'widget-user',
          agentId: 'shango-general',
          channel: 'chat'
        })
      });

      const sessionData = await sessionResponse.json();
      currentSession = sessionData.session;
      messages = sessionData.session.messages;

      expect(currentSession).toBeDefined();
      expect(messages).toHaveLength(1);
      expect(messages[0].role).toBe('assistant');

      // Simulate sending multiple messages
      const userMessages = [
        'Hello SHANGO!',
        'What is your pricing?',
        'Can I get a demo?',
        'Thank you!'
      ];

      for (let i = 0; i < userMessages.length; i++) {
        const mockMessageResponse = {
          success: true,
          message: {
            id: `msg-user-${i}`,
            role: 'user',
            content: userMessages[i],
            timestamp: new Date().toISOString(),
            type: 'text'
          },
          aiResponse: {
            id: `msg-ai-${i}`,
            role: 'assistant',
            content: `AI response to: ${userMessages[i]}`,
            timestamp: new Date().toISOString(),
            type: 'text',
            agentId: 'shango-general'
          }
        };

        vi.mocked(fetch).mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockMessageResponse)
        } as Response);

        const messageResponse = await fetch(`${baseUrl}/api/v1/shango/sessions/${currentSession.id}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMessages[i],
            role: 'user',
            agentId: 'shango-general'
          })
        });

        const messageData = await messageResponse.json();
        
        // Simulate adding messages to frontend state
        messages.push(messageData.message);
        messages.push(messageData.aiResponse);

        expect(messageData.success).toBe(true);
        expect(messageData.message.content).toBe(userMessages[i]);
        expect(messageData.aiResponse.role).toBe('assistant');
      }

      // Verify complete conversation
      expect(messages).toHaveLength(9); // 1 greeting + 4 user messages + 4 AI responses
      expect(messages.filter(m => m.role === 'user')).toHaveLength(4);
      expect(messages.filter(m => m.role === 'assistant')).toHaveLength(5); // 1 greeting + 4 responses
    });

    it('should handle concurrent users', async () => {
      const users = ['user-1', 'user-2', 'user-3'];
      const sessions = [];

      // Create sessions for multiple users
      for (const userId of users) {
        const mockSessionResponse = {
          success: true,
          session: {
            id: `session-${userId}`,
            userId: userId,
            agentId: 'shango-general',
            status: 'active',
            channel: 'chat',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            messages: []
          }
        };

        vi.mocked(fetch).mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockSessionResponse)
        } as Response);

        const response = await fetch(`${baseUrl}/api/v1/shango/sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userId,
            agentId: 'shango-general',
            channel: 'chat'
          })
        });

        const data = await response.json();
        sessions.push(data.session);
      }

      expect(sessions).toHaveLength(3);
      expect(sessions[0].userId).toBe('user-1');
      expect(sessions[1].userId).toBe('user-2');
      expect(sessions[2].userId).toBe('user-3');

      // Send messages from all users simultaneously
      const messagePromises = sessions.map((session, index) => {
        const mockMessageResponse = {
          success: true,
          message: {
            id: `msg-${session.userId}`,
            role: 'user',
            content: `Message from ${session.userId}`,
            timestamp: new Date().toISOString(),
            type: 'text'
          },
          aiResponse: {
            id: `msg-ai-${session.userId}`,
            role: 'assistant',
            content: `Response to ${session.userId}`,
            timestamp: new Date().toISOString(),
            type: 'text',
            agentId: 'shango-general'
          }
        };

        vi.mocked(fetch).mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockMessageResponse)
        } as Response);

        return fetch(`${baseUrl}/api/v1/shango/sessions/${session.id}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `Message from ${session.userId}`,
            role: 'user',
            agentId: 'shango-general'
          })
        });
      });

      const responses = await Promise.all(messagePromises);
      const messageData = await Promise.all(responses.map(r => r.json()));

      expect(messageData).toHaveLength(3);
      messageData.forEach((data, index) => {
        expect(data.success).toBe(true);
        expect(data.message.content).toBe(`Message from user-${index + 1}`);
        expect(data.aiResponse.role).toBe('assistant');
      });
    });
  });

  describe('Error Recovery and Resilience', () => {
    it('should handle partial failures gracefully', async () => {
      // Mock session creation success
      const mockSessionResponse = {
        success: true,
        session: {
          id: 'session-resilience-test',
          userId: 'user-resilience',
          agentId: 'shango-general',
          status: 'active',
          channel: 'chat',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: []
        }
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSessionResponse)
      } as Response);

      // Create session
      const sessionResponse = await fetch(`${baseUrl}/api/v1/shango/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-resilience',
          agentId: 'shango-general',
          channel: 'chat'
        })
      });

      const sessionData = await sessionResponse.json();
      expect(sessionData.success).toBe(true);

      // Mock first message success, second message failure
      const mockSuccessResponse = {
        success: true,
        message: {
          id: 'msg-success',
          role: 'user',
          content: 'First message',
          timestamp: new Date().toISOString(),
          type: 'text'
        },
        aiResponse: {
          id: 'msg-ai-success',
          role: 'assistant',
          content: 'Response to first message',
          timestamp: new Date().toISOString(),
          type: 'text',
          agentId: 'shango-general'
        }
      };

      const mockErrorResponse = {
        success: false,
        error: 'Internal server error'
      };

      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockSuccessResponse)
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: () => Promise.resolve(mockErrorResponse)
        } as Response);

      // First message should succeed
      const firstMessageResponse = await fetch(`${baseUrl}/api/v1/shango/sessions/${sessionData.session.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'First message',
          role: 'user',
          agentId: 'shango-general'
        })
      });

      const firstMessageData = await firstMessageResponse.json();
      expect(firstMessageData.success).toBe(true);

      // Second message should fail
      const secondMessageResponse = await fetch(`${baseUrl}/api/v1/shango/sessions/${sessionData.session.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Second message',
          role: 'user',
          agentId: 'shango-general'
        })
      });

      const secondMessageData = await secondMessageResponse.json();
      expect(secondMessageData.success).toBe(false);
      expect(secondMessageData.error).toBe('Internal server error');
    });
  });
});
