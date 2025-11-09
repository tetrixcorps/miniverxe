import type { APIRoute } from 'astro';
import { joromiSessionStore } from '../../../../../../../services/joromiSessionStore';
import { joromiCache } from '../../../../../../../services/joromiCache';
import { ollamaPool } from '../../../../../../../services/ollamaConnectionPool';
import { buildBackendContext } from '../../../../../../../services/joromiBackendDataService';

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
    const session = joromiSessionStore.get(sessionId);
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

    // Check cache first - if cached, return immediately without streaming
    const cachedResponse = joromiCache.get(message, agentId);
    if (cachedResponse) {
      return new Response(
        JSON.stringify({
          success: true,
          cached: true,
          aiResponse: {
            id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            role: 'assistant',
            content: cachedResponse,
            timestamp: new Date().toISOString(),
            type: 'text',
            agentId: agentId
          }
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' }
        }
      );
    }

    // Create a readable stream for Server-Sent Events
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        try {
          const agent = JOROMI_AGENTS.find((a: any) => a.id === agentId);
          const agentContext = agent ? `${agent.name}: ${agent.description}` : 'JoRoMi AI Super Agent';
          
          // Fetch real-time backend data to provide accurate information
          console.log('🔄 Fetching backend data for JoRoMi streaming context...');
          const backendContext = await buildBackendContext();
          
          const prompt = `You are ${agentContext}. You are helping enterprise customers with their inquiries.

${backendContext}

User message: ${message}

Please provide a helpful, professional response that addresses their inquiry using the real-time backend data provided above. Be concise but informative.`;

          // Call Ollama with streaming enabled
          const ollamaResponse = await ollamaPool.request('/api/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'qwen3:latest',
              prompt: prompt,
              stream: true, // Enable streaming
              options: {
                temperature: 0.7,
                top_p: 0.9,
                max_tokens: 500
              }
            })
          });

          if (!ollamaResponse.ok) {
            throw new Error('Ollama API error');
          }

          const reader = ollamaResponse.body?.getReader();
          const decoder = new TextDecoder();
          
          if (!reader) {
            throw new Error('No response body');
          }

          let fullResponse = '';
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              // Send final message
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ done: true, fullResponse })}\n\n`)
              );
              
              // Cache the full response
              joromiCache.set(message, agentId, fullResponse);
              
              controller.close();
              break;
            }

            // Decode the chunk
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep incomplete line in buffer

            for (const line of lines) {
              if (line.trim() === '') continue;

              try {
                const data = JSON.parse(line);
                
                if (data.response) {
                  fullResponse += data.response;
                  
                  // Send token chunk to client
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ token: data.response, done: false })}\n\n`)
                  );
                }
              } catch (e) {
                // Skip invalid JSON lines
                continue;
              }
            }
          }
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
