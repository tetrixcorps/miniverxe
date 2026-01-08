// IVR Analytics Dashboard Component
// Displays comprehensive IVR analytics with charts and metrics

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const fetchAnalytics = async (timeRange: string, industry?: string) => {
  const url = `/api/ivr/admin/analytics?timeRange=${timeRange}${industry ? `&industry=${industry}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
};

export function IVRAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');

  const { data: analytics, isLoading, error } = useQuery(
    ['ivr-analytics', timeRange, selectedIndustry],
    () => fetchAnalytics(timeRange, selectedIndustry === 'all' ? undefined : selectedIndustry)
  );

  const handleExportCSV = async () => {
    const url = `/api/ivr/admin/analytics?timeRange=${timeRange}&format=csv${selectedIndustry !== 'all' ? `&industry=${selectedIndustry}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) return;

    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `ivr-analytics-${timeRange}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  };

  if (isLoading) return <div>Loading analytics...</div>;
  if (error) return <div className="text-red-600">Error loading analytics</div>;
  if (!analytics) return null;

  const industryData = Object.entries(analytics.industryBreakdown || {}).map(([name, value]) => ({
    name,
    value
  }));

  const stepDropOffData = Object.entries(analytics.stepDropOffs || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => (b.value as number) - (a.value as number))
    .slice(0, 10);

  const topOptionsData = analytics.topOptions || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">IVR Analytics</h2>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as typeof timeRange)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Industries</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="insurance">Insurance</SelectItem>
              <SelectItem value="retail">Retail</SelectItem>
              <SelectItem value="construction">Construction</SelectItem>
              <SelectItem value="real_estate">Real Estate</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportCSV}>Export CSV</Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Total Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalCalls || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.completedCalls || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Containment Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.containmentRate?.toFixed(1) || 0}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Avg Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(analytics.averageCallDuration / 60) || 0}m</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Industry Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {industryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={industryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {industryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-gray-500 py-12">No data available</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Step Drop-offs</CardTitle>
          </CardHeader>
          <CardContent>
            {stepDropOffData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stepDropOffData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-gray-500 py-12">No data available</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Selected Options</CardTitle>
          </CardHeader>
          <CardContent>
            {topOptionsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topOptionsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="option" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-gray-500 py-12">No data available</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Time of Day Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(analytics.timeOfDayBreakdown || {}).length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.entries(analytics.timeOfDayBreakdown).map(([name, value]) => ({ name, value }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#FF8042" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-gray-500 py-12">No data available</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
