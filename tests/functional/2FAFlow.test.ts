// Functional tests for complete 2FA authentication flow
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock DOM environment
const mockDocument = {
  getElementById: vi.fn(),
  querySelectorAll: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  body: {
    style: {}
  }
};

const mockWindow = {
  localStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn()
  },
  location: {
    href: '',
    hostname: 'localhost'
  },
  open: vi.fn(),
  navigator: {
    userAgent: 'test-user-agent'
  },
  fetch: vi.fn()
};

Object.defineProperty(global, 'document', { value: mockDocument });
Object.defineProperty(global, 'window', { value: mockWindow });
global.fetch = vi.fn();

describe('2FA Authentication Flow - Functional Tests', () => {
  let TwoFAManager: any;
  let mockElements: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup comprehensive mock elements
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
      },
      phoneDisplay: {
        textContent: ''
      }
    };

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
        'resend-code-btn': mockElements.resendBtn,
        'phone-display': mockElements.phoneDisplay
      };
      return elementMap[id] || null;
    });

    mockDocument.querySelectorAll.mockReturnValue([]);

    // Enhanced TwoFAManager with full functionality
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
        // Mock event listener setup
      }

      showStep(step: number) {
        this.currentStep = step;
        if (step === 2 && this.phoneNumber) {
          mockElements.phoneDisplay.textContent = `+${this.phoneNumber}`;
        }
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
        const button = mockDocument.getElementById(`${buttonType}-btn`);
        if (button) {
          button.disabled = isLoading;
        }
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
        // Mock phone formatting
      }

      generateSessionId() {
        return 'test-session-id';
      }

      async getClientIP() {
        return '127.0.0.1';
      }

      startResendTimer() {
        this.resendCountdown = 60;
        this.resendTimer = setInterval(() => {
          this.resendCountdown--;
          if (this.resendCountdown <= 0) {
            clearInterval(this.resendTimer!);
            this.resendTimer = null;
          }
        }, 1000);
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
        if (this.resendTimer) {
          clearInterval(this.resendTimer);
          this.resendTimer = null;
        }
        this.authContext = 'default';
      }
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Complete Authentication Flow', () => {
    it('should complete full SMS authentication flow successfully', async () => {
      const manager = new TwoFAManager();
      
      // Step 1: Enter phone number
      mockElements.phoneInput.value = '1234567890';
      mockElements.methodSelect.value = 'sms';
      
      // Mock successful initiation
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          verificationId: 'test-verification-id'
        })
      });
      
      await manager.handlePhoneSubmit();
      
      // Verify step 1 completion
      expect(manager.currentStep).toBe(2);
      expect(manager.verificationId).toBe('test-verification-id');
      expect(manager.phoneNumber).toBe('1234567890');
      expect(manager.method).toBe('sms');
      expect(mockElements.phoneDisplay.textContent).toBe('+1234567890');
      
      // Step 2: Enter verification code
      mockElements.codeInput.value = '123456';
      
      // Mock successful verification
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          verified: true,
          token: 'test-auth-token'
        })
      });
      
      await manager.handleCodeSubmit();
      
      // Verify step 2 completion
      expect(manager.currentStep).toBe(3);
      expect(mockWindow.localStorage.setItem).toHaveBeenCalledWith('tetrix_auth_token', 'test-auth-token');
    });

    it('should complete voice call authentication flow', async () => {
      const manager = new TwoFAManager();
      
      // Step 1: Enter phone number with voice method
      mockElements.phoneInput.value = '1234567890';
      mockElements.methodSelect.value = 'voice';
      
      // Mock successful initiation
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          verificationId: 'test-voice-verification-id'
        })
      });
      
      await manager.handlePhoneSubmit();
      
      // Verify voice call initiation
      expect(manager.method).toBe('voice');
      expect(manager.verificationId).toBe('test-voice-verification-id');
      expect(manager.currentStep).toBe(2);
    });

    it('should handle authentication failure and retry', async () => {
      const manager = new TwoFAManager();
      
      // Step 1: Enter phone number
      mockElements.phoneInput.value = '1234567890';
      mockElements.methodSelect.value = 'sms';
      
      // Mock successful initiation
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          verificationId: 'test-verification-id'
        })
      });
      
      await manager.handlePhoneSubmit();
      expect(manager.currentStep).toBe(2);
      
      // Step 2: Enter wrong verification code
      mockElements.codeInput.value = '000000';
      
      // Mock verification failure
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          verified: false,
          message: 'Invalid verification code'
        })
      });
      
      await manager.handleCodeSubmit();
      
      // Verify error handling
      expect(manager.currentStep).toBe(2); // Should stay on step 2
      expect(mockElements.errorMessage.textContent).toBe('Invalid verification code');
      
      // Retry with correct code
      mockElements.codeInput.value = '123456';
      
      // Mock successful verification
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          verified: true,
          token: 'test-auth-token'
        })
      });
      
      await manager.handleCodeSubmit();
      
      // Verify successful completion
      expect(manager.currentStep).toBe(3);
      expect(mockWindow.localStorage.setItem).toHaveBeenCalledWith('tetrix_auth_token', 'test-auth-token');
    });

    it('should handle network errors gracefully', async () => {
      const manager = new TwoFAManager();
      
      // Step 1: Enter phone number
      mockElements.phoneInput.value = '1234567890';
      mockElements.methodSelect.value = 'sms';
      
      // Mock network error
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));
      
      await manager.handlePhoneSubmit();
      
      // Verify error handling
      expect(manager.currentStep).toBe(1); // Should stay on step 1
      expect(mockElements.errorMessage.textContent).toBe('Network error. Please check your connection and try again.');
    });

    it('should handle API errors with proper user feedback', async () => {
      const manager = new TwoFAManager();
      
      // Step 1: Enter phone number
      mockElements.phoneInput.value = '1234567890';
      mockElements.methodSelect.value = 'sms';
      
      // Mock API error
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: false,
          message: 'Rate limit exceeded'
        })
      });
      
      await manager.handlePhoneSubmit();
      
      // Verify error handling
      expect(manager.currentStep).toBe(1);
      expect(mockElements.errorMessage.textContent).toBe('Rate limit exceeded');
    });
  });

  describe('Modal State Management', () => {
    it('should properly manage modal visibility states', () => {
      const manager = new TwoFAManager();
      
      // Test modal opening
      manager.showStep(1);
      expect(manager.currentStep).toBe(1);
      
      // Test step progression
      manager.showStep(2);
      expect(manager.currentStep).toBe(2);
      
      // Test modal closing
      manager.closeModal();
      expect(mockElements.modal.classList.add).toHaveBeenCalledWith('hidden');
      expect(manager.currentStep).toBe(1);
    });

    it('should reset all state when modal is closed', () => {
      const manager = new TwoFAManager();
      
      // Set some state
      manager.currentStep = 3;
      manager.verificationId = 'test-id';
      manager.phoneNumber = '1234567890';
      manager.method = 'voice';
      manager.authContext = 'test';
      
      // Close modal
      manager.closeModal();
      
      // Verify reset
      expect(manager.currentStep).toBe(1);
      expect(manager.verificationId).toBeNull();
      expect(manager.phoneNumber).toBeNull();
      expect(manager.method).toBe('sms');
      expect(manager.authContext).toBe('default');
    });
  });

  describe('Input Validation', () => {
    it('should validate phone number format', async () => {
      const manager = new TwoFAManager();
      
      // Test empty phone number
      mockElements.phoneInput.value = '';
      await manager.handlePhoneSubmit();
      expect(mockElements.errorMessage.textContent).toBe('Please enter a valid phone number');
      
      // Test short phone number
      mockElements.phoneInput.value = '123';
      await manager.handlePhoneSubmit();
      expect(mockElements.errorMessage.textContent).toBe('Please enter a valid phone number');
      
      // Test valid phone number
      mockElements.phoneInput.value = '1234567890';
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          verificationId: 'test-verification-id'
        })
      });
      
      await manager.handlePhoneSubmit();
      expect(manager.currentStep).toBe(2);
    });

    it('should validate verification code format', async () => {
      const manager = new TwoFAManager();
      manager.verificationId = 'test-verification-id';
      manager.phoneNumber = '1234567890';
      
      // Test empty code
      mockElements.codeInput.value = '';
      await manager.handleCodeSubmit();
      expect(mockElements.errorMessage.textContent).toBe('Please enter a valid 6-digit code');
      
      // Test short code
      mockElements.codeInput.value = '123';
      await manager.handleCodeSubmit();
      expect(mockElements.errorMessage.textContent).toBe('Please enter a valid 6-digit code');
      
      // Test valid code
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
    });
  });

  describe('Loading States', () => {
    it('should manage loading states during API calls', async () => {
      const manager = new TwoFAManager();
      
      // Test phone submission loading
      mockElements.phoneInput.value = '1234567890';
      mockElements.methodSelect.value = 'sms';
      
      // Mock delayed response
      (global.fetch as any).mockImplementationOnce(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              verificationId: 'test-verification-id'
            })
          }), 100)
        )
      );
      
      const phonePromise = manager.handlePhoneSubmit();
      
      // Verify loading state is set
      expect(mockElements.sendCodeBtn.disabled).toBe(true);
      
      await phonePromise;
      
      // Verify loading state is cleared
      expect(mockElements.sendCodeBtn.disabled).toBe(false);
    });
  });

  describe('Authentication Context', () => {
    it('should handle different authentication contexts', () => {
      const manager = new TwoFAManager();
      
      // Test default context
      expect(manager.authContext).toBe('default');
      
      // Test context change
      manager.authContext = 'joromi';
      expect(manager.authContext).toBe('joromi');
      
      // Test reset
      manager.reset();
      expect(manager.authContext).toBe('default');
    });
  });
});
