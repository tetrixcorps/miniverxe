import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../providers/AuthProvider';
import LoginPage from '../../pages/LoginPage';

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

describe('LoginPage RBAC Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnAuthStateChanged.mockReturnValue(() => {});
    mockNavigate.mockClear();
  });

  describe('User Group Selection', () => {
    test('should show all user group options', () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      expect(screen.getByText('Data Annotator')).toBeInTheDocument();
      expect(screen.getByText('Code Academy')).toBeInTheDocument();
      expect(screen.getByText('Enterprise Client')).toBeInTheDocument();
    });

    test('should allow selecting Data Annotator', () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const dataAnnotatorOption = screen.getByText('Data Annotator');
      fireEvent.click(dataAnnotatorOption);

      expect(dataAnnotatorOption).toHaveClass('selected');
    });

    test('should allow selecting Code Academy', () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const academyOption = screen.getByText('Code Academy');
      fireEvent.click(academyOption);

      expect(academyOption).toHaveClass('selected');
    });

    test('should allow selecting Enterprise Client', () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const enterpriseOption = screen.getByText('Enterprise Client');
      fireEvent.click(enterpriseOption);

      expect(enterpriseOption).toHaveClass('selected');
    });

    test('should only allow one selection at a time', () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const dataAnnotatorOption = screen.getByText('Data Annotator');
      const academyOption = screen.getByText('Code Academy');

      fireEvent.click(dataAnnotatorOption);
      expect(dataAnnotatorOption).toHaveClass('selected');
      expect(academyOption).not.toHaveClass('selected');

      fireEvent.click(academyOption);
      expect(dataAnnotatorOption).not.toHaveClass('selected');
      expect(academyOption).toHaveClass('selected');
    });
  });

  describe('Authentication Flow', () => {
    test('should show error when no user group is selected', async () => {
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const signInButton = screen.getByText('Sign In');
      fireEvent.click(signInButton);

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Please select a user type before signing in.');
      });

      alertSpy.mockRestore();
    });

    test('should handle Data Annotator sign in', async () => {
      mockSignInWithPopup.mockResolvedValue({
        user: {
          getIdToken: jest.fn().mockResolvedValue('mock-token'),
        },
      });

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      // Select Data Annotator
      fireEvent.click(screen.getByText('Data Annotator'));

      // Sign in
      fireEvent.click(screen.getByText('Sign In'));

      await waitFor(() => {
        expect(mockSignInWithPopup).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/data-labeling/dashboard');
      });
    });

    test('should handle Code Academy sign in', async () => {
      mockSignInWithPopup.mockResolvedValue({
        user: {
          getIdToken: jest.fn().mockResolvedValue('mock-token'),
        },
      });

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      // Select Code Academy
      fireEvent.click(screen.getByText('Code Academy'));

      // Sign in
      fireEvent.click(screen.getByText('Sign In'));

      await waitFor(() => {
        expect(mockSignInWithPopup).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/academy/dashboard');
      });
    });

    test('should handle Enterprise Client sign in', async () => {
      mockSignInWithPopup.mockResolvedValue({
        user: {
          getIdToken: jest.fn().mockResolvedValue('mock-token'),
        },
      });

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      // Select Enterprise Client
      fireEvent.click(screen.getByText('Enterprise Client'));

      // Sign in
      fireEvent.click(screen.getByText('Sign In'));

      await waitFor(() => {
        expect(mockSignInWithPopup).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/customer/dashboard');
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle authentication errors', async () => {
      mockSignInWithPopup.mockRejectedValue(new Error('Authentication failed'));

      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      // Select Data Annotator
      fireEvent.click(screen.getByText('Data Annotator'));

      // Sign in
      fireEvent.click(screen.getByText('Sign In'));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Failed to sign in. Please try again.');
      });

      alertSpy.mockRestore();
    });

    test('should handle missing user token', async () => {
      mockSignInWithPopup.mockResolvedValue({
        user: {
          getIdToken: jest.fn().mockRejectedValue(new Error('Token error')),
        },
      });

      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      // Select Data Annotator
      fireEvent.click(screen.getByText('Data Annotator'));

      // Sign in
      fireEvent.click(screen.getByText('Sign In'));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Failed to sign in. Please try again.');
      });

      alertSpy.mockRestore();
    });
  });

  describe('Navigation', () => {
    test('should navigate to sign up page', () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const signUpLink = screen.getByText('Don\'t have an account?');
      fireEvent.click(signUpLink);

      expect(mockNavigate).toHaveBeenCalledWith('/signup');
    });

    test('should navigate back to landing page', () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const backLink = screen.getByText('← Back to Home');
      fireEvent.click(backLink);

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('User Group Descriptions', () => {
    test('should show correct description for Data Annotator', () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      expect(screen.getByText(/Access data labeling tasks and manage your annotation workflow/)).toBeInTheDocument();
    });

    test('should show correct description for Code Academy', () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      expect(screen.getByText(/Learn coding skills and access educational resources/)).toBeInTheDocument();
    });

    test('should show correct description for Enterprise Client', () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      expect(screen.getByText(/Manage your organization and access enterprise features/)).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    test('should show loading state during authentication', async () => {
      mockSignInWithPopup.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      // Select Data Annotator
      fireEvent.click(screen.getByText('Data Annotator'));

      // Sign in
      fireEvent.click(screen.getByText('Sign In'));

      expect(screen.getByText('Signing in...')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA labels for user group selection', () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const dataAnnotatorOption = screen.getByText('Data Annotator');
      expect(dataAnnotatorOption).toHaveAttribute('role', 'button');
      expect(dataAnnotatorOption).toHaveAttribute('tabIndex', '0');
    });

    test('should have proper keyboard navigation', () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const dataAnnotatorOption = screen.getByText('Data Annotator');
      
      // Test Enter key
      fireEvent.keyDown(dataAnnotatorOption, { key: 'Enter' });
      expect(dataAnnotatorOption).toHaveClass('selected');

      // Test Space key
      const academyOption = screen.getByText('Code Academy');
      fireEvent.keyDown(academyOption, { key: ' ' });
      expect(academyOption).toHaveClass('selected');
    });
  });
}); 