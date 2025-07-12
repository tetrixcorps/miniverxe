import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import apiService from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import LoadingState from '../../components/ui/LoadingState';
import ErrorMessage from '../../components/ui/ErrorMessage';

const UserAnalytics: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['user-analytics', userId],
    queryFn: () => userId ? apiService.getUserAnalytics(userId) : Promise.resolve({ data: null }),
    enabled: !!userId,
  });

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">My Analytics</h2>
      <p className="mb-4">Your annotation and review performance metrics.</p>
      {isLoading ? (
        <LoadingState message="Loading analytics..." />
      ) : error ? (
        <ErrorMessage error={error} fallback="Error loading analytics." />
      ) : data?.data ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">Total Annotations</div>
              <div className="text-2xl font-bold">{data.data.totalAnnotations}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">Total Reviews</div>
              <div className="text-2xl font-bold">{data.data.totalReviews}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">Approved</div>
              <div className="text-2xl font-bold">{data.data.approved}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">Rejected</div>
              <div className="text-2xl font-bold">{data.data.rejected}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">Avg Annotation Time (s)</div>
              <div className="text-2xl font-bold">{data.data.avgAnnotationTimeSec}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">Avg Review Time (s)</div>
              <div className="text-2xl font-bold">{data.data.avgReviewTimeSec}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">Validation Pass Rate</div>
              <div className="text-2xl font-bold">{(data.data.validationPassRate * 100).toFixed(1)}%</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">Review Rejection Rate</div>
              <div className="text-2xl font-bold">{(data.data.reviewRejectionRate * 100).toFixed(1)}%</div>
            </div>
          </div>
          {data.data.trend && data.data.trend.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.data.trend} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
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
        </>
      ) : (
        <div className="text-gray-500">No analytics data found.</div>
      )}
    </div>
  );
};

export default UserAnalytics; 