import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EnterpriseDashboardPage from '../Dashboard';
import * as AgUiClient from '../../lib/ag-ui-client';

// Mock AG-UI client
const mockConnector = {
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  disconnect: jest.fn(),
};

jest.mock('../../lib/ag-ui-client', () => ({
  createAgUiConnector: jest.fn(() => mockConnector),
}));

// Mock useEnterpriseAuth
const mockUseEnterpriseAuth = jest.fn();
jest.mock('../../hooks/useEnterpriseAuth', () => ({
  useEnterpriseAuth: () => mockUseEnterpriseAuth(),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('EnterpriseDashboardPage Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConnector.emit.mockClear();
    mockConnector.on.mockClear();
    mockConnector.off.mockClear();
    mockConnector.disconnect.mockClear();
  });

  describe('UI Rendering Integration', () => {
    it('renders iframe for authorized users and hides for unauthorized users', async () => {
      // Test authorized user
      mockUseEnterpriseAuth.mockReturnValue({
        loading: false,
        error: null,
        user: { 
          uid: 'auth-123', 
          email: 'admin@enterprise.com',
          userGroup: 'enterprise' 
        },
        roles: ['SuperAdmin'],
        isEnterpriseUser: true,
        canAccessChat: true,
      });

      const { rerender } = renderWithRouter(<EnterpriseDashboardPage />);
      
      // Should render iframe
      expect(screen.getByTitle('Enterprise AI Agent Chat')).toBeInTheDocument();
      expect(screen.queryByText('🔒 Access Restricted')).not.toBeInTheDocument();

      // Test unauthorized user
      mockUseEnterpriseAuth.mockReturnValue({
        loading: false,
        error: null,
        user: { 
          uid: 'unauth-123', 
          email: 'student@academy.com',
          userGroup: 'academy' 
        },
        roles: ['CodingStudent'],
        isEnterpriseUser: false,
        canAccessChat: false,
      });

      rerender(
        <BrowserRouter>
          <EnterpriseDashboardPage />
        </BrowserRouter>
      );

      // Should show access restricted
      expect(screen.queryByTitle('Enterprise AI Agent Chat')).not.toBeInTheDocument();
      expect(screen.getByText('🔒 Access Restricted')).toBeInTheDocument();
    });

    it('shows loading state and then transitions to dashboard', async () => {
      // Start with loading
      mockUseEnterpriseAuth.mockReturnValue({
        loading: true,
        error: null,
        user: null,
        roles: [],
        isEnterpriseUser: false,
        canAccessChat: false,
      });

      const { rerender } = renderWithRouter(<EnterpriseDashboardPage />);
      
      // Should show loading
      expect(screen.getByRole('generic')).toHaveClass('animate-spin');
      expect(screen.queryByText('Enterprise Dashboard')).not.toBeInTheDocument();

      // Transition to loaded state
      mockUseEnterpriseAuth.mockReturnValue({
        loading: false,
        error: null,
        user: { 
          uid: '123', 
          email: 'admin@enterprise.com',
          userGroup: 'enterprise' 
        },
        roles: ['SuperAdmin'],
        isEnterpriseUser: true,
        canAccessChat: true,
      });

      rerender(
        <BrowserRouter>
          <EnterpriseDashboardPage />
        </BrowserRouter>
      );

      // Should show dashboard
      expect(screen.queryByRole('generic')).not.toHaveClass('animate-spin');
      expect(screen.getByText('Enterprise Dashboard')).toBeInTheDocument();
    });
  });

  describe('Event Flow Integration', () => {
    it('simulates AG-UI events and verifies handler effects', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      mockUseEnterpriseAuth.mockReturnValue({
        loading: false,
        error: null,
        user: { 
          uid: '123', 
          email: 'admin@enterprise.com',
          userGroup: 'enterprise' 
        },
        roles: ['SuperAdmin'],
        isEnterpriseUser: true,
        canAccessChat: true,
      });

      renderWithRouter(<EnterpriseDashboardPage />);

      // Verify AG-UI connector was initialized
      expect(AgUiClient.createAgUiConnector).toHaveBeenCalledTimes(1);
      expect(mockConnector.on).toHaveBeenCalledWith('agent.response', expect.any(Function));
      expect(mockConnector.on).toHaveBeenCalledWith('structured_content', expect.any(Function));

      // Get the registered callback functions
      const agentResponseCallback = mockConnector.on.mock.calls.find(call => call[0] === 'agent.response')?.[1];
      const structuredContentCallback = mockConnector.on.mock.calls.find(call => call[0] === 'structured_content')?.[1];

      // Simulate agent response event
      if (agentResponseCallback) {
        const mockResponse = {
          id: 'response-123',
          type: 'text' as const,
          content: 'Hello, how can I help you?',
          timestamp: Date.now(),
        };
        
        agentResponseCallback(mockResponse);
        
        expect(consoleSpy).toHaveBeenCalledWith('Agent response received:', mockResponse);
      }

      // Simulate structured content event
      if (structuredContentCallback) {
        const mockContent = {
          type: 'table' as const,
          data: [
            { id: 1, name: 'John', status: 'Active' },
            { id: 2, name: 'Jane', status: 'Inactive' },
          ],
        };
        
        structuredContentCallback(mockContent);
        
        expect(consoleSpy).toHaveBeenCalledWith('Structured content received:', mockContent);
      }

      consoleSpy.mockRestore();
    });

    it('handles multiple event types in sequence', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      mockUseEnterpriseAuth.mockReturnValue({
        loading: false,
        error: null,
        user: { 
          uid: '123', 
          email: 'admin@enterprise.com',
          userGroup: 'enterprise' 
        },
        roles: ['SuperAdmin'],
        isEnterpriseUser: true,
        canAccessChat: true,
      });

      renderWithRouter(<EnterpriseDashboardPage />);

      // Get the registered callback functions
      const agentResponseCallback = mockConnector.on.mock.calls.find(call => call[0] === 'agent.response')?.[1];
      const structuredContentCallback = mockConnector.on.mock.calls.find(call => call[0] === 'structured_content')?.[1];

      // Simulate multiple events in sequence
      if (agentResponseCallback && structuredContentCallback) {
        // First event
        agentResponseCallback({
          id: 'response-1',
          type: 'text' as const,
          content: 'Processing your request...',
          timestamp: Date.now(),
        });

        // Second event
        structuredContentCallback({
          type: 'chart' as const,
          data: { labels: ['Jan', 'Feb', 'Mar'], values: [10, 20, 30] },
        });

        // Third event
        agentResponseCallback({
          id: 'response-2',
          type: 'structured' as const,
          content: 'Here are your results',
          timestamp: Date.now(),
        });

        expect(consoleSpy).toHaveBeenCalledTimes(3);
      }

      consoleSpy.mockRestore();
    });
  });

  describe('Security Integration Tests', () => {
    it('ensures no chat is rendered for unauthorized users across different user types', () => {
      const unauthorizedUsers = [
        {
          user: { uid: '1', email: 'student@academy.com', userGroup: 'academy' },
          roles: ['CodingStudent'],
          description: 'Academy student'
        },
        {
          user: { uid: '2', email: 'reviewer@academy.com', userGroup: 'academy' },
          roles: ['Reviewer'],
          description: 'Academy reviewer'
        },
        {
          user: { uid: '3', email: 'labeler@company.com', userGroup: 'guest' },
          roles: ['Labeler'],
          description: 'Guest labeler'
        },
        {
          user: null,
          roles: [],
          description: 'Unauthenticated user'
        }
      ];

      unauthorizedUsers.forEach(({ user, roles, description }) => {
        mockUseEnterpriseAuth.mockReturnValue({
          loading: false,
          error: null,
          user,
          roles,
          isEnterpriseUser: false,
          canAccessChat: false,
        });

        const { unmount } = renderWithRouter(<EnterpriseDashboardPage />);
        
        if (user) {
          // Should show access restricted for logged-in unauthorized users
          expect(screen.getByText('🔒 Access Restricted')).toBeInTheDocument();
          expect(screen.queryByTitle('Enterprise AI Agent Chat')).not.toBeInTheDocument();
          expect(AgUiClient.createAgUiConnector).not.toHaveBeenCalled();
        } else {
          // Should show access denied for unauthenticated users
          expect(screen.getByText('Access Denied')).toBeInTheDocument();
          expect(screen.queryByTitle('Enterprise AI Agent Chat')).not.toBeInTheDocument();
          expect(AgUiClient.createAgUiConnector).not.toHaveBeenCalled();
        }

        unmount();
        jest.clearAllMocks();
      });
    });

    it('verifies AG-UI connector is only initialized for authorized users', () => {
      const testCases = [
        {
          user: { uid: '1', userGroup: 'enterprise' },
          roles: ['SuperAdmin'],
          shouldInitialize: true,
          description: 'SuperAdmin enterprise user'
        },
        {
          user: { uid: '2', userGroup: 'enterprise' },
          roles: ['TaskAdmin'],
          shouldInitialize: true,
          description: 'TaskAdmin enterprise user'
        },
        {
          user: { uid: '3', userGroup: 'academy' },
          roles: ['SuperAdmin'],
          shouldInitialize: false,
          description: 'SuperAdmin academy user'
        },
        {
          user: { uid: '4', userGroup: 'enterprise' },
          roles: ['Labeler'],
          shouldInitialize: false,
          description: 'Labeler enterprise user'
        }
      ];

      testCases.forEach(({ user, roles, shouldInitialize, description }) => {
        mockUseEnterpriseAuth.mockReturnValue({
          loading: false,
          error: null,
          user,
          roles,
          isEnterpriseUser: user?.userGroup === 'enterprise',
          canAccessChat: shouldInitialize,
        });

        const { unmount } = renderWithRouter(<EnterpriseDashboardPage />);
        
        if (shouldInitialize) {
          expect(AgUiClient.createAgUiConnector).toHaveBeenCalledTimes(1);
          expect(mockConnector.on).toHaveBeenCalledWith('agent.response', expect.any(Function));
          expect(mockConnector.on).toHaveBeenCalledWith('structured_content', expect.any(Function));
        } else {
          expect(AgUiClient.createAgUiConnector).not.toHaveBeenCalled();
        }

        unmount();
        jest.clearAllMocks();
      });
    });
  });

  describe('Error Handling Integration', () => {
    it('handles AG-UI connector errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      (AgUiClient.createAgUiConnector as jest.Mock).mockImplementation(() => {
        throw new Error('Network connection failed');
      });

      mockUseEnterpriseAuth.mockReturnValue({
        loading: false,
        error: null,
        user: { 
          uid: '123', 
          email: 'admin@enterprise.com',
          userGroup: 'enterprise' 
        },
        roles: ['SuperAdmin'],
        isEnterpriseUser: true,
        canAccessChat: true,
      });

      renderWithRouter(<EnterpriseDashboardPage />);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to initialize AG-UI connector:',
        expect.objectContaining({
          message: 'Network connection failed'
        })
      );

      consoleSpy.mockRestore();
    });

    it('handles auth errors gracefully', () => {
      mockUseEnterpriseAuth.mockReturnValue({
        loading: false,
        error: new Error('Authentication failed'),
        user: null,
        roles: [],
        isEnterpriseUser: false,
        canAccessChat: false,
      });

      renderWithRouter(<EnterpriseDashboardPage />);

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(AgUiClient.createAgUiConnector).not.toHaveBeenCalled();
    });
  });

  describe('Component Lifecycle Integration', () => {
    it('properly initializes and cleans up AG-UI connector', () => {
      mockUseEnterpriseAuth.mockReturnValue({
        loading: false,
        error: null,
        user: { 
          uid: '123', 
          email: 'admin@enterprise.com',
          userGroup: 'enterprise' 
        },
        roles: ['SuperAdmin'],
        isEnterpriseUser: true,
        canAccessChat: true,
      });

      const { unmount } = renderWithRouter(<EnterpriseDashboardPage />);

      // Verify initialization
      expect(AgUiClient.createAgUiConnector).toHaveBeenCalledTimes(1);
      expect(mockConnector.on).toHaveBeenCalledWith('agent.response', expect.any(Function));
      expect(mockConnector.on).toHaveBeenCalledWith('structured_content', expect.any(Function));

      // Verify cleanup on unmount
      unmount();
      expect(mockConnector.disconnect).toHaveBeenCalledTimes(1);
    });

    it('handles permission changes dynamically', () => {
      // Start with authorized user
      mockUseEnterpriseAuth.mockReturnValue({
        loading: false,
        error: null,
        user: { 
          uid: '123', 
          email: 'admin@enterprise.com',
          userGroup: 'enterprise' 
        },
        roles: ['SuperAdmin'],
        isEnterpriseUser: true,
        canAccessChat: true,
      });

      const { rerender } = renderWithRouter(<EnterpriseDashboardPage />);

      // Should initialize connector
      expect(AgUiClient.createAgUiConnector).toHaveBeenCalledTimes(1);
      expect(screen.getByTitle('Enterprise AI Agent Chat')).toBeInTheDocument();

      // Change to unauthorized user
      mockUseEnterpriseAuth.mockReturnValue({
        loading: false,
        error: null,
        user: { 
          uid: '123', 
          email: 'admin@enterprise.com',
          userGroup: 'academy' 
        },
        roles: ['CodingStudent'],
        isEnterpriseUser: false,
        canAccessChat: false,
      });

      rerender(
        <BrowserRouter>
          <EnterpriseDashboardPage />
        </BrowserRouter>
      );

      // Should disconnect previous connector and show restricted access
      expect(mockConnector.disconnect).toHaveBeenCalledTimes(1);
      expect(screen.queryByTitle('Enterprise AI Agent Chat')).not.toBeInTheDocument();
      expect(screen.getByText('🔒 Access Restricted')).toBeInTheDocument();
    });
  });
});