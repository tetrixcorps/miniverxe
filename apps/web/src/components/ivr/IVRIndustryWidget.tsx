// IVR Industry Widget Component
// Compact widget for displaying IVR metrics on industry dashboards

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';

interface IVRIndustryWidgetProps {
  industry: 'healthcare' | 'insurance' | 'retail' | 'construction' | 'real_estate';
  compact?: boolean;
}

const fetchIndustryAnalytics = async (industry: string) => {
  const res = await fetch(`/api/ivr/admin/analytics?timeRange=24h&industry=${industry}`);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
};

export function IVRIndustryWidget({ industry, compact = false }: IVRIndustryWidgetProps) {
  const { data: analytics, isLoading } = useQuery(
    ['ivr-industry-analytics', industry],
    () => fetchIndustryAnalytics(industry)
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-gray-500">Loading IVR metrics...</div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">IVR Calls (24h)</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{analytics?.totalCalls || 0}</div>
              <div className="text-xs text-gray-500">
                {analytics?.containmentRate?.toFixed(1) || 0}% contained
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/ivr-admin'}>
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="capitalize">{industry} IVR Metrics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-600">Total Calls</div>
            <div className="text-2xl font-bold">{analytics?.totalCalls || 0}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Completed</div>
            <div className="text-2xl font-bold">{analytics?.completedCalls || 0}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Containment</div>
            <div className="text-2xl font-bold">{analytics?.containmentRate?.toFixed(1) || 0}%</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600">Avg Duration</div>
            <div className="text-lg font-semibold">
              {Math.round((analytics?.averageCallDuration || 0) / 60)}m
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Transfer Rate</div>
            <div className="text-lg font-semibold">{analytics?.transferRate?.toFixed(1) || 0}%</div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.location.href = '/ivr-admin?tab=analytics'}>
            Full Analytics
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.location.href = '/ivr-admin?tab=flows'}>
            Manage Flows
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
