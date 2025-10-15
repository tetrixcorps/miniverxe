import type { APIRoute } from 'astro';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * JWKS (JSON Web Key Set) endpoint for Epic FHIR integration
 * Serves the public keys for JWT verification
 * 
 * Endpoints:
 * - Production: https://tetrixcorp.com/.well-known/jwks.json
 * - Development: https://dev.tetrixcorp.com/.well-known/jwks.json
 * - Staging: https://staging.tetrixcorp.com/.well-known/jwks.json
 */
export const GET: APIRoute = async ({ request }) => {
  try {
    console.log('🔑 JWKS endpoint accessed:', request.url);
    
    // Try to load static JWKS file first (for Epic FHIR integration)
    try {
      const jwksPath = join(process.cwd(), 'public', '.well-known', 'jwks.json');
      const jwksContent = readFileSync(jwksPath, 'utf8');
      const jwks = JSON.parse(jwksContent);
      
      console.log('✅ Static JWKS loaded successfully:', {
        keyCount: jwks.keys.length,
        keyIds: jwks.keys.map(k => k.kid)
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
      
    } catch (staticError) {
      console.log('⚠️ Static JWKS not found, falling back to error response');
      
      // Return error if static file not found
      return new Response(JSON.stringify({
        error: 'JWKS not available',
        message: 'Static JWKS file not found and dynamic generation not available'
      }), {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

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
