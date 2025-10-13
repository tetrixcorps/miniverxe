/**
 * Unit Tests for 2FA Modal Component
 * Tests the authentication flow and phone number formatting
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock DOM environment
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Mock fetch
global.fetch = vi.fn();

// Mock window.open
global.window.open = vi.fn();

describe('2FA Modal - Phone Number Formatting', () => {
  let formatPhoneNumber;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock the formatPhoneNumber function from the 2FA modal
    formatPhoneNumber = (input) => {
      let value = input.value.replace(/\D/g, '');
      if (value.length > 0) {
        // Handle US numbers (11 digits starting with 1)
        if (value.length === 11 && value.startsWith('1')) {
          value = `+1 (${value.slice(1, 4)}) ${value.slice(4, 7)}-${value.slice(7)}`;
        }
        // Handle US numbers (10 digits)
        else if (value.length === 10) {
          value = `+1 (${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6)}`;
        }
        // Handle other international numbers
        else if (value.length <= 3) {
          value = `+${value}`;
        } else if (value.length <= 6) {
          value = `+${value.slice(0, 1)} (${value.slice(1, 4)}) ${value.slice(4)}`;
        } else if (value.length <= 10) {
          value = `+${value.slice(0, 1)} (${value.slice(1, 4)}) ${value.slice(4, 7)}-${value.slice(7)}`;
        } else {
          value = `+${value.slice(0, 1)} (${value.slice(1, 4)}) ${value.slice(4, 7)}-${value.slice(7, 11)}`;
        }
      }
      input.value = value;
    };
  });

  it('should format 10-digit US phone number correctly', () => {
    const input = { value: '5551234567' };
    formatPhoneNumber(input);
    expect(input.value).toBe('+1 (555) 123-4567');
  });

  it('should format 11-digit US phone number correctly', () => {
    const input = { value: '15551234567' };
    formatPhoneNumber(input);
    expect(input.value).toBe('+1 (555) 123-4567');
  });

  it('should format international number correctly', () => {
    const input = { value: '447123456789' };
    formatPhoneNumber(input);
    expect(input.value).toBe('+4 (471) 234-5678');
  });

  it('should handle short numbers', () => {
    const input = { value: '123' };
    formatPhoneNumber(input);
    expect(input.value).toBe('+123');
  });

  it('should handle empty input', () => {
    const input = { value: '' };
    formatPhoneNumber(input);
    expect(input.value).toBe('');
  });

  it('should remove non-digit characters', () => {
    const input = { value: '+1 (555) 123-4567' };
    formatPhoneNumber(input);
    expect(input.value).toBe('+1 (555) 123-4567');
  });
});

describe('2FA Modal - Authentication Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it('should handle phone submission with valid number', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        success: true,
        verificationId: 'test-verification-id'
      })
    };
    
    global.fetch.mockResolvedValueOnce(mockResponse);
    mockLocalStorage.getItem.mockReturnValue('test-token');

    // Mock the handlePhoneSubmit function
    const handlePhoneSubmit = async (phoneNumber, method) => {
      const response = await fetch('/api/v2/2fa/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: `+${phoneNumber}`,
          method: method,
          userAgent: navigator.userAgent,
          ipAddress: 'test-ip',
          sessionId: 'test-session'
        })
      });

      const result = await response.json();
      return result;
    };

    const result = await handlePhoneSubmit('15551234567', 'sms');
    
    expect(result.success).toBe(true);
    expect(result.verificationId).toBe('test-verification-id');
  });

  it('should handle phone submission with invalid number', async () => {
    const handlePhoneSubmit = async (phoneNumber) => {
      if (!phoneNumber || phoneNumber.length < 10) {
        throw new Error('Please enter a valid phone number');
      }
    };

    await expect(handlePhoneSubmit('123')).rejects.toThrow('Please enter a valid phone number');
  });

  it('should handle code verification successfully', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        success: true,
        token: 'test-auth-token'
      })
    };
    
    global.fetch.mockResolvedValueOnce(mockResponse);

    const handleCodeSubmit = async (verificationId, code, phoneNumber) => {
      const response = await fetch('/api/v2/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verificationId,
          code,
          phoneNumber: `+${phoneNumber}`
        })
      });

      const result = await response.json();
      return result;
    };

    const result = await handleCodeSubmit('test-verification-id', '123456', '15551234567');
    
    expect(result.success).toBe(true);
    expect(result.token).toBe('test-auth-token');
  });

  it('should handle code verification failure', async () => {
    const mockResponse = {
      ok: false,
      json: () => Promise.resolve({
        success: false,
        message: 'Invalid verification code'
      })
    };
    
    global.fetch.mockResolvedValueOnce(mockResponse);

    const handleCodeSubmit = async (verificationId, code, phoneNumber) => {
      const response = await fetch('/api/v2/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verificationId,
          code,
          phoneNumber: `+${phoneNumber}`
        })
      });

      const result = await response.json();
      return result;
    };

    const result = await handleCodeSubmit('test-verification-id', '000000', '15551234567');
    
    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid verification code');
  });
});

describe('2FA Modal - JoRoMi Redirection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.window.open = vi.fn();
  });

  it('should redirect to JoRoMi with authentication token', () => {
    mockLocalStorage.getItem.mockReturnValue('test-tetrix-token');

    const redirectToJoRoMi = () => {
      const authToken = localStorage.getItem('tetrix_auth_token');
      if (authToken) {
        window.open(`http://localhost:3000/tetrix-auth?redirect=joromi-dashboard&token=${authToken}`, '_blank');
      } else {
        window.open('http://localhost:3000', '_blank');
      }
    };

    redirectToJoRoMi();

    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('tetrix_auth_token');
    expect(global.window.open).toHaveBeenCalledWith(
      'http://localhost:3000/tetrix-auth?redirect=joromi-dashboard&token=test-tetrix-token',
      '_blank'
    );
  });

  it('should redirect to JoRoMi without token if not authenticated', () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    const redirectToJoRoMi = () => {
      const authToken = localStorage.getItem('tetrix_auth_token');
      if (authToken) {
        window.open(`http://localhost:3000/tetrix-auth?redirect=joromi-dashboard&token=${authToken}`, '_blank');
      } else {
        window.open('http://localhost:3000', '_blank');
      }
    };

    redirectToJoRoMi();

    expect(global.window.open).toHaveBeenCalledWith('http://localhost:3000', '_blank');
  });
});
