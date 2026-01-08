// OAuth Client Credentials Endpoint
// Initiates OAuth 2.0 Client Credentials Grant flow (server-to-server)

import type { APIRoute } from 'astro';
import { industryAuthService } from '../../../services/oauth';
import { getProviderConfig } from '../../../services/oauth/providerConfigs';
import { z } from 'zod';

const clientCredentialsSchema = z.object({
  provider: z.enum(['salesforce', 'hubspot', 'epic', 'cerner', 'shopify', 'clio', 'custom']),
  integrationId: z.string(),
  tenantId: z.string(),
  scopes: z.array(z.string()).optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = clientCredentialsSchema.parse(body);

    // Get provider configuration
    const config = getProviderConfig(validated.provider);

    // Initiate client credentials flow
    const result = await industryAuthService.initiateClientCredentialsFlow({
      tenantId: validated.tenantId,
      integrationId: validated.integrationId,
      config: {
        ...config,
        scopes: validated.scopes || config.scopes,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        integrationId: result.integrationId,
        message: 'Client credentials authentication successful',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Client credentials error:', error);
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: 'Invalid request', details: error.errors }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        error: 'Failed to authenticate with client credentials',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

