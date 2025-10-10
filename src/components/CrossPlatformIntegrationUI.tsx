// Cross-Platform Integration UI Component
// Displays integration status and cross-platform features

import React, { useState, useEffect } from 'react';

interface IntegrationStatus {
  voiceAPI: {
    status: string;
    features: string[];
  };
  ivrIntegration: {
    status: string;
    features: string[];
  };
  sinchChatIntegration: {
    status: string;
    features: string[];
  };
  unifiedMessagingIntegration: {
    status: string;
    features: string[];
  };
  transcription: {
    status: string;
    features: string[];
  };
  translation: {
    status: string;
    features: string[];
  };
  crossPlatformSync: {
    status: string;
    features: string[];
  };
  webhooks: {
    status: string;
    features: string[];
  };
}

export const CrossPlatformIntegrationUI: React.FC = () => {
  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch integration status
  const fetchIntegrationStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/voice/integration/status');
      
      if (response.ok) {
        const data = await response.json();
        setIntegrationStatus(data.status);
        setError(null);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      console.error('Failed to fetch integration status:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch integration status');
    } finally {
      setLoading(false);
    }
  };

  // Load integration status on component mount
  useEffect(() => {
    fetchIntegrationStatus();
    const interval = setInterval(fetchIntegrationStatus, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'enabled':
        return 'text-green-600 bg-green-100';
      case 'disabled':
        return 'text-red-600 bg-red-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'enabled':
        return '✅';
      case 'disabled':
        return '❌';
      case 'pending':
        return '⏳';
      default:
        return '❓';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading integration status...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-8">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Integration Status</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchIntegrationStatus}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!integrationStatus) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">📡</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Integration Data</h3>
          <p className="text-gray-600">Integration status data is not available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          🔗 Cross-Platform Integration Status
        </h2>
        <button
          onClick={fetchIntegrationStatus}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
        >
          Refresh
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Voice API */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-700">Voice API</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(integrationStatus.voiceAPI.status)}`}>
              {getStatusIcon(integrationStatus.voiceAPI.status)} {integrationStatus.voiceAPI.status}
            </span>
          </div>
          <ul className="space-y-1 text-sm text-gray-600">
            {integrationStatus.voiceAPI.features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <span className="text-green-500 mr-2">•</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* IVR Integration */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-700">IVR Integration</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(integrationStatus.ivrIntegration.status)}`}>
              {getStatusIcon(integrationStatus.ivrIntegration.status)} {integrationStatus.ivrIntegration.status}
            </span>
          </div>
          <ul className="space-y-1 text-sm text-gray-600">
            {integrationStatus.ivrIntegration.features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <span className="text-green-500 mr-2">•</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Sinch Chat Integration */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-700">Sinch Chat Integration</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(integrationStatus.sinchChatIntegration.status)}`}>
              {getStatusIcon(integrationStatus.sinchChatIntegration.status)} {integrationStatus.sinchChatIntegration.status}
            </span>
          </div>
          <ul className="space-y-1 text-sm text-gray-600">
            {integrationStatus.sinchChatIntegration.features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <span className="text-green-500 mr-2">•</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Unified Messaging Integration */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-700">Unified Messaging</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(integrationStatus.unifiedMessagingIntegration.status)}`}>
              {getStatusIcon(integrationStatus.unifiedMessagingIntegration.status)} {integrationStatus.unifiedMessagingIntegration.status}
            </span>
          </div>
          <ul className="space-y-1 text-sm text-gray-600">
            {integrationStatus.unifiedMessagingIntegration.features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <span className="text-green-500 mr-2">•</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Transcription */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-700">Transcription</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(integrationStatus.transcription.status)}`}>
              {getStatusIcon(integrationStatus.transcription.status)} {integrationStatus.transcription.status}
            </span>
          </div>
          <ul className="space-y-1 text-sm text-gray-600">
            {integrationStatus.transcription.features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <span className="text-green-500 mr-2">•</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Cross-Platform Sync */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-700">Cross-Platform Sync</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(integrationStatus.crossPlatformSync.status)}`}>
              {getStatusIcon(integrationStatus.crossPlatformSync.status)} {integrationStatus.crossPlatformSync.status}
            </span>
          </div>
          <ul className="space-y-1 text-sm text-gray-600">
            {integrationStatus.crossPlatformSync.features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <span className="text-green-500 mr-2">•</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Overall Status Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">Overall Integration Health</h4>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {Object.values(integrationStatus).filter(service => 
              service.status.toLowerCase() === 'active' || service.status.toLowerCase() === 'enabled'
            ).length} of {Object.keys(integrationStatus).length} services active
          </div>
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrossPlatformIntegrationUI;
