// IVR Call Monitor Component
// Real-time monitoring of active IVR calls

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../ui/table';
import { Button } from '../ui/button';

const fetchSessions = async () => {
  const res = await fetch('/api/ivr/admin/sessions?status=recent&limit=50');
  if (!res.ok) throw new Error('Failed to fetch sessions');
  return res.json();
};

export function IVRCallMonitor() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data, isLoading, refetch } = useQuery(
    ['ivr-sessions'],
    fetchSessions,
    {
      refetchInterval: autoRefresh ? 5000 : false // Refresh every 5 seconds if enabled
    }
  );

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'transferred':
        return 'bg-purple-100 text-purple-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">Recent Calls</h3>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span className="text-sm">Auto-refresh</span>
          </label>
        </div>
        <Button variant="outline" onClick={() => refetch()}>Refresh</Button>
      </div>

      {isLoading ? (
        <div>Loading calls...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Session ID</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Steps</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.calls?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                  No recent calls
                </TableCell>
              </TableRow>
            ) : (
              data?.calls?.map((call: any) => (
                <TableRow key={call.sessionId}>
                  <TableCell className="font-mono text-xs">{call.sessionId.substring(0, 12)}...</TableCell>
                  <TableCell className="capitalize">{call.industry}</TableCell>
                  <TableCell>{call.from || '-'}</TableCell>
                  <TableCell>{call.to || '-'}</TableCell>
                  <TableCell>{formatDate(call.startTime)}</TableCell>
                  <TableCell>{formatDuration(call.duration || 0)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(call.status)}`}>
                      {call.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {call.stepsCompleted?.length || 0} step(s)
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
