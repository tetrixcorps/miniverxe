/**
 * Test Setup File
 * Global test configuration and mocks
 */

import { vi } from 'vitest';

// Mock global fetch
global.fetch = vi.fn();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn()
};

// Mock window.open
global.window.open = vi.fn();

// Mock window.close
global.window.close = vi.fn();

// Mock postMessage
global.window.postMessage = vi.fn();

// Mock addEventListener
global.window.addEventListener = vi.fn();

// Mock removeEventListener
global.window.removeEventListener = vi.fn();

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

Object.defineProperty(global.window, 'localStorage', {
  value: mockLocalStorage
});

// Mock sessionStorage
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

Object.defineProperty(global.window, 'sessionStorage', {
  value: mockSessionStorage
});

// Mock navigator
Object.defineProperty(global.window, 'navigator', {
  value: {
    userAgent: 'Mozilla/5.0 (Test Browser)',
    platform: 'Test Platform'
  }
});

// Mock location
Object.defineProperty(global.window, 'location', {
  value: {
    href: 'http://localhost:8080',
    origin: 'http://localhost:8080',
    protocol: 'http:',
    host: 'localhost:8080',
    hostname: 'localhost',
    port: '8080',
    pathname: '/',
    search: '',
    hash: ''
  }
});

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  mockLocalStorage.getItem.mockReturnValue(null);
  mockSessionStorage.getItem.mockReturnValue(null);
});
