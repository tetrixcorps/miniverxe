import type { APIRoute } from 'astro';

// Mock session storage for JoRoMi
const joromiSessions = new Map();

// JoRoMi agents configuration
const JOROMI_AGENTS = [
  {
    id: 'joromi-general',
    name: 'JoRoMi General Assistant',
    description: 'General purpose AI assistant for enterprise inquiries',
    greeting: 'Hello! I\'m JoRoMi, your AI Super Agent. I\'m here to help you with enterprise inquiries, technical support, and solution recommendations. How can I assist you today?'
  },
  {
    id: 'joromi-technical',
    name: 'JoRoMi Technical Support',
    description: 'Specialized technical support for TETRIX services',
    greeting: 'Hi! I\'m JoRoMi Technical Support. I can help you with technical issues, troubleshooting, and system optimization. What technical challenge can I help you solve?'
  },
  {
    id: 'joromi-sales',
    name: 'JoRoMi Sales Assistant',
    description: 'Sales and pricing information specialist',
    greeting: 'Welcome! I\'m JoRoMi Sales Assistant. I can provide detailed information about our enterprise solutions, pricing, and help you find the perfect plan for your business needs.'
  }
];

// GET /api/v1/joromi/sessions - List available agents or get specific session
export const GET: APIRoute = async ({ url }) => {
  try {
    const sessionId = url.searchParams.get('sessionId');
    
    if (sessionId) {
      // Get specific session
      const session = joromiSessions.get(sessionId);
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
    
    // Return available agents
    return new Response(JSON.stringify({
      success: true,
      agents: JOROMI_AGENTS
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error getting JoRoMi agents:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// POST /api/v1/joromi/sessions - Create new chat session
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { userId, agentId = 'joromi-general', channel = 'chat' } = body;
    
    if (!userId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'User ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Create session
    const sessionId = `joromi-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const agent = JOROMI_AGENTS.find(a => a.id === agentId);
    
    const session = {
      id: sessionId,
      userId,
      agentId,
      status: 'active',
      channel,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
      joromiAgent: agent
    };
    
    // Store session
    joromiSessions.set(sessionId, session);
    
    // Add greeting message
    if (agent) {
      const greetingMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: agent.greeting,
        timestamp: new Date().toISOString(),
        type: 'text'
      };
      
      session.messages.push(greetingMessage);
    }
    
    return new Response(JSON.stringify({
      success: true,
      session: session
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error creating JoRoMi session:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to create session'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
