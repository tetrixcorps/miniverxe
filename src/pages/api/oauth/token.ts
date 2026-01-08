// OAuth Token Endpoint
// Retrieves access token for an integration (with automatic refresh if needed)

import type { APIRoute } from 'astro';
import { industryAuthService } from '../../../services/oauth';
import { z } from 'zod';

const tokenSchema = z.object({
  userId: z.string(),
  integrationId: z.string(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = tokenSchema.parse(body);

    // Get access token (with automatic refresh if needed)
    const accessToken = await industryAuthService.getAccessToken(
      validated.userId,
      validated.integrationId
    );

    return new Response(
      JSON.stringify({
        success: true,
        accessToken,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Token retrieval error:', error);
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: 'Invalid request', details: error.errors }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        error: 'Failed to retrieve access token',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
