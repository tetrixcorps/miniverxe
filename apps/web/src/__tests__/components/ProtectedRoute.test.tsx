import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../providers/AuthProvider';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import type { UserGroup } from '../../providers/AuthProvider';

// Mock Firebase Auth
const mockSignInWithPopup = jest.fn();
const mockSignOut = jest.fn();
const mockOnAuthStateChanged = jest.fn();

jest.mock('firebase/auth', () => ({
  signInWithPopup: mockSignInWithPopup,
  signOut: mockSignOut,
  onAuthStateChanged: mockOnAuthStateChanged,
  GoogleAuthProvider: jest.fn(),
}));

// Mock Firebase Auth instance
const mockAuth = {
  currentUser: null,
};

jest.mock('../../lib/firebase', () => ({
  auth: mockAuth,
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Wrapper component for testing
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>{children}</AuthProvider>
  </BrowserRouter>
);

// Test component for protected route
const TestProtectedComponent = ({ 
  userGroup, 
  roles 
}: { 
  userGroup?: UserGroup; 
  roles?: string[] 
}) => (
  <ProtectedRoute requiredUserGroup={userGroup} requiredRoles={roles}>
    <div data-testid="protected-content">Protected Content</div>
  </ProtectedRoute>
);

describe('ProtectedRoute RBAC Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnAuthStateChanged.mockReturnValue(() => {});
    mockNavigate.mockClear();
  });

  describe('Unauthenticated User', () => {
    test('should redirect to login when user is not authenticated', () => {
      render(
        <TestWrapper>
          <TestProtectedComponent userGroup="data-annotator" />
        </TestWrapper>
      );

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    test('should redirect to login for any user group when not authenticated', () => {
      render(
        <TestWrapper>
          <TestProtectedComponent userGroup="enterprise" />
        </TestWrapper>
      );

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  describe('Data Annotator User', () => {
    test('should allow access to data-annotator routes', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'annotator@example.com',
        displayName: 'Data Annotator',
        getIdTokenResult: jest.fn().mockResolvedValue({
          claims: {
            userGroup: 'data-annotator',
            roles: ['Labeler'],
            permissions: ['task.assign'],
          },
        }),
      };

      mockOnAuthStateChanged.mockImplementation((callback) => {
        callback(mockUser);
        return () => {};
      });

      render(
        <TestWrapper>
          <TestProtectedComponent userGroup="data-annotator" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });
    });

    test('should deny access to academy routes', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'annotator@example.com',
        displayName: 'Data Annotator',
        getIdTokenResult: jest.fn().mockResolvedValue({
          claims: {
            userGroup: 'data-annotator',
            roles: ['Labeler'],
            permissions: ['task.assign'],
          },
        }),
      };

      mockOnAuthStateChanged.mockImplementation((callback) => {
        callback(mockUser);
        return () => {};
      });

      render(
        <TestWrapper>
          <TestProtectedComponent userGroup="academy" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
        expect(mockNavigate).toHaveBeenCalledWith('/unauthorized');
      });
    });

    test('should deny access to enterprise routes', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'annotator@example.com',
        displayName: 'Data Annotator',
        getIdTokenResult: jest.fn().mockResolvedValue({
          claims: {
            userGroup: 'data-annotator',
            roles: ['Labeler'],
            permissions: ['task.assign'],
          },
        }),
      };

      mockOnAuthStateChanged.mockImplementation((callback) => {
        callback(mockUser);
        return () => {};
      });

      render(
        <TestWrapper>
          <TestProtectedComponent userGroup="enterprise" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
        expect(mockNavigate).toHaveBeenCalledWith('/unauthorized');
      });
    });

    test('should allow access when required role matches', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'annotator@example.com',
        displayName: 'Data Annotator',
        getIdTokenResult: jest.fn().mockResolvedValue({
          claims: {
            userGroup: 'data-annotator',
            roles: ['Labeler', 'Reviewer'],
            permissions: ['task.assign'],
          },
        }),
      };

      mockOnAuthStateChanged.mockImplementation((callback) => {
        callback(mockUser);
        return () => {};
      });

      render(
        <TestWrapper>
          <TestProtectedComponent userGroup="data-annotator" roles={['Labeler']} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });
    });

    test('should deny access when required role does not match', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'annotator@example.com',
        displayName: 'Data Annotator',
        getIdTokenResult: jest.fn().mockResolvedValue({
          claims: {
            userGroup: 'data-annotator',
            roles: ['Labeler'],
            permissions: ['task.assign'],
          },
        }),
      };

      mockOnAuthStateChanged.mockImplementation((callback) => {
        callback(mockUser);
        return () => {};
      });

      render(
        <TestWrapper>
          <TestProtectedComponent userGroup="data-annotator" roles={['Reviewer']} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
        expect(mockNavigate).toHaveBeenCalledWith('/unauthorized');
      });
    });
  });

  describe('Academy User', () => {
    test('should allow access to academy routes', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'student@example.com',
        displayName: 'Academy Student',
        getIdTokenResult: jest.fn().mockResolvedValue({
          claims: {
            userGroup: 'academy',
            roles: ['CodingStudent'],
            permissions: ['course.enroll'],
          },
        }),
      };

      mockOnAuthStateChanged.mockImplementation((callback) => {
        callback(mockUser);
        return () => {};
      });

      render(
        <TestWrapper>
          <TestProtectedComponent userGroup="academy" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });
    });

    test('should deny access to data-annotator routes', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'student@example.com',
        displayName: 'Academy Student',
        getIdTokenResult: jest.fn().mockResolvedValue({
          claims: {
            userGroup: 'academy',
            roles: ['CodingStudent'],
            permissions: ['course.enroll'],
          },
        }),
      };

      mockOnAuthStateChanged.mockImplementation((callback) => {
        callback(mockUser);
        return () => {};
      });

      render(
        <TestWrapper>
          <TestProtectedComponent userGroup="data-annotator" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
        expect(mockNavigate).toHaveBeenCalledWith('/unauthorized');
      });
    });

    test('should deny access to enterprise routes', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'student@example.com',
        displayName: 'Academy Student',
        getIdTokenResult: jest.fn().mockResolvedValue({
          claims: {
            userGroup: 'academy',
            roles: ['CodingStudent'],
            permissions: ['course.enroll'],
          },
        }),
      };

      mockOnAuthStateChanged.mockImplementation((callback) => {
        callback(mockUser);
        return () => {};
      });

      render(
        <TestWrapper>
          <TestProtectedComponent userGroup="enterprise" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
        expect(mockNavigate).toHaveBeenCalledWith('/unauthorized');
      });
    });
  });

  describe('Enterprise User', () => {
    test('should allow access to enterprise routes', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'admin@enterprise.com',
        displayName: 'Enterprise Admin',
        getIdTokenResult: jest.fn().mockResolvedValue({
          claims: {
            userGroup: 'enterprise',
            roles: ['SuperAdmin'],
            permissions: ['org.create'],
          },
        }),
      };

      mockOnAuthStateChanged.mockImplementation((callback) => {
        callback(mockUser);
        return () => {};
      });

      render(
        <TestWrapper>
          <TestProtectedComponent userGroup="enterprise" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });
    });

    test('should deny access to data-annotator routes', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'admin@enterprise.com',
        displayName: 'Enterprise Admin',
        getIdTokenResult: jest.fn().mockResolvedValue({
          claims: {
            userGroup: 'enterprise',
            roles: ['SuperAdmin'],
            permissions: ['org.create'],
          },
        }),
      };

      mockOnAuthStateChanged.mockImplementation((callback) => {
        callback(mockUser);
        return () => {};
      });

      render(
        <TestWrapper>
          <TestProtectedComponent userGroup="data-annotator" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
        expect(mockNavigate).toHaveBeenCalledWith('/unauthorized');
      });
    });

    test('should deny access to academy routes', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'admin@enterprise.com',
        displayName: 'Enterprise Admin',
        getIdTokenResult: jest.fn().mockResolvedValue({
          claims: {
            userGroup: 'enterprise',
            roles: ['SuperAdmin'],
            permissions: ['org.create'],
          },
        }),
      };

      mockOnAuthStateChanged.mockImplementation((callback) => {
        callback(mockUser);
        return () => {};
      });

      render(
        <TestWrapper>
          <TestProtectedComponent userGroup="academy" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
        expect(mockNavigate).toHaveBeenCalledWith('/unauthorized');
      });
    });

    test('should allow access when required role matches', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'admin@enterprise.com',
        displayName: 'Enterprise Admin',
        getIdTokenResult: jest.fn().mockResolvedValue({
          claims: {
            userGroup: 'enterprise',
            roles: ['SuperAdmin', 'ClientAdmin'],
            permissions: ['org.create'],
          },
        }),
      };

      mockOnAuthStateChanged.mockImplementation((callback) => {
        callback(mockUser);
        return () => {};
      });

      render(
        <TestWrapper>
          <TestProtectedComponent userGroup="enterprise" roles={['SuperAdmin']} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });
    });

    test('should deny access when required role does not match', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'admin@enterprise.com',
        displayName: 'Enterprise Admin',
        getIdTokenResult: jest.fn().mockResolvedValue({
          claims: {
            userGroup: 'enterprise',
            roles: ['ClientAdmin'],
            permissions: ['org.create'],
          },
        }),
      };

      mockOnAuthStateChanged.mockImplementation((callback) => {
        callback(mockUser);
        return () => {};
      });

      render(
        <TestWrapper>
          <TestProtectedComponent userGroup="enterprise" roles={['SuperAdmin']} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
        expect(mockNavigate).toHaveBeenCalledWith('/unauthorized');
      });
    });
  });

  describe('Multiple Role Requirements', () => {
    test('should allow access when user has any of the required roles', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'admin@enterprise.com',
        displayName: 'Enterprise Admin',
        getIdTokenResult: jest.fn().mockResolvedValue({
          claims: {
            userGroup: 'enterprise',
            roles: ['ClientAdmin'],
            permissions: ['org.create'],
          },
        }),
      };

      mockOnAuthStateChanged.mockImplementation((callback) => {
        callback(mockUser);
        return () => {};
      });

      render(
        <TestWrapper>
          <TestProtectedComponent userGroup="enterprise" roles={['SuperAdmin', 'ClientAdmin']} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });
    });

    test('should deny access when user has none of the required roles', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'admin@enterprise.com',
        displayName: 'Enterprise Admin',
        getIdTokenResult: jest.fn().mockResolvedValue({
          claims: {
            userGroup: 'enterprise',
            roles: ['DataAnalyst'],
            permissions: ['org.create'],
          },
        }),
      };

      mockOnAuthStateChanged.mockImplementation((callback) => {
        callback(mockUser);
        return () => {};
      });

      render(
        <TestWrapper>
          <TestProtectedComponent userGroup="enterprise" roles={['SuperAdmin', 'ClientAdmin']} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
        expect(mockNavigate).toHaveBeenCalledWith('/unauthorized');
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle missing user claims gracefully', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        getIdTokenResult: jest.fn().mockResolvedValue({
          claims: {},
        }),
      };

      mockOnAuthStateChanged.mockImplementation((callback) => {
        callback(mockUser);
        return () => {};
      });

      render(
        <TestWrapper>
          <TestProtectedComponent userGroup="data-annotator" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
        expect(mockNavigate).toHaveBeenCalledWith('/unauthorized');
      });
    });

    test('should handle authentication errors gracefully', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        getIdTokenResult: jest.fn().mockRejectedValue(new Error('Token error')),
      };

      mockOnAuthStateChanged.mockImplementation((callback) => {
        callback(mockUser);
        return () => {};
      });

      render(
        <TestWrapper>
          <TestProtectedComponent userGroup="data-annotator" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
        expect(mockNavigate).toHaveBeenCalledWith('/unauthorized');
      });
    });
  });
}); 