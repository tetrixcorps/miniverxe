// Simple test API endpoint to debug request handling

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('=== TEST API DEBUG ===');
    console.log('Request method:', request.method);
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    
    // Try to get the raw body
    const text = await request.text();
    console.log('Raw body text:', text);
    console.log('Body length:', text.length);
    
    // Try to parse as JSON
    let jsonBody;
    try {
      jsonBody = JSON.parse(text);
      console.log('Parsed JSON:', jsonBody);
    } catch (e) {
      console.log('JSON parse error:', e);
    }
    
    return new Response(JSON.stringify({
      success: true,
      method: request.method,
      contentType: request.headers.get('content-type'),
      bodyLength: text.length,
      bodyText: text,
      parsedJson: jsonBody
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error('Test API error:', error);
    return new Response(JSON.stringify({
      error: 'Test API failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
