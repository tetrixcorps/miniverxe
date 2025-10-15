import type { APIRoute } from 'astro';
import { shangoStorage } from '../../../../../../services/shangoStorage';
import { realSHANGOAIService } from '../../../../../../services/realSinchChatService';

// Helper function to generate AI response using SinchChatLive as primary with Ollama fallback
async function generateAIResponse(message: string, agentId: string = 'shango-general'): Promise<string> {
  try {
    // Try to use the real SinchChatLive service first
    const session = realSHANGOAIService.getCurrentSession();
    if (session) {
      try {
        const aiMessage = await realSHANGOAIService.sendSHANGOMessage(session.id, message, agentId);
        return aiMessage.content;
      } catch (sinchError) {
        console.log('SinchChatLive failed, falling back to Ollama:', sinchError);
        // Fall through to Ollama fallback
      }
    }
    
    // Fallback to Ollama
    const agent = realSHANGOAIService.getSHANGOAgents().find(a => a.id === agentId);
    const agentContext = agent ? `${agent.name}: ${agent.description}` : 'SHANGO AI Super Agent';
    
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen3:latest',
        prompt: `You are ${agentContext}. You are helping enterprise customers with their inquiries.

Context: Enterprise communication platform, technical support, sales, billing, and general assistance.

User message: ${message}

Please provide a helpful, professional response that addresses their inquiry. Be concise but informative.`,
        stream: false
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.response || 'I apologize, but I couldn\'t generate a response at this time.';
    } else {
      throw new Error('Ollama API error');
    }
  } catch (error) {
    console.error('Failed to generate AI response:', error);
    // Final fallback to hardcoded responses
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
  }
}

// GET /api/v1/shango/sessions/{sessionId}/messages - Get chat history
export const GET: APIRoute = async ({ params }) => {
  try {
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
    
    // Check if session exists
    const session = shangoStorage.getSession(sessionId);
    if (!session) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Session not found'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const sessionMessages = shangoStorage.getMessages(sessionId);
    
    return new Response(JSON.stringify({
      success: true,
      messages: sessionMessages
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error getting SHANGO messages:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// POST /api/v1/shango/sessions/{sessionId}/messages - Send message
export const POST: APIRoute = async ({ params, request }) => {
  try {
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
    
    // Check if session exists
    const session = shangoStorage.getSession(sessionId);
    if (!session) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Session not found'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Add user message
    const userMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
      type: 'text'
    };
    
    shangoStorage.addMessage(sessionId, userMessage);
    
    // Generate AI response using SinchChatLive primary with Ollama fallback
    const aiResponse = await generateAIResponse(message, agentId);
    
    // Create AI message
    const aiMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString(),
      type: 'text',
      agentId: agentId
    };
    
    // Add AI response to session messages immediately
    shangoStorage.addMessage(sessionId, aiMessage);
    
    return new Response(JSON.stringify({
      success: true,
      message: userMessage,
      aiResponse: aiMessage
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error sending SHANGO message:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
