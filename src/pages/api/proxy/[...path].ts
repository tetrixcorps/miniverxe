import type { APIRoute } from 'astro';

// Proxy API route to redirect authentication requests to production URL
// This ensures the custom domain works while using the production implementation
export const GET: APIRoute = async ({ request, params }) => {
  const { path } = params;
  const url = new URL(request.url);
  
  // Construct the production URL
  const productionUrl = `https://tetrix-minimal-uzzxn.ondigitalocean.app/api/${path?.join('/')}${url.search}`;
  
  console.log(`🔄 [PROXY] Redirecting GET request to: ${productionUrl}`);
  
  try {
    const response = await fetch(productionUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': request.headers.get('user-agent') || 'TetrixProxy/1.0',
        'Accept': request.headers.get('accept') || 'application/json',
      }
    });
    
    const data = await response.text();
    
    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  } catch (error) {
    console.error('❌ [PROXY] Error proxying request:', error);
    return new Response(JSON.stringify({ error: 'Proxy request failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request, params }) => {
  const { path } = params;
  const url = new URL(request.url);
  
  // Construct the production URL
  const productionUrl = `https://tetrix-minimal-uzzxn.ondigitalocean.app/api/${path?.join('/')}${url.search}`;
  
  console.log(`🔄 [PROXY] Redirecting POST request to: ${productionUrl}`);
  
  try {
    // Get the request body
    const body = await request.text();
    
    const response = await fetch(productionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': request.headers.get('content-type') || 'application/json',
        'User-Agent': request.headers.get('user-agent') || 'TetrixProxy/1.0',
        'Accept': request.headers.get('accept') || 'application/json',
      },
      body: body
    });
    
    const data = await response.text();
    
    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  } catch (error) {
    console.error('❌ [PROXY] Error proxying request:', error);
    return new Response(JSON.stringify({ error: 'Proxy request failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
};
