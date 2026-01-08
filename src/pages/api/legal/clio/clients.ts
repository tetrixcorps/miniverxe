// Clio Clients API Endpoint
// Fetches clients from Clio API using OAuth tokens

import type { APIRoute } from 'astro';
import { industryAuthService } from '../../../../services/oauth';
import { LegalIntegrationFactory } from '../../../../services/integrations/LegalIntegrations';

export const GET: APIRoute = async ({ request }) => {
  try {
    // Get user ID from request
    const userId = request.headers.get('x-user-id') || 'anonymous';
    const integrationId = 'clio_legal_dashboard';
    
    if (userId === 'anonymous') {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get access token from OAuth service
    const accessToken = await industryAuthService.getAccessToken(userId, integrationId);
    
    // Create Clio integration (uses environment variables for credentials)
    const clioIntegration = LegalIntegrationFactory.createClioIntegration();
    clioIntegration['accessToken'] = accessToken; // Set token directly
    
    // Fetch clients from Clio
    const clients = await clioIntegration.getClients();
    
    return new Response(
      JSON.stringify({
        success: true,
        clients: clients,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Clio clients API error:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch Clio clients',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

