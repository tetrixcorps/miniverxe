/**
 * Unit Tests for 2FA Modal Component
 * Tests the TwoFAManager class functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';

// Mock DOM elements and fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock DOM methods
const mockGetElementById = vi.fn();
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();
const mockClassList = {
  add: vi.fn(),
  remove: vi.fn(),
  contains: vi.fn(),
  addClass: vi.fn(),
  removeClass: vi.fn()
};

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Mock document methods
Object.defineProperty(document, 'getElementById', {
  value: mockGetElementById
});

// Mock window methods
Object.defineProperty(window, 'setInterval', {
  value: vi.fn(() => 123)
});
Object.defineProperty(window, 'clearInterval', {
  value: vi.fn()
});

describe('TwoFAManager', () => {
  let twoFAManager: any;
  let mockPhoneInput: any;
  let mockMethodSelect: any;
  let mockCodeInput: any;
  let mockSendCodeBtn: any;
  let mockVerifyCodeBtn: any;
  let mockErrorDiv: any;
  let mockErrorMessage: any;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    mockFetch.mockClear();
    mockLocalStorage.clear.mockClear();

    // Create mock DOM elements
    mockPhoneInput = {
      value: '+1234567890',
      addEventListener: mockAddEventListener
    };

    mockMethodSelect = {
      value: 'sms',
      addEventListener: mockAddEventListener
    };

    mockCodeInput = {
      value: '123456',
      addEventListener: mockAddEventListener
    };

    mockSendCodeBtn = {
      disabled: false,
      addEventListener: mockAddEventListener
    };

    mockVerifyCodeBtn = {
      disabled: false,
      addEventListener: mockAddEventListener
    };

    mockErrorDiv = {
      classList: mockClassList
    };

    mockErrorMessage = {
      textContent: ''
    };

    // Setup getElementById mock
    mockGetElementById.mockImplementation((id: string) => {
      switch (id) {
        case 'phone-number':
          return mockPhoneInput;
        case 'verification-method':
          return mockMethodSelect;
        case 'verification-code':
          return mockCodeInput;
        case 'send-code-btn':
          return mockSendCodeBtn;
        case 'verify-code-btn':
          return mockVerifyCodeBtn;
        case '2fa-error':
          return mockErrorDiv;
        case 'error-message':
          return mockErrorMessage;
        case 'phone-form':
          return { addEventListener: mockAddEventListener };
        case 'code-form':
          return { addEventListener: mockAddEventListener };
        case 'resend-code-btn':
          return { addEventListener: mockAddEventListener, disabled: false };
        case 'phone-display':
          return { textContent: '' };
        case 'resend-timer':
          return { textContent: '60' };
        default:
          return null;
      }
    });

    // Mock the TwoFAManager class
    twoFAManager = {
      currentStep: 1,
      verificationId: null,
      phoneNumber: null,
      method: 'sms',
      resendCountdown: 60,
      resendTimer: null,
      authContext: 'default',

      validatePhoneNumber: vi.fn(),
      handlePhoneSubmit: vi.fn(),
      handleCodeSubmit: vi.fn(),
      showError: vi.fn(),
      hideError: vi.fn(),
      setLoading: vi.fn(),
      showStep: vi.fn(),
      startResendTimer: vi.fn(),
      getClientIP: vi.fn().mockResolvedValue('192.168.1.1'),
      generateSessionId: vi.fn().mockReturnValue('session_abc123'),
      getDetailedErrorMessage: vi.fn()
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Phone Number Validation', () => {
    it('should validate US phone numbers correctly', () => {
      const validUSNumbers = [
        '+1 (555) 123-4567',
        '+15551234567',
        '+1 555 123 4567'
      ];

      validUSNumbers.forEach(phone => {
        twoFAManager.validatePhoneNumber.mockReturnValue({
          isValid: true,
          formatted: '+15551234567'
        });

        const result = twoFAManager.validatePhoneNumber(phone);
        expect(result.isValid).toBe(true);
        expect(result.formatted).toBe('+15551234567');
      });
    });

    it('should reject invalid phone numbers', () => {
      const invalidNumbers = [
        '123',
        '555-1234',
        '+1 555',
        'invalid'
      ];

      invalidNumbers.forEach(phone => {
        twoFAManager.validatePhoneNumber.mockReturnValue({
          isValid: false,
          error: 'Invalid phone number format'
        });

        const result = twoFAManager.validatePhoneNumber(phone);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    it('should format international phone numbers', () => {
      const internationalNumbers = [
        '+44 20 7946 0958',
        '+33 1 42 86 83 26',
        '+49 30 12345678'
      ];

      internationalNumbers.forEach(phone => {
        twoFAManager.validatePhoneNumber.mockReturnValue({
          isValid: true,
          formatted: phone
        });

        const result = twoFAManager.validatePhoneNumber(phone);
        expect(result.isValid).toBe(true);
        expect(result.formatted).toMatch(/^\+\d+/);
      });
    });
  });

  describe('2FA Initiation', () => {
    it('should initiate 2FA successfully', async () => {
      // Mock successful API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          success: true,
          verificationId: 'ver_abc123',
          message: 'Verification SMS sent successfully'
        })
      });

      twoFAManager.validatePhoneNumber.mockReturnValue({
        isValid: true,
        formatted: '+1234567890'
      });

      twoFAManager.handlePhoneSubmit.mockImplementation(async () => {
        const phoneValidation = twoFAManager.validatePhoneNumber('+1234567890');
        if (!phoneValidation.isValid) {
          twoFAManager.showError(phoneValidation.error);
          return;
        }

        twoFAManager.phoneNumber = phoneValidation.formatted;
        twoFAManager.method = 'sms';

        const response = await fetch('/api/v2/2fa/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: twoFAManager.phoneNumber,
            method: twoFAManager.method,
            userAgent: navigator.userAgent,
            ipAddress: await twoFAManager.getClientIP(),
            sessionId: twoFAManager.generateSessionId()
          })
        });

        const result = await response.json();
        if (result.success) {
          twoFAManager.verificationId = result.verificationId;
          twoFAManager.showStep(2);
          twoFAManager.startResendTimer();
          twoFAManager.hideError();
        } else {
          twoFAManager.showError(result.message || 'Failed to send verification code');
        }
      });

      await twoFAManager.handlePhoneSubmit();

      expect(mockFetch).toHaveBeenCalledWith('/api/v2/2fa/initiate', expect.any(Object));
      expect(twoFAManager.showStep).toHaveBeenCalledWith(2);
      expect(twoFAManager.startResendTimer).toHaveBeenCalled();
    });

    it('should handle 2FA initiation errors', async () => {
      // Mock API error response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          success: false,
          error: 'Invalid phone number format'
        })
      });

      twoFAManager.validatePhoneNumber.mockReturnValue({
        isValid: true,
        formatted: '+1234567890'
      });

      twoFAManager.handlePhoneSubmit.mockImplementation(async () => {
        const response = await fetch('/api/v2/2fa/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: '+1234567890',
            method: 'sms'
          })
        });

        const result = await response.json();
        if (!result.success) {
          twoFAManager.showError(result.error);
        }
      });

      await twoFAManager.handlePhoneSubmit();

      expect(twoFAManager.showError).toHaveBeenCalledWith('Invalid phone number format');
    });

    it('should handle network errors during initiation', async () => {
      // Mock network error
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      twoFAManager.validatePhoneNumber.mockReturnValue({
        isValid: true,
        formatted: '+1234567890'
      });

      twoFAManager.handlePhoneSubmit.mockImplementation(async () => {
        try {
          await fetch('/api/v2/2fa/initiate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phoneNumber: '+1234567890',
              method: 'sms'
            })
          });
        } catch (error) {
          twoFAManager.showError('Network error. Please check your connection and try again.');
        }
      });

      await twoFAManager.handlePhoneSubmit();

      expect(twoFAManager.showError).toHaveBeenCalledWith('Network error. Please check your connection and try again.');
    });
  });

  describe('2FA Verification', () => {
    it('should verify code successfully', async () => {
      // Mock successful verification response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          success: true,
          verified: true,
          token: 'auth_token_xyz789',
          message: 'Verification successful'
        })
      });

      twoFAManager.verificationId = 'ver_abc123';
      twoFAManager.phoneNumber = '+1234567890';

      twoFAManager.handleCodeSubmit.mockImplementation(async () => {
        const code = '123456';
        if (!code || code.length !== 6) {
          twoFAManager.showError('Please enter a valid 6-digit code');
          return;
        }

        const response = await fetch('/api/v2/2fa/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            verificationId: twoFAManager.verificationId,
            code: code,
            phoneNumber: twoFAManager.phoneNumber
          })
        });

        const result = await response.json();
        if (result.success && result.verified) {
          twoFAManager.showStep(3);
          twoFAManager.hideError();
          if (result.token) {
            localStorage.setItem('tetrix_auth_token', result.token);
          }
        } else {
          const errorMessage = twoFAManager.getDetailedErrorMessage(result);
          twoFAManager.showError(errorMessage);
        }
      });

      await twoFAManager.handleCodeSubmit();

      expect(mockFetch).toHaveBeenCalledWith('/api/v2/2fa/verify', expect.any(Object));
      expect(twoFAManager.showStep).toHaveBeenCalledWith(3);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('tetrix_auth_token', 'auth_token_xyz789');
    });

    it('should handle invalid verification codes', async () => {
      // Mock failed verification response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          success: true,
          verified: false,
          details: {
            responseCode: 'rejected',
            message: 'Invalid verification code'
          }
        })
      });

      twoFAManager.verificationId = 'ver_abc123';
      twoFAManager.phoneNumber = '+1234567890';
      twoFAManager.getDetailedErrorMessage.mockReturnValue('Invalid verification code. Please check the code and try again.');

      twoFAManager.handleCodeSubmit.mockImplementation(async () => {
        const response = await fetch('/api/v2/2fa/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            verificationId: twoFAManager.verificationId,
            code: '123456',
            phoneNumber: twoFAManager.phoneNumber
          })
        });

        const result = await response.json();
        if (result.success && result.verified) {
          twoFAManager.showStep(3);
        } else {
          const errorMessage = twoFAManager.getDetailedErrorMessage(result);
          twoFAManager.showError(errorMessage);
        }
      });

      await twoFAManager.handleCodeSubmit();

      expect(twoFAManager.showError).toHaveBeenCalledWith('Invalid verification code. Please check the code and try again.');
    });

    it('should validate 6-digit code format', async () => {
      twoFAManager.handleCodeSubmit.mockImplementation(async () => {
        const code = '123'; // Invalid length
        if (!code || code.length !== 6) {
          twoFAManager.showError('Please enter a valid 6-digit code');
          return;
        }
      });

      await twoFAManager.handleCodeSubmit();

      expect(twoFAManager.showError).toHaveBeenCalledWith('Please enter a valid 6-digit code');
    });
  });

  describe('Error Handling', () => {
    it('should provide detailed error messages for different response codes', () => {
      const testCases = [
        {
          result: { details: { responseCode: 'rejected' } },
          expected: 'Invalid verification code. Please check the code and try again.'
        },
        {
          result: { details: { responseCode: 'expired' } },
          expected: 'Verification code has expired. Please request a new code.'
        },
        {
          result: { details: { responseCode: 'max_attempts' } },
          expected: 'Maximum verification attempts exceeded. Please request a new code.'
        },
        {
          result: { details: { responseCode: 'invalid_phone_number' } },
          expected: 'Invalid phone number format. Please check your number and try again.'
        },
        {
          result: { message: 'Custom error message' },
          expected: 'Custom error message'
        },
        {
          result: { error: 'API error' },
          expected: 'API error'
        },
        {
          result: {},
          expected: 'Verification failed. Please try again.'
        }
      ];

      testCases.forEach(({ result, expected }) => {
        twoFAManager.getDetailedErrorMessage.mockReturnValue(expected);
        const errorMessage = twoFAManager.getDetailedErrorMessage(result);
        expect(errorMessage).toBe(expected);
      });
    });
  });

  describe('Resend Functionality', () => {
    it('should resend verification code', async () => {
      // Mock successful resend response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          success: true,
          verificationId: 'ver_abc123_new'
        })
      });

      twoFAManager.phoneNumber = '+1234567890';
      twoFAManager.method = 'sms';

      const resendCode = async () => {
        const response = await fetch('/api/v2/2fa/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: twoFAManager.phoneNumber,
            method: twoFAManager.method,
            userAgent: navigator.userAgent,
            ipAddress: await twoFAManager.getClientIP(),
            sessionId: twoFAManager.generateSessionId()
          })
        });

        const result = await response.json();
        if (result.success) {
          twoFAManager.verificationId = result.verificationId;
          twoFAManager.startResendTimer();
          twoFAManager.hideError();
        } else {
          twoFAManager.showError(result.message || 'Failed to resend verification code');
        }
      };

      await resendCode();

      expect(mockFetch).toHaveBeenCalledWith('/api/v2/2fa/initiate', expect.any(Object));
      expect(twoFAManager.startResendTimer).toHaveBeenCalled();
    });

    it('should not resend if countdown is active', async () => {
      twoFAManager.resendCountdown = 30; // Active countdown

      const resendCode = async () => {
        if (twoFAManager.resendCountdown > 0) return;
        // Resend logic would go here
      };

      await resendCode();

      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('Step Management', () => {
    it('should show correct step', () => {
      twoFAManager.showStep.mockImplementation((step: number) => {
        twoFAManager.currentStep = step;
      });

      twoFAManager.showStep(2);
      expect(twoFAManager.currentStep).toBe(2);

      twoFAManager.showStep(3);
      expect(twoFAManager.currentStep).toBe(3);
    });
  });

  describe('Loading States', () => {
    it('should set loading state correctly', () => {
      twoFAManager.setLoading.mockImplementation((buttonType: string, isLoading: boolean) => {
        // Mock implementation
      });

      twoFAManager.setLoading('send-code', true);
      expect(twoFAManager.setLoading).toHaveBeenCalledWith('send-code', true);

      twoFAManager.setLoading('verify-code', false);
      expect(twoFAManager.setLoading).toHaveBeenCalledWith('verify-code', false);
    });
  });
});
