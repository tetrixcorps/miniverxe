// Performance Dashboard Component
// Displays real-time performance metrics and analytics

import React, { useState, useEffect } from 'react';

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

interface PerformanceSummary {
  totalMetrics: number;
  averageAPIDuration: number;
  averageComponentRenderDuration: number;
  errorRate: number;
  slowestAPIs: PerformanceMetric[];
  slowestComponents: PerformanceMetric[];
}

interface PerformanceDashboardProps {
  refreshInterval?: number;
  showDetails?: boolean;
  className?: string;
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  refreshInterval = 10000, // 10 seconds
  showDetails = false,
  className = ''
}) => {
  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
  const [recentMetrics, setRecentMetrics] = useState<PerformanceMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchPerformanceData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real application, you would fetch from your performance API
      // For now, we'll use the performance monitor directly
      const performanceMonitor = (window as any).performanceMonitor;
      if (performanceMonitor) {
        const summaryData = performanceMonitor.getPerformanceSummary();
        const recentData = performanceMonitor.getRecentMetrics(20);
        
        setSummary(summaryData);
        setRecentMetrics(recentData);
      } else {
        // Mock data for demonstration
        setSummary({
          totalMetrics: 0,
          averageAPIDuration: 0,
          averageComponentRenderDuration: 0,
          errorRate: 0,
          slowestAPIs: [],
          slowestComponents: []
        });
        setRecentMetrics([]);
      }
      
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Failed to fetch performance data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch performance data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
    
    const interval = setInterval(fetchPerformanceData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const formatDuration = (duration: number) => {
    if (duration < 1000) return `${duration.toFixed(0)}ms`;
    return `${(duration / 1000).toFixed(2)}s`;
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      case 'timeout':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'api':
        return '🌐';
      case 'user_action':
        return '👆';
      case 'component_render':
        return '⚛️';
      case 'navigation':
        return '🧭';
      default:
        return '📊';
    }
  };

  if (isLoading && !summary) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading performance data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="text-center">
          <div className="text-red-600 text-2xl mb-2">⚠</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance Data Unavailable</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchPerformanceData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Performance Dashboard</h2>
          <p className="text-sm text-gray-600">
            Last updated: {lastRefresh?.toLocaleTimeString() || 'Never'}
          </p>
        </div>
        <button
          onClick={fetchPerformanceData}
          disabled={isLoading}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title="Refresh"
        >
          <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">{summary.totalMetrics}</div>
          <div className="text-sm text-gray-600">Total Metrics</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{formatDuration(summary.averageAPIDuration)}</div>
          <div className="text-sm text-gray-600">Avg API Duration</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">{formatDuration(summary.averageComponentRenderDuration)}</div>
          <div className="text-sm text-gray-600">Avg Render Duration</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600">{(summary.errorRate * 100).toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Error Rate</div>
        </div>
      </div>

      {/* Slowest APIs */}
      {summary.slowestAPIs.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Slowest API Calls</h3>
          <div className="space-y-2">
            {summary.slowestAPIs.map((api, index) => (
              <div key={api.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-lg">{getTypeIcon(api.type)}</div>
                  <div>
                    <div className="font-medium text-gray-900">{api.name}</div>
                    <div className="text-sm text-gray-600">
                      {api.metadata?.method} {api.metadata?.url}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">{formatDuration(api.duration || 0)}</div>
                  <div className={`text-xs px-2 py-1 rounded ${getStatusColor(api.status)}`}>
                    {api.status?.toUpperCase() || 'UNKNOWN'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Slowest Components */}
      {summary.slowestComponents.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Slowest Component Renders</h3>
          <div className="space-y-2">
            {summary.slowestComponents.map((component, index) => (
              <div key={component.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-lg">{getTypeIcon(component.type)}</div>
                  <div>
                    <div className="font-medium text-gray-900">{component.name}</div>
                    <div className="text-sm text-gray-600">
                      {component.metadata?.componentName}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">{formatDuration(component.duration || 0)}</div>
                  <div className={`text-xs px-2 py-1 rounded ${getStatusColor(component.status)}`}>
                    {component.status?.toUpperCase() || 'UNKNOWN'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Metrics */}
      {recentMetrics.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Metrics</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {recentMetrics.map((metric) => (
              <div key={metric.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-2">
                  <div className="text-sm">{getTypeIcon(metric.type)}</div>
                  <div className="text-sm font-medium text-gray-900">{metric.name}</div>
                </div>
                <div className="flex items-center space-x-2">
                  {metric.duration && (
                    <div className="text-sm text-gray-600">{formatDuration(metric.duration)}</div>
                  )}
                  <div className={`text-xs px-2 py-1 rounded ${getStatusColor(metric.status)}`}>
                    {metric.status?.toUpperCase() || 'UNKNOWN'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Details Section */}
      {showDetails && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Technical Details</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="text-xs text-gray-700 overflow-auto">
              {JSON.stringify({ summary, recentMetrics }, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceDashboard;
