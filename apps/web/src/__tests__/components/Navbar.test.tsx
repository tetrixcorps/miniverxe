import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../providers/AuthProvider';
import { Navbar } from '../../components/Navbar';

// Mock @tetrix/rbac package
jest.mock('@tetrix/rbac', () => ({
  Roles: {
    Labeler: 'Labeler',
    SuperAdmin: 'SuperAdmin',
    ClientAdmin: 'ClientAdmin',
  },
  Permissions: {
    'task.assign': 'task.assign',
    'org.create': 'org.create',
  },
}));

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
  GoogleAuthProvider: jest.fn(),
}));

// Mock Firebase Auth instance
jest.mock('../../lib/firebase', () => ({
  auth: {
    currentUser: null,
  },
}));

// Mock window.location
const mockLocation = {
  href: '',
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// Wrapper component for testing
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>{children}</AuthProvider>
  </BrowserRouter>
);

describe('Navbar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up default mock behavior
    const { onAuthStateChanged } = require('firebase/auth');
    onAuthStateChanged.mockImplementation((auth: any, callback: any) => {
      // Call callback asynchronously to allow loading state to be tested
      setTimeout(() => {
        callback(null); // No user by default
      }, 0);
      return () => {};
    });
  });

  describe('Unauthenticated State', () => {
    test('should render navbar with correct elements when not authenticated', async () => {
      render(
        <TestWrapper>
          <Navbar />
        </TestWrapper>
      );

      // Check for logo/brand
      expect(screen.getByText('TETRIX')).toBeInTheDocument();

      // Check for navigation links
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();

      // Check for login button (should show Client Login for unauthenticated users)
      expect(screen.getByText('Client Login')).toBeInTheDocument();
      expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
    });

    test('should show client login button for unauthenticated users', async () => {
      render(
        <TestWrapper>
          <Navbar />
        </TestWrapper>
      );

      const clientLoginButton = screen.getByText('Client Login');
      expect(clientLoginButton).toBeInTheDocument();
      expect(clientLoginButton).toBeInstanceOf(HTMLButtonElement);
    });
  });

  describe('Authenticated State - Data Annotator', () => {
    test('should render navbar for data annotator user', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'annotator@example.com',
        displayName: 'Data Annotator',
        getIdTokenResult: jest.fn().mockResolvedValue({
          claims: {
            userGroup: 'data-annotator',
            roles: ['Labeler'],
            permissions: ['task.assign'],
            isActive: true,
          },
        }),
      };

      const { onAuthStateChanged } = require('firebase/auth');
      onAuthStateChanged.mockImplementation((auth: any, callback: any) => {
        callback(mockUser);
        return () => {};
      });

      render(
        <TestWrapper>
          <Navbar />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should show user display name or email
        expect(screen.getByText('Welcome, Data Annotator')).toBeInTheDocument();
        
        // Should not show Client Login for data annotator
        expect(screen.queryByText('Client Login')).not.toBeInTheDocument();
        
        // Should show sign out option
        expect(screen.getByText('Sign Out')).toBeInTheDocument();
      });
    });

    test('should show appropriate navigation for data annotator', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'annotator@example.com',
        displayName: 'Data Annotator',
        getIdTokenResult: jest.fn().mockResolvedValue({
          claims: {
            userGroup: 'data-annotator',
            roles: ['Labeler'],
            permissions: ['task.assign'],
            isActive: true,
          },
        }),
      };

      const { onAuthStateChanged } = require('firebase/auth');
      onAuthStateChanged.mockImplementation((auth: any, callback: any) => {
        callback(mockUser);
        return () => {};
      });

      render(
        <TestWrapper>
          <Navbar />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should show data annotator specific navigation
        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Contact')).toBeInTheDocument();
      });
    });
  });

  describe('Authenticated State - Academy User', () => {
    test('should render navbar for academy user', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'student@academy.com',
        displayName: 'Academy Student',
        getIdTokenResult: jest.fn().mockResolvedValue({
          claims: {
            userGroup: 'academy',
            roles: ['CodingStudent'],
            permissions: ['course.enroll'],
            isActive: true,
          },
        }),
      };

      const { onAuthStateChanged } = require('firebase/auth');
      onAuthStateChanged.mockImplementation((auth: any, callback: any) => {
        callback(mockUser);
        return () => {};
      });

      render(
        <TestWrapper>
          <Navbar />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should show user display name or email
        expect(screen.getByText('Welcome, Academy Student')).toBeInTheDocument();
        
        // Should not show Client Login for academy user
        expect(screen.queryByText('Client Login')).not.toBeInTheDocument();
        
        // Should show sign out option
        expect(screen.getByText('Sign Out')).toBeInTheDocument();
      });
    });
  });

  describe('Authenticated State - Enterprise User', () => {
    test('should render navbar for enterprise user with SuperAdmin role', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'admin@enterprise.com',
        displayName: 'Enterprise Admin',
        getIdTokenResult: jest.fn().mockResolvedValue({
          claims: {
            userGroup: 'enterprise',
            roles: ['SuperAdmin'],
            permissions: ['org.create'],
            isActive: true,
          },
        }),
      };

      const { onAuthStateChanged } = require('firebase/auth');
      onAuthStateChanged.mockImplementation((auth: any, callback: any) => {
        callback(mockUser);
        return () => {};
      });

      render(
        <TestWrapper>
          <Navbar />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should show user display name or email
        expect(screen.getByText('Welcome, Enterprise Admin')).toBeInTheDocument();
        
        // Should show Client Login for enterprise user with SuperAdmin role
        expect(screen.getByText('Client Login')).toBeInTheDocument();
        
        // Should show sign out option
        expect(screen.getByText('Sign Out')).toBeInTheDocument();
      });
    });

    test('should not show Client Login for enterprise user without SuperAdmin role', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'user@enterprise.com',
        displayName: 'Enterprise User',
        getIdTokenResult: jest.fn().mockResolvedValue({
          claims: {
            userGroup: 'enterprise',
            roles: ['DataAnalyst'],
            permissions: ['api.access'],
            isActive: true,
          },
        }),
      };

      const { onAuthStateChanged } = require('firebase/auth');
      onAuthStateChanged.mockImplementation((auth: any, callback: any) => {
        callback(mockUser);
        return () => {};
      });

      render(
        <TestWrapper>
          <Navbar />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should show user display name or email
        expect(screen.getByText('Welcome, Enterprise User')).toBeInTheDocument();
        
        // Should not show Client Login for enterprise user without SuperAdmin role
        expect(screen.queryByText('Client Login')).not.toBeInTheDocument();
        
        // Should show sign out option
        expect(screen.getByText('Sign Out')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation Links', () => {
    test('should have correct navigation links', async () => {
      render(
        <TestWrapper>
          <Navbar />
        </TestWrapper>
      );

      // Check that all expected navigation links are present
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();

      // Check that links have correct href attributes
      const homeLink = screen.getByText('Home').closest('a');
      const contactLink = screen.getByText('Contact').closest('a');

      expect(homeLink).toHaveAttribute('href', '/');
      expect(contactLink).toHaveAttribute('href', '/contact');
    });
  });

  describe('User Menu Interactions', () => {
    test('should show user menu when authenticated user clicks on their email', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'user@example.com',
        displayName: 'Test User',
        getIdTokenResult: jest.fn().mockResolvedValue({
          claims: {
            userGroup: 'enterprise',
            roles: ['SuperAdmin'],
            permissions: ['org.create'],
            isActive: true,
          },
        }),
      };

      const { onAuthStateChanged } = require('firebase/auth');
      onAuthStateChanged.mockImplementation((auth: any, callback: any) => {
        callback(mockUser);
        return () => {};
      });

      render(
        <TestWrapper>
          <Navbar />
        </TestWrapper>
      );

      await waitFor(() => {
        const userWelcome = screen.getByText('Welcome, Test User');
        expect(userWelcome).toBeInTheDocument();
        
        // Click on user welcome text to open menu
        fireEvent.click(userWelcome);
        
        // Should show sign out option
        expect(screen.getByText('Sign Out')).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    test('should handle loading state gracefully', async () => {
      const { onAuthStateChanged } = require('firebase/auth');
      onAuthStateChanged.mockImplementation((auth: any, callback: any) => {
        // Don't call callback immediately to test loading state
        return () => {};
      });

      render(
        <TestWrapper>
          <Navbar />
        </TestWrapper>
      );

      // Should show basic navigation even during loading
      expect(screen.getByText('TETRIX')).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('should handle authentication errors gracefully', async () => {
      const { onAuthStateChanged } = require('firebase/auth');
      onAuthStateChanged.mockImplementation((auth: any, callback: any) => {
        // Simulate error by calling callback with null
        setTimeout(() => {
          callback(null);
        }, 0);
        return () => {};
      });

      render(
        <TestWrapper>
          <Navbar />
        </TestWrapper>
      );

      // Should still render basic navigation
      expect(screen.getByText('TETRIX')).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
    });
  });
}); 