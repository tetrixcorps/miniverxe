import type { APIRoute } from 'astro';
import { enterprise2FAService } from '../../../../services/enterprise2FAService';

// Get audit logs endpoint for security monitoring
export const GET: APIRoute = async ({ url, request }) => {
  try {
    const phoneNumber = url.searchParams.get('phoneNumber');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Check authorization (in production, implement proper auth)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return createErrorResponse('Authorization required', 401);
    }

    if (!phoneNumber) {
      return createErrorResponse('phoneNumber parameter is required', 400);
    }

    const auditLogs = enterprise2FAService.getAuditLogs(phoneNumber);
    
    // Apply pagination
    const paginatedLogs = auditLogs.slice(offset, offset + limit);
    
    // Calculate risk score based on recent activity
    const riskScore = calculateRiskScore(auditLogs);
    const riskLevel = getRiskLevel(riskScore);

    return createSuccessResponse({
      data: {
        phoneNumber,
        auditLogs: paginatedLogs,
        pagination: {
          total: auditLogs.length,
          limit,
          offset,
          hasMore: offset + limit < auditLogs.length
        },
        riskAssessment: {
          score: riskScore,
          level: riskLevel,
          recommendations: getRiskRecommendations(riskLevel)
        }
      }
    });

  } catch (error) {
    console.error('Get audit logs failed:', error);
    return createErrorResponse(
      'Failed to get audit logs',
      500,
      { 
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    );
  }
};

// Calculate risk score based on audit logs
function calculateRiskScore(logs: any[]): number {
  let score = 0;
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  const oneDay = 24 * oneHour;

  // Recent failed attempts
  const recentFailures = logs.filter(log => 
    log.status === 'failed' && 
    (now - new Date(log.timestamp).getTime()) < oneHour
  ).length;
  score += recentFailures * 0.2;

  // Multiple attempts in short time
  const rapidAttempts = logs.filter(log => 
    (now - new Date(log.timestamp).getTime()) < 5 * 60 * 1000 // 5 minutes
  ).length;
  if (rapidAttempts > 3) {
    score += 0.3;
  }

  // Blocked attempts
  const blockedAttempts = logs.filter(log => log.status === 'blocked').length;
  score += blockedAttempts * 0.4;

  // High fraud scores
  const highFraudAttempts = logs.filter(log => 
    log.fraudScore && log.fraudScore > 0.7
  ).length;
  score += highFraudAttempts * 0.3;

  return Math.min(score, 1.0);
}

function getRiskLevel(score: number): string {
  if (score >= 0.8) return 'high';
  if (score >= 0.5) return 'medium';
  return 'low';
}

function getRiskRecommendations(level: string): string[] {
  switch (level) {
    case 'high':
      return [
        'Consider blocking this phone number temporarily',
        'Implement additional verification steps',
        'Monitor for suspicious patterns',
        'Review recent activity logs'
      ];
    case 'medium':
      return [
        'Monitor for additional suspicious activity',
        'Consider implementing rate limiting',
        'Review user behavior patterns'
      ];
    default:
      return [
        'Continue normal monitoring',
        'No immediate action required'
      ];
  }
}

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
