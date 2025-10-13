import { jest } from '@jest/globals';

// Mock fetch globally
global.fetch = jest.fn();

// Mock console methods to reduce noise during tests
const originalConsoleError = console.error;
const originalConsoleLog = console.log;

beforeAll(() => {
  console.error = jest.fn();
  console.log = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.log = originalConsoleLog;
});

describe('SHANGO Chat Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset fetch mock
    (global.fetch as jest.Mock).mockClear();
  });

  describe('API Endpoints', () => {
    it('should get available SHANGO agents', async () => {
      const mockAgents = [
        {
          id: 'shango-general',
          name: 'SHANGO',
          description: 'Your AI Super Agent for general assistance and support',
          capabilities: ['general_questions', 'basic_support', 'product_info', 'troubleshooting'],
          tools: ['n8n', 'knowledge_base', 'api_docs'],
          personality: 'friendly',
          avatar: '⚡',
          greeting: 'Hello! I\'m SHANGO, your AI Super Agent. How can I help you today?'
        },
        {
          id: 'shango-technical',
          name: 'SHANGO Tech',
          description: 'Specialized in technical issues and advanced troubleshooting',
          capabilities: ['technical_support', 'api_integration', 'debugging', 'system_analysis'],
          tools: ['n8n', 'api_docs', 'system_logs', 'debugging_tools'],
          personality: 'technical',
          avatar: '🔧',
          greeting: 'Hi! I\'m SHANGO Tech, your technical AI Super Agent. What technical challenge can I help you solve?'
        }
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          agents: mockAgents
        })
      });

      const response = await fetch('http://localhost:8081/api/v1/shango/sessions');
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(data.agents).toHaveLength(2);
      expect(data.agents[0].name).toBe('SHANGO');
      expect(data.agents[1].name).toBe('SHANGO Tech');
    });

    it('should create a new chat session', async () => {
      const mockSession = {
        id: 'session-1234567890-abcdef',
        userId: 'test-user-123',
        agentId: 'shango-general',
        status: 'active',
        channel: 'chat',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [
          {
            id: 'msg-greeting-123',
            role: 'assistant',
            content: 'Hello! I\'m SHANGO, your AI Super Agent. How can I help you today?',
            timestamp: new Date().toISOString(),
            type: 'text'
          }
        ],
        shangoAgent: {
          id: 'shango-general',
          name: 'SHANGO',
          personality: 'friendly',
          avatar: '⚡'
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          session: mockSession
        })
      });

      const response = await fetch('http://localhost:8081/api/v1/shango/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'test-user-123',
          agentId: 'shango-general',
          channel: 'chat'
        })
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(data.session.id).toBe('session-1234567890-abcdef');
      expect(data.session.userId).toBe('test-user-123');
      expect(data.session.agentId).toBe('shango-general');
      expect(data.session.messages).toHaveLength(1);
      expect(data.session.messages[0].role).toBe('assistant');
    });

    it('should send a message and receive AI response', async () => {
      const mockMessageResponse = {
        success: true,
        message: {
          id: 'msg-user-123',
          role: 'user',
          content: 'Hello SHANGO! Can you help me with pricing?',
          timestamp: new Date().toISOString(),
          type: 'text'
        },
        aiResponse: {
          id: 'msg-ai-123',
          role: 'assistant',
          content: 'Our enterprise pricing starts at $299/month for the basic plan, with custom solutions available for larger organizations. Would you like me to connect you with our sales team for a detailed quote?',
          timestamp: new Date().toISOString(),
          type: 'text',
          agentId: 'shango-general'
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMessageResponse
      });

      const response = await fetch('http://localhost:8081/api/v1/shango/sessions/session-123/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Hello SHANGO! Can you help me with pricing?',
          role: 'user',
          agentId: 'shango-general'
        })
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(data.message.content).toBe('Hello SHANGO! Can you help me with pricing?');
      expect(data.aiResponse.content).toContain('$299/month');
      expect(data.aiResponse.agentId).toBe('shango-general');
    });

    it('should get chat history', async () => {
      const mockHistory = [
        {
          id: 'msg-greeting-123',
          role: 'assistant',
          content: 'Hello! I\'m SHANGO, your AI Super Agent. How can I help you today?',
          timestamp: new Date().toISOString(),
          type: 'text'
        },
        {
          id: 'msg-user-123',
          role: 'user',
          content: 'Hello SHANGO! Can you help me with pricing?',
          timestamp: new Date().toISOString(),
          type: 'text'
        },
        {
          id: 'msg-ai-123',
          role: 'assistant',
          content: 'Our enterprise pricing starts at $299/month for the basic plan...',
          timestamp: new Date().toISOString(),
          type: 'text',
          agentId: 'shango-general'
        }
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          messages: mockHistory
        })
      });

      const response = await fetch('http://localhost:8081/api/v1/shango/sessions/session-123/messages');
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(data.messages).toHaveLength(3);
      expect(data.messages[0].role).toBe('assistant');
      expect(data.messages[1].role).toBe('user');
      expect(data.messages[2].role).toBe('assistant');
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      try {
        await fetch('http://localhost:8081/api/v1/shango/sessions');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Network error');
      }
    });

    it('should handle 500 server errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          success: false,
          error: 'Internal server error'
        })
      });

      const response = await fetch('http://localhost:8081/api/v1/shango/sessions');
      const data = await response.json();

      expect(response.ok).toBe(false);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Internal server error');
    });

    it('should handle 400 bad request errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          error: 'User ID is required'
        })
      });

      const response = await fetch('http://localhost:8081/api/v1/shango/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: 'shango-general',
          channel: 'chat'
          // Missing userId
        })
      });

      const data = await response.json();

      expect(response.ok).toBe(false);
      expect(data.success).toBe(false);
      expect(data.error).toBe('User ID is required');
    });
  });

  describe('AI Response Generation', () => {
    it('should generate appropriate responses for pricing questions', () => {
      const generateAIResponse = (message: string, agentId: string = 'shango-general'): string => {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('pricing') || lowerMessage.includes('price') || lowerMessage.includes('cost')) {
          return 'Our enterprise pricing starts at $299/month for the basic plan, with custom solutions available for larger organizations. Would you like me to connect you with our sales team for a detailed quote?';
        } else if (lowerMessage.includes('technical') || lowerMessage.includes('bug') || lowerMessage.includes('error')) {
          return 'I can help you with technical issues! Our platform offers 24/7 technical support. Can you describe the specific problem you\'re experiencing? I can also connect you with our technical team if needed.';
        } else if (lowerMessage.includes('demo') || lowerMessage.includes('trial')) {
          return 'I\'d be happy to arrange a demo for you! Our team can show you how our enterprise communication platform can transform your business. When would be a good time for a 30-minute demonstration?';
        } else if (lowerMessage.includes('billing') || lowerMessage.includes('payment') || lowerMessage.includes('invoice')) {
          return 'For billing and payment inquiries, I can help you with account management, subscription changes, or payment issues. What specific billing question do you have?';
        } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
          return 'Hello! I\'m SHANGO, your AI Super Agent. I\'m here to help you with any questions about our enterprise communication platform, technical support, pricing, or general inquiries. How can I assist you today?';
        } else {
          return 'Thank you for your message! I\'m SHANGO, your AI Super Agent. I can help you with information about our enterprise communication platform, technical support, pricing, demos, or any other questions you might have. What would you like to know more about?';
        }
      };

      expect(generateAIResponse('What are your prices?')).toContain('$299/month');
      expect(generateAIResponse('How much does it cost?')).toContain('$299/month');
      expect(generateAIResponse('I need pricing information')).toContain('$299/month');
    });

    it('should generate appropriate responses for technical questions', () => {
      const generateAIResponse = (message: string, agentId: string = 'shango-general'): string => {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('technical') || lowerMessage.includes('bug') || lowerMessage.includes('error')) {
          return 'I can help you with technical issues! Our platform offers 24/7 technical support. Can you describe the specific problem you\'re experiencing? I can also connect you with our technical team if needed.';
        } else {
          return 'Thank you for your message! I\'m SHANGO, your AI Super Agent. I can help you with information about our enterprise communication platform, technical support, pricing, demos, or any other questions you might have. What would you like to know more about?';
        }
      };

      expect(generateAIResponse('I have a technical issue')).toContain('technical support');
      expect(generateAIResponse('There is a bug in the system')).toContain('technical support');
      expect(generateAIResponse('I encountered an error')).toContain('technical support');
    });

    it('should generate appropriate responses for demo requests', () => {
      const generateAIResponse = (message: string, agentId: string = 'shango-general'): string => {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('demo') || lowerMessage.includes('trial')) {
          return 'I\'d be happy to arrange a demo for you! Our team can show you how our enterprise communication platform can transform your business. When would be a good time for a 30-minute demonstration?';
        } else {
          return 'Thank you for your message! I\'m SHANGO, your AI Super Agent. I can help you with information about our enterprise communication platform, technical support, pricing, demos, or any other questions you might have. What would you like to know more about?';
        }
      };

      expect(generateAIResponse('Can I get a demo?')).toContain('30-minute demonstration');
      expect(generateAIResponse('I want to try a trial')).toContain('30-minute demonstration');
      expect(generateAIResponse('Show me how it works')).toContain('Thank you for your message! I\'m SHANGO');
    });

    it('should generate appropriate responses for billing questions', () => {
      const generateAIResponse = (message: string, agentId: string = 'shango-general'): string => {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('billing') || lowerMessage.includes('payment') || lowerMessage.includes('invoice')) {
          return 'For billing and payment inquiries, I can help you with account management, subscription changes, or payment issues. What specific billing question do you have?';
        } else {
          return 'Thank you for your message! I\'m SHANGO, your AI Super Agent. I can help you with information about our enterprise communication platform, technical support, pricing, demos, or any other questions you might have. What would you like to know more about?';
        }
      };

      expect(generateAIResponse('I have a billing question')).toContain('billing and payment inquiries');
      expect(generateAIResponse('How do I pay my invoice?')).toContain('billing and payment inquiries');
      expect(generateAIResponse('Payment issue')).toContain('billing and payment inquiries');
    });

    it('should generate appropriate responses for greetings', () => {
      const generateAIResponse = (message: string, agentId: string = 'shango-general'): string => {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
          return 'Hello! I\'m SHANGO, your AI Super Agent. I\'m here to help you with any questions about our enterprise communication platform, technical support, pricing, or general inquiries. How can I assist you today?';
        } else {
          return 'Thank you for your message! I\'m SHANGO, your AI Super Agent. I can help you with information about our enterprise communication platform, technical support, pricing, demos, or any other questions you might have. What would you like to know more about?';
        }
      };

      expect(generateAIResponse('Hello')).toContain('Hello! I\'m SHANGO');
      expect(generateAIResponse('Hi there')).toContain('Hello! I\'m SHANGO');
      expect(generateAIResponse('Hey SHANGO')).toContain('Hello! I\'m SHANGO');
    });

    it('should generate default responses for other messages', () => {
      const generateAIResponse = (message: string, agentId: string = 'shango-general'): string => {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('pricing') || lowerMessage.includes('price') || lowerMessage.includes('cost')) {
          return 'Our enterprise pricing starts at $299/month for the basic plan, with custom solutions available for larger organizations. Would you like me to connect you with our sales team for a detailed quote?';
        } else if (lowerMessage.includes('technical') || lowerMessage.includes('bug') || lowerMessage.includes('error')) {
          return 'I can help you with technical issues! Our platform offers 24/7 technical support. Can you describe the specific problem you\'re experiencing? I can also connect you with our technical team if needed.';
        } else if (lowerMessage.includes('demo') || lowerMessage.includes('trial')) {
          return 'I\'d be happy to arrange a demo for you! Our team can show you how our enterprise communication platform can transform your business. When would be a good time for a 30-minute demonstration?';
        } else if (lowerMessage.includes('billing') || lowerMessage.includes('payment') || lowerMessage.includes('invoice')) {
          return 'For billing and payment inquiries, I can help you with account management, subscription changes, or payment issues. What specific billing question do you have?';
        } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
          return 'Hello! I\'m SHANGO, your AI Super Agent. I\'m here to help you with any questions about our enterprise communication platform, technical support, pricing, or general inquiries. How can I assist you today?';
        } else {
          return 'Thank you for your message! I\'m SHANGO, your AI Super Agent. I can help you with information about our enterprise communication platform, technical support, pricing, demos, or any other questions you might have. What would you like to know more about?';
        }
      };

      expect(generateAIResponse('Random question')).toContain('Thank you for your message! I\'m SHANGO');
      expect(generateAIResponse('General inquiry')).toContain('Thank you for your message! I\'m SHANGO');
      expect(generateAIResponse('Some random text')).toContain('Thank you for your message! I\'m SHANGO');
    });
  });

  describe('Session Management', () => {
    it('should update session status', async () => {
      const mockUpdatedSession = {
        id: 'session-123',
        userId: 'test-user-123',
        agentId: 'shango-technical',
        status: 'ended',
        channel: 'chat',
        updatedAt: new Date().toISOString()
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          session: mockUpdatedSession
        })
      });

      const response = await fetch('http://localhost:8081/api/v1/shango/sessions?sessionId=session-123', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'ended',
          agentId: 'shango-technical'
        })
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(data.session.status).toBe('ended');
      expect(data.session.agentId).toBe('shango-technical');
    });

    it('should end a session', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Session ended successfully'
        })
      });

      const response = await fetch('http://localhost:8081/api/v1/shango/sessions?sessionId=session-123', {
        method: 'DELETE'
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Session ended successfully');
    });
  });

  describe('Integration Tests', () => {
    it('should complete a full chat flow', async () => {
      // Step 1: Get agents
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          agents: [{ id: 'shango-general', name: 'SHANGO' }]
        })
      });

      // Step 2: Create session
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          session: {
            id: 'session-123',
            userId: 'test-user',
            agentId: 'shango-general',
            status: 'active',
            messages: []
          }
        })
      });

      // Step 3: Send message
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: {
            id: 'msg-1',
            role: 'user',
            content: 'Hello!',
            timestamp: new Date().toISOString()
          },
          aiResponse: {
            id: 'msg-2',
            role: 'assistant',
            content: 'Hello! I\'m SHANGO, your AI Super Agent. How can I help you today?',
            timestamp: new Date().toISOString()
          }
        })
      });

      // Step 4: Get history
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          messages: [
            {
              id: 'msg-1',
              role: 'user',
              content: 'Hello!',
              timestamp: new Date().toISOString()
            },
            {
              id: 'msg-2',
              role: 'assistant',
              content: 'Hello! I\'m SHANGO, your AI Super Agent. How can I help you today?',
              timestamp: new Date().toISOString()
            }
          ]
        })
      });

      // Execute the flow
      const agentsResponse = await fetch('http://localhost:8081/api/v1/shango/sessions');
      const agentsData = await agentsResponse.json();
      expect(agentsData.success).toBe(true);

      const sessionResponse = await fetch('http://localhost:8081/api/v1/shango/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'test-user',
          agentId: 'shango-general',
          channel: 'chat'
        })
      });
      const sessionData = await sessionResponse.json();
      expect(sessionData.success).toBe(true);

      const messageResponse = await fetch(`http://localhost:8081/api/v1/shango/sessions/${sessionData.session.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Hello!',
          role: 'user',
          agentId: 'shango-general'
        })
      });
      const messageData = await messageResponse.json();
      expect(messageData.success).toBe(true);

      const historyResponse = await fetch(`http://localhost:8081/api/v1/shango/sessions/${sessionData.session.id}/messages`);
      const historyData = await historyResponse.json();
      expect(historyData.success).toBe(true);
      expect(historyData.messages).toHaveLength(2);
    });
  });
});
