// Test utilities for authentication testing
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

// Mock data for testing
export const mockAuthToken = 'mock-tetrix-auth-token-12345';
export const mockVerificationId = 'mock-verification-id-67890';
export const mockPhoneNumber = '+1234567890';
export const mockVerificationCode = '123456';

// Mock API responses
export const mock2FAInitiateResponse = {
  success: true,
  data: {
    verificationId: mockVerificationId,
    phoneNumber: mockPhoneNumber,
    method: 'sms',
    status: 'pending',
    timeoutSecs: 300,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 300000).toISOString(),
    attempts: 0,
    maxAttempts: 3
  },
  message: 'Verification SMS sent successfully',
  estimatedDelivery: '30-60 seconds'
};

export const mock2FAVerifyResponse = {
  success: true,
  data: {
    verified: true,
    verificationId: mockVerificationId,
    phoneNumber: mockPhoneNumber,
    responseCode: 'accepted',
    timestamp: new Date().toISOString(),
    riskLevel: 'low'
  },
  message: 'Verification successful',
  token: mockAuthToken
};

export const mock2FAErrorResponse = {
  success: false,
  error: 'Invalid verification code',
  status: 400,
  details: {
    verified: false,
    responseCode: 'rejected',
    message: 'Invalid verification code. Please try again.'
  }
};

// Mock user data
export const mockUserData = {
  id: 'user-123',
  email: 'test@example.com',
  phoneNumber: mockPhoneNumber,
  firstName: 'John',
  lastName: 'Doe',
  isVerified: true,
  phoneVerified: true,
  twoFactorEnabled: true,
  role: 'user',
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString()
};

// Mock environment configurations
export const mockEnvironmentConfigs = {
  development: {
    joromiUrl: 'http://localhost:3000',
    codeAcademyUrl: 'http://localhost:3001',
    tetrixApiUrl: 'http://localhost:4321',
    webhookBaseUrl: 'http://localhost:4321',
    environment: 'development'
  },
  production: {
    joromiUrl: 'https://joromi.ai',
    codeAcademyUrl: 'https://poisonedreligion.ai',
    tetrixApiUrl: 'https://tetrixcorp.com',
    webhookBaseUrl: 'https://tetrixcorp.com',
    environment: 'production'
  }
};

// Custom render function with providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { ...options });

// Mock fetch responses
export const mockFetch = (response: any, status = 200) => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => response,
    text: async () => JSON.stringify(response)
  });
};

// Mock fetch error
export const mockFetchError = (error: string) => {
  (global.fetch as jest.Mock).mockRejectedValueOnce(new Error(error));
};

// Setup authenticated state
export const setupAuthenticatedState = () => {
  localStorage.setItem('tetrix_auth_token', mockAuthToken);
  localStorage.setItem('tetrix_integration_token', mockAuthToken);
  localStorage.setItem('tetrix_integration_status', 'connected');
  localStorage.setItem('tetrix_integration_timestamp', new Date().toISOString());
};

// Clear authentication state
export const clearAuthenticationState = () => {
  localStorage.removeItem('tetrix_auth_token');
  localStorage.removeItem('tetrix_integration_token');
  localStorage.removeItem('tetrix_integration_status');
  localStorage.removeItem('tetrix_integration_timestamp');
};

// Mock window.postMessage
export const mockPostMessage = () => {
  const mockPostMessage = jest.fn();
  Object.defineProperty(window, 'postMessage', {
    value: mockPostMessage,
    writable: true
  });
  return mockPostMessage;
};

// Mock window.opener
export const mockWindowOpener = () => {
  const mockOpener = {
    postMessage: jest.fn(),
    location: { href: 'http://localhost:3000' }
  };
  Object.defineProperty(window, 'opener', {
    value: mockOpener,
    writable: true
  });
  return mockOpener;
};

// Wait for async operations
export const waitForAsync = (ms = 0) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Mock URLSearchParams
export const mockURLSearchParams = (params: Record<string, string>) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    searchParams.set(key, value);
  });
  return searchParams;
};

// Mock router query
export const mockRouterQuery = (query: Record<string, string>) => ({
  query,
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  pathname: '/test',
  asPath: '/test'
});

// Test data factories
export const createMockUser = (overrides = {}) => ({
  ...mockUserData,
  ...overrides
});

export const createMock2FAResponse = (overrides = {}) => ({
  ...mock2FAInitiateResponse,
  ...overrides
});

export const createMockVerifyResponse = (overrides = {}) => ({
  ...mock2FAVerifyResponse,
  ...overrides
});

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
