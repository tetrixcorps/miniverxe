// Auth Lookup API Route
// Proxies to backend /api/v2/auth/lookup endpoint
import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const url = new URL(request.url);
  
  // Check if we should proxy to backend
  const isDocker = process.env.NODE_ENV === 'production' && process.env.DOCKER_ENV === 'true';
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
  
  // Always proxy to backend when BACKEND_URL is set or when in Docker
  if (process.env.BACKEND_URL || isDocker) {
    const targetUrl = isDocker 
      ? `http://tetrix-backend:3001/api/v2/auth/lookup${url.search}`
      : `${backendUrl}/api/v2/auth/lookup${url.search}`;
    
    console.log(`🔄 [${requestId}] Proxying auth lookup to backend: ${targetUrl}`);
    
    try {
      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': request.headers.get('user-agent') || 'TetrixAuthProxy/1.0',
          'Accept': 'application/json',
        }
      });
      
      const data = await response.text();
      
      return new Response(data, {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    } catch (error: any) {
      console.error(`❌ [${requestId}] Backend proxy failed:`, error);
      return new Response(JSON.stringify({
        success: false,
        error: 'Backend service unavailable',
        message: error.message || 'Failed to connect to backend',
        requestId
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  // Fallback: return error if backend URL is not configured
  return new Response(JSON.stringify({
    success: false,
    error: 'Backend URL not configured',
    message: 'Please set BACKEND_URL environment variable'
  }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' }
  });
};


