import type { APIRoute } from 'astro';

// Mock session storage (in production, use a database)
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

// Generate AI response based on message and agent
function generateJoRoMiResponse(message: string, agentId: string = 'joromi-general'): string {
  const responses = {
    'joromi-general': [
      "I understand your inquiry about our enterprise services. Let me help you with that.",
      "Based on your question, here's what I can tell you about TETRIX:",
      "Our enterprise communication platform offers several solutions:",
      "For your specific needs, I recommend:",
      "I can connect you with our team for:",
      "Here's how TETRIX can help your enterprise:"
    ],
    'joromi-technical': [
      "I can help you troubleshoot that technical issue.",
      "Let me provide you with a technical solution:",
      "For this technical challenge, I recommend:",
      "Here's how to resolve this:",
      "I can guide you through the technical setup:",
      "Let me explain the technical details:"
    ],
    'joromi-sales': [
      "I'd be happy to provide you with pricing information.",
      "Let me explain our enterprise plans:",
      "For your business size, I recommend:",
      "Here are our current pricing options:",
      "I can help you find the perfect plan:",
      "Let me show you the value of our solutions:"
    ]
  };

  const agentResponses = responses[agentId as keyof typeof responses] || responses['joromi-general'];
  return agentResponses[Math.floor(Math.random() * agentResponses.length)];
}

// GET /api/v1/joromi/sessions/[sessionId]/messages - Get session messages
export const GET: APIRoute = async ({ params }) => {
  try {
    const { sessionId } = params;
    
    if (!sessionId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Session ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

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
      messages: session.messages
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error getting JoRoMi messages:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to get messages'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// POST /api/v1/joromi/sessions/[sessionId]/messages - Send message to JoRoMi
export const POST: APIRoute = async ({ params, request }) => {
  try {
    const { sessionId } = params;
    
    if (!sessionId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Session ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

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

    const body = await request.json();
    const { message, role = 'user', agentId = session.agentId } = body;

    if (!message) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Message is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Add user message
    const userMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role: role,
      content: message,
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    session.messages.push(userMessage);

    // Generate AI response
    const aiResponse = generateJoRoMiResponse(message, agentId);
    
    const aiMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString(),
      type: 'text',
      agentId: agentId
    };

    session.messages.push(aiMessage);
    session.updatedAt = new Date().toISOString();

    return new Response(JSON.stringify({
      success: true,
      aiResponse: aiMessage,
      session: session
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error sending JoRoMi message:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to send message'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
