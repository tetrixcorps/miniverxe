import type { APIRoute } from 'astro';
import { enterprise2FAService } from '../../../../services/enterprise2FAService';

// Get verification status endpoint
export const GET: APIRoute = async ({ url }) => {
  try {
    const verificationId = url.searchParams.get('verificationId');
    const phoneNumber = url.searchParams.get('phoneNumber');

    if (!verificationId) {
      return createErrorResponse('verificationId parameter is required', 400);
    }

    const status = await enterprise2FAService.getVerificationStatus(verificationId);

    if (!status) {
      return createErrorResponse('Verification not found', 404);
    }

    return createSuccessResponse({
      data: status
    });

  } catch (error) {
    console.error('Get verification status failed:', error);
    return createErrorResponse(
      'Failed to get verification status',
      500,
      { 
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    );
  }
};

// Helper functions
function createErrorResponse(message: string, status: number, details?: any) {
  return new Response(JSON.stringify({
    success: false,
    error: message,
    status,
    details,
    timestamp: new Date().toISOString()
  }), {
    status,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

function createSuccessResponse(data: any) {
  return new Response(JSON.stringify({
    success: true,
    ...data,
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
