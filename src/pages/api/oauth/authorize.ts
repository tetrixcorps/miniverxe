// OAuth Authorization Endpoint
// Initiates OAuth 2.0 Authorization Code Grant flow

import type { APIRoute } from 'astro';
import { industryAuthService } from '../../../services/oauth';
import { getProviderConfig } from '../../../services/oauth/providerConfigs';
import { z } from 'zod';

const authorizeSchema = z.object({
  provider: z.enum(['salesforce', 'hubspot', 'epic', 'cerner', 'shopify', 'clio', 'custom']),
  integrationId: z.string(),
  scopes: z.array(z.string()).optional(),
  state: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = authorizeSchema.parse(body);

    // Get user ID from session/auth (implement based on your auth system)
    const userId = request.headers.get('x-user-id') || 'anonymous';
    
    if (userId === 'anonymous') {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get provider configuration
    const config = getProviderConfig(validated.provider);

    // Initiate OAuth flow
    const result = await industryAuthService.initiateAuthorizationCodeFlow({
      userId,
      integrationId: validated.integrationId,
      config: {
        ...config,
        scopes: validated.scopes || config.scopes,
      },
      state: validated.state,
    });

    return new Response(
      JSON.stringify({
        success: true,
        authorizationUrl: result.authorizationUrl,
        state: result.state,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('OAuth authorization error:', error);
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: 'Invalid request', details: error.errors }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        error: 'Failed to initiate OAuth flow',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

