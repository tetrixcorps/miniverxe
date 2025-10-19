// Performance Monitoring Service
// Tracks API call performance, user interactions, and system metrics

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

interface APICallMetric extends PerformanceMetric {
  type: 'api';
  url: string;
  method: string;
  statusCode?: number;
  responseSize?: number;
  retryCount?: number;
}

interface UserActionMetric extends PerformanceMetric {
  type: 'user_action';
  action: string;
  element?: string;
  page?: string;
}

interface ComponentRenderMetric extends PerformanceMetric {
  type: 'component_render';
  componentName: string;
  props?: Record<string, any>;
}

interface NavigationMetric extends PerformanceMetric {
  type: 'navigation';
  from: string;
  to: string;
  trigger: 'user' | 'programmatic' | 'browser';
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private activeMetrics: Map<string, PerformanceMetric> = new Map();
  private maxMetrics = 1000; // Keep only last 1000 metrics
  private isEnabled = true;
  private batchSize = 10;
  private flushInterval = 30000; // 30 seconds
  private flushTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.startFlushTimer();
    this.setupGlobalErrorHandling();
  }

  // Start tracking a metric
  startMetric(
    name: string,
    type: PerformanceMetric['type'],
    metadata?: Record<string, any>
  ): string {
    if (!this.isEnabled) return '';

    const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const metric: PerformanceMetric = {
      id,
      name,
      type,
      startTime: performance.now(),
      metadata
    };

    this.activeMetrics.set(id, metric);
    return id;
  }

  // End tracking a metric
  endMetric(
    id: string,
    status: 'success' | 'error' | 'timeout' = 'success',
    error?: string,
    additionalMetadata?: Record<string, any>
  ): void {
    if (!this.isEnabled) return;

    const metric = this.activeMetrics.get(id);
    if (!metric) return;

    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;
    metric.status = status;
    if (error) metric.error = error;
    if (additionalMetadata) {
      metric.metadata = { ...metric.metadata, ...additionalMetadata };
    }

    this.activeMetrics.delete(id);
    this.addMetric(metric);
  }

  // Track API call
  trackAPICall(
    url: string,
    method: string,
    metadata?: Record<string, any>
  ): string {
    const id = this.startMetric(`API ${method} ${url}`, 'api', {
      url,
      method,
      ...metadata
    });
    return id;
  }

  // Complete API call tracking
  completeAPICall(
    id: string,
    statusCode: number,
    responseSize?: number,
    status: 'success' | 'error' | 'timeout' = 'success',
    error?: string
  ): void {
    const metric = this.activeMetrics.get(id);
    if (metric && metric.type === 'api') {
      const apiMetric = metric as APICallMetric;
      apiMetric.statusCode = statusCode;
      apiMetric.responseSize = responseSize;
      this.endMetric(id, status, error, { statusCode, responseSize });
    }
  }

  // Track user action
  trackUserAction(
    action: string,
    element?: string,
    page?: string,
    metadata?: Record<string, any>
  ): string {
    const id = this.startMetric(`User Action: ${action}`, 'user_action', {
      action,
      element,
      page,
      ...metadata
    });
    return id;
  }

  // Complete user action tracking
  completeUserAction(id: string, status: 'success' | 'error' = 'success', error?: string): void {
    this.endMetric(id, status, error);
  }

  // Track component render
  trackComponentRender(
    componentName: string,
    props?: Record<string, any>,
    metadata?: Record<string, any>
  ): string {
    const id = this.startMetric(`Component Render: ${componentName}`, 'component_render', {
      componentName,
      props,
      ...metadata
    });
    return id;
  }

  // Complete component render tracking
  completeComponentRender(id: string, status: 'success' | 'error' = 'success', error?: string): void {
    this.endMetric(id, status, error);
  }

  // Track navigation
  trackNavigation(
    from: string,
    to: string,
    trigger: 'user' | 'programmatic' | 'browser' = 'user',
    metadata?: Record<string, any>
  ): string {
    const id = this.startMetric(`Navigation: ${from} → ${to}`, 'navigation', {
      from,
      to,
      trigger,
      ...metadata
    });
    return id;
  }

  // Complete navigation tracking
  completeNavigation(id: string, status: 'success' | 'error' = 'success', error?: string): void {
    this.endMetric(id, status, error);
  }

  // Add metric to collection
  private addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Keep only the last maxMetrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Check if we should flush
    if (this.metrics.length >= this.batchSize) {
      this.flushMetrics();
    }
  }

  // Get performance summary
  getPerformanceSummary(): {
    totalMetrics: number;
    averageAPIDuration: number;
    averageComponentRenderDuration: number;
    errorRate: number;
    slowestAPIs: APICallMetric[];
    slowestComponents: ComponentRenderMetric[];
  } {
    const apiMetrics = this.metrics.filter(m => m.type === 'api') as APICallMetric[];
    const componentMetrics = this.metrics.filter(m => m.type === 'component_render') as ComponentRenderMetric[];
    
    const averageAPIDuration = apiMetrics.length > 0 
      ? apiMetrics.reduce((sum, m) => sum + (m.duration || 0), 0) / apiMetrics.length 
      : 0;
    
    const averageComponentRenderDuration = componentMetrics.length > 0
      ? componentMetrics.reduce((sum, m) => sum + (m.duration || 0), 0) / componentMetrics.length
      : 0;
    
    const errorRate = this.metrics.length > 0
      ? this.metrics.filter(m => m.status === 'error').length / this.metrics.length
      : 0;
    
    const slowestAPIs = [...apiMetrics]
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .slice(0, 5);
    
    const slowestComponents = [...componentMetrics]
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .slice(0, 5);

    return {
      totalMetrics: this.metrics.length,
      averageAPIDuration,
      averageComponentRenderDuration,
      errorRate,
      slowestAPIs,
      slowestComponents
    };
  }

  // Get metrics by type
  getMetricsByType(type: PerformanceMetric['type']): PerformanceMetric[] {
    return this.metrics.filter(m => m.type === type);
  }

  // Get recent metrics
  getRecentMetrics(limit: number = 50): PerformanceMetric[] {
    return this.metrics.slice(-limit);
  }

  // Clear all metrics
  clearMetrics(): void {
    this.metrics = [];
    this.activeMetrics.clear();
  }

  // Enable/disable monitoring
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.clearMetrics();
    }
  }

  // Flush metrics to server
  private async flushMetrics(): Promise<void> {
    if (this.metrics.length === 0) return;

    const metricsToFlush = [...this.metrics];
    this.metrics = [];

    try {
      await fetch('/api/performance/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics: metricsToFlush,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      });
    } catch (error) {
      console.error('Failed to flush performance metrics:', error);
      // Put metrics back if flush failed
      this.metrics = [...metricsToFlush, ...this.metrics];
    }
  }

  // Start flush timer
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flushMetrics();
    }, this.flushInterval);
  }

  // Stop flush timer
  private stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  // Setup global error handling
  private setupGlobalErrorHandling(): void {
    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackUserAction('unhandled_promise_rejection', 'window', window.location.pathname, {
        reason: event.reason,
        promise: event.promise
      });
    });

    // Track global errors
    window.addEventListener('error', (event) => {
      this.trackUserAction('global_error', (event.target as HTMLElement)?.tagName || 'unknown', window.location.pathname, {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.trackUserAction('visibility_change', 'document', window.location.pathname, {
        visibilityState: document.visibilityState
      });
    });
  }

  // Cleanup
  destroy(): void {
    this.stopFlushTimer();
    this.flushMetrics();
    this.clearMetrics();
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export types
export type {
  PerformanceMetric,
  APICallMetric,
  UserActionMetric,
  ComponentRenderMetric,
  NavigationMetric
};
