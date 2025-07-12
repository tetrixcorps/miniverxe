import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../providers/AuthProvider';
import { useAuth } from '../../hooks/useAuth';
import type { UserGroup } from '../../providers/AuthProvider';

// Define Role type for testing since we're mocking the RBAC package
type Role = string;

// Mock @tetrix/rbac package with more comprehensive mocks
jest.mock('@tetrix/rbac', () => ({
  Roles: {
    Labeler: 'Labeler',
    Reviewer: 'Reviewer',
    CodingStudent: 'CodingStudent',
    SuperAdmin: 'SuperAdmin',
    ClientAdmin: 'ClientAdmin',
    DataAnalyst: 'DataAnalyst',
  },
  Permissions: {
    'task.assign': 'task.assign',
    'task.review': 'task.review',
    'course.enroll': 'course.enroll',
    'course.view': 'course.view',
    'org.create': 'org.create',
    'user.invite': 'user.invite',
    'api.access': 'api.access',
  },
}));

// Enhanced Firebase Auth mocks
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
      <button onClick={() => auth.signIn('data-annotator')} data-testid="sign-in-data-annotator">
        Sign In Data Annotator
      </button>
      <button onClick={() => auth.signIn('academy')} data-testid="sign-in-academy">
        Sign In Academy
      </button>
      <button onClick={() => auth.signIn('enterprise')} data-testid="sign-in-enterprise">
        Sign In Enterprise
      </button>
      <button onClick={auth.signOut} data-testid="sign-out">
        Sign Out
      </button>
    </div>
  );
};

// Wrapper component for testing
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>{children}</AuthProvider>
  </BrowserRouter>
);

describe('RBAC Implementation Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset Firebase mocks
    const { onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider } = require('firebase/auth');
    onAuthStateChanged.mockReturnValue(() => {});
    signInWithPopup.mockResolvedValue({
      user: {
        getIdToken: jest.fn().mockResolvedValue('mock-token'),
      },
    });
    signOut.mockResolvedValue(undefined);
    GoogleAuthProvider.mockImplementation(() => ({}));
  });

  describe('Authentication State Management', () => {
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

    test('should handle user authentication state changes', async () => {
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
      onAuthStateChanged.mockImplementation((callback: any) => {
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

    test('should handle authentication errors gracefully', async () => {
      const { onAuthStateChanged } = require('firebase/auth');
      onAuthStateChanged.mockImplementation((callback: any) => {
        callback(null); // No user
        return () => {};
      });

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-group')).toHaveTextContent('none');
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });
    });
  });

  describe('User Group Access Control', () => {
    test('should allow data annotator access to data labeling routes', async () => {
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
      onAuthStateChanged.mockImplementation((callback: any) => {
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
        expect(screen.getByTestId('roles')).toHaveTextContent('Labeler');
        expect(screen.getByTestId('can-access-client-login')).toHaveTextContent('false');
      });
    });

    test('should allow academy user access to academy routes', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'student@example.com',
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
      onAuthStateChanged.mockImplementation((callback: any) => {
        callback(mockUser);
        return () => {};
      });

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-group')).toHaveTextContent('academy');
        expect(screen.getByTestId('roles')).toHaveTextContent('CodingStudent');
        expect(screen.getByTestId('can-access-client-login')).toHaveTextContent('false');
      });
    });

    test('should handle enterprise user with multiple roles', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'admin@enterprise.com',
        displayName: 'Enterprise Admin',
        getIdTokenResult: jest.fn().mockResolvedValue({
          claims: {
            userGroup: 'enterprise',
            roles: ['SuperAdmin', 'ClientAdmin'],
            permissions: ['org.create', 'user.invite'],
            isActive: true,
          },
        }),
      };

      const { onAuthStateChanged } = require('firebase/auth');
      onAuthStateChanged.mockImplementation((callback: any) => {
        callback(mockUser);
        return () => {};
      });

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-group')).toHaveTextContent('enterprise');
        expect(screen.getByTestId('roles')).toHaveTextContent('SuperAdmin,ClientAdmin');
        expect(screen.getByTestId('permissions')).toHaveTextContent('org.create,user.invite');
        expect(screen.getByTestId('can-access-client-login')).toHaveTextContent('true');
      });
    });
  });

  describe('Client Login Access Control', () => {
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
      onAuthStateChanged.mockImplementation((callback: any) => {
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
      onAuthStateChanged.mockImplementation((callback: any) => {
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

    test('should deny enterprise user without SuperAdmin role access to client login', async () => {
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
      onAuthStateChanged.mockImplementation((callback: any) => {
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

  describe('Role and Permission Management', () => {
    test('should correctly identify user roles', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'admin@example.com',
        displayName: 'Admin User',
        getIdTokenResult: jest.fn().mockResolvedValue({
          claims: {
            userGroup: 'enterprise',
            roles: ['SuperAdmin', 'ClientAdmin'],
            permissions: ['org.create', 'user.invite'],
            isActive: true,
          },
        }),
      };

      const { onAuthStateChanged } = require('firebase/auth');
      onAuthStateChanged.mockImplementation((callback: any) => {
        callback(mockUser);
        return () => {};
      });

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('roles')).toHaveTextContent('SuperAdmin,ClientAdmin');
        expect(screen.getByTestId('permissions')).toHaveTextContent('org.create,user.invite');
      });
    });

    test('should handle empty roles and permissions', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'user@example.com',
        displayName: 'Basic User',
        getIdTokenResult: jest.fn().mockResolvedValue({
          claims: {
            userGroup: 'data-annotator',
            roles: [],
            permissions: [],
            isActive: true,
          },
        }),
      };

      const { onAuthStateChanged } = require('firebase/auth');
      onAuthStateChanged.mockImplementation((callback: any) => {
        callback(mockUser);
        return () => {};
      });

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('roles')).toHaveTextContent('');
        expect(screen.getByTestId('permissions')).toHaveTextContent('');
      });
    });

    test('should handle missing claims gracefully', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'user@example.com',
        displayName: 'User',
        getIdTokenResult: jest.fn().mockResolvedValue({
          claims: {},
        }),
      };

      const { onAuthStateChanged } = require('firebase/auth');
      onAuthStateChanged.mockImplementation((callback: any) => {
        callback(mockUser);
        return () => {};
      });

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-group')).toHaveTextContent('data-annotator'); // Default fallback
        expect(screen.getByTestId('roles')).toHaveTextContent('');
        expect(screen.getByTestId('permissions')).toHaveTextContent('');
      });
    });
  });

  describe('Authentication Flows', () => {
    test('should handle sign in for data annotator', async () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId('sign-in-data-annotator'));

      await waitFor(() => {
        expect(require('firebase/auth').signInWithPopup).toHaveBeenCalled();
      });
    });

    test('should handle sign in for academy user', async () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId('sign-in-academy'));

      await waitFor(() => {
        expect(require('firebase/auth').signInWithPopup).toHaveBeenCalled();
      });
    });

    test('should handle sign in for enterprise user', async () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId('sign-in-enterprise'));

      await waitFor(() => {
        expect(require('firebase/auth').signInWithPopup).toHaveBeenCalled();
      });
    });

    test('should handle sign out', async () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId('sign-out'));

      await waitFor(() => {
        expect(require('firebase/auth').signOut).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle authentication errors gracefully', async () => {
      require('firebase/auth').signInWithPopup.mockRejectedValue(new Error('Authentication failed'));

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId('sign-in-data-annotator'));

      await waitFor(() => {
        expect(require('firebase/auth').signInWithPopup).toHaveBeenCalled();
      });
    });

    test('should handle token verification errors', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'user@example.com',
        getIdTokenResult: jest.fn().mockRejectedValue(new Error('Token verification failed')),
      };

      const { onAuthStateChanged } = require('firebase/auth');
      onAuthStateChanged.mockImplementation((callback: any) => {
        callback(mockUser);
        return () => {};
      });

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-group')).toHaveTextContent('none');
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });
    });
  });
}); 