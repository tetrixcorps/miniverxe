// Create Campaign API
import type { APIRoute } from 'astro';
import { campaignManagementService } from '../../../../services/telemarketing/campaignManagementService';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { tenantId, name, description, contactListId, dialerMode, script, outcomeTags, timezoneBasedCalling, dncCheck, recordingEnabled, targetAgents, maxCallsPerContact, retrySettings, scheduledStartTime, scheduledEndTime } = body;

    if (!tenantId || !name || !contactListId || !dialerMode) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: tenantId, name, contactListId, dialerMode'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const campaign = await campaignManagementService.createCampaign(tenantId, {
      name,
      description,
      contactListId,
      dialerMode,
      script,
      outcomeTags: outcomeTags || ['answered', 'voicemail', 'no_answer', 'busy', 'callback'],
      timezoneBasedCalling: timezoneBasedCalling !== false,
      dncCheck: dncCheck !== false,
      recordingEnabled: recordingEnabled !== false,
      targetAgents,
      maxCallsPerContact,
      retrySettings,
      scheduledStartTime: scheduledStartTime ? new Date(scheduledStartTime) : undefined,
      scheduledEndTime: scheduledEndTime ? new Date(scheduledEndTime) : undefined
    });

    return new Response(JSON.stringify({
      success: true,
      campaign: {
        campaignId: campaign.campaignId,
        name: campaign.name,
        status: campaign.status,
        dialerMode: campaign.dialerMode
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Campaign creation error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
