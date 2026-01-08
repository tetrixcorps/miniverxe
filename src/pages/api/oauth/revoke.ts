// OAuth Revoke Endpoint
// Revokes OAuth tokens for an integration

import type { APIRoute } from 'astro';
import { industryAuthService } from '../../../services/oauth';
import { z } from 'zod';

const revokeSchema = z.object({
  userId: z.string(),
  integrationId: z.string(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = revokeSchema.parse(body);

    // Revoke integration
    await industryAuthService.revokeIntegration(
      validated.userId,
      validated.integrationId
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Integration revoked successfully',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Revoke error:', error);
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: 'Invalid request', details: error.errors }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        error: 'Failed to revoke integration',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
