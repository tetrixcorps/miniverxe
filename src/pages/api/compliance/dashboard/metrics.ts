// Compliance Dashboard Metrics API
// Returns compliance metrics for enterprise dashboards

import type { APIRoute } from 'astro';
import { auditEvidenceService } from '@/services/compliance';
import { consentManagementService } from '@/services/compliance';
import { policyEngineService } from '@/services/compliance';

export const GET: APIRoute = async ({ request, url }) => {
  try {
    const tenantId = url.searchParams.get('tenantId') || 'default';
    const industry = url.searchParams.get('industry') || 'healthcare';

    // Calculate audit trail completeness
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const auditEvents = auditEvidenceService.searchEvents({
      tenantId,
      startDate: last24Hours
    });

    // Get total calls (would come from IVR analytics in production)
    const totalCalls = auditEvents.filter(e => 
      e.eventType === 'call.initiated'
    ).length;

    const auditTrailCompleteness = totalCalls > 0 
      ? Math.min(100, (auditEvents.length / (totalCalls * 5)) * 100) // Estimate 5 events per call
      : 100;

    // Calculate consent rate
    const consentEvents = auditEvents.filter(e => 
      e.eventType === 'consent.granted' || e.eventType === 'consent.denied'
    );
    const grantedConsents = consentEvents.filter(e => e.eventType === 'consent.granted').length;
    const consentRate = consentEvents.length > 0
      ? (grantedConsents / consentEvents.length) * 100
      : 100;

    // Calculate redaction coverage (would come from redaction logs in production)
    const redactionEvents = auditEvents.filter(e => 
      e.eventType === 'data.redacted'
    );
    const redactionCoverage = totalCalls > 0
      ? Math.min(100, (redactionEvents.length / totalCalls) * 100)
      : 100;

    // Calculate policy compliance
    const policyEvents = auditEvents.filter(e => 
      e.eventType === 'policy.evaluated' || e.eventType === 'policy.action_taken'
    );
    const violationEvents = auditEvents.filter(e => 
      e.eventType === 'compliance.violation'
    );
    const policyCompliance = policyEvents.length > 0
      ? Math.max(0, 100 - (violationEvents.length / policyEvents.length) * 100)
      : 100;

    // Recent violations (last 7 days)
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentViolations = auditEvidenceService.searchEvents({
      tenantId,
      eventType: 'compliance.violation',
      startDate: last7Days
    }).length;

    // Determine overall compliance status
    let complianceStatus: 'compliant' | 'warning' | 'non-compliant' = 'compliant';
    if (recentViolations > 0 || auditTrailCompleteness < 90 || policyCompliance < 95) {
      complianceStatus = 'non-compliant';
    } else if (auditTrailCompleteness < 95 || policyCompliance < 98 || consentRate < 80) {
      complianceStatus = 'warning';
    }

    // Get last audit date
    const lastAuditEvent = auditEvents
      .filter(e => e.eventType === 'policy.evaluated')
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

    const metrics = {
      auditTrailCompleteness: Math.round(auditTrailCompleteness),
      consentRate: Math.round(consentRate),
      redactionCoverage: Math.round(redactionCoverage),
      policyCompliance: Math.round(policyCompliance),
      recentViolations,
      lastAuditDate: lastAuditEvent?.timestamp.toISOString() || new Date().toISOString(),
      complianceStatus,
      totalCalls,
      totalAuditEvents: auditEvents.length
    };

    return new Response(JSON.stringify(metrics), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Compliance metrics error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
