// IVR Quick Actions Component
// Quick action buttons for common IVR operations

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';

interface IVRQuickActionsProps {
  industry: 'healthcare' | 'insurance' | 'retail' | 'construction' | 'real_estate';
}

export function IVRQuickActions({ industry }: IVRQuickActionsProps) {
  const handleTestCall = () => {
    // Trigger a test call to the IVR system
    alert('Test call feature coming soon');
  };

  const handleViewFlows = () => {
    window.location.href = `/ivr-admin?tab=flows&industry=${industry}`;
  };

  const handleViewAgents = () => {
    window.location.href = `/ivr-admin?tab=agents&industry=${industry}`;
  };

  const handleViewAnalytics = () => {
    window.location.href = `/ivr-admin?tab=analytics&industry=${industry}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="capitalize">{industry} IVR Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={handleViewFlows}>
            View Flows
          </Button>
          <Button variant="outline" onClick={handleViewAgents}>
            Manage Agents
          </Button>
          <Button variant="outline" onClick={handleViewAnalytics}>
            View Analytics
          </Button>
          <Button variant="outline" onClick={handleTestCall}>
            Test Call
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
