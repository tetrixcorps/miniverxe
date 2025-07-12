import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EnterpriseDashboardPage from '../Dashboard';
import * as AgUiClient from '../../lib/ag-ui-client';

// Mock AG-UI client
jest.mock('../../lib/ag-ui-client', () => ({
  createAgUiConnector: jest.fn(() => ({
    emit: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    disconnect: jest.fn(),
  })),
}));

// Mock useEnterpriseAuth
const mockUseEnterpriseAuth = jest.fn();
jest.mock('../../hooks/useEnterpriseAuth', () => ({
  useEnterpriseAuth: () => mockUseEnterpriseAuth(),
}));

// Wrapper for components that need Router
const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('EnterpriseDashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('RBAC Logic Tests', () => {
    it('renders AI Agent Chat iframe for authorized enterprise user', () => {
      mockUseEnterpriseAuth.mockReturnValue({
        loading: false,
        error: null,
        user: { 
          uid: '123', 
          email: 'admin@enterprise.com',
          userGroup: 'enterprise',
          department: 'IT',
          organizationId: 'org-123'
        },
        roles: ['SuperAdmin'],
        isEnterpriseUser: true,
        canAccessChat: true,
      });

      renderWithRouter(<EnterpriseDashboardPage />);
      
      expect(screen.getByTitle('Enterprise AI Agent Chat')).toBeInTheDocument();
      expect(screen.getByText('AI Agent Chat')).toBeInTheDocument();
      expect(screen.queryByText('🔒 Access Restricted')).not.toBeInTheDocument();
    });

    it('does not render AI Agent Chat for unauthorized user', () => {
      mockUseEnterpriseAuth.mockReturnValue({
        loading: false,
        error: null,
        user: { 
          uid: '123', 
          email: 'student@academy.com',
          userGroup: 'academy',
          department: 'Education',
          organizationId: 'org-456'
        },
        roles: ['CodingStudent'],
        isEnterpriseUser: false,
        canAccessChat: false,
      });

      renderWithRouter(<EnterpriseDashboardPage />);
      
      expect(screen.queryByTitle('Enterprise AI Agent Chat')).not.toBeInTheDocument();
      expect(screen.getByText('🔒 Access Restricted')).toBeInTheDocument();
      expect(screen.getByText('You don\'t have sufficient permissions to access the AI Agent Chat.')).toBeInTheDocument();
    });

    it('shows access denied for non-enterprise user even with some permissions', () => {
      mockUseEnterpriseAuth.mockReturnValue({
        loading: false,
        error: null,
        user: { 
          uid: '123', 
          email: 'reviewer@academy.com',
          userGroup: 'academy',
          department: 'Education',
          organizationId: 'org-456'
        },
        roles: ['Reviewer'],
        isEnterpriseUser: false,
        canAccessChat: false,
      });

      renderWithRouter(<EnterpriseDashboardPage />);
      
      expect(screen.queryByTitle('Enterprise AI Agent Chat')).not.toBeInTheDocument();
      expect(screen.getByText('🔒 Access Restricted')).toBeInTheDocument();
    });
  });

  describe('AG-UI Connector Initialization Tests', () => {
    it('initializes AG-UI connector when chat is shown', () => {
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
      
      expect(AgUiClient.createAgUiConnector).toHaveBeenCalledWith(
        expect.objectContaining({
          transport: 'iframe',
          iframeSelector: '#enterprise-chatbot',
          onConnect: expect.any(Function),
          onDisconnect: expect.any(Function),
          onError: expect.any(Function),
        })
      );
    });

    it('does not initialize AG-UI connector when chat is not shown', () => {
      mockUseEnterpriseAuth.mockReturnValue({
        loading: false,
        error: null,
        user: { 
          uid: '123', 
          email: 'student@academy.com',
          userGroup: 'academy' 
        },
        roles: ['CodingStudent'],
        isEnterpriseUser: false,
        canAccessChat: false,
      });

      renderWithRouter(<EnterpriseDashboardPage />);
      
      expect(AgUiClient.createAgUiConnector).not.toHaveBeenCalled();
    });

    it('handles AG-UI connector initialization error gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      (AgUiClient.createAgUiConnector as jest.Mock).mockImplementation(() => {
        throw new Error('Connection failed');
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
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Event Handler Registration Tests', () => {
    it('registers event handlers for agent.response and structured_content', () => {
      const mockOn = jest.fn();
      const mockConnector = {
        emit: jest.fn(),
        on: mockOn,
        off: jest.fn(),
        disconnect: jest.fn(),
      };

      (AgUiClient.createAgUiConnector as jest.Mock).mockReturnValue(mockConnector);

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

      expect(mockOn).toHaveBeenCalledWith('agent.response', expect.any(Function));
      expect(mockOn).toHaveBeenCalledWith('structured_content', expect.any(Function));
    });

    it('handles agent.response event correctly', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const mockOn = jest.fn();
      const mockConnector = {
        emit: jest.fn(),
        on: mockOn,
        off: jest.fn(),
        disconnect: jest.fn(),
      };

      (AgUiClient.createAgUiConnector as jest.Mock).mockReturnValue(mockConnector);

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

      // Get the callback function passed to 'on' for 'agent.response'
      const agentResponseCallback = mockOn.mock.calls.find(call => call[0] === 'agent.response')?.[1];
      
      // Simulate an agent response event
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
      
      consoleSpy.mockRestore();
    });

    it('handles structured_content event correctly', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const mockOn = jest.fn();
      const mockConnector = {
        emit: jest.fn(),
        on: mockOn,
        off: jest.fn(),
        disconnect: jest.fn(),
      };

      (AgUiClient.createAgUiConnector as jest.Mock).mockReturnValue(mockConnector);

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

      // Get the callback function passed to 'on' for 'structured_content'
      const structuredContentCallback = mockOn.mock.calls.find(call => call[0] === 'structured_content')?.[1];
      
      // Simulate a structured content event
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
  });

  describe('Loading and Error States', () => {
    it('shows loading spinner when loading', () => {
      mockUseEnterpriseAuth.mockReturnValue({
        loading: true,
        error: null,
        user: null,
        roles: [],
        isEnterpriseUser: false,
        canAccessChat: false,
      });

      renderWithRouter(<EnterpriseDashboardPage />);
      
      expect(screen.getByRole('generic')).toHaveClass('animate-spin');
    });

    it('shows access denied when user is not logged in', () => {
      mockUseEnterpriseAuth.mockReturnValue({
        loading: false,
        error: null,
        user: null,
        roles: [],
        isEnterpriseUser: false,
        canAccessChat: false,
      });

      renderWithRouter(<EnterpriseDashboardPage />);
      
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.getByText('Please log in to access the dashboard.')).toBeInTheDocument();
    });
  });

  describe('UI Rendering Tests', () => {
    it('renders dashboard content for authenticated user', () => {
      mockUseEnterpriseAuth.mockReturnValue({
        loading: false,
        error: null,
        user: { 
          uid: '123', 
          email: 'admin@enterprise.com',
          userGroup: 'enterprise',
          department: 'IT',
          organizationId: 'org-123'
        },
        roles: ['SuperAdmin'],
        isEnterpriseUser: true,
        canAccessChat: true,
      });

      renderWithRouter(<EnterpriseDashboardPage />);
      
      expect(screen.getByText('Enterprise Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Welcome back, admin@enterprise.com')).toBeInTheDocument();
      expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
      expect(screen.getByText('Active Projects')).toBeInTheDocument();
      expect(screen.getByText('Completed Tasks')).toBeInTheDocument();
      expect(screen.getByText('User Information')).toBeInTheDocument();
      expect(screen.getByText('User Group: enterprise')).toBeInTheDocument();
      expect(screen.getByText('Department: IT')).toBeInTheDocument();
      expect(screen.getByText('Organization: org-123')).toBeInTheDocument();
    });

    it('renders user information with defaults when optional fields are missing', () => {
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
      
      expect(screen.getByText('Department: Not specified')).toBeInTheDocument();
      expect(screen.getByText('Organization: Not specified')).toBeInTheDocument();
    });
  });

  describe('Cleanup Tests', () => {
    it('disconnects AG-UI connector on unmount', () => {
      const mockDisconnect = jest.fn();
      const mockConnector = {
        emit: jest.fn(),
        on: jest.fn(),
        off: jest.fn(),
        disconnect: mockDisconnect,
      };

      (AgUiClient.createAgUiConnector as jest.Mock).mockReturnValue(mockConnector);

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
      
      unmount();
      
      expect(mockDisconnect).toHaveBeenCalled();
    });
  });
});