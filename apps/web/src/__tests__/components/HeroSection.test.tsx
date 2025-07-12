import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../providers/AuthProvider';
import HeroSection from '../../components/landing/HeroSection';

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

// Mock NiceModal
jest.mock('@ebay/nice-modal-react', () => ({
  show: jest.fn(),
}));

// Mock LottieLogo component
jest.mock('../../components/LottieLogo', () => ({
  AdvancedLottieLogo: ({ size, className }: any) => (
    <div data-testid="lottie-logo" className={className}>
      Logo {size}
    </div>
  ),
}));

// Wrapper component for testing
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>{children}</AuthProvider>
  </BrowserRouter>
);

describe('HeroSection RBAC Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnAuthStateChanged.mockReturnValue(() => {});
    mockNavigate.mockClear();
  });

  describe('Unauthenticated User', () => {
    test('should show all buttons for unauthenticated user', () => {
      render(
        <TestWrapper>
          <HeroSection />
        </TestWrapper>
      );

      expect(screen.getByText('Access Data Labeling')).toBeInTheDocument();
      expect(screen.getByText('Access Code Academy')).toBeInTheDocument();
      expect(screen.getByText('Sign Up')).toBeInTheDocument();
      expect(screen.getByText('CUSTOMER')).toBeInTheDocument();
    });

    test('should handle Data Labeling access for unauthenticated user', async () => {
      mockSignInWithPopup.mockResolvedValue({
        user: {
          getIdToken: jest.fn().mockResolvedValue('mock-token'),
        },
      });

      render(
        <TestWrapper>
          <HeroSection />
        </TestWrapper>
      );

      fireEvent.click(screen.getByText('Access Data Labeling'));

      await waitFor(() => {
        expect(mockSignInWithPopup).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/data-labeling/dashboard');
      });
    });

    test('should handle Academy access for unauthenticated user', async () => {
      mockSignInWithPopup.mockResolvedValue({
        user: {
          getIdToken: jest.fn().mockResolvedValue('mock-token'),
        },
      });

      render(
        <TestWrapper>
          <HeroSection />
        </TestWrapper>
      );

      fireEvent.click(screen.getByText('Access Code Academy'));

      await waitFor(() => {
        expect(mockSignInWithPopup).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/academy/dashboard');
      });
    });

    test('should handle Customer access for unauthenticated user', async () => {
      mockSignInWithPopup.mockResolvedValue({
        user: {
          getIdToken: jest.fn().mockResolvedValue('mock-token'),
        },
      });

      render(
        <TestWrapper>
          <HeroSection />
        </TestWrapper>
      );

      fireEvent.click(screen.getByText('CUSTOMER'));

      await waitFor(() => {
        expect(mockSignInWithPopup).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/customer/dashboard');
      });
    });
  });

  describe('Data Annotator User', () => {
    test('should allow data annotator to access Data Labeling', async () => {
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
          <HeroSection />
        </TestWrapper>
      );

      await waitFor(() => {
        fireEvent.click(screen.getByText('Access Data Labeling'));
        expect(mockNavigate).toHaveBeenCalledWith('/data-labeling/dashboard');
      });
    });

    test('should show error when data annotator tries to access Academy', async () => {
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

      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

      render(
        <TestWrapper>
          <HeroSection />
        </TestWrapper>
      );

      await waitFor(() => {
        fireEvent.click(screen.getByText('Access Code Academy'));
        expect(alertSpy).toHaveBeenCalledWith(
          'You are currently logged in as a different user type. Please sign out and sign in as an Academy user to access this feature.'
        );
      });

      alertSpy.mockRestore();
    });

    test('should show error when data annotator tries to access Customer', async () => {
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

      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

      render(
        <TestWrapper>
          <HeroSection />
        </TestWrapper>
      );

      await waitFor(() => {
        fireEvent.click(screen.getByText('CUSTOMER'));
        expect(alertSpy).toHaveBeenCalledWith(
          'Only Enterprise customers can access this feature. Please contact support for access.'
        );
      });

      alertSpy.mockRestore();
    });
  });

  describe('Academy User', () => {
    test('should allow academy user to access Academy', async () => {
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
          <HeroSection />
        </TestWrapper>
      );

      await waitFor(() => {
        fireEvent.click(screen.getByText('Access Code Academy'));
        expect(mockNavigate).toHaveBeenCalledWith('/academy/dashboard');
      });
    });

    test('should show error when academy user tries to access Data Labeling', async () => {
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

      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

      render(
        <TestWrapper>
          <HeroSection />
        </TestWrapper>
      );

      await waitFor(() => {
        fireEvent.click(screen.getByText('Access Data Labeling'));
        expect(alertSpy).toHaveBeenCalledWith(
          'You are currently logged in as a different user type. Please sign out and sign in as a Data Annotator to access this feature.'
        );
      });

      alertSpy.mockRestore();
    });

    test('should show error when academy user tries to access Customer', async () => {
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

      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

      render(
        <TestWrapper>
          <HeroSection />
        </TestWrapper>
      );

      await waitFor(() => {
        fireEvent.click(screen.getByText('CUSTOMER'));
        expect(alertSpy).toHaveBeenCalledWith(
          'Only Enterprise customers can access this feature. Please contact support for access.'
        );
      });

      alertSpy.mockRestore();
    });
  });

  describe('Enterprise User', () => {
    test('should allow enterprise user to access Customer', async () => {
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
          <HeroSection />
        </TestWrapper>
      );

      await waitFor(() => {
        fireEvent.click(screen.getByText('CUSTOMER'));
        expect(mockNavigate).toHaveBeenCalledWith('/customer/dashboard');
      });
    });

    test('should show error when enterprise user tries to access Data Labeling', async () => {
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

      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

      render(
        <TestWrapper>
          <HeroSection />
        </TestWrapper>
      );

      await waitFor(() => {
        fireEvent.click(screen.getByText('Access Data Labeling'));
        expect(alertSpy).toHaveBeenCalledWith(
          'You are currently logged in as a different user type. Please sign out and sign in as a Data Annotator to access this feature.'
        );
      });

      alertSpy.mockRestore();
    });

    test('should show error when enterprise user tries to access Academy', async () => {
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

      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

      render(
        <TestWrapper>
          <HeroSection />
        </TestWrapper>
      );

      await waitFor(() => {
        fireEvent.click(screen.getByText('Access Code Academy'));
        expect(alertSpy).toHaveBeenCalledWith(
          'You are currently logged in as a different user type. Please sign out and sign in as an Academy user to access this feature.'
        );
      });

      alertSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    test('should handle authentication errors gracefully', async () => {
      mockSignInWithPopup.mockRejectedValue(new Error('Authentication failed'));

      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

      render(
        <TestWrapper>
          <HeroSection />
        </TestWrapper>
      );

      fireEvent.click(screen.getByText('Access Data Labeling'));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Failed to sign in. Please try again.');
      });

      alertSpy.mockRestore();
    });
  });

  describe('Sign Up Button', () => {
    test('should show Sign Up button for unauthenticated users', () => {
      render(
        <TestWrapper>
          <HeroSection />
        </TestWrapper>
      );

      expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });

    test('should not show Sign Up button for authenticated users', async () => {
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

      render(
        <TestWrapper>
          <HeroSection />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByText('Sign Up')).not.toBeInTheDocument();
      });
    });
  });
}); 