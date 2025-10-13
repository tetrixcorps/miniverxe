import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the Astro APIRoute type
interface MockAPIRoute {
  url: URL;
  request: Request;
  params: Record<string, string>;
}

// Mock the sessions and messages storage
const mockSessions = new Map();
const mockMessages = new Map();

// Mock SHANGO agents data
const SHANGO_AGENTS = [
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
  },
  {
    id: 'shango-sales',
    name: 'SHANGO Sales',
    description: 'Expert in sales, pricing, and product recommendations',
    capabilities: ['sales', 'product_recommendations', 'pricing_info', 'demo_requests', 'lead_qualification'],
    tools: ['n8n', 'crm', 'pricing_engine', 'product_catalog'],
    personality: 'sales',
    avatar: '💰',
    greeting: 'Welcome! I\'m SHANGO Sales, your AI Super Agent for all sales inquiries. How can I help you succeed today?'
  },
  {
    id: 'shango-billing',
    name: 'SHANGO Billing',
    description: 'Specialized in billing, payments, and account management',
    capabilities: ['billing_support', 'payment_issues', 'subscription_management', 'account_updates'],
    tools: ['n8n', 'stripe', 'billing_system', 'account_management'],
    personality: 'professional',
    avatar: '💳',
    greeting: 'Hello! I\'m SHANGO Billing, your AI Super Agent for billing and account matters. How can I assist you?'
  }
];

// Helper function to generate AI response (mocked for testing)
function generateAIResponse(message: string, agentId: string = 'shango-general'): string {
  const lowerMessage = message.toLowerCase();
  const agent = SHANGO_AGENTS.find(a => a.id === agentId);
  
  if (lowerMessage.includes('pricing') || lowerMessage.includes('price') || lowerMessage.includes('cost')) {
    return 'Our enterprise pricing starts at $299/month for the basic plan, with custom solutions available for larger organizations. Would you like me to connect you with our sales team for a detailed quote?';
  } else if (lowerMessage.includes('technical') || lowerMessage.includes('bug') || lowerMessage.includes('error')) {
    return 'I can help you with technical issues! Our platform offers 24/7 technical support. Can you describe the specific problem you\'re experiencing? I can also connect you with our technical team if needed.';
  } else if (lowerMessage.includes('demo') || lowerMessage.includes('trial')) {
    return 'I\'d be happy to arrange a demo for you! Our team can show you how our enterprise communication platform can transform your business. When would be a good time for a 30-minute demonstration?';
  } else if (lowerMessage.includes('billing') || lowerMessage.includes('payment') || lowerMessage.includes('invoice')) {
    return 'For billing and payment inquiries, I can help you with account management, subscription changes, or payment issues. What specific billing question do you have?';
  } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return agent?.greeting || 'Hello! I\'m SHANGO, your AI Super Agent. How can I help you today?';
  } else {
    return 'Thank you for your message! I\'m SHANGO, your AI Super Agent. I can help you with information about our enterprise communication platform, technical support, pricing, demos, or any other questions you might have. What would you like to know more about?';
  }
}

// Mock API route handlers
const mockSessionsAPI = {
  GET: async ({ url }: MockAPIRoute) => {
    const sessionId = url.searchParams.get('sessionId');
    
    if (sessionId) {
      const session = mockSessions.get(sessionId);
      if (!session) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Session not found'
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify({
        success: true,
        session: session
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      success: true,
      agents: SHANGO_AGENTS
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  },

  POST: async ({ request }: MockAPIRoute) => {
    const body = await request.json();
    const { userId, agentId = 'shango-general', channel = 'chat' } = body;
    
    if (!userId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'User ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const agent = SHANGO_AGENTS.find(a => a.id === agentId);
    
    const session = {
      id: sessionId,
      userId,
      agentId,
      status: 'active',
      channel,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
      shangoAgent: agent
    };
    
    mockSessions.set(sessionId, session);
    mockMessages.set(sessionId, []);
    
    // Add greeting message
    if (agent) {
      const greetingMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: agent.greeting,
        timestamp: new Date().toISOString(),
        type: 'text'
      };
      
      mockMessages.get(sessionId)?.push(greetingMessage);
      session.messages.push(greetingMessage);
    }
    
    return new Response(JSON.stringify({
      success: true,
      session: session
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  },

  PUT: async ({ request, url }: MockAPIRoute) => {
    const sessionId = url.searchParams.get('sessionId');
    if (!sessionId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Session ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const session = mockSessions.get(sessionId);
    if (!session) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Session not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const body = await request.json();
    const { status, agentId } = body;
    
    if (status) session.status = status;
    if (agentId) {
      session.agentId = agentId;
      const agent = SHANGO_AGENTS.find(a => a.id === agentId);
      session.shangoAgent = agent;
    }
    
    session.updatedAt = new Date().toISOString();
    mockSessions.set(sessionId, session);
    
    return new Response(JSON.stringify({
      success: true,
      session: session
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  },

  DELETE: async ({ url }: MockAPIRoute) => {
    const sessionId = url.searchParams.get('sessionId');
    if (!sessionId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Session ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const session = mockSessions.get(sessionId);
    if (!session) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Session not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    session.status = 'ended';
    session.updatedAt = new Date().toISOString();
    mockSessions.set(sessionId, session);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Session ended successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

const mockMessagesAPI = {
  GET: async ({ params }: MockAPIRoute) => {
    const sessionId = params.sessionId;
    
    if (!sessionId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Session ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const sessionMessages = mockMessages.get(sessionId) || [];
    
    return new Response(JSON.stringify({
      success: true,
      messages: sessionMessages
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  },

  POST: async ({ params, request }: MockAPIRoute) => {
    const sessionId = params.sessionId;
    
    if (!sessionId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Session ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const body = await request.json();
    const { message, role = 'user', agentId = 'shango-general' } = body;
    
    if (!message) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Message content is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get existing messages for this session
    const sessionMessages = mockMessages.get(sessionId) || [];
    
    // Add user message
    const userMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
      type: 'text'
    };
    
    sessionMessages.push(userMessage);
    mockMessages.set(sessionId, sessionMessages);
    
    // Generate AI response
    const aiResponse = generateAIResponse(message, agentId);
    
    // Add AI response
    const aiMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString(),
      type: 'text',
      agentId: agentId
    };
    
    const currentMessages = mockMessages.get(sessionId) || [];
    currentMessages.push(aiMessage);
    mockMessages.set(sessionId, currentMessages);
    
    return new Response(JSON.stringify({
      success: true,
      message: userMessage,
      aiResponse: aiMessage
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

describe('SHANGO Chat API', () => {
  beforeEach(() => {
    // Clear mock storage before each test
    mockSessions.clear();
    mockMessages.clear();
  });

  describe('Sessions API', () => {
    describe('GET /api/v1/shango/sessions', () => {
      it('should return available agents when no sessionId provided', async () => {
        const mockUrl = new URL('http://localhost:3000/api/v1/shango/sessions');
        const response = await mockSessionsAPI.GET({ url: mockUrl, request: {} as Request, params: {} });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.agents).toHaveLength(4);
        expect(data.agents[0]).toMatchObject({
          id: 'shango-general',
          name: 'SHANGO',
          avatar: '⚡'
        });
      });

      it('should return specific session when sessionId provided', async () => {
        // First create a session
        const createRequest = new Request('http://localhost:3000/api/v1/shango/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: 'test-user', agentId: 'shango-general' })
        });
        
        const createResponse = await mockSessionsAPI.POST({ url: new URL('http://localhost:3000/api/v1/shango/sessions'), request: createRequest, params: {} });
        const createData = await createResponse.json();
        const sessionId = createData.session.id;

        // Then get the session
        const mockUrl = new URL(`http://localhost:3000/api/v1/shango/sessions?sessionId=${sessionId}`);
        const response = await mockSessionsAPI.GET({ url: mockUrl, request: {} as Request, params: {} });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.session.id).toBe(sessionId);
        expect(data.session.userId).toBe('test-user');
        expect(data.session.agentId).toBe('shango-general');
      });

      it('should return 404 when session not found', async () => {
        const mockUrl = new URL('http://localhost:3000/api/v1/shango/sessions?sessionId=non-existent');
        const response = await mockSessionsAPI.GET({ url: mockUrl, request: {} as Request, params: {} });
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.success).toBe(false);
        expect(data.error).toBe('Session not found');
      });
    });

    describe('POST /api/v1/shango/sessions', () => {
      it('should create a new session with default agent', async () => {
        const request = new Request('http://localhost:3000/api/v1/shango/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: 'test-user' })
        });

        const response = await mockSessionsAPI.POST({ url: new URL('http://localhost:3000/api/v1/shango/sessions'), request, params: {} });
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.success).toBe(true);
        expect(data.session.userId).toBe('test-user');
        expect(data.session.agentId).toBe('shango-general');
        expect(data.session.status).toBe('active');
        expect(data.session.messages).toHaveLength(1); // Greeting message
        expect(data.session.messages[0].role).toBe('assistant');
      });

      it('should create a session with specific agent', async () => {
        const request = new Request('http://localhost:3000/api/v1/shango/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: 'test-user', agentId: 'shango-technical' })
        });

        const response = await mockSessionsAPI.POST({ url: new URL('http://localhost:3000/api/v1/shango/sessions'), request, params: {} });
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.success).toBe(true);
        expect(data.session.agentId).toBe('shango-technical');
        expect(data.session.shangoAgent.name).toBe('SHANGO Tech');
      });

      it('should return 400 when userId is missing', async () => {
        const request = new Request('http://localhost:3000/api/v1/shango/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agentId: 'shango-general' })
        });

        const response = await mockSessionsAPI.POST({ url: new URL('http://localhost:3000/api/v1/shango/sessions'), request, params: {} });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toBe('User ID is required');
      });
    });

    describe('PUT /api/v1/shango/sessions', () => {
      it('should update session status', async () => {
        // First create a session
        const createRequest = new Request('http://localhost:3000/api/v1/shango/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: 'test-user' })
        });
        
        const createResponse = await mockSessionsAPI.POST({ url: new URL('http://localhost:3000/api/v1/shango/sessions'), request: createRequest, params: {} });
        const createData = await createResponse.json();
        const sessionId = createData.session.id;

        // Then update the session
        const updateRequest = new Request('http://localhost:3000/api/v1/shango/sessions', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'ended' })
        });

        const mockUrl = new URL(`http://localhost:3000/api/v1/shango/sessions?sessionId=${sessionId}`);
        const response = await mockSessionsAPI.PUT({ url: mockUrl, request: updateRequest, params: {} });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.session.status).toBe('ended');
      });

      it('should update session agent', async () => {
        // First create a session
        const createRequest = new Request('http://localhost:3000/api/v1/shango/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: 'test-user' })
        });
        
        const createResponse = await mockSessionsAPI.POST({ url: new URL('http://localhost:3000/api/v1/shango/sessions'), request: createRequest, params: {} });
        const createData = await createResponse.json();
        const sessionId = createData.session.id;

        // Then update the agent
        const updateRequest = new Request('http://localhost:3000/api/v1/shango/sessions', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agentId: 'shango-sales' })
        });

        const mockUrl = new URL(`http://localhost:3000/api/v1/shango/sessions?sessionId=${sessionId}`);
        const response = await mockSessionsAPI.PUT({ url: mockUrl, request: updateRequest, params: {} });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.session.agentId).toBe('shango-sales');
        expect(data.session.shangoAgent.name).toBe('SHANGO Sales');
      });
    });

    describe('DELETE /api/v1/shango/sessions', () => {
      it('should end a session', async () => {
        // First create a session
        const createRequest = new Request('http://localhost:3000/api/v1/shango/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: 'test-user' })
        });
        
        const createResponse = await mockSessionsAPI.POST({ url: new URL('http://localhost:3000/api/v1/shango/sessions'), request: createRequest, params: {} });
        const createData = await createResponse.json();
        const sessionId = createData.session.id;

        // Then delete the session
        const mockUrl = new URL(`http://localhost:3000/api/v1/shango/sessions?sessionId=${sessionId}`);
        const response = await mockSessionsAPI.DELETE({ url: mockUrl, request: {} as Request, params: {} });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.message).toBe('Session ended successfully');
      });
    });
  });

  describe('Messages API', () => {
    let sessionId: string;

    beforeEach(async () => {
      // Create a session for message tests
      const createRequest = new Request('http://localhost:3000/api/v1/shango/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'test-user' })
      });
      
      const createResponse = await mockSessionsAPI.POST({ url: new URL('http://localhost:3000/api/v1/shango/sessions'), request: createRequest, params: {} });
      const createData = await createResponse.json();
      sessionId = createData.session.id;
    });

    describe('GET /api/v1/shango/sessions/{sessionId}/messages', () => {
      it('should return empty messages for new session', async () => {
        const response = await mockMessagesAPI.GET({ 
          url: new URL('http://localhost:3000/api/v1/shango/sessions'), 
          request: {} as Request, 
          params: { sessionId } 
        });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.messages).toHaveLength(1); // Greeting message
        expect(data.messages[0].role).toBe('assistant');
      });
    });

    describe('POST /api/v1/shango/sessions/{sessionId}/messages', () => {
      it('should send a message and receive AI response', async () => {
        const request = new Request('http://localhost:3000/api/v1/shango/sessions/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'Hello, I need help with pricing' })
        });

        const response = await mockMessagesAPI.POST({ 
          url: new URL('http://localhost:3000/api/v1/shango/sessions'), 
          request, 
          params: { sessionId } 
        });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.message.content).toBe('Hello, I need help with pricing');
        expect(data.message.role).toBe('user');
        expect(data.aiResponse.content).toContain('pricing starts at $299/month');
        expect(data.aiResponse.role).toBe('assistant');
      });

      it('should handle technical support messages', async () => {
        const request = new Request('http://localhost:3000/api/v1/shango/sessions/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'I have a technical issue with the API' })
        });

        const response = await mockMessagesAPI.POST({ 
          url: new URL('http://localhost:3000/api/v1/shango/sessions'), 
          request, 
          params: { sessionId } 
        });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.aiResponse.content).toContain('technical support');
      });

      it('should handle demo requests', async () => {
        const request = new Request('http://localhost:3000/api/v1/shango/sessions/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'I would like to schedule a demo' })
        });

        const response = await mockMessagesAPI.POST({ 
          url: new URL('http://localhost:3000/api/v1/shango/sessions'), 
          request, 
          params: { sessionId } 
        });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.aiResponse.content).toContain('arrange a demo');
      });

      it('should return 400 when message is missing', async () => {
        const request = new Request('http://localhost:3000/api/v1/shango/sessions/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: 'user' })
        });

        const response = await mockMessagesAPI.POST({ 
          url: new URL('http://localhost:3000/api/v1/shango/sessions'), 
          request, 
          params: { sessionId } 
        });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toBe('Message content is required');
      });
    });
  });

  describe('AI Response Generation', () => {
    it('should generate appropriate response for pricing questions', () => {
      const response = generateAIResponse('What are your prices?', 'shango-general');
      expect(response).toContain('$299/month');
      expect(response).toContain('pricing');
    });

    it('should generate appropriate response for technical questions', () => {
      const response = generateAIResponse('I have a bug in my code', 'shango-technical');
      expect(response).toContain('technical support');
      expect(response).toContain('24/7');
    });

    it('should generate appropriate response for demo requests', () => {
      const response = generateAIResponse('Can I get a demo?', 'shango-sales');
      expect(response).toContain('arrange a demo');
      expect(response).toContain('30-minute');
    });

    it('should generate appropriate response for billing questions', () => {
      const response = generateAIResponse('I have a payment issue', 'shango-billing');
      expect(response).toContain('billing');
      expect(response).toContain('payment');
    });

    it('should generate greeting for hello messages', () => {
      const response = generateAIResponse('Hello there!', 'shango-general');
      expect(response).toContain('Hello! I\'m SHANGO');
    });

    it('should generate default response for other messages', () => {
      const response = generateAIResponse('Tell me about your company', 'shango-general');
      expect(response).toContain('Thank you for your message');
      expect(response).toContain('enterprise communication platform');
    });
  });
});
