// Get Campaign Metrics API
import type { APIRoute } from 'astro';
import { campaignManagementService } from '../../../../../services/telemarketing/campaignManagementService';

export const GET: APIRoute = async ({ params }) => {
  try {
    const campaignId = params.campaignId || '';

    if (!campaignId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing campaignId'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const metrics = campaignManagementService.getLiveMetrics(campaignId);

    // Convert Map to object for JSON serialization
    const outcomesObj: Record<string, number> = {};
    metrics.outcomes.forEach((value, key) => {
      outcomesObj[key] = value;
    });

    return new Response(JSON.stringify({
      success: true,
      metrics: {
        ...metrics,
        outcomes: outcomesObj,
        startTime: metrics.startTime?.toISOString(),
        lastUpdateTime: metrics.lastUpdateTime.toISOString(),
        estimatedCompletionTime: metrics.estimatedCompletionTime?.toISOString()
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Get metrics error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
