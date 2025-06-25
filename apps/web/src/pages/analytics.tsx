import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

// Fetch metrics from the real API endpoint
const fetchMetrics = async (): Promise<{ date: string; approvedRate: number }[]> => {
  const res = await fetch('/api/metrics');
  if (!res.ok) throw new Error('Failed to fetch metrics');
  return res.json();
};

export default function AnalyticsDashboard() {
  const { data, isLoading, error } = useQuery(['metrics'], fetchMetrics);

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-8">
      <h1 className="text-2xl font-bold mb-4">Analytics Dashboard</h1>
      {isLoading && <div>Loading metrics...</div>}
      {error && <div className="text-red-600">Error loading metrics.</div>}
      {data && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Approval Rate Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 1]} tickFormatter={(v: number) => `${Math.round(v * 100)}%`} />
              <Tooltip formatter={(v: number) => `${Math.round(v * 100)}%`} />
              <Line type="monotone" dataKey="approvedRate" stroke="#8884d8" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      {/* Placeholder for more charts/metrics */}
      <div className="mt-8 text-gray-400">[More analytics coming soon]</div>
    </div>
  );
} 