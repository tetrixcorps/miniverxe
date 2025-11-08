import type { APIRoute } from 'astro';
import { joromiSessions } from '../../storage';

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

// POST /api/v1/joromi/sessions/[sessionId]/stream - Stream message response
export const POST: APIRoute = async ({ params, request }) => {
  try {
    const { sessionId } = params;
    
    if (!sessionId) {
      return new Response('Session ID is required', { status: 400 });
    }

    const session = joromiSessions.get(sessionId);
    if (!session) {
      return new Response('Session not found', { status: 404 });
    }

    const body = await request.json();
    const { message, role = 'user', agentId = session.agentId } = body;

    if (!message) {
      return new Response('Message is required', { status: 400 });
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

    // Generate full AI response
    const fullResponse = generateJoRoMiResponse(message, agentId);
    
    // Create streaming response using Server-Sent Events (SSE)
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        // Send start event
        controller.enqueue(encoder.encode(`event: start\ndata: ${JSON.stringify({ messageId: userMessage.id })}\n\n`));
        
        // Stream response word by word to simulate real-time streaming
        const words = fullResponse.split(' ');
        let streamedContent = '';
        
        for (let i = 0; i < words.length; i++) {
          streamedContent += (i > 0 ? ' ' : '') + words[i];
          
          // Send chunk event
          controller.enqueue(encoder.encode(`event: chunk\ndata: ${JSON.stringify({ 
            content: words[i] + (i < words.length - 1 ? ' ' : ''),
            messageId: userMessage.id
          })}\n\n`));
          
          // Small delay to simulate streaming
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        // Create final AI message
        const aiMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          role: 'assistant',
          content: fullResponse,
          timestamp: new Date().toISOString(),
          type: 'text',
          agentId: agentId
        };

        session.messages.push(aiMessage);
        session.updatedAt = new Date().toISOString();
        
        // Send complete event
        controller.enqueue(encoder.encode(`event: complete\ndata: ${JSON.stringify({ 
          message: aiMessage,
          session: session
        })}\n\n`));
        
        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable nginx buffering
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Expose-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    console.error('Error streaming JoRoMi message:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to stream message',
      success: false
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

