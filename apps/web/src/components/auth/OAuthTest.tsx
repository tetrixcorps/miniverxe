import React, { useState } from 'react';
import OAuthLogin from './OAuthLogin';

const OAuthTest: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleOAuthSuccess = (user: any) => {
    addResult(`OAuth Success: ${user?.email || 'Unknown user'}`);
  };

  const handleOAuthError = (error: string) => {
    addResult(`OAuth Error: ${error}`);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">OAuth Integration Test</h1>
        <p className="text-gray-600 mb-4">
          This page tests the OAuth integration with the backend API.
        </p>
        
        <div className="flex space-x-4 mb-6">
          <button
            onClick={clearResults}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Clear Results
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">OAuth Login Component</h2>
          <OAuthLogin
            onSuccess={handleOAuthSuccess}
            onError={handleOAuthError}
            className="border rounded-lg p-6"
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <div className="border rounded-lg p-4 bg-gray-50 h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500">No test results yet. Try the OAuth login above.</p>
            ) : (
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm font-mono bg-white p-2 rounded border">
                    {result}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Test Instructions:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Click on an OAuth provider button to test the authorization flow</li>
          <li>• The component will attempt to fetch available providers from the backend</li>
          <li>• Check the test results panel for success/error messages</li>
          <li>• Verify that the backend API endpoints are responding correctly</li>
        </ul>
      </div>
    </div>
  );
};

export default OAuthTest; 