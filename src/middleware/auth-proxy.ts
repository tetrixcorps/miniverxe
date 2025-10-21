import type { MiddlewareHandler } from 'astro';

// Middleware to proxy authentication requests to production URL
// This ensures seamless authentication flow on custom domain
export const onRequest: MiddlewareHandler = async (context, next) => {
  const { request, url } = context;
  
  // Check if this is an authentication-related request
  const isAuthRequest = url.pathname.startsWith('/api/v2/2fa/') || 
                       url.pathname.startsWith('/api/v2/industry-auth/') ||
                       url.pathname.startsWith('/dashboards/') ||
                       url.pathname.includes('IndustryAuth.astro') ||
                       url.pathname.includes('2FAModal.astro') ||
                       url.pathname.includes('header-auth.js');
  
  if (isAuthRequest) {
    console.log(`🔄 [AUTH-PROXY] Proxying authentication request: ${url.pathname}`);
    
    // Construct the production URL
    const productionUrl = `https://tetrix-minimal-uzzxn.ondigitalocean.app${url.pathname}${url.search}`;
    
    try {
      // For API requests, proxy to production
      if (url.pathname.startsWith('/api/')) {
        const method = request.method;
        const headers: HeadersInit = {
          'Content-Type': request.headers.get('content-type') || 'application/json',
          'User-Agent': request.headers.get('user-agent') || 'TetrixAuthProxy/1.0',
          'Accept': request.headers.get('accept') || 'application/json',
        };
        
        let body: string | undefined;
        if (method !== 'GET' && method !== 'HEAD') {
          body = await request.text();
        }
        
        const response = await fetch(productionUrl, {
          method,
          headers,
          body
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
      }
      
      // For dashboard requests, redirect to production
      if (url.pathname.startsWith('/dashboards/')) {
        return Response.redirect(productionUrl, 302);
      }
      
      // For asset requests, proxy to production
      if (url.pathname.includes('.js') || url.pathname.includes('.css')) {
        const response = await fetch(productionUrl);
        const data = await response.text();
        
        return new Response(data, {
          status: response.status,
          headers: {
            'Content-Type': response.headers.get('content-type') || 'application/javascript',
            'Cache-Control': 'public, max-age=31536000',
          }
        });
      }
      
    } catch (error) {
      console.error('❌ [AUTH-PROXY] Error proxying request:', error);
      return new Response(JSON.stringify({ error: 'Authentication proxy failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  // Continue with normal request processing
  return next();
};
