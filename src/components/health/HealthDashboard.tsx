// Health Dashboard Component
// Displays real-time health status of all services

import React, { useState, useEffect } from 'react';

interface HealthStatus {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime?: number;
  lastChecked: string;
  error?: string;
  details?: any;
}

interface HealthCheckResult {
  overall: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  services: HealthStatus[];
  uptime: number;
  version: string;
}

interface HealthDashboardProps {
  refreshInterval?: number;
  showDetails?: boolean;
  className?: string;
}

const HealthDashboard: React.FC<HealthDashboardProps> = ({
  refreshInterval = 30000, // 30 seconds
  showDetails = false,
  className = ''
}) => {
  const [healthData, setHealthData] = useState<HealthCheckResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchHealthData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/health/check');
      const data = await response.json();
      
      setHealthData(data);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Failed to fetch health data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch health data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
    
    const interval = setInterval(fetchHealthData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100';
      case 'unhealthy':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return '✓';
      case 'degraded':
        return '⚠';
      case 'unhealthy':
        return '✗';
      default:
        return '?';
    }
  };

  const formatUptime = (uptime: number) => {
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  if (isLoading && !healthData) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading health status...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="text-center">
          <div className="text-red-600 text-2xl mb-2">⚠</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Health Check Failed</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchHealthData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!healthData) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">System Health</h2>
          <p className="text-sm text-gray-600">
            Last updated: {lastRefresh?.toLocaleTimeString() || 'Never'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(healthData.overall)}`}>
            {getStatusIcon(healthData.overall)} {healthData.overall.toUpperCase()}
          </div>
          <button
            onClick={fetchHealthData}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Refresh"
          >
            <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">{healthData.services.length}</div>
          <div className="text-sm text-gray-600">Total Services</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            {healthData.services.filter(s => s.status === 'healthy').length}
          </div>
          <div className="text-sm text-gray-600">Healthy</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">{formatUptime(healthData.uptime)}</div>
          <div className="text-sm text-gray-600">Uptime</div>
        </div>
      </div>

      {/* Services List */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-gray-900">Services</h3>
        {healthData.services.map((service) => (
          <div key={service.service} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${getStatusColor(service.status)}`}>
                {getStatusIcon(service.status)}
              </div>
              <div>
                <div className="font-medium text-gray-900 capitalize">{service.service}</div>
                <div className="text-sm text-gray-600">
                  {service.responseTime ? `${service.responseTime}ms` : 'N/A'}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-sm font-medium ${getStatusColor(service.status).split(' ')[0]}`}>
                {service.status.toUpperCase()}
              </div>
              {service.error && (
                <div className="text-xs text-red-600 truncate max-w-32" title={service.error}>
                  {service.error}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Details Section */}
      {showDetails && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Technical Details</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="text-xs text-gray-700 overflow-auto">
              {JSON.stringify(healthData, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthDashboard;
