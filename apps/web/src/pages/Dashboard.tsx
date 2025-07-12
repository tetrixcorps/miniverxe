import React, { useEffect, useRef } from 'react';
import { useEnterpriseAuth } from '../hooks/useEnterpriseAuth';
import { createAgUiConnector } from '../lib/ag-ui-client';
import type { AgUiConnector, AgentResponse, StructuredContent } from '../lib/ag-ui-client';

export default function EnterpriseDashboardPage() {
  const { loading, user, canAccessChat, isEnterpriseUser } = useEnterpriseAuth();
  const connectorRef = useRef<AgUiConnector | null>(null);
  const showChat = canAccessChat && isEnterpriseUser;

  useEffect(() => {
    if (!showChat) {
      return;
    }

    // Initialize AG-UI connector when chat should be shown
    try {
      const connector = createAgUiConnector({
        transport: 'iframe',
        iframeSelector: '#enterprise-chatbot',
        onConnect: () => {
          console.log('AG-UI Connector connected');
        },
        onDisconnect: () => {
          console.log('AG-UI Connector disconnected');
        },
        onError: (error: Error) => {
          console.error('AG-UI Connector error:', error);
        },
      });

      connectorRef.current = connector;

      // Set up event handlers
      connector.on('agent.response', (response: AgentResponse) => {
        console.log('Agent response received:', response);
        // Handle agent response - could trigger UI updates, notifications, etc.
      });

      connector.on('structured_content', (content: StructuredContent) => {
        console.log('Structured content received:', content);
        // Handle structured content - could render charts, tables, etc.
      });

    } catch (error) {
      console.error('Failed to initialize AG-UI connector:', error);
    }

    // Cleanup on unmount
    return () => {
      if (connectorRef.current) {
        connectorRef.current.disconnect();
        connectorRef.current = null;
      }
    };
  }, [showChat]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600">Please log in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Enterprise Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {user.email}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Dashboard Overview</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-900">Active Projects</h3>
                    <p className="text-2xl font-bold text-blue-600">12</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-medium text-green-900">Completed Tasks</h3>
                    <p className="text-2xl font-bold text-green-600">48</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900">User Information</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-600">User Group: {user.userGroup}</p>
                    <p className="text-sm text-gray-600">Department: {user.department || 'Not specified'}</p>
                    <p className="text-sm text-gray-600">Organization: {user.organizationId || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Agent Chat */}
          <div className="lg:col-span-1">
            {showChat ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">AI Agent Chat</h2>
                <div className="relative">
                  <iframe
                    id="enterprise-chatbot"
                    title="Enterprise AI Agent Chat"
                    src="https://openwebui.example.com/chat"
                    className="w-full h-96 border-0 rounded-lg"
                    style={{ minHeight: '400px' }}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">AI Agent Chat</h2>
                <div className="text-center text-gray-500">
                  <p className="mb-2">🔒 Access Restricted</p>
                  <p className="text-sm">
                    You don't have sufficient permissions to access the AI Agent Chat.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}