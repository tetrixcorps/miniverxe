// Compliance Reports Export API
// Exports compliance reports for enterprise dashboards

import type { APIRoute } from 'astro';
import { auditEvidenceService } from '@/services/compliance';
import { consentManagementService } from '@/services/compliance';

export const GET: APIRoute = async ({ request, url }) => {
  try {
    const tenantId = url.searchParams.get('tenantId') || 'default';
    const industry = url.searchParams.get('industry') || 'healthcare';
    const format = url.searchParams.get('format') || 'json'; // json, csv, pdf
    const reportType = url.searchParams.get('type') || 'full'; // full, audit, consent, violations
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: last 30 days
    const end = endDate ? new Date(endDate) : new Date();

    let report: any = {};

    switch (reportType) {
      case 'audit':
        report = await generateAuditReport(tenantId, start, end);
        break;
      case 'consent':
        report = await generateConsentReport(tenantId, start, end);
        break;
      case 'violations':
        report = await generateViolationsReport(tenantId, start, end);
        break;
      case 'full':
      default:
        report = await generateFullReport(tenantId, industry, start, end);
        break;
    }

    // Log report export
    await auditEvidenceService.logEvent({
      tenantId,
      callId: `report_${Date.now()}`,
      eventType: 'data.exported',
      eventData: {
        reportType,
        format,
        startDate: start.toISOString(),
        endDate: end.toISOString()
      }
    });

    if (format === 'csv') {
      return new Response(convertToCSV(report), {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="compliance-report-${tenantId}-${Date.now()}.csv"`
        }
      });
    }

    if (format === 'pdf') {
      // In production, use a PDF generation library
      return new Response(JSON.stringify({ error: 'PDF export not yet implemented' }), {
        status: 501,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(report, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="compliance-report-${tenantId}-${Date.now()}.json"`
      }
    });
  } catch (error: any) {
    console.error('Compliance report export error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

async function generateFullReport(tenantId: string, industry: string, start: Date, end: Date) {
  const auditEvents = auditEvidenceService.searchEvents({
    tenantId,
    startDate: start,
    endDate: end
  });

  const consents = consentManagementService.getConsentsForTenant(tenantId)
    .filter(c => c.createdAt >= start && c.createdAt <= end);

  const violations = auditEvents.filter(e => e.eventType === 'compliance.violation');
  const calls = auditEvents.filter(e => e.eventType === 'call.initiated');
  const consentEvents = auditEvents.filter(e => 
    e.eventType === 'consent.granted' || e.eventType === 'consent.denied'
  );

  return {
    reportType: 'full',
    tenantId,
    industry,
    period: {
      start: start.toISOString(),
      end: end.toISOString()
    },
    summary: {
      totalCalls: calls.length,
      totalAuditEvents: auditEvents.length,
      totalConsents: consents.length,
      violations: violations.length,
      consentRate: consentEvents.length > 0
        ? (consentEvents.filter(e => e.eventType === 'consent.granted').length / consentEvents.length) * 100
        : 100
    },
    auditTrail: auditEvents.map(e => ({
      logId: e.logId,
      timestamp: e.timestamp.toISOString(),
      eventType: e.eventType,
      callId: e.callId
    })),
    consents: consents.map(c => ({
      consentId: c.consentId,
      customerId: c.customerId,
      consentType: c.consentType,
      granted: c.granted,
      grantedAt: c.grantedAt?.toISOString(),
      revokedAt: c.revokedAt?.toISOString()
    })),
    violations: violations.map(v => ({
      logId: v.logId,
      timestamp: v.timestamp.toISOString(),
      callId: v.callId,
      eventData: v.eventData
    }))
  };
}

async function generateAuditReport(tenantId: string, start: Date, end: Date) {
  const auditEvents = auditEvidenceService.searchEvents({
    tenantId,
    startDate: start,
    endDate: end
  });

  return {
    reportType: 'audit',
    tenantId,
    period: {
      start: start.toISOString(),
      end: end.toISOString()
    },
    totalEvents: auditEvents.length,
    events: auditEvents.map(e => ({
      logId: e.logId,
      timestamp: e.timestamp.toISOString(),
      eventType: e.eventType,
      callId: e.callId,
      eventHash: e.eventHash
    }))
  };
}

async function generateConsentReport(tenantId: string, start: Date, end: Date) {
  const consents = consentManagementService.getConsentsForTenant(tenantId)
    .filter(c => c.createdAt >= start && c.createdAt <= end);

  return {
    reportType: 'consent',
    tenantId,
    period: {
      start: start.toISOString(),
      end: end.toISOString()
    },
    totalConsents: consents.length,
    granted: consents.filter(c => c.granted).length,
    revoked: consents.filter(c => c.revokedAt).length,
    consents: consents.map(c => ({
      consentId: c.consentId,
      customerId: c.customerId,
      consentType: c.consentType,
      channel: c.channel,
      granted: c.granted,
      grantedAt: c.grantedAt?.toISOString(),
      revokedAt: c.revokedAt?.toISOString()
    }))
  };
}

async function generateViolationsReport(tenantId: string, start: Date, end: Date) {
  const violations = auditEvidenceService.searchEvents({
    tenantId,
    eventType: 'compliance.violation',
    startDate: start,
    endDate: end
  });

  return {
    reportType: 'violations',
    tenantId,
    period: {
      start: start.toISOString(),
      end: end.toISOString()
    },
    totalViolations: violations.length,
    violations: violations.map(v => ({
      logId: v.logId,
      timestamp: v.timestamp.toISOString(),
      callId: v.callId,
      eventData: v.eventData
    }))
  };
}

function convertToCSV(report: any): string {
  // Simple CSV conversion - in production, use a proper CSV library
  if (report.reportType === 'audit') {
    const lines = ['Log ID,Timestamp,Event Type,Call ID,Event Hash'];
    for (const event of report.events) {
      lines.push([
        event.logId || '',
        event.timestamp || '',
        event.eventType || '',
        event.callId || '',
        event.eventHash || ''
      ].join(','));
    }
    return lines.join('\n');
  }

  // Default: return JSON as CSV isn't straightforward for nested objects
  return JSON.stringify(report);
}
