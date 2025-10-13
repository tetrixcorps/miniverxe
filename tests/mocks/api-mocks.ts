// API mocks for authentication testing
import { mock2FAInitiateResponse, mock2FAVerifyResponse, mock2FAErrorResponse } from '../setup/test-utils';

// Mock API responses
export const createMock2FAInitiateResponse = (overrides = {}) => ({
  ...mock2FAInitiateResponse,
  ...overrides
});

export const createMock2FAVerifyResponse = (overrides = {}) => ({
  ...mock2FAVerifyResponse,
  ...overrides
});

export const createMock2FAErrorResponse = (overrides = {}) => ({
  ...mock2FAErrorResponse,
  ...overrides
});

// Mock fetch responses
export const mockSuccessful2FAInitiate = () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => createMock2FAInitiateResponse()
  });
};

export const mockSuccessful2FAVerify = () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => createMock2FAVerifyResponse()
  });
};

export const mockFailed2FAInitiate = (error = 'Invalid phone number') => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: false,
    status: 400,
    json: async () => createMock2FAErrorResponse({ error })
  });
};

export const mockFailed2FAVerify = (error = 'Invalid verification code') => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: false,
    status: 400,
    json: async () => createMock2FAErrorResponse({ error })
  });
};

export const mockNetworkError = () => {
  (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
};

// Mock API endpoints
export const mockAPIEndpoints = {
  '/api/v2/2fa/initiate': {
    success: mockSuccessful2FAInitiate,
    failure: mockFailed2FAInitiate
  },
  '/api/v2/2fa/verify': {
    success: mockSuccessful2FAVerify,
    failure: mockFailed2FAVerify
  }
};

// Mock authentication states
export const mockAuthStates = {
  authenticated: () => {
    localStorage.setItem('tetrix_auth_token', 'mock-token-123');
    localStorage.setItem('tetrix_integration_token', 'mock-token-123');
    localStorage.setItem('tetrix_integration_status', 'connected');
  },
  unauthenticated: () => {
    localStorage.removeItem('tetrix_auth_token');
    localStorage.removeItem('tetrix_integration_token');
    localStorage.removeItem('tetrix_integration_status');
  },
  partiallyAuthenticated: () => {
    localStorage.setItem('tetrix_auth_token', 'mock-token-123');
    localStorage.removeItem('tetrix_integration_token');
    localStorage.removeItem('tetrix_integration_status');
  }
};

// Mock environment configurations
export const mockEnvironments = {
  development: {
    joromiUrl: 'http://localhost:3000',
    codeAcademyUrl: 'http://localhost:3001',
    tetrixApiUrl: 'http://localhost:4321'
  },
  production: {
    joromiUrl: 'https://joromi.ai',
    codeAcademyUrl: 'https://poisonedreligion.ai',
    tetrixApiUrl: 'https://tetrixcorp.com'
  },
  staging: {
    joromiUrl: 'https://staging-joromi.tetrixcorp.com',
    codeAcademyUrl: 'https://staging.poisonedreligion.ai',
    tetrixApiUrl: 'https://staging.tetrixcorp.com'
  }
};

// Mock user data
export const mockUsers = {
  validUser: {
    id: 'user-123',
    email: 'test@example.com',
    phoneNumber: '+1234567890',
    firstName: 'John',
    lastName: 'Doe',
    isVerified: true,
    phoneVerified: true,
    twoFactorEnabled: true,
    role: 'user'
  },
  unverifiedUser: {
    id: 'user-456',
    email: 'unverified@example.com',
    phoneNumber: '+1234567891',
    firstName: 'Jane',
    lastName: 'Smith',
    isVerified: false,
    phoneVerified: false,
    twoFactorEnabled: false,
    role: 'user'
  },
  adminUser: {
    id: 'admin-789',
    email: 'admin@example.com',
    phoneNumber: '+1234567892',
    firstName: 'Admin',
    lastName: 'User',
    isVerified: true,
    phoneVerified: true,
    twoFactorEnabled: true,
    role: 'admin'
  }
};

// Mock platform configurations
export const mockPlatforms = {
  joromi: {
    name: 'JoRoMi Platform',
    domain: 'joromi.ai',
    localhost: 'http://localhost:3000',
    production: 'https://joromi.ai',
    authContext: 'joromi'
  },
  codeAcademy: {
    name: 'Code Academy',
    domain: 'poisonedreligion.ai',
    localhost: 'http://localhost:3001',
    production: 'https://poisonedreligion.ai',
    authContext: 'code-academy'
  },
  tetrix: {
    name: 'TETRIX Platform',
    domain: 'tetrixcorp.com',
    localhost: 'http://localhost:4321',
    production: 'https://tetrixcorp.com',
    authContext: 'default'
  }
};

// Mock error messages
export const mockErrorMessages = {
  networkError: 'Network error. Please try again.',
  invalidPhone: 'Invalid phone number format',
  invalidCode: 'Invalid verification code',
  expiredCode: 'Verification code has expired',
  maxAttempts: 'Maximum verification attempts exceeded',
  serverError: 'Server error. Please try again later',
  unauthorized: 'Unauthorized access',
  forbidden: 'Access forbidden',
  notFound: 'Resource not found',
  timeout: 'Request timeout'
};

// Mock timestamps
export const mockTimestamps = {
  now: new Date().toISOString(),
  future: new Date(Date.now() + 300000).toISOString(), // 5 minutes from now
  past: new Date(Date.now() - 300000).toISOString() // 5 minutes ago
};

// Mock session data
export const mockSessions = {
  valid: {
    id: 'session-123',
    userId: 'user-123',
    token: 'mock-session-token-123',
    expiresAt: mockTimestamps.future,
    createdAt: mockTimestamps.now,
    isActive: true
  },
  expired: {
    id: 'session-456',
    userId: 'user-123',
    token: 'mock-session-token-456',
    expiresAt: mockTimestamps.past,
    createdAt: mockTimestamps.past,
    isActive: false
  }
};

// Mock cross-platform data
export const mockCrossPlatformData = {
  integrationToken: 'mock-integration-token-123',
  integrationStatus: 'connected',
  lastSync: mockTimestamps.now,
  platforms: ['joromi', 'code-academy'],
  permissions: ['read', 'write', 'admin']
};

// Utility functions
export const createMockResponse = (data: any, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data,
  text: async () => JSON.stringify(data)
});

export const createMockError = (message: string, status = 500) => {
  const error = new Error(message);
  (error as any).status = status;
  return error;
};

export const mockConsole = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};

// Mock window methods
export const mockWindowMethods = {
  open: jest.fn(),
  close: jest.fn(),
  postMessage: jest.fn(),
  reload: jest.fn(),
  location: {
    href: 'http://localhost:3000',
    hostname: 'localhost',
    origin: 'http://localhost:3000',
    assign: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn()
  }
};

// Mock localStorage methods
export const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0
};

// Mock sessionStorage methods
export const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0
};

// Mock IntersectionObserver
export const mockIntersectionObserver = {
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
};

// Mock ResizeObserver
export const mockResizeObserver = {
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
};

// Mock fetch with different scenarios
export const mockFetchScenarios = {
  success: () => {
    (global.fetch as jest.Mock).mockResolvedValue(createMockResponse(mock2FAInitiateResponse));
  },
  failure: () => {
    (global.fetch as jest.Mock).mockResolvedValue(createMockResponse(mock2FAErrorResponse, 400));
  },
  networkError: () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
  },
  timeout: () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Request timeout'));
  }
};
