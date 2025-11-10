import type { APIRoute } from 'astro';
import { joromiSessions } from '../../../storage';

// Import agent configuration
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

// Streaming endpoint for real-time token display
export const POST: APIRoute = async ({ params, request }) => {
  try {
    const { sessionId } = params;
    
    if (!sessionId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Session ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' }
      });
    }

    // Get session from shared store
    const session = joromiSessions.get(sessionId);
    if (!session) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Session not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' }
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
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' }
      });
    }

    // Note: Cache functionality removed - using simple streaming instead

    // Create a readable stream for Server-Sent Events
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        try {
          const agent = JOROMI_AGENTS.find((a: any) => a.id === agentId);
          const agentContext = agent ? `${agent.name}: ${agent.description}` : 'JoRoMi AI Super Agent';
          
          // Generate a simple response (Ollama integration removed for now)
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
          const fullResponse = agentResponses[Math.floor(Math.random() * agentResponses.length)] + ' ' + message;

          // Stream response word by word
          const words = fullResponse.split(' ');
          for (let i = 0; i < words.length; i++) {
            const word = words[i] + (i < words.length - 1 ? ' ' : '');
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ token: word, done: false })}\n\n`)
            );
            await new Promise(resolve => setTimeout(resolve, 50));
          }

          // Send final message
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ done: true, fullResponse })}\n\n`)
          );
          
          // Add AI message to session
          const aiMessage = {
            id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            role: 'assistant',
            content: fullResponse,
            timestamp: new Date().toISOString(),
            type: 'text',
            agentId: agentId
          };

          if (!session.messages) {
            session.messages = [];
          }
          session.messages.push(aiMessage);
          session.updatedAt = new Date().toISOString();
          
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: 'Failed to generate response', done: true })}\n\n`)
          );
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Expose-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    console.error('Error in streaming endpoint:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to start streaming'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' }
    });
  }
};

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
