import React, { useState, useEffect } from 'react';
import type { AIInsight } from '../../services/openwebui';

interface AIInsightsProps {
  industry: string;
  insights: AIInsight[];
  onInsightAction?: (insight: AIInsight, action: string) => void;
  className?: string;
}

const AIInsights: React.FC<AIInsightsProps> = ({
  industry,
  insights,
  onInsightAction,
  className = ''
}) => {
  const [filteredInsights, setFilteredInsights] = useState<AIInsight[]>(insights);
  const [filter, setFilter] = useState<'all' | 'recommendation' | 'alert' | 'insight' | 'prediction'>('all');
  const [sortBy, setSortBy] = useState<'confidence' | 'timestamp' | 'type'>('confidence');

  useEffect(() => {
    let filtered = insights;

    // Filter by type
    if (filter !== 'all') {
      filtered = filtered.filter(insight => insight.type === filter);
    }

    // Sort insights
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'confidence':
          return b.confidence - a.confidence;
        case 'timestamp':
          return b.timestamp.getTime() - a.timestamp.getTime();
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

    setFilteredInsights(filtered);
  }, [insights, filter, sortBy]);

  const getInsightIcon = (type: string) => {
    const icons = {
      recommendation: '💡',
      alert: '⚠️',
      insight: '🔍',
      prediction: '🔮'
    };
    return icons[type as keyof typeof icons] || '📊';
  };

  const getInsightColor = (type: string) => {
    const colors = {
      recommendation: 'blue',
      alert: 'red',
      insight: 'green',
      prediction: 'purple'
    };
    return colors[type as keyof typeof colors] || 'gray';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.8) return 'text-green-600';
    if (confidence > 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleInsightAction = (insight: AIInsight, action: string) => {
    onInsightAction?.(insight, action);
  };

  if (insights.length === 0) {
    return (
      <div className={`ai-insights ${className}`}>
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">🤖</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No AI Insights Yet</h3>
          <p className="text-gray-500">
            Start interacting with the AI assistant to generate insights for your {industry} operations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`ai-insights ${className}`}>
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            AI Insights - {industry.charAt(0).toUpperCase() + industry.slice(1)}
          </h3>
          <span className="text-sm text-gray-500">
            {filteredInsights.length} of {insights.length} insights
          </span>
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Filter:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="recommendation">Recommendations</option>
              <option value="alert">Alerts</option>
              <option value="insight">Insights</option>
              <option value="prediction">Predictions</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="confidence">Confidence</option>
              <option value="timestamp">Recent</option>
              <option value="type">Type</option>
            </select>
          </div>
        </div>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {filteredInsights.map((insight) => {
          const colorClass = getInsightColor(insight.type);
          const confidenceColor = getConfidenceColor(insight.confidence);

          return (
            <div
              key={insight.id}
              className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow ${
                insight.type === 'alert' ? 'border-red-200 bg-red-50' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full bg-${colorClass}-100 flex items-center justify-center`}>
                    <span className="text-lg">{getInsightIcon(insight.type)}</span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-md font-medium text-gray-900 capitalize">
                      {insight.title}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${confidenceColor}`}>
                        {Math.round(insight.confidence * 100)}%
                      </span>
                      <span className="text-xs text-gray-500">
                        {insight.timestamp.toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                    {insight.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${colorClass}-100 text-${colorClass}-800`}>
                        {insight.type}
                      </span>
                      {insight.actionable && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Actionable
                        </span>
                      )}
                    </div>

                    {insight.actionable && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleInsightAction(insight, 'implement')}
                          className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          Implement
                        </button>
                        <button
                          onClick={() => handleInsightAction(insight, 'dismiss')}
                          className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 className="text-md font-medium text-gray-900 mb-3">Insight Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {insights.filter(i => i.type === 'recommendation').length}
            </div>
            <div className="text-sm text-gray-600">Recommendations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {insights.filter(i => i.type === 'alert').length}
            </div>
            <div className="text-sm text-gray-600">Alerts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {insights.filter(i => i.type === 'insight').length}
            </div>
            <div className="text-sm text-gray-600">Insights</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {insights.filter(i => i.type === 'prediction').length}
            </div>
            <div className="text-sm text-gray-600">Predictions</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
