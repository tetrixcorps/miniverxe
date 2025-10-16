import React, { useState, useEffect } from 'react';
import { voiceAPIService, CallAnalytics } from '../../services/voiceapi';

interface CallAnalyticsProps {
  industry: string;
  timeRange?: {
    start: Date;
    end: Date;
  };
  onAnalyticsUpdate?: (analytics: CallAnalytics) => void;
  className?: string;
}

const CallAnalytics: React.FC<CallAnalyticsProps> = ({
  industry,
  timeRange,
  onAnalyticsUpdate,
  className = ''
}) => {
  const [analytics, setAnalytics] = useState<CallAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | 'custom'>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [industry, timeRange, selectedTimeRange]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let startDate: Date | undefined;
      let endDate: Date | undefined;

      if (selectedTimeRange === 'custom' && timeRange) {
        startDate = timeRange.start;
        endDate = timeRange.end;
      } else {
        const now = new Date();
        const days = selectedTimeRange === '7d' ? 7 : selectedTimeRange === '30d' ? 30 : 90;
        startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        endDate = now;
      }

      const data = await voiceAPIService.getCallAnalytics(industry, startDate, endDate);
      setAnalytics(data);
      onAnalyticsUpdate?.(data);
    } catch (err) {
      console.error('Error loading call analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const getIndustryIcon = () => {
    const icons = {
      healthcare: '🏥',
      legal: '⚖️',
      retail: '🛒',
      construction: '🏗️',
      education: '🎓',
      government: '🏛️',
      hospitality: '🏨',
      logistics: '🚚',
      wellness: '🏥',
      beauty: '🎨'
    };
    return icons[industry as keyof typeof icons] || '📞';
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className={`call-analytics ${className}`}>
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading call analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`call-analytics ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-400 mr-3">⚠️</div>
            <div>
              <h3 className="text-sm font-medium text-red-800">Error Loading Analytics</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className={`call-analytics ${className}`}>
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Call Data Available</h3>
          <p className="text-gray-500">
            Start making calls to see analytics for your {industry} operations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`call-analytics ${className}`}>
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{getIndustryIcon()}</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Call Analytics - {industry.charAt(0).toUpperCase() + industry.slice(1)}
              </h3>
              <p className="text-sm text-gray-500">
                {analytics.timeRange.start.toLocaleDateString()} - {analytics.timeRange.end.toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="custom">Custom range</option>
            </select>
            <button
              onClick={loadAnalytics}
              className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm">📞</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Calls</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.totalCalls}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm">✅</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Answered Calls</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.answeredCalls}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 text-sm">⏱️</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Avg Duration</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatDuration(analytics.averageDuration)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-sm">💰</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Cost</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(analytics.totalCost)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Rate and Missed Calls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-md font-medium text-gray-900 mb-3">Success Rate</h4>
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${analytics.successRate}%` }}
                ></div>
              </div>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {analytics.successRate.toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {analytics.answeredCalls} of {analytics.totalCalls} calls answered
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-md font-medium text-gray-900 mb-3">Missed Calls</h4>
          <div className="flex items-center space-x-3">
            <div className="text-3xl font-bold text-red-600">{analytics.missedCalls}</div>
            <div>
              <p className="text-sm text-gray-500">
                {analytics.totalCalls > 0 
                  ? `${((analytics.missedCalls / analytics.totalCalls) * 100).toFixed(1)}% of total calls`
                  : 'No calls made'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Industry Breakdown */}
      {Object.keys(analytics.industryBreakdown).length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-md font-medium text-gray-900 mb-3">Call Distribution by Industry</h4>
          <div className="space-y-2">
            {Object.entries(analytics.industryBreakdown).map(([industry, count]) => (
              <div key={industry} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 capitalize">{industry}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ 
                        width: `${analytics.totalCalls > 0 ? (count / analytics.totalCalls) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Indicators */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {analytics.totalCalls > 0 ? Math.round(analytics.totalCalls / 30) : 0}
          </div>
          <div className="text-sm text-gray-500">Calls per day</div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {analytics.totalCalls > 0 ? Math.round((analytics.answeredCalls / analytics.totalCalls) * 100) : 0}%
          </div>
          <div className="text-sm text-gray-500">Answer rate</div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600 mb-1">
            {analytics.totalCalls > 0 ? formatCurrency(analytics.totalCost / analytics.totalCalls) : '$0.00'}
          </div>
          <div className="text-sm text-gray-500">Cost per call</div>
        </div>
      </div>
    </div>
  );
};

export default CallAnalytics;
