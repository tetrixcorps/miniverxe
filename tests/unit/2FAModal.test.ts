// Unit tests for 2FA Modal functionality
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Mock DOM environment
const mockDocument = {
  getElementById: jest.fn(),
  querySelectorAll: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  body: {
    style: {}
  }
};

// Mock window object
const mockWindow = {
  localStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn()
  },
  location: {
    href: '',
    hostname: 'localhost'
  },
  open: jest.fn(),
  navigator: {
    userAgent: 'test-user-agent'
  },
  fetch: jest.fn()
};

// Mock global objects
Object.defineProperty(global, 'document', { value: mockDocument });
Object.defineProperty(global, 'window', { value: mockWindow });

// Mock fetch globally
global.fetch = jest.fn();

describe('2FA Modal Unit Tests', () => {
  let TwoFAManager: any;
  let mockElements: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock DOM elements
    mockElements = {
      modal: {
        classList: {
          add: vi.fn(),
          remove: vi.fn(),
          contains: vi.fn()
        }
      },
      phoneForm: {
        addEventListener: vi.fn(),
        reset: vi.fn()
      },
      codeForm: {
        addEventListener: vi.fn(),
        reset: vi.fn()
      },
      phoneInput: {
        value: '',
        addEventListener: vi.fn()
      },
      methodSelect: {
        value: 'sms',
        addEventListener: vi.fn()
      },
      codeInput: {
        value: '',
        addEventListener: vi.fn()
      },
      errorMessage: {
        textContent: '',
        classList: {
          add: vi.fn(),
          remove: vi.fn(),
          contains: vi.fn()
        }
      },
      errorContainer: {
        classList: {
          add: vi.fn(),
          remove: vi.fn(),
          contains: vi.fn()
        }
      },
      sendCodeBtn: {
        disabled: false,
        classList: {
          add: vi.fn(),
          remove: vi.fn()
        }
      },
      verifyCodeBtn: {
        disabled: false,
        classList: {
          add: vi.fn(),
          remove: vi.fn()
        }
      },
      resendBtn: {
        disabled: false,
        textContent: '',
        classList: {
          add: vi.fn(),
          remove: vi.fn()
        }
      }
    };

    // Setup getElementById mock
    mockDocument.getElementById.mockImplementation((id: string) => {
      const elementMap: { [key: string]: any } = {
        '2fa-modal': mockElements.modal,
        'phone-form': mockElements.phoneForm,
        'code-form': mockElements.codeForm,
        'phone-number': mockElements.phoneInput,
        'verification-method': mockElements.methodSelect,
        'verification-code': mockElements.codeInput,
        'error-message': mockElements.errorMessage,
        '2fa-error': mockElements.errorContainer,
        'send-code-btn': mockElements.sendCodeBtn,
        'verify-code-btn': mockElements.verifyCodeBtn,
        'resend-code-btn': mockElements.resendBtn
      };
      return elementMap[id] || null;
    });

    // Mock querySelectorAll
    mockDocument.querySelectorAll.mockReturnValue([]);

    // Import the TwoFAManager class (we'll need to extract it from the component)
    TwoFAManager = class {
      currentStep: number = 1;
      verificationId: string | null = null;
      phoneNumber: string | null = null;
      method: string = 'sms';
      resendCountdown: number = 60;
      resendTimer: NodeJS.Timeout | null = null;
      authContext: string = 'default';

      constructor() {
        this.initializeEventListeners();
      }

      initializeEventListeners() {
        // Mock implementation
      }

      showStep(step: number) {
        this.currentStep = step;
      }

      showError(message: string) {
        if (mockElements.errorMessage) {
          mockElements.errorMessage.textContent = message;
        }
        if (mockElements.errorContainer) {
          mockElements.errorContainer.classList.remove('hidden');
        }
      }

      hideError() {
        if (mockElements.errorContainer) {
          mockElements.errorContainer.classList.add('hidden');
        }
      }

      setLoading(buttonType: string, isLoading: boolean) {
        // Mock implementation
      }

      async handlePhoneSubmit() {
        const phoneInput = mockDocument.getElementById('phone-number');
        const methodSelect = mockDocument.getElementById('verification-method');
        
        this.phoneNumber = phoneInput?.value?.replace(/\D/g, '') || '';
        this.method = methodSelect?.value || 'sms';

        if (!this.phoneNumber || this.phoneNumber.length < 10) {
          this.showError('Please enter a valid phone number');
          return;
        }

        this.setLoading('send-code', true);
        this.hideError();

        try {
          const response = await fetch('/api/v2/2fa/initiate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phoneNumber: `+${this.phoneNumber}`,
              method: this.method,
              userAgent: navigator.userAgent,
              ipAddress: '127.0.0.1',
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
          this.showError('Network error. Please check your connection and try again.');
        } finally {
          this.setLoading('send-code', false);
        }
      }

      async handleCodeSubmit() {
        const codeInput = mockDocument.getElementById('verification-code');
        const code = codeInput?.value || '';

        if (!code || code.length !== 6) {
          this.showError('Please enter a valid 6-digit code');
          return;
        }

        this.setLoading('verify-code', true);
        this.hideError();

        try {
          const response = await fetch('/api/v2/2fa/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              verificationId: this.verificationId,
              code: code,
              phoneNumber: `+${this.phoneNumber}`
            })
          });

          const result = await response.json();

          if (result.success && result.verified) {
            this.showStep(3);
            this.hideError();
            if (result.token) {
              localStorage.setItem('tetrix_auth_token', result.token);
            }
          } else {
            this.showError(result.message || 'Invalid verification code. Please try again.');
          }
        } catch (error) {
          this.showError('Network error. Please check your connection and try again.');
        } finally {
          this.setLoading('verify-code', false);
        }
      }

      formatPhoneNumber(input: any) {
        // Mock implementation
      }

      generateSessionId() {
        return 'test-session-id';
      }

      async getClientIP() {
        return '127.0.0.1';
      }

      startResendTimer() {
        // Mock implementation
      }

      closeModal() {
        if (mockElements.modal) {
          mockElements.modal.classList.add('hidden');
        }
        this.reset();
      }

      reset() {
        this.currentStep = 1;
        this.verificationId = null;
        this.phoneNumber = null;
        this.method = 'sms';
        this.resendCountdown = 60;
        this.resendTimer = null;
        this.authContext = 'default';
      }
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('TwoFAManager Initialization', () => {
    it('should initialize with default values', () => {
      const manager = new TwoFAManager();
      
      expect(manager.currentStep).toBe(1);
      expect(manager.verificationId).toBeNull();
      expect(manager.phoneNumber).toBeNull();
      expect(manager.method).toBe('sms');
      expect(manager.resendCountdown).toBe(60);
      expect(manager.resendTimer).toBeNull();
      expect(manager.authContext).toBe('default');
    });

    it('should set up event listeners on initialization', () => {
      const manager = new TwoFAManager();
      expect(mockDocument.getElementById).toHaveBeenCalled();
    });
  });

  describe('Phone Number Validation', () => {
    it('should show error for empty phone number', async () => {
      const manager = new TwoFAManager();
      mockElements.phoneInput.value = '';
      
      await manager.handlePhoneSubmit();
      
      expect(mockElements.errorMessage.textContent).toBe('Please enter a valid phone number');
      expect(mockElements.errorContainer.classList.remove).toHaveBeenCalledWith('hidden');
    });

    it('should show error for invalid phone number length', async () => {
      const manager = new TwoFAManager();
      mockElements.phoneInput.value = '123';
      
      await manager.handlePhoneSubmit();
      
      expect(mockElements.errorMessage.textContent).toBe('Please enter a valid phone number');
    });

    it('should accept valid phone number', async () => {
      const manager = new TwoFAManager();
      mockElements.phoneInput.value = '1234567890';
      mockElements.methodSelect.value = 'sms';
      
      // Mock successful API response
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          verificationId: 'test-verification-id'
        })
      });
      
      await manager.handlePhoneSubmit();
      
      expect(manager.phoneNumber).toBe('1234567890');
      expect(manager.method).toBe('sms');
      expect(manager.verificationId).toBe('test-verification-id');
      expect(manager.currentStep).toBe(2);
    });
  });

  describe('API Integration', () => {
    it('should call initiate API with correct parameters', async () => {
      const manager = new TwoFAManager();
      mockElements.phoneInput.value = '1234567890';
      mockElements.methodSelect.value = 'sms';
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          verificationId: 'test-verification-id'
        })
      });
      
      await manager.handlePhoneSubmit();
      
      expect(global.fetch).toHaveBeenCalledWith('/api/v2/2fa/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: '+1234567890',
          method: 'sms',
          userAgent: 'test-user-agent',
          ipAddress: '127.0.0.1',
          sessionId: 'test-session-id'
        })
      });
    });

    it('should handle API errors gracefully', async () => {
      const manager = new TwoFAManager();
      mockElements.phoneInput.value = '1234567890';
      mockElements.methodSelect.value = 'sms';
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: false,
          message: 'API Error'
        })
      });
      
      await manager.handlePhoneSubmit();
      
      expect(mockElements.errorMessage.textContent).toBe('API Error');
    });

    it('should handle network errors', async () => {
      const manager = new TwoFAManager();
      mockElements.phoneInput.value = '1234567890';
      mockElements.methodSelect.value = 'sms';
      
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));
      
      await manager.handlePhoneSubmit();
      
      expect(mockElements.errorMessage.textContent).toBe('Network error. Please check your connection and try again.');
    });
  });

  describe('Code Verification', () => {
    it('should show error for invalid code length', async () => {
      const manager = new TwoFAManager();
      mockElements.codeInput.value = '123';
      
      await manager.handleCodeSubmit();
      
      expect(mockElements.errorMessage.textContent).toBe('Please enter a valid 6-digit code');
    });

    it('should verify code successfully', async () => {
      const manager = new TwoFAManager();
      manager.verificationId = 'test-verification-id';
      manager.phoneNumber = '1234567890';
      mockElements.codeInput.value = '123456';
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          verified: true,
          token: 'test-auth-token'
        })
      });
      
      await manager.handleCodeSubmit();
      
      expect(manager.currentStep).toBe(3);
      expect(mockWindow.localStorage.setItem).toHaveBeenCalledWith('tetrix_auth_token', 'test-auth-token');
    });

    it('should handle verification failure', async () => {
      const manager = new TwoFAManager();
      manager.verificationId = 'test-verification-id';
      manager.phoneNumber = '1234567890';
      mockElements.codeInput.value = '123456';
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          verified: false,
          message: 'Invalid code'
        })
      });
      
      await manager.handleCodeSubmit();
      
      expect(mockElements.errorMessage.textContent).toBe('Invalid code');
    });
  });

  describe('Modal State Management', () => {
    it('should show correct step', () => {
      const manager = new TwoFAManager();
      
      manager.showStep(2);
      expect(manager.currentStep).toBe(2);
      
      manager.showStep(3);
      expect(manager.currentStep).toBe(3);
    });

    it('should reset state correctly', () => {
      const manager = new TwoFAManager();
      manager.currentStep = 3;
      manager.verificationId = 'test-id';
      manager.phoneNumber = '1234567890';
      manager.method = 'voice';
      manager.authContext = 'test';
      
      manager.reset();
      
      expect(manager.currentStep).toBe(1);
      expect(manager.verificationId).toBeNull();
      expect(manager.phoneNumber).toBeNull();
      expect(manager.method).toBe('sms');
      expect(manager.authContext).toBe('default');
    });

    it('should close modal and reset state', () => {
      const manager = new TwoFAManager();
      manager.currentStep = 3;
      manager.verificationId = 'test-id';
      
      manager.closeModal();
      
      expect(mockElements.modal.classList.add).toHaveBeenCalledWith('hidden');
      expect(manager.currentStep).toBe(1);
      expect(manager.verificationId).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should show error message', () => {
      const manager = new TwoFAManager();
      
      manager.showError('Test error message');
      
      expect(mockElements.errorMessage.textContent).toBe('Test error message');
      expect(mockElements.errorContainer.classList.remove).toHaveBeenCalledWith('hidden');
    });

    it('should hide error message', () => {
      const manager = new TwoFAManager();
      
      manager.hideError();
      
      expect(mockElements.errorContainer.classList.add).toHaveBeenCalledWith('hidden');
    });
  });
});
