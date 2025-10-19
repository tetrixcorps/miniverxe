// API Performance Monitor
// Wraps fetch calls with performance monitoring

import { performanceMonitor } from './PerformanceMonitor';

interface APIMonitorOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  trackPerformance?: boolean;
  componentName?: string;
  headers?: Record<string, string>;
}

interface APIMonitorResponse<T = any> extends Response {
  data?: T;
  performance?: {
    duration: number;
    retryCount: number;
    status: 'success' | 'error' | 'timeout';
  };
}

class APIMonitor {
  private defaultOptions: APIMonitorOptions = {
    timeout: 30000, // 30 seconds
    retries: 3,
    retryDelay: 1000, // 1 second
    trackPerformance: true,
    componentName: 'unknown'
  };

  // Monitor a fetch call
  async monitor<T = any>(
    url: string,
    options: RequestInit & APIMonitorOptions = {}
  ): Promise<APIMonitorResponse<T>> {
    const {
      timeout = this.defaultOptions.timeout,
      retries = this.defaultOptions.retries!,
      retryDelay = this.defaultOptions.retryDelay!,
      trackPerformance = this.defaultOptions.trackPerformance,
      componentName = this.defaultOptions.componentName,
      ...fetchOptions
    } = options;

    let retryCount = 0;
    let lastError: Error | null = null;
    let metricId = '';

    // Start performance tracking
    if (trackPerformance) {
      metricId = performanceMonitor.trackAPICall(
        url,
        fetchOptions.method || 'GET',
        {
          component: componentName,
          timeout,
          retries
        }
      );
    }

    const startTime = performance.now();

    while (retryCount <= retries) {
      try {
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        // Make the request
        const response = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Calculate performance metrics
        const endTime = performance.now();
        const duration = endTime - startTime;

        // Parse response data
        let data: T | undefined;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            data = await response.json();
          } catch (parseError) {
            console.warn('Failed to parse JSON response:', parseError);
          }
        }

        // Complete performance tracking
        if (trackPerformance) {
          performanceMonitor.completeAPICall(
            metricId,
            response.status,
            response.headers.get('content-length') ? parseInt(response.headers.get('content-length')!) : undefined,
            response.ok ? 'success' : 'error'
          );
        }

        // Create enhanced response
        const enhancedResponse = response as APIMonitorResponse<T>;
        enhancedResponse.data = data;
        enhancedResponse.performance = {
          duration,
          retryCount,
          status: response.ok ? 'success' : 'error'
        };

        return enhancedResponse;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        retryCount++;

        // Check if it's a timeout error
        if (lastError.name === 'AbortError') {
          lastError = new Error(`Request timeout after ${timeout}ms`);
        }

        // Check if we should retry
        if (retryCount <= retries) {
          console.warn(`API call failed, retrying (${retryCount}/${retries}):`, {
            url,
            error: lastError.message,
            retryDelay
          });

          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, retryDelay * retryCount));
        } else {
          // All retries exhausted
          const endTime = performance.now();
          const duration = endTime - startTime;

          // Complete performance tracking with error
          if (trackPerformance) {
            performanceMonitor.completeAPICall(
              metricId,
              0,
              undefined,
              'error',
              lastError.message
            );
          }

          // Create error response
          const errorResponse = new Response(JSON.stringify({
            error: lastError.message,
            retryCount,
            duration
          }), {
            status: 0,
            statusText: 'Network Error'
          }) as APIMonitorResponse<T>;

          errorResponse.performance = {
            duration,
            retryCount,
            status: 'error'
          };

          return errorResponse;
        }
      }
    }

    // This should never be reached, but TypeScript requires it
    throw lastError || new Error('Unknown error');
  }

  // Monitor GET request
  async get<T = any>(url: string, options: APIMonitorOptions = {}): Promise<APIMonitorResponse<T>> {
    return this.monitor<T>(url, { ...options, method: 'GET' });
  }

  // Monitor POST request
  async post<T = any>(url: string, data?: any, options: APIMonitorOptions = {}): Promise<APIMonitorResponse<T>> {
    return this.monitor<T>(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: data ? JSON.stringify(data) : undefined
    });
  }

  // Monitor PUT request
  async put<T = any>(url: string, data?: any, options: APIMonitorOptions = {}): Promise<APIMonitorResponse<T>> {
    return this.monitor<T>(url, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: data ? JSON.stringify(data) : undefined
    });
  }

  // Monitor DELETE request
  async delete<T = any>(url: string, options: APIMonitorOptions = {}): Promise<APIMonitorResponse<T>> {
    return this.monitor<T>(url, { ...options, method: 'DELETE' });
  }

  // Monitor PATCH request
  async patch<T = any>(url: string, data?: any, options: APIMonitorOptions = {}): Promise<APIMonitorResponse<T>> {
    return this.monitor<T>(url, {
      ...options,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: data ? JSON.stringify(data) : undefined
    });
  }

  // Set default options
  setDefaultOptions(options: Partial<APIMonitorOptions>): void {
    this.defaultOptions = { ...this.defaultOptions, ...options };
  }
}

// Create singleton instance
export const apiMonitor = new APIMonitor();

// Export types
export type { APIMonitorOptions, APIMonitorResponse };
