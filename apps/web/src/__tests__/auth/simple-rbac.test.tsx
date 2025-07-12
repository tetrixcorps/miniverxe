import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../providers/AuthProvider';
import { useAuth } from '../../hooks/useAuth';

// Mock @tetrix/rbac package
jest.mock('@tetrix/rbac', () => ({
  Roles: {
    Labeler: 'Labeler',
    SuperAdmin: 'SuperAdmin',
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

// Test component to access auth context
const TestComponent = () => {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="user-group">{auth.userGroup || 'none'}</div>
      <div data-testid="user-email">{auth.user?.email || 'none'}</div>
      <div data-testid="roles">{auth.roles.join(',')}</div>
      <div data-testid="permissions">{auth.permissions.join(',')}</div>
      <div data-testid="can-access-client-login">{auth.canAccessClientLogin().toString()}</div>
      <div data-testid="loading">{auth.loading.toString()}</div>
    </div>
  );
};

// Wrapper component for testing
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>{children}</AuthProvider>
  </BrowserRouter>
);

describe('Simple RBAC Tests', () => {
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

  test('should initialize with no user and loading state', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId('user-group')).toHaveTextContent('none');
    expect(screen.getByTestId('user-email')).toHaveTextContent('none');
    expect(screen.getByTestId('can-access-client-login')).toHaveTextContent('false');
    expect(screen.getByTestId('loading')).toHaveTextContent('true');
  });

  test('should handle user authentication with claims', async () => {
    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
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
        <TestComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-group')).toHaveTextContent('data-annotator');
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
      expect(screen.getByTestId('roles')).toHaveTextContent('Labeler');
      expect(screen.getByTestId('permissions')).toHaveTextContent('task.assign');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
  });

  test('should allow enterprise user with SuperAdmin role to access client login', async () => {
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
        <TestComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('can-access-client-login')).toHaveTextContent('true');
    });
  });

  test('should deny data annotator access to client login', async () => {
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
        <TestComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('can-access-client-login')).toHaveTextContent('false');
    });
  });
}); 