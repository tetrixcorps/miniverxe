// Clio OAuth Callback Endpoint
// Handles OAuth callback and exchanges authorization code for tokens

import type { APIRoute } from 'astro';
import { industryAuthService } from '../../../../services/oauth';
import { getProviderConfig } from '../../../../services/oauth/providerConfigs';

export const GET: APIRoute = async ({ request, url }) => {
  try {
    // Extract OAuth callback parameters
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');

    // Handle OAuth errors
    if (error) {
      return new Response(
        JSON.stringify({
          error: 'Clio OAuth authorization failed',
          details: errorDescription || error,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!code || !state) {
      return new Response(
        JSON.stringify({
          error: 'Missing required parameters',
          required: ['code', 'state'],
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Extract integration info from state or request
    const userId = request.headers.get('x-user-id') || url.searchParams.get('user_id') || '';
    const integrationId = url.searchParams.get('integration_id') || url.searchParams.get('state') || '';

    if (!userId || !integrationId) {
      return new Response(
        JSON.stringify({
          error: 'Missing user or integration information',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get Clio provider configuration
    const config = getProviderConfig('clio');

    // Handle OAuth callback
    const result = await industryAuthService.handleAuthorizationCallback({
      code,
      state,
      userId,
      integrationId,
      config,
    });

    // Redirect to success page or return JSON
    const redirectUrl = url.searchParams.get('redirect_uri') || '/dashboards/legal?clio_connected=true';
    
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${redirectUrl}&integration_id=${result.integrationId}`,
      },
    });
  } catch (error) {
    console.error('Clio OAuth callback error:', error);
    
    const redirectUrl = url.searchParams.get('redirect_uri') || '/dashboards/legal?error=clio_oauth_failed';
    
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${redirectUrl}&error_message=${encodeURIComponent(
          error instanceof Error ? error.message : 'Clio OAuth callback failed'
        )}`,
      },
    });
  }
};

