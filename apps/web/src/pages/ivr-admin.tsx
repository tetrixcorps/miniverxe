// IVR Admin Dashboard
// Main admin interface for managing IVR flows, agents, and analytics

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { IVRFlowBuilder } from '../components/ivr/IVRFlowBuilder';
import { IVRAgentManagement } from '../components/ivr/IVRAgentManagement';
import { IVRAnalyticsDashboard } from '../components/ivr/IVRAnalyticsDashboard';
import { IVRCallMonitor } from '../components/ivr/IVRCallMonitor';

const fetchFlows = async () => {
  const res = await fetch('/api/ivr/admin/flows');
  if (!res.ok) throw new Error('Failed to fetch flows');
  return res.json();
};

const fetchAgents = async () => {
  const res = await fetch('/api/ivr/admin/agents');
  if (!res.ok) throw new Error('Failed to fetch agents');
  return res.json();
};

export default function IVRAdminDashboard() {
  const [activeTab, setActiveTab] = useState('flows');

  const { data: flowsData } = useQuery(['ivr-flows'], fetchFlows);
  const { data: agentsData } = useQuery(['ivr-agents'], fetchAgents);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">IVR System Administration</h1>
        <div className="flex gap-2">
          <Button variant="outline">Export Configuration</Button>
          <Button>Save Changes</Button>
        </div>
      </div>

      <Tabs defaultValue="flows">
        <TabsList>
          <TabsTrigger value="flows">Call Flows</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="monitor">Live Monitor</TabsTrigger>
        </TabsList>

        <TabsContent value="flows" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>IVR Flow Builder</CardTitle>
            </CardHeader>
            <CardContent>
              <IVRFlowBuilder flows={flowsData?.flows || []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent Management</CardTitle>
            </CardHeader>
            <CardContent>
              <IVRAgentManagement agents={agentsData?.agents || []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <IVRAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="monitor" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Live Call Monitor</CardTitle>
            </CardHeader>
            <CardContent>
              <IVRCallMonitor />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
