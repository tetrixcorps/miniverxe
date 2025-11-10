import type { APIRoute } from 'astro';
import { joromiSessions, JOROMI_AGENTS } from './storage';

// Handle OPTIONS for CORS preflight
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
};

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
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          }
        });
      }
      
      return new Response(JSON.stringify({
        success: true,
        session: session
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }
    
    // Return available agents
    return new Response(JSON.stringify({
      success: true,
      agents: JOROMI_AGENTS
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
    
  } catch (error) {
    console.error('Error getting JoRoMi agents:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
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
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
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
    console.log(`✅ [SESSIONS] Created session: ${sessionId}`);
    console.log(`📊 [SESSIONS] Storage size: ${joromiSessions.size}`);
    console.log(`📋 [SESSIONS] All sessions:`, Array.from(joromiSessions.keys()));
    
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
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
    
  } catch (error) {
    console.error('Error creating JoRoMi session:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to create session'
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }
};

