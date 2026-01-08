// IVR Admin API - Analytics
// Provides analytics data for IVR system

import type { APIRoute } from 'astro';
import { ivrAnalyticsService } from '@/services/ivr';

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const timeRange = (url.searchParams.get('timeRange') || '24h') as '1h' | '24h' | '7d' | '30d';
    const industry = url.searchParams.get('industry') || undefined;
    const format = url.searchParams.get('format') || 'json';

    const analytics = ivrAnalyticsService.getAnalytics(timeRange, industry);

    if (format === 'csv') {
      const csv = ivrAnalyticsService.exportAnalytics(timeRange, industry);
      return new Response(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="ivr-analytics-${timeRange}.csv"`
        }
      });
    }

    return new Response(JSON.stringify(analytics), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
