import type { APIRoute } from 'astro';
import { shangoStorage } from '../../../../services/shangoStorage';

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

// Use shared storage service

// Helper function to generate AI response
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

// GET /api/v1/shango/sessions - List available agents
export const GET: APIRoute = async ({ url }) => {
  try {
    const sessionId = url.searchParams.get('sessionId');
    
    if (sessionId) {
      // Get specific session
      const session = shangoStorage.getSession(sessionId);
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
      agents: SHANGO_AGENTS
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error getting SHANGO agents:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// POST /api/v1/shango/sessions - Create new chat session
export const POST: APIRoute = async ({ request }) => {
  try {
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
    
    // Create session in shared storage
    shangoStorage.createSession(session);
    
    // Add greeting message
    if (agent) {
      const greetingMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: agent.greeting,
        timestamp: new Date().toISOString(),
        type: 'text'
      };
      
      shangoStorage.addMessage(sessionId, greetingMessage);
    }
    
    return new Response(JSON.stringify({
      success: true,
      session: session
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error creating SHANGO session:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// PUT /api/v1/shango/sessions - Update session
export const PUT: APIRoute = async ({ request, url }) => {
  try {
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
    
    const session = sessions.get(sessionId);
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
    sessions.set(sessionId, session);
    
    return new Response(JSON.stringify({
      success: true,
      session: session
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error updating SHANGO session:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// DELETE /api/v1/shango/sessions - End session
export const DELETE: APIRoute = async ({ url }) => {
  try {
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
    
    const session = sessions.get(sessionId);
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
    sessions.set(sessionId, session);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Session ended successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error ending SHANGO session:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
