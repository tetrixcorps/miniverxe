import React, { useState, useEffect } from 'react';

export const HubSpotWidget: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    contacts: 0,
    deals: 0,
    pipeline: 0
  });

  useEffect(() => {
    // Simulate checking connection status
    setTimeout(() => {
      setConnected(false); // Default to not connected
      setLoading(false);
    }, 500);
  }, []);

  const handleConnect = () => {
    // In a real implementation, this would open OAuth flow
    window.open('/api/integrations/hubspot/connect', '_blank');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">HubSpot</h3>
            <p className="text-sm text-gray-600">Marketing & Sales</p>
          </div>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          connected 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {connected ? 'Connected' : 'Not Connected'}
        </span>
      </div>

      {connected ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{data.contacts}</p>
              <p className="text-xs text-gray-600">Contacts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{data.deals}</p>
              <p className="text-xs text-gray-600">Deals</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">${data.pipeline.toLocaleString()}</p>
              <p className="text-xs text-gray-600">Pipeline</p>
            </div>
          </div>
          <button className="w-full text-sm text-orange-600 hover:text-orange-700 font-medium">
            View Dashboard →
          </button>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-sm text-gray-600 mb-4">
            Connect your HubSpot account to sync contacts, deals, and marketing data.
          </p>
          <button
            onClick={handleConnect}
            className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium"
          >
            Connect HubSpot
          </button>
        </div>
      )}
    </div>
  );
};

export default HubSpotWidget;




