import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../providers/AuthProvider';
import { useAuth } from '../../hooks/useAuth';

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

// Wrapper component for testing
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>{children}</AuthProvider>
  </BrowserRouter>
);

describe('useAuth Hook Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnAuthStateChanged.mockReturnValue(() => {});
  });

  describe('Initial State', () => {
    test('should return initial state when no user is authenticated', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      expect(result.current.user).toBeNull();
      expect(result.current.userGroup).toBe('data-annotator'); // Default fallback
      expect(result.current.roles).toEqual([]);
      expect(result.current.permissions).toEqual([]);
      expect(result.current.loading).toBe(true);
    });
  });

  describe('Authentication State Changes', () => {
    test('should update state when user signs in', async () => {
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

      mockOnAuthStateChanged.mockImplementation((callback) => {
        callback(mockUser);
        return () => {};
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.userGroup).toBe('data-annotator');
        expect(result.current.roles).toEqual(['Labeler']);
        expect(result.current.permissions).toEqual(['task.assign']);
        expect(result.current.loading).toBe(false);
      });
    });

    test('should update state when user signs out', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        getIdTokenResult: jest.fn().mockResolvedValue({
          claims: {
            userGroup: 'data-annotator',
            roles: ['Labeler'],
            permissions: ['task.assign'],
          },
        }),
      };

      let authCallback: ((user: any) => void) | null = null;
      mockOnAuthStateChanged.mockImplementation((callback) => {
        authCallback = callback;
        callback(mockUser);
        return () => {};
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      // Simulate sign out
      act(() => {
        if (authCallback) authCallback(null);
      });

      await waitFor(() => {
        expect(result.current.user).toBeNull();
        expect(result.current.userGroup).toBe('data-annotator'); // Default fallback
        expect(result.current.roles).toEqual([]);
        expect(result.current.permissions).toEqual([]);
      });
    });
  });

  describe('User Group Management', () => {
    test('should handle data-annotator user group', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'annotator@example.com',
        displayName: 'Data Annotator',
        getIdTokenResult: jest.fn().mockResolvedValue({
          claims: {
            userGroup: 'data-annotator',
            roles: ['Labeler', 'Reviewer'],
            permissions: ['task.assign', 'task.review'],
          },
        }),
      };

      mockOnAuthStateChanged.mockImplementation((callback) => {
        callback(mockUser);
        return () => {};
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      await waitFor(() => {
        expect(result.current.userGroup).toBe('data-annotator');
        expect(result.current.roles).toEqual(['Labeler', 'Reviewer']);
        expect(result.current.permissions).toEqual(['task.assign', 'task.review']);
      });
    });

    test('should handle academy user group', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'student@example.com',
        displayName: 'Academy Student',
        getIdTokenResult: jest.fn().mockResolvedValue({
          claims: {
            userGroup: 'academy',
            roles: ['CodingStudent'],
            permissions: ['course.enroll', 'course.view'],
          },
        }),
      };

      mockOnAuthStateChanged.mockImplementation((callback) => {
        callback(mockUser);
        return () => {};
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      await waitFor(() => {
        expect(result.current.userGroup).toBe('academy');
        expect(result.current.roles).toEqual(['CodingStudent']);
        expect(result.current.permissions).toEqual(['course.enroll', 'course.view']);
      });
    });

    test('should handle enterprise user group', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'admin@enterprise.com',
        displayName: 'Enterprise Admin',
        getIdTokenResult: jest.fn().mockResolvedValue({
          claims: {
            userGroup: 'enterprise',
            roles: ['SuperAdmin', 'ClientAdmin'],
            permissions: ['org.create', 'user.invite', 'api.access'],
          },
        }),
      };

      mockOnAuthStateChanged.mockImplementation((callback) => {
        callback(mockUser);
        return () => {};
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      await waitFor(() => {
        expect(result.current.userGroup).toBe('enterprise');
        expect(result.current.roles).toEqual(['SuperAdmin', 'ClientAdmin']);
        expect(result.current.permissions).toEqual(['org.create', 'user.invite', 'api.access']);
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
          },
        }),
      };

      mockOnAuthStateChanged.mockImplementation((callback) => {
        callback(mockUser);
        return () => {};
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      await waitFor(() => {
        expect(result.current.canAccessClientLogin()).toBe(true);
      });
    });

    test('should allow enterprise user with ClientAdmin role to access client login', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'client@enterprise.com',
        displayName: 'Client Admin',
        getIdTokenResult: jest.fn().mockResolvedValue({
          claims: {
            userGroup: 'enterprise',
            roles: ['ClientAdmin'],
            permissions: ['org.view'],
          },
        }),
      };

      mockOnAuthStateChanged.mockImplementation((callback) => {
        callback(mockUser);
        return () => {};
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      await waitFor(() => {
        expect(result.current.canAccessClientLogin()).toBe(true);
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
          },
        }),
      };

      mockOnAuthStateChanged.mockImplementation((callback) => {
        callback(mockUser);
        return () => {};
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      await waitFor(() => {
        expect(result.current.canAccessClientLogin()).toBe(false);
      });
    });

    test('should deny academy user access to client login', async () => {
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

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      await waitFor(() => {
        expect(result.current.canAccessClientLogin()).toBe(false);
      });
    });
  });

  describe('Authentication Methods', () => {
    test('should handle sign in for data annotator', async () => {
      mockSignInWithPopup.mockResolvedValue({
        user: {
          getIdToken: jest.fn().mockResolvedValue('mock-token'),
        },
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        await result.current.signIn('data-annotator');
      });

      expect(mockSignInWithPopup).toHaveBeenCalled();
    });

    test('should handle sign in for academy user', async () => {
      mockSignInWithPopup.mockResolvedValue({
        user: {
          getIdToken: jest.fn().mockResolvedValue('mock-token'),
        },
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        await result.current.signIn('academy');
      });

      expect(mockSignInWithPopup).toHaveBeenCalled();
    });

    test('should handle sign in for enterprise user', async () => {
      mockSignInWithPopup.mockResolvedValue({
        user: {
          getIdToken: jest.fn().mockResolvedValue('mock-token'),
        },
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        await result.current.signIn('enterprise');
      });

      expect(mockSignInWithPopup).toHaveBeenCalled();
    });

    test('should handle sign out', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        await result.current.signOut();
      });

      expect(mockSignOut).toHaveBeenCalled();
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

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      await waitFor(() => {
        expect(result.current.userGroup).toBe('data-annotator'); // Default fallback
        expect(result.current.roles).toEqual([]);
        expect(result.current.permissions).toEqual([]);
      });
    });

    test('should handle authentication errors gracefully', async () => {
      mockSignInWithPopup.mockRejectedValue(new Error('Authentication failed'));

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        try {
          await result.current.signIn('data-annotator');
        } catch (error) {
          // Error should be handled internally
        }
      });

      expect(mockSignInWithPopup).toHaveBeenCalled();
    });

    test('should handle token retrieval errors', async () => {
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

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      await waitFor(() => {
        expect(result.current.userGroup).toBe('data-annotator'); // Default fallback
        expect(result.current.roles).toEqual([]);
        expect(result.current.permissions).toEqual([]);
      });
    });
  });

  describe('Loading State', () => {
    test('should show loading state initially', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      expect(result.current.loading).toBe(true);
    });

    test('should hide loading state after authentication', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
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

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });
}); 