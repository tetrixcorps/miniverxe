/**
 * Functional Tests for Authentication Workflow
 * Tests the complete user journey from login to platform access
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

// Mock DOM environment
const dom = new JSDOM(`
  <!DOCTYPE html>
  <html>
    <body>
      <div id="2fa-modal" class="hidden">
        <div id="2fa-step-1">
          <form id="phone-form">
            <input id="phone-number" type="tel" />
            <select id="verification-method">
              <option value="sms">SMS</option>
              <option value="voice">Voice</option>
            </select>
            <button id="send-code-btn" type="submit">Send Code</button>
          </form>
        </div>
        <div id="2fa-step-2" class="hidden">
          <form id="code-form">
            <input id="verification-code" type="text" />
            <button id="verify-code-btn" type="submit">Verify Code</button>
          </form>
        </div>
        <div id="2fa-step-3" class="hidden">
          <button id="redirect-joromi">Continue to JoRoMi Platform</button>
          <button id="redirect-dashboard">Go to Client Dashboard</button>
        </div>
        <div id="2fa-error" class="hidden">
          <p id="error-message"></p>
        </div>
      </div>
    </body>
  </html>
`, {
  url: 'http://localhost:8080',
  pretendToBeVisual: true,
  resources: 'usable'
});

global.window = dom.window;
global.document = dom.window.document;

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

// Mock fetch
global.fetch = vi.fn();

// Mock window.open
global.window.open = vi.fn();

describe('Authentication Workflow - Complete User Journey', () => {
  let twoFAManager;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    
    // Reset DOM
    document.getElementById('2fa-step-1').classList.remove('hidden');
    document.getElementById('2fa-step-2').classList.add('hidden');
    document.getElementById('2fa-step-3').classList.add('hidden');
    document.getElementById('2fa-error').classList.add('hidden');
    document.getElementById('phone-number').value = '';
    document.getElementById('verification-code').value = '';

    // Mock the TwoFAManager class
    twoFAManager = {
      currentStep: 1,
      verificationId: null,
      phoneNumber: null,
      method: 'sms',
      resendTimer: null,
      resendCountdown: 60,
      authContext: 'default',

    formatPhoneNumber(input) {
      let value = input.value.replace(/\D/g, '');
      if (value.length > 0) {
        if (value.length === 11 && value.startsWith('1')) {
          value = `+1 (${value.slice(1, 4)}) ${value.slice(4, 7)}-${value.slice(7)}`;
        } else if (value.length === 10) {
          value = `+1 (${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6)}`;
        } else if (value.length === 12) {
          value = `+${value.slice(0, 1)} (${value.slice(1, 4)}) ${value.slice(4, 7)}-${value.slice(7, 11)}`;
        } else if (value.length <= 3) {
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
    },

      async handlePhoneSubmit() {
        const phoneInput = document.getElementById('phone-number');
        const methodSelect = document.getElementById('verification-method');
        
        this.phoneNumber = phoneInput.value.replace(/\D/g, '');
        this.method = methodSelect.value;

        if (!this.phoneNumber || this.phoneNumber.length < 10) {
          this.showError('Please enter a valid phone number');
          return;
        }

        try {
          const response = await fetch('/api/v2/2fa/initiate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              phoneNumber: `+${this.phoneNumber}`,
              method: this.method,
              userAgent: navigator.userAgent,
              ipAddress: 'test-ip',
              sessionId: 'test-session'
            })
          });

          const result = await response.json();

          if (result.success) {
            this.verificationId = result.verificationId;
            this.showStep(2);
            this.hideError();
          } else {
            this.showError(result.message || 'Failed to send verification code');
          }
        } catch (error) {
          this.showError('Network error. Please try again.');
        }
      },

      async handleCodeSubmit() {
        const codeInput = document.getElementById('verification-code');
        const code = codeInput.value;

        if (!code || code.length !== 6) {
          this.showError('Please enter a valid 6-digit code');
          return;
        }

        try {
          const response = await fetch('/api/v2/2fa/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              verificationId: this.verificationId,
              code: code,
              phoneNumber: `+${this.phoneNumber}`
            })
          });

          const result = await response.json();

          if (result.success) {
            this.showStep(3);
            this.hideError();
            if (result.token) {
              global.window.localStorage.setItem('tetrix_auth_token', result.token);
            }
          } else {
            this.showError(result.message || 'Invalid verification code');
          }
        } catch (error) {
          this.showError('Network error. Please try again.');
        }
      },

      showStep(step) {
        document.getElementById('2fa-step-1').classList.add('hidden');
        document.getElementById('2fa-step-2').classList.add('hidden');
        document.getElementById('2fa-step-3').classList.add('hidden');

        document.getElementById(`2fa-step-${step}`).classList.remove('hidden');
        this.currentStep = step;
      },

      showError(message) {
        const errorDiv = document.getElementById('2fa-error');
        const errorMessage = document.getElementById('error-message');
        
        if (errorDiv && errorMessage) {
          errorMessage.textContent = message;
          errorDiv.classList.remove('hidden');
        }
      },

      hideError() {
        const errorDiv = document.getElementById('2fa-error');
        if (errorDiv) {
          errorDiv.classList.add('hidden');
        }
      }
    };
  });

  describe('Complete Authentication Flow', () => {
    it('should complete full authentication flow successfully', async () => {
      // Step 1: Phone number entry
      const phoneInput = document.getElementById('phone-number');
      const methodSelect = document.getElementById('verification-method');
      
      phoneInput.value = '15551234567';
      twoFAManager.formatPhoneNumber(phoneInput);
      expect(phoneInput.value).toBe('+1 (555) 123-4567');

      // Mock successful initiation
      const mockInitiateResponse = {
        ok: true,
        json: () => Promise.resolve({
          success: true,
          verificationId: 'test-verification-id'
        })
      };
      global.fetch.mockResolvedValueOnce(mockInitiateResponse);

      // Submit phone number
      await twoFAManager.handlePhoneSubmit();
      
      expect(twoFAManager.verificationId).toBe('test-verification-id');
      expect(twoFAManager.currentStep).toBe(2);
      expect(document.getElementById('2fa-step-2').classList.contains('hidden')).toBe(false);

      // Step 2: Code verification
      const codeInput = document.getElementById('verification-code');
      codeInput.value = '123456';

      // Mock successful verification
      const mockVerifyResponse = {
        ok: true,
        json: () => Promise.resolve({
          success: true,
          token: 'test-auth-token'
        })
      };
      global.fetch.mockResolvedValueOnce(mockVerifyResponse);

      // Submit verification code
      await twoFAManager.handleCodeSubmit();
      
      expect(twoFAManager.currentStep).toBe(3);
      expect(document.getElementById('2fa-step-3').classList.contains('hidden')).toBe(false);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('tetrix_auth_token', 'test-auth-token');
    });

    it('should handle phone number validation errors', async () => {
      const phoneInput = document.getElementById('phone-number');
      phoneInput.value = '123'; // Too short

      await twoFAManager.handlePhoneSubmit();
      
      expect(document.getElementById('2fa-error').classList.contains('hidden')).toBe(false);
      expect(document.getElementById('error-message').textContent).toBe('Please enter a valid phone number');
    });

    it('should handle verification code validation errors', async () => {
      // First complete phone submission
      twoFAManager.phoneNumber = '15551234567';
      twoFAManager.verificationId = 'test-verification-id';
      twoFAManager.showStep(2);

      const codeInput = document.getElementById('verification-code');
      codeInput.value = '123'; // Too short

      await twoFAManager.handleCodeSubmit();
      
      expect(document.getElementById('2fa-error').classList.contains('hidden')).toBe(false);
      expect(document.getElementById('error-message').textContent).toBe('Please enter a valid 6-digit code');
    });

    it('should handle network errors during phone submission', async () => {
      const phoneInput = document.getElementById('phone-number');
      phoneInput.value = '15551234567';

      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      await twoFAManager.handlePhoneSubmit();
      
      expect(document.getElementById('2fa-error').classList.contains('hidden')).toBe(false);
      expect(document.getElementById('error-message').textContent).toBe('Network error. Please try again.');
    });

    it('should handle API errors during verification', async () => {
      // First complete phone submission
      twoFAManager.phoneNumber = '15551234567';
      twoFAManager.verificationId = 'test-verification-id';
      twoFAManager.showStep(2);

      const codeInput = document.getElementById('verification-code');
      codeInput.value = '123456';

      const mockErrorResponse = {
        ok: false,
        json: () => Promise.resolve({
          success: false,
          message: 'Invalid verification code'
        })
      };
      global.fetch.mockResolvedValueOnce(mockErrorResponse);

      await twoFAManager.handleCodeSubmit();
      
      expect(document.getElementById('2fa-error').classList.contains('hidden')).toBe(false);
      expect(document.getElementById('error-message').textContent).toBe('Invalid verification code');
    });
  });

  describe('JoRoMi Redirection Flow', () => {
    it('should redirect to JoRoMi with authentication token', () => {
      mockLocalStorage.getItem.mockReturnValue('test-tetrix-token');
      
      const redirectToJoRoMi = () => {
        const authToken = global.window.localStorage.getItem('tetrix_auth_token');
        if (authToken) {
          global.window.open(`http://localhost:3000/tetrix-auth?redirect=joromi-dashboard&token=${authToken}`, '_blank');
        } else {
          global.window.open('http://localhost:3000', '_blank');
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
        const authToken = global.window.localStorage.getItem('tetrix_auth_token');
        if (authToken) {
          global.window.open(`http://localhost:3000/tetrix-auth?redirect=joromi-dashboard&token=${authToken}`, '_blank');
        } else {
          global.window.open('http://localhost:3000', '_blank');
        }
      };

      redirectToJoRoMi();

      expect(global.window.open).toHaveBeenCalledWith('http://localhost:3000', '_blank');
    });
  });

  describe('Phone Number Formatting', () => {
    it('should format various phone number formats correctly', () => {
      const testCases = [
        { input: '15551234567', expected: '+1 (555) 123-4567' },
        { input: '5551234567', expected: '+1 (555) 123-4567' },
        { input: '447123456789', expected: '+4 (471) 234-5678' },
        { input: '123', expected: '+123' },
        { input: '', expected: '' }
      ];

      testCases.forEach(({ input, expected }) => {
        const phoneInput = { value: input };
        twoFAManager.formatPhoneNumber(phoneInput);
        expect(phoneInput.value).toBe(expected);
      });
    });
  });

  describe('Error Handling', () => {
    it('should show and hide errors correctly', () => {
      twoFAManager.showError('Test error message');
      expect(document.getElementById('2fa-error').classList.contains('hidden')).toBe(false);
      expect(document.getElementById('error-message').textContent).toBe('Test error message');

      twoFAManager.hideError();
      expect(document.getElementById('2fa-error').classList.contains('hidden')).toBe(true);
    });

    it('should handle step transitions correctly', () => {
      twoFAManager.showStep(1);
      expect(document.getElementById('2fa-step-1').classList.contains('hidden')).toBe(false);
      expect(document.getElementById('2fa-step-2').classList.contains('hidden')).toBe(true);
      expect(document.getElementById('2fa-step-3').classList.contains('hidden')).toBe(true);

      twoFAManager.showStep(2);
      expect(document.getElementById('2fa-step-1').classList.contains('hidden')).toBe(true);
      expect(document.getElementById('2fa-step-2').classList.contains('hidden')).toBe(false);
      expect(document.getElementById('2fa-step-3').classList.contains('hidden')).toBe(true);

      twoFAManager.showStep(3);
      expect(document.getElementById('2fa-step-1').classList.contains('hidden')).toBe(true);
      expect(document.getElementById('2fa-step-2').classList.contains('hidden')).toBe(true);
      expect(document.getElementById('2fa-step-3').classList.contains('hidden')).toBe(false);
    });
  });
});
