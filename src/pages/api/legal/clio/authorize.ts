// Clio OAuth Authorization Endpoint
// Initiates OAuth 2.0 flow for Clio integration

import type { APIRoute } from 'astro';
import { industryAuthService } from '../../../../services/oauth';
import { getProviderConfig } from '../../../../services/oauth/providerConfigs';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const integrationId = body.integrationId || `clio_${Date.now()}`;
    
    // Get user ID from session/auth (implement based on your auth system)
    const userId = request.headers.get('x-user-id') || body.userId || 'anonymous';
    
    if (userId === 'anonymous') {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get Clio provider configuration (uses environment variables)
    const config = getProviderConfig('clio');

    // Initiate OAuth flow
    const result = await industryAuthService.initiateAuthorizationCodeFlow({
      userId,
      integrationId,
      config,
    });

    return new Response(
      JSON.stringify({
        success: true,
        authorizationUrl: result.authorizationUrl,
        state: result.state,
        integrationId,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Clio OAuth authorization error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to initiate Clio OAuth flow',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

