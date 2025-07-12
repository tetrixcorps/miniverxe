import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import apiService from '../lib/api';
import { withErrorBoundary } from '../components/ui/withErrorBoundary';
import ErrorDisplay from '../components/ui/ErrorDisplay';
import LoadingState from '../components/ui/LoadingState';

function AnalyticsDashboard() {
  const { data: overview, isLoading: loadingOverview, error: errorOverview, refetch: refetchOverview } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: () => apiService.getAnalyticsOverview(),
  });

  const { data: trends, isLoading: loadingTrends, error: errorTrends, refetch: refetchTrends } = useQuery({
    queryKey: ['analytics-trends'],
    queryFn: () => apiService.getAnalyticsTrends({ interval: 'day' }),
  });

  const loading = loadingOverview || loadingTrends;
  const error = errorOverview || errorTrends;

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <h1 className="text-2xl font-bold mb-4">Analytics Dashboard</h1>
      {loading && <LoadingState message="Loading analytics..." />}
      {error && (
        <ErrorDisplay
          error={error}
          title="Failed to load analytics"
          description="Unable to load analytics data. Please try again."
          onRetry={() => { refetchOverview(); refetchTrends(); }}
        />
      )}
      {overview?.data && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Platform Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">Total Tasks</div>
              <div className="text-2xl font-bold">{overview.data.totalTasks}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">Total Annotations</div>
              <div className="text-2xl font-bold">{overview.data.totalAnnotations}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">Total Reviews</div>
              <div className="text-2xl font-bold">{overview.data.totalReviews}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">Approved</div>
              <div className="text-2xl font-bold">{overview.data.totalApproved}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">Rejected</div>
              <div className="text-2xl font-bold">{overview.data.totalRejected}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">Active Annotators</div>
              <div className="text-2xl font-bold">{overview.data.activeAnnotators}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">Active Reviewers</div>
              <div className="text-2xl font-bold">{overview.data.activeReviewers}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">Avg Annotation Time (s)</div>
              <div className="text-2xl font-bold">{overview.data.avgAnnotationTimeSec}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">Avg Review Time (s)</div>
              <div className="text-2xl font-bold">{overview.data.avgReviewTimeSec}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">Validation Pass Rate</div>
              <div className="text-2xl font-bold">{(overview.data.validationPassRate * 100).toFixed(1)}%</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">Review Rejection Rate</div>
              <div className="text-2xl font-bold">{(overview.data.reviewRejectionRate * 100).toFixed(1)}%</div>
            </div>
          </div>
        </div>
      )}
      {trends?.data && trends.data.data && trends.data.data.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends.data.data} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="annotationsCompleted" stroke="#8884d8" strokeWidth={2} dot />
              <Line type="monotone" dataKey="reviewsCompleted" stroke="#82ca9d" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="mt-8 text-gray-400">[More analytics coming soon: user/project dashboards]</div>
    </div>
  );
}

export default withErrorBoundary(AnalyticsDashboard, {
  title: 'Analytics Dashboard Error',
  showDetails: false
}); 