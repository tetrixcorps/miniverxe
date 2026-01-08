// IVR Agent Management Component
// Interface for managing IVR agents and their availability

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../ui/table';

interface Agent {
  id: string;
  name: string;
  phoneNumber?: string;
  sipUri?: string;
  department: string;
  industry: string;
  status: 'available' | 'busy' | 'offline';
  skills?: string[];
}

interface IVRAgentManagementProps {
  agents: Agent[];
}

export function IVRAgentManagement({ agents }: IVRAgentManagementProps) {
  const [showAddAgent, setShowAddAgent] = useState(false);
  const [newAgent, setNewAgent] = useState<Partial<Agent>>({
    id: '',
    name: '',
    department: '',
    industry: 'healthcare',
    status: 'available'
  });

  const industries = ['healthcare', 'insurance', 'retail', 'construction', 'real_estate'];

  const handleAddAgent = async () => {
    if (!newAgent.id || !newAgent.name || !newAgent.department) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const res = await fetch('/api/ivr/admin/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent: newAgent })
      });

      if (res.ok) {
        setShowAddAgent(false);
        setNewAgent({
          id: '',
          name: '',
          department: '',
          industry: 'healthcare',
          status: 'available'
        });
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to add agent:', error);
    }
  };

  const handleUpdateStatus = async (agentId: string, status: Agent['status']) => {
    try {
      const res = await fetch('/api/ivr/admin/agents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, status })
      });

      if (res.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to update agent status:', error);
    }
  };

  const agentsByIndustry = industries.reduce((acc, industry) => {
    acc[industry] = agents.filter(a => a.industry === industry);
    return acc;
  }, {} as Record<string, Agent[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Agent Management</h2>
        <Button onClick={() => setShowAddAgent(true)}>Add Agent</Button>
      </div>

      {showAddAgent && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Agent</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Agent ID</label>
                <Input
                  value={newAgent.id || ''}
                  onChange={(e) => setNewAgent({ ...newAgent, id: e.target.value })}
                  placeholder="agent_id"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  value={newAgent.name || ''}
                  onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                  placeholder="Agent Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <Input
                  value={newAgent.department || ''}
                  onChange={(e) => setNewAgent({ ...newAgent, department: e.target.value })}
                  placeholder="Department"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Industry</label>
                <Select
                  value={newAgent.industry || 'healthcare'}
                  onValueChange={(value) => setNewAgent({ ...newAgent, industry: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map(industry => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <Input
                  value={newAgent.phoneNumber || ''}
                  onChange={(e) => setNewAgent({ ...newAgent, phoneNumber: e.target.value })}
                  placeholder="+1234567890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">SIP URI</label>
                <Input
                  value={newAgent.sipUri || ''}
                  onChange={(e) => setNewAgent({ ...newAgent, sipUri: e.target.value })}
                  placeholder="sip:agent@example.com"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowAddAgent(false)}>Cancel</Button>
              <Button onClick={handleAddAgent}>Add Agent</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {industries.map(industry => {
        const industryAgents = agentsByIndustry[industry] || [];
        if (industryAgents.length === 0) return null;

        return (
          <Card key={industry}>
            <CardHeader>
              <CardTitle className="capitalize">{industry} Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {industryAgents.map(agent => (
                    <TableRow key={agent.id}>
                      <TableCell className="font-medium">{agent.name}</TableCell>
                      <TableCell>{agent.department}</TableCell>
                      <TableCell>
                        {agent.phoneNumber || agent.sipUri || '-'}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          agent.status === 'available' ? 'bg-green-100 text-green-800' :
                          agent.status === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {agent.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {agent.status !== 'available' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateStatus(agent.id, 'available')}
                            >
                              Set Available
                            </Button>
                          )}
                          {agent.status !== 'busy' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateStatus(agent.id, 'busy')}
                            >
                              Set Busy
                            </Button>
                          )}
                          {agent.status !== 'offline' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateStatus(agent.id, 'offline')}
                            >
                              Set Offline
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
