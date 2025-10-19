// React hook for performance monitoring
// Provides easy integration with React components

import { useEffect, useRef, useCallback } from 'react';
import { performanceMonitor } from '../services/performance/PerformanceMonitor';

interface UsePerformanceMonitorOptions {
  componentName: string;
  trackRenders?: boolean;
  trackProps?: boolean;
  trackUserActions?: boolean;
  trackAPI?: boolean;
}

interface UsePerformanceMonitorReturn {
  trackAPICall: (url: string, method: string, metadata?: Record<string, any>) => string;
  completeAPICall: (id: string, statusCode: number, responseSize?: number, status?: 'success' | 'error' | 'timeout', error?: string) => void;
  trackUserAction: (action: string, element?: string, metadata?: Record<string, any>) => string;
  completeUserAction: (id: string, status?: 'success' | 'error', error?: string) => void;
  trackNavigation: (from: string, to: string, trigger?: 'user' | 'programmatic' | 'browser', metadata?: Record<string, any>) => string;
  completeNavigation: (id: string, status?: 'success' | 'error', error?: string) => void;
  getPerformanceSummary: () => any;
  clearMetrics: () => void;
}

export const usePerformanceMonitor = (options: UsePerformanceMonitorOptions): UsePerformanceMonitorReturn => {
  const {
    componentName,
    trackRenders = true,
    trackProps = false,
    trackUserActions = true,
    trackAPI = true
  } = options;

  const renderStartTime = useRef<number>(0);
  const renderId = useRef<string>('');

  // Track component render
  useEffect(() => {
    if (trackRenders) {
      renderStartTime.current = performance.now();
      renderId.current = performanceMonitor.trackComponentRender(
        componentName,
        trackProps ? options : undefined,
        {
          timestamp: new Date().toISOString(),
          url: window.location.href
        }
      );
    }

    return () => {
      if (trackRenders && renderId.current) {
        performanceMonitor.completeComponentRender(renderId.current, 'success');
      }
    };
  }, [componentName, trackRenders, trackProps]);

  // Track API calls
  const trackAPICall = useCallback((url: string, method: string, metadata?: Record<string, any>) => {
    if (!trackAPI) return '';
    return performanceMonitor.trackAPICall(url, method, {
      component: componentName,
      ...metadata
    });
  }, [componentName, trackAPI]);

  const completeAPICall = useCallback((
    id: string,
    statusCode: number,
    responseSize?: number,
    status: 'success' | 'error' | 'timeout' = 'success',
    error?: string
  ) => {
    if (!trackAPI) return;
    performanceMonitor.completeAPICall(id, statusCode, responseSize, status, error);
  }, [trackAPI]);

  // Track user actions
  const trackUserAction = useCallback((action: string, element?: string, metadata?: Record<string, any>) => {
    if (!trackUserActions) return '';
    return performanceMonitor.trackUserAction(action, element, window.location.pathname, {
      component: componentName,
      ...metadata
    });
  }, [componentName, trackUserActions]);

  const completeUserAction = useCallback((id: string, status: 'success' | 'error' = 'success', error?: string) => {
    if (!trackUserActions) return;
    performanceMonitor.completeUserAction(id, status, error);
  }, [trackUserActions]);

  // Track navigation
  const trackNavigation = useCallback((
    from: string,
    to: string,
    trigger: 'user' | 'programmatic' | 'browser' = 'user',
    metadata?: Record<string, any>
  ) => {
    return performanceMonitor.trackNavigation(from, to, trigger, {
      component: componentName,
      ...metadata
    });
  }, [componentName]);

  const completeNavigation = useCallback((id: string, status: 'success' | 'error' = 'success', error?: string) => {
    performanceMonitor.completeNavigation(id, status, error);
  }, []);

  // Get performance summary
  const getPerformanceSummary = useCallback(() => {
    return performanceMonitor.getPerformanceSummary();
  }, []);

  // Clear metrics
  const clearMetrics = useCallback(() => {
    performanceMonitor.clearMetrics();
  }, []);

  return {
    trackAPICall,
    completeAPICall,
    trackUserAction,
    completeUserAction,
    trackNavigation,
    completeNavigation,
    getPerformanceSummary,
    clearMetrics
  };
};

// Hook for API performance monitoring
export const useAPIPerformanceMonitor = (componentName: string) => {
  const trackAPICall = useCallback((url: string, method: string, metadata?: Record<string, any>) => {
    return performanceMonitor.trackAPICall(url, method, {
      component: componentName,
      ...metadata
    });
  }, [componentName]);

  const completeAPICall = useCallback((
    id: string,
    statusCode: number,
    responseSize?: number,
    status: 'success' | 'error' | 'timeout' = 'success',
    error?: string
  ) => {
    performanceMonitor.completeAPICall(id, statusCode, responseSize, status, error);
  }, []);

  return { trackAPICall, completeAPICall };
};

// Hook for user action performance monitoring
export const useUserActionPerformanceMonitor = (componentName: string) => {
  const trackUserAction = useCallback((action: string, element?: string, metadata?: Record<string, any>) => {
    return performanceMonitor.trackUserAction(action, element, window.location.pathname, {
      component: componentName,
      ...metadata
    });
  }, [componentName]);

  const completeUserAction = useCallback((id: string, status: 'success' | 'error' = 'success', error?: string) => {
    performanceMonitor.completeUserAction(id, status, error);
  }, []);

  return { trackUserAction, completeUserAction };
};
