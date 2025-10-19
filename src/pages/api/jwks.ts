import type { APIRoute } from 'astro';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * JWKS (JSON Web Key Set) API endpoint for Epic FHIR integration
 * Alternative endpoint: /api/jwks
 */
export const GET: APIRoute = async ({ request }) => {
  try {
    console.log('🔑 JWKS API endpoint accessed:', request.url);
    
    // Load static JWKS file
    const jwksPath = join(process.cwd(), 'public', '.well-known', 'jwks.json');
    const jwksContent = readFileSync(jwksPath, 'utf8');
    const jwks = JSON.parse(jwksContent);
    
    console.log('✅ JWKS served successfully:', {
      keyCount: jwks.keys.length,
      keyIds: jwks.keys.map((k: any) => k.kid)
    });

    // Set appropriate headers for Epic FHIR
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    });

    return new Response(JSON.stringify(jwks, null, 2), {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('❌ Error serving JWKS:', error);
    
    return new Response(JSON.stringify({
      error: 'Failed to serve JWKS',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

// Handle OPTIONS for CORS
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
};
