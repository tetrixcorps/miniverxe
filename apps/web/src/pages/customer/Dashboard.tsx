import React, { useEffect, useState } from 'react';
import { useEnterpriseAuth } from '../../hooks/useEnterpriseAuth';
import { Spinner } from '../../components/ui/spinner';
import ErrorDisplay from '../../components/ui/ErrorDisplay';
import apiService from '../../lib/api';
// Import the shared AG-UI protocol client
// @ts-ignore: JS build output, no types available
import * as AgUiClient from 'ag-ui-client';

// Set your actual Open WebUI deployment URL here
const OPEN_WEBUI_URL = 'http://localhost:3000/?embedded=true'; // TODO: update for production

function renderComponent(content: any) {
  // TODO: Implement rendering of structured content (charts, cards, etc.)
  // For now, just log to console
  console.log('Render structured content:', content);
}

const EnterpriseDashboardPage: React.FC = () => {
  const { loading, error, user, roles } = useEnterpriseAuth();
  const [company, setCompany] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // RBAC: Only show chat for authorized enterprise users
  const showChat = user && user.userGroup === 'enterprise' && roles.includes('SuperAdmin'); // TODO: expand roles if needed

  useEffect(() => {
    if (!loading && !error) {
      // Fetch company and analytics data
      const fetchData = async () => {
        setIsLoading(true);
        setApiError(null);
        try {
          // TODO: Replace with real API call for company info if available
          // Placeholder: setCompany({ name: 'Demo Company', ... })
          setCompany({ name: 'Demo Company', id: 'company-123', domain: 'demo.com' });
          // Use public method for analytics
          const analyticsRes = await apiService.getAnalyticsOverview();
          setAnalytics(analyticsRes.data || analyticsRes);
        } catch (e: any) {
          setApiError(e.message || 'Failed to load enterprise dashboard data');
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [loading, error]);

  useEffect(() => {
    if (!showChat) return;
    // Only run in browser
    if (typeof window === 'undefined') return;
    // Initialize AG-UI protocol client for iframe
    const connector = AgUiClient.createAgUiConnector({
      transport: 'iframe',
      iframeSelector: '#enterprise-chatbot',
      eventTypes: ['message', 'structured_content']
    });
    // Example: send user context (customize as needed)
    connector.emit('ui.setContext', { userId: user?.uid, role: roles[0] });
    // Listen for agent responses (customize as needed)
    connector.on('agent.response', (event: any) => {
      // Custom handler for agent responses
      console.log('Agent says:', event.payload?.content);
      // TODO: Display agent messages in UI if desired
    });
    connector.on('structured_content', ({ payload }: any) => {
      renderComponent(payload.content);
    });
    // Cleanup on unmount
    return () => connector.disconnect && connector.disconnect();
  }, [showChat, user, roles]);

  if (loading || isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner /> Loading enterprise dashboard...</div>;
  }
  if (error || apiError) {
    return <ErrorDisplay error={error || apiError} title="Enterprise Dashboard Error" description="Unable to load enterprise dashboard data." />;
  }

  // TODO: Customize layout and stats for enterprise users
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6 text-blue-800">Enterprise Dashboard</h1>
      <div className="mb-4">Welcome, {user?.email} ({roles?.join(', ')})</div>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Company Info</h2>
        <pre className="bg-white rounded p-4 shadow text-sm overflow-x-auto">{JSON.stringify(company, null, 2)}</pre>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Analytics</h2>
        <pre className="bg-white rounded p-4 shadow text-sm overflow-x-auto">{JSON.stringify(analytics, null, 2)}</pre>
      </div>
      {/* TODO: Add AG-UI chat, charts, and enterprise-specific widgets */}
      {showChat && (
        <section className="mt-8">
          <h2 className="text-xl font-bold mb-2">AI Agent Chat</h2>
          {/* Open WebUI iframe */}
          <iframe
            id="enterprise-chatbot"
            src={OPEN_WEBUI_URL}
            title="Enterprise AI Agent Chat"
            className="w-full h-[500px] border rounded-lg shadow-lg"
            allow="clipboard-write; microphone; camera"
          />
        </section>
      )}
    </div>
  );
};

export default EnterpriseDashboardPage; 