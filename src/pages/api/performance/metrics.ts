// Performance Metrics API Endpoint
// Collects and stores performance metrics from the application

import type { APIRoute } from 'astro';

interface PerformanceMetric {
  id: string;
  name: string;
  type: 'api' | 'user_action' | 'component_render' | 'navigation';
  startTime: number;
  endTime?: number;
  duration?: number;
  status?: 'success' | 'error' | 'timeout';
  metadata?: Record<string, any>;
  error?: string;
}

interface PerformanceMetricsRequest {
  metrics: PerformanceMetric[];
  timestamp: string;
  userAgent: string;
  url: string;
}

interface PerformanceMetricsResponse {
  success: boolean;
  message: string;
  processedCount: number;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const data: PerformanceMetricsRequest = await request.json();
    
    // Validate required fields
    if (!data.metrics || !Array.isArray(data.metrics)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid metrics data'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Process metrics
    const processedMetrics = data.metrics.map(metric => ({
      ...metric,
      receivedAt: new Date().toISOString(),
      sessionId: generateSessionId(),
      userAgent: data.userAgent,
      url: data.url
    }));

    // Log metrics (in production, you would store this in a database)
    console.log(`Received ${processedMetrics.length} performance metrics:`, {
      timestamp: data.timestamp,
      url: data.url,
      metrics: processedMetrics.map(m => ({
        id: m.id,
        name: m.name,
        type: m.type,
        duration: m.duration,
        status: m.status
      }))
    });

    // In a real application, you would:
    // 1. Store metrics in a time-series database (InfluxDB, TimescaleDB, etc.)
    // 2. Aggregate metrics for dashboards
    // 3. Set up alerts for performance degradation
    // 4. Generate performance reports

    // Example: Store in database
    // await db.performanceMetrics.createMany({
    //   data: processedMetrics.map(metric => ({
    //     id: metric.id,
    //     name: metric.name,
    //     type: metric.type,
    //     startTime: new Date(metric.startTime),
    //     endTime: metric.endTime ? new Date(metric.endTime) : null,
    //     duration: metric.duration,
    //     status: metric.status,
    //     metadata: metric.metadata,
    //     error: metric.error,
    //     receivedAt: new Date(metric.receivedAt),
    //     sessionId: metric.sessionId,
    //     userAgent: metric.userAgent,
    //     url: metric.url
    //   }))
    // });

    // Example: Send to analytics service
    if (process.env.ANALYTICS_ENDPOINT) {
      try {
        await fetch(process.env.ANALYTICS_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.ANALYTICS_API_KEY}`
          },
          body: JSON.stringify({
            event: 'performance_metrics',
            data: processedMetrics,
            timestamp: data.timestamp
          })
        });
      } catch (analyticsError) {
        console.error('Failed to send to analytics service:', analyticsError);
      }
    }

    // Example: Check for performance alerts
    await checkPerformanceAlerts(processedMetrics);

    const response: PerformanceMetricsResponse = {
      success: true,
      message: 'Performance metrics received successfully',
      processedCount: processedMetrics.length
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error processing performance metrics:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to process performance metrics',
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Generate session ID
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Check for performance alerts
async function checkPerformanceAlerts(metrics: PerformanceMetric[]): Promise<void> {
  // Check for slow API calls
  const slowAPIs = metrics.filter(m => 
    m.type === 'api' && 
    m.duration && 
    m.duration > 5000 // 5 seconds
  );

  if (slowAPIs.length > 0) {
    console.warn('Slow API calls detected:', slowAPIs.map(m => ({
      name: m.name,
      duration: m.duration,
      metadata: m.metadata
    })));
  }

  // Check for high error rates
  const errorMetrics = metrics.filter(m => m.status === 'error');
  const errorRate = errorMetrics.length / metrics.length;
  
  if (errorRate > 0.1) { // 10% error rate
    console.warn('High error rate detected:', {
      errorRate: (errorRate * 100).toFixed(2) + '%',
      errorCount: errorMetrics.length,
      totalCount: metrics.length
    });
  }

  // Check for slow component renders
  const slowComponents = metrics.filter(m => 
    m.type === 'component_render' && 
    m.duration && 
    m.duration > 1000 // 1 second
  );

  if (slowComponents.length > 0) {
    console.warn('Slow component renders detected:', slowComponents.map(m => ({
      name: m.name,
      duration: m.duration,
      metadata: m.metadata
    })));
  }
}
