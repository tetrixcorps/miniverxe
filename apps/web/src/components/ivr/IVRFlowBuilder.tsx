// IVR Flow Builder Component
// Visual builder for creating and editing IVR call flows

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../ui/table';

interface IVRStep {
  id: string;
  type: 'say' | 'gather' | 'dial' | 'record' | 'redirect' | 'hangup';
  message?: string;
  options?: Array<{ digit: string; label: string; action: string; nextStep?: string }>;
  timeout?: number;
  maxDigits?: number;
  nextStep?: string;
}

interface IVRFlow {
  id: string;
  name: string;
  industry: string;
  steps: IVRStep[];
}

interface IVRFlowBuilderProps {
  flows: IVRFlow[];
}

export function IVRFlowBuilder({ flows }: IVRFlowBuilderProps) {
  const [selectedFlow, setSelectedFlow] = useState<IVRFlow | null>(flows[0] || null);
  const [editingStep, setEditingStep] = useState<IVRStep | null>(null);
  const [showStepEditor, setShowStepEditor] = useState(false);

  const industries = ['healthcare', 'insurance', 'retail', 'construction', 'real_estate'];

  const handleCreateFlow = () => {
    const newFlow: IVRFlow = {
      id: `flow_${Date.now()}`,
      name: 'New Flow',
      industry: 'healthcare',
      steps: []
    };
    setSelectedFlow(newFlow);
  };

  const handleAddStep = () => {
    const newStep: IVRStep = {
      id: `step_${Date.now()}`,
      type: 'say',
      message: ''
    };
    setEditingStep(newStep);
    setShowStepEditor(true);
  };

  const handleSaveStep = async () => {
    if (!editingStep || !selectedFlow) return;

    const updatedFlow = {
      ...selectedFlow,
      steps: [...selectedFlow.steps, editingStep]
    };

    try {
      const res = await fetch('/api/ivr/admin/flows', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flow: updatedFlow })
      });

      if (res.ok) {
        setSelectedFlow(updatedFlow);
        setShowStepEditor(false);
        setEditingStep(null);
      }
    } catch (error) {
      console.error('Failed to save step:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Select
          value={selectedFlow?.id || ''}
          onValueChange={(value) => {
            const flow = flows.find(f => f.id === value);
            setSelectedFlow(flow || null);
          }}
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select a flow" />
          </SelectTrigger>
          <SelectContent>
            {flows.map(flow => (
              <SelectItem key={flow.id} value={flow.id}>
                {flow.name} ({flow.industry})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCreateFlow}>New Flow</Button>
          <Button onClick={handleAddStep}>Add Step</Button>
        </div>
      </div>

      {selectedFlow && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{selectedFlow.name}</CardTitle>
              <div className="flex gap-2">
                <Input
                  value={selectedFlow.name}
                  onChange={(e) => setSelectedFlow({ ...selectedFlow, name: e.target.value })}
                  className="w-48"
                />
                <Select
                  value={selectedFlow.industry}
                  onValueChange={(value) => setSelectedFlow({ ...selectedFlow, industry: value })}
                >
                  <SelectTrigger className="w-32">
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
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h3 className="font-semibold">Flow Steps</h3>
              {selectedFlow.steps.length === 0 ? (
                <p className="text-gray-500">No steps configured. Click "Add Step" to get started.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Step ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Options</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedFlow.steps.map((step, index) => (
                      <TableRow key={step.id}>
                        <TableCell>{step.id}</TableCell>
                        <TableCell>{step.type}</TableCell>
                        <TableCell className="max-w-md truncate">{step.message || '-'}</TableCell>
                        <TableCell>
                          {step.options?.length || 0} option(s)
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingStep(step);
                              setShowStepEditor(true);
                            }}
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {showStepEditor && editingStep && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Step</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Step Type</label>
              <Select
                value={editingStep.type}
                onValueChange={(value) => setEditingStep({ ...editingStep, type: value as IVRStep['type'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="say">Say</SelectItem>
                  <SelectItem value="gather">Gather</SelectItem>
                  <SelectItem value="dial">Dial</SelectItem>
                  <SelectItem value="record">Record</SelectItem>
                  <SelectItem value="hangup">Hangup</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {editingStep.type === 'say' && (
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <Input
                  value={editingStep.message || ''}
                  onChange={(e) => setEditingStep({ ...editingStep, message: e.target.value })}
                  placeholder="Enter message to speak"
                />
              </div>
            )}

            {editingStep.type === 'gather' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Prompt Message</label>
                  <Input
                    value={editingStep.message || ''}
                    onChange={(e) => setEditingStep({ ...editingStep, message: e.target.value })}
                    placeholder="Enter prompt message"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Timeout (seconds)</label>
                    <Input
                      type="number"
                      value={editingStep.timeout || 10}
                      onChange={(e) => setEditingStep({ ...editingStep, timeout: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Max Digits</label>
                    <Input
                      type="number"
                      value={editingStep.maxDigits || 1}
                      onChange={(e) => setEditingStep({ ...editingStep, maxDigits: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowStepEditor(false)}>Cancel</Button>
              <Button onClick={handleSaveStep}>Save Step</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
