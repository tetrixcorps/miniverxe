// Debugging Tools Integration Example
// Demonstrates how to use all debugging tools together

import React, { useState, useEffect } from 'react';
import ErrorBoundary from '../error/ErrorBoundary';
import ComponentErrorBoundary from '../error/ComponentErrorBoundary';
import { useErrorHandler, useAPIErrorHandler } from '../../hooks/useErrorHandler';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';
import { apiMonitor } from '../../services/performance/APIMonitor';

interface User {
  id: string;
  name: string;
  email: string;
}

const DebuggingExample: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Error handling
  const { errorState, handleError, clearError } = useErrorHandler('DebuggingExample');
  const { handleAPIError } = useAPIErrorHandler('DebuggingExample');

  // Performance monitoring
  const { trackUserAction, completeUserAction, trackAPICall, completeAPICall } = usePerformanceMonitor({
    componentName: 'DebuggingExample',
    trackRenders: true,
    trackUserActions: true,
    trackAPI: true
  });

  // Load users with error handling and performance monitoring
  const loadUsers = async () => {
    const actionId = trackUserAction('load_users', 'load-button');
    
    try {
      setLoading(true);
      setError(null);
      clearError();

      // Track API call
      const apiId = trackAPICall('/api/users', 'GET');
      
      // Use API monitor for automatic retry and timeout
      const response = await apiMonitor.get<User[]>('/api/users', {
        timeout: 5000,
        retries: 3,
        componentName: 'DebuggingExample'
      });

      if (response.ok && response.data) {
        setUsers(response.data);
        completeAPICall(apiId, response.status, response.data.length, 'success');
        completeUserAction(actionId, 'success');
      } else {
        throw new Error(`API call failed with status: ${response.status}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      handleError(new Error(errorMessage), 'loading users');
      completeUserAction(actionId, 'error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Simulate error for testing
  const simulateError = () => {
    const actionId = trackUserAction('simulate_error', 'error-button');
    
    try {
      // This will throw an error
      throw new Error('Simulated error for testing');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      handleError(new Error(errorMessage), 'simulating error');
      completeUserAction(actionId, 'error', errorMessage);
    }
  };

  // Test API error handling
  const testAPIError = async () => {
    const actionId = trackUserAction('test_api_error', 'api-error-button');
    
    try {
      // This will fail
      const response = await handleAPIError(
        () => fetch('/api/nonexistent'),
        'testing API error handling'
      );
      
      if (response) {
        completeUserAction(actionId, 'success');
      } else {
        completeUserAction(actionId, 'error', 'API call failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      completeUserAction(actionId, 'error', errorMessage);
    }
  };

  // Load users on mount
  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Debugging Tools Integration Example
      </h1>

      {/* Error State Display */}
      {errorState.hasError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="text-red-600 text-xl mr-3">⚠</div>
            <div>
              <h3 className="text-lg font-semibold text-red-800">Error Detected</h3>
              <p className="text-red-700">{errorState.error?.message}</p>
              <p className="text-sm text-red-600">Error ID: {errorState.errorId}</p>
            </div>
            <button
              onClick={clearError}
              className="ml-auto bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200 transition-colors"
            >
              Clear Error
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={loadUsers}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Loading...' : 'Load Users'}
        </button>
        
        <button
          onClick={simulateError}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
        >
          Simulate Error
        </button>
        
        <button
          onClick={testAPIError}
          className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition-colors"
        >
          Test API Error
        </button>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Users</h2>
        
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading users...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <div className="text-red-600 text-xl mb-2">⚠</div>
            <p className="text-red-700">{error}</p>
            <button
              onClick={loadUsers}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && users.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">No users found</p>
          </div>
        )}

        {!loading && !error && users.length > 0 && (
          <div className="space-y-2">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-600">{user.email}</div>
                </div>
                <div className="text-sm text-gray-500">ID: {user.id}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Debug Information */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Debug Information</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p>Error State: {errorState.hasError ? 'Has Error' : 'No Error'}</p>
          <p>Error ID: {errorState.errorId || 'None'}</p>
          <p>Component: DebuggingExample</p>
          <p>Performance Monitoring: Enabled</p>
          <p>Error Handling: Enabled</p>
        </div>
      </div>
    </div>
  );
};

// Wrap with error boundaries
const DebuggingExampleWithErrorBoundaries: React.FC = () => (
  <ErrorBoundary
    onError={(error, errorInfo) => {
      console.error('Global error in DebuggingExample:', error, errorInfo);
    }}
  >
    <ComponentErrorBoundary
      componentName="DebuggingExample"
      onError={(error, errorInfo, componentName) => {
        console.error(`Error in ${componentName}:`, error, errorInfo);
      }}
    >
      <DebuggingExample />
    </ComponentErrorBoundary>
  </ErrorBoundary>
);

export default DebuggingExampleWithErrorBoundaries;
