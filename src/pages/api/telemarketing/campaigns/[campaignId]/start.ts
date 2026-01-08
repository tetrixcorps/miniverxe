// Start Campaign API
import type { APIRoute } from 'astro';
import { campaignManagementService } from '../../../../../services/telemarketing/campaignManagementService';

export const POST: APIRoute = async ({ request, params }) => {
  try {
    const campaignId = params.campaignId || '';
    const body = await request.json();
    const { tenantId } = body;

    if (!tenantId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required field: tenantId'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await campaignManagementService.startCampaign(tenantId, campaignId);

    return new Response(JSON.stringify({
      success: result.success,
      message: result.message
    }), {
      status: result.success ? 200 : 400,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Campaign start error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
