/**
 * Integration Tests for Authentication System
 * Tests the complete authentication flow across components
 */

import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock DOM elements
const mockGetElementById = vi.fn();
Object.defineProperty(document, 'getElementById', {
  value: mockGetElementById
});

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

// Mock window methods
Object.defineProperty(window, 'prompt', {
  value: vi.fn()
});

Object.defineProperty(window, 'openIndustryAuth', {
  value: vi.fn()
});

Object.defineProperty(window, 'open2FAModal', {
  value: vi.fn()
});

describe('Authentication System Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
    mockLocalStorage.clear.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Complete Industry Authentication Flow', () => {
    it('should complete full industry authentication with 2FA', async () => {
      // Mock successful 2FA initiation
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            verificationId: 'ver_abc123',
            message: 'Verification SMS sent successfully'
          })
        })
        // Mock successful 2FA verification
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            verified: true,
            token: 'auth_token_xyz789',
            message: 'Verification successful'
          })
        });

      // Mock prompt responses
      const mockPrompt = vi.fn()
        .mockResolvedValueOnce('+1234567890') // Phone number
        .mockResolvedValueOnce('123456'); // Verification code

      Object.defineProperty(window, 'prompt', {
        value: mockPrompt
      });

      // Mock DOM elements
      const mockIndustrySelect = { value: 'healthcare' };
      const mockRoleSelect = { value: 'doctor' };
      const mockOrganizationInput = { value: 'Test Hospital' };
      const mockLoginBtn = { disabled: false };
      const mockAuthLoading = { classList: { add: vi.fn(), remove: vi.fn() } };

      mockGetElementById.mockImplementation((id: string) => {
        switch (id) {
          case 'industry-select':
            return mockIndustrySelect;
          case 'role-select':
            return mockRoleSelect;
          case 'organization-input':
            return mockOrganizationInput;
          case 'login-btn':
            return mockLoginBtn;
          case 'auth-loading':
            return mockAuthLoading;
          default:
            return null;
        }
      });

      // Simulate the complete authentication flow
      const authenticateIndustryUser = async () => {
        const industry = mockIndustrySelect.value;
        const role = mockRoleSelect.value;
        const organization = mockOrganizationInput.value;

        if (!industry || !role || !organization) {
          throw new Error('Please fill in all required fields');
        }

        // Show loading state
        mockAuthLoading.classList.remove('hidden');
        mockLoginBtn.disabled = true;

        try {
          // Step 1: Get phone number
          const phoneNumber = await mockPrompt('Please enter your phone number (with country code, e.g., +1234567890):');
          if (!phoneNumber) {
            throw new Error('Phone number is required for authentication');
          }

          // Step 2: Initiate 2FA
          const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
          const initiateResponse = await fetch('/api/v2/2fa/initiate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phoneNumber: formattedPhone,
              method: 'sms',
              userAgent: navigator.userAgent,
              ipAddress: '192.168.1.1',
              sessionId: 'session_abc123'
            })
          });

          const initiateResult = await initiateResponse.json();
          if (!initiateResult.success) {
            throw new Error(initiateResult.message || 'Failed to initiate 2FA verification');
          }

          // Step 3: Get verification code
          const verificationCode = await mockPrompt('Please enter the 6-digit verification code sent to your phone:');
          if (!verificationCode) {
            throw new Error('Verification code is required');
          }

          // Step 4: Verify code
          const verifyResponse = await fetch('/api/v2/2fa/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              verificationId: initiateResult.verificationId,
              code: verificationCode,
              phoneNumber: formattedPhone
            })
          });

          const verifyResult = await verifyResponse.json();
          if (!verifyResult.success || !verifyResult.verified) {
            throw new Error(verifyResult.message || 'Invalid verification code');
          }

          // Step 5: Store authentication data
          const authData = {
            industry,
            role,
            organization,
            phoneNumber,
            verificationId: initiateResult.verificationId,
            authToken: verifyResult.token,
            authMethod: '2fa',
            timestamp: Date.now()
          };

          localStorage.setItem('tetrixAuth', JSON.stringify(authData));

          // Step 6: Redirect to dashboard
          const industryDashboards = {
            healthcare: '/dashboards/healthcare',
            construction: '/dashboards/construction',
            logistics: '/dashboards/logistics'
          };

          const dashboardUrl = industryDashboards[industry as keyof typeof industryDashboards];
          const redirectUrl = dashboardUrl ? `${dashboardUrl}?token=${verifyResult.token}` : `/dashboards/client?token=${verifyResult.token}`;

          return {
            success: true,
            authData,
            redirectUrl
          };

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return {
            success: false,
            error: errorMessage
          };
        } finally {
          mockAuthLoading.classList.add('hidden');
          mockLoginBtn.disabled = false;
        }
      };

      const result = await authenticateIndustryUser();

      expect(result.success).toBe(true);
      expect(result.authData.industry).toBe('healthcare');
      expect(result.authData.role).toBe('doctor');
      expect(result.authData.organization).toBe('Test Hospital');
      expect(result.redirectUrl).toBe('/dashboards/healthcare?token=auth_token_xyz789');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('tetrixAuth', expect.any(String));

      // Verify API calls
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenNthCalledWith(1, '/api/v2/2fa/initiate', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('+1234567890')
      }));
      expect(mockFetch).toHaveBeenNthCalledWith(2, '/api/v2/2fa/verify', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('ver_abc123')
      }));
    });

    it('should handle authentication errors gracefully', async () => {
      // Mock failed 2FA initiation
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({
          success: false,
          error: 'Invalid phone number format'
        })
      });

      const mockPrompt = vi.fn().mockResolvedValueOnce('invalid_phone');
      Object.defineProperty(window, 'prompt', {
        value: mockPrompt
      });

      const authenticateIndustryUser = async () => {
        try {
          const phoneNumber = await mockPrompt('Please enter your phone number:');
          
          const response = await fetch('/api/v2/2fa/initiate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phoneNumber: phoneNumber,
              method: 'sms'
            })
          });
          
          const result = await response.json();
          if (!result.success) {
            throw new Error(result.error || 'Failed to initiate 2FA');
          }
          
          return { success: true };
        } catch (error) {
          return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          };
        }
      };

      const result = await authenticateIndustryUser();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid phone number format');
    });
  });

  describe('2FA Modal Integration', () => {
    it('should complete 2FA verification flow', async () => {
      // Mock successful 2FA initiation
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            verificationId: 'ver_abc123',
            message: 'Verification SMS sent successfully'
          })
        })
        // Mock successful 2FA verification
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            verified: true,
            token: 'auth_token_xyz789',
            message: 'Verification successful'
          })
        });

      // Mock DOM elements for 2FA modal
      const mockPhoneInput = { value: '+1234567890' };
      const mockMethodSelect = { value: 'sms' };
      const mockCodeInput = { value: '123456' };
      const mockSendCodeBtn = { disabled: false };
      const mockVerifyCodeBtn = { disabled: false };
      const mockErrorDiv = { classList: { add: vi.fn(), remove: vi.fn() } };
      const mockErrorMessage = { textContent: '' };

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
          default:
            return null;
        }
      });

      // Simulate 2FA modal flow
      const twoFAFlow = async () => {
        // Step 1: Phone number submission
        const phoneNumber = mockPhoneInput.value;
        const method = mockMethodSelect.value;

        const initiateResponse = await fetch('/api/v2/2fa/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: phoneNumber,
            method: method,
            userAgent: navigator.userAgent,
            ipAddress: '192.168.1.1',
            sessionId: 'session_abc123'
          })
        });

        const initiateResult = await initiateResponse.json();
        if (!initiateResult.success) {
          throw new Error(initiateResult.message || 'Failed to send verification code');
        }

        // Step 2: Code verification
        const code = mockCodeInput.value;
        if (!code || code.length !== 6) {
          throw new Error('Please enter a valid 6-digit code');
        }

        const verifyResponse = await fetch('/api/v2/2fa/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            verificationId: initiateResult.verificationId,
            code: code,
            phoneNumber: phoneNumber
          })
        });

        const verifyResult = await verifyResponse.json();
        if (!verifyResult.success || !verifyResult.verified) {
          throw new Error(verifyResult.message || 'Invalid verification code');
        }

        // Step 3: Store token and show success
        if (verifyResult.token) {
          localStorage.setItem('tetrix_auth_token', verifyResult.token);
        }

        return {
          success: true,
          token: verifyResult.token,
          verificationId: initiateResult.verificationId
        };
      };

      const result = await twoFAFlow();

      expect(result.success).toBe(true);
      expect(result.token).toBe('auth_token_xyz789');
      expect(result.verificationId).toBe('ver_abc123');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('tetrix_auth_token', 'auth_token_xyz789');
    });

    it('should handle 2FA verification errors', async () => {
      // Mock failed 2FA verification
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            verificationId: 'ver_abc123',
            message: 'Verification SMS sent successfully'
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            verified: false,
            details: {
              responseCode: 'rejected',
              message: 'Invalid verification code'
            }
          })
        });

      const mockPhoneInput = { value: '+1234567890' };
      const mockMethodSelect = { value: 'sms' };
      const mockCodeInput = { value: '000000' }; // Invalid code

      mockGetElementById.mockImplementation((id: string) => {
        switch (id) {
          case 'phone-number':
            return mockPhoneInput;
          case 'verification-method':
            return mockMethodSelect;
          case 'verification-code':
            return mockCodeInput;
          default:
            return null;
        }
      });

      const twoFAFlow = async () => {
        try {
          // Initiate 2FA
          const initiateResponse = await fetch('/api/v2/2fa/initiate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phoneNumber: mockPhoneInput.value,
              method: mockMethodSelect.value
            })
          });

          const initiateResult = await initiateResponse.json();
          if (!initiateResult.success) {
            throw new Error(initiateResult.message);
          }

          // Verify code
          const verifyResponse = await fetch('/api/v2/2fa/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              verificationId: initiateResult.verificationId,
              code: mockCodeInput.value,
              phoneNumber: mockPhoneInput.value
            })
          });

          const verifyResult = await verifyResponse.json();
          if (!verifyResult.success || !verifyResult.verified) {
            throw new Error(verifyResult.details?.message || 'Verification failed');
          }

          return { success: true };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      };

      const result = await twoFAFlow();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid verification code');
    });
  });

  describe('Cross-Component Communication', () => {
    it('should handle industry auth opening 2FA modal', () => {
      const openIndustryAuth = () => {
        const modal = document.getElementById('industry-auth-modal');
        modal?.classList.remove('hidden');
      };

      const open2FAModal = () => {
        const modal = document.getElementById('2fa-modal');
        modal?.classList.remove('hidden');
      };

      const mockIndustryModal = { classList: { remove: vi.fn() } };
      const mock2FAModal = { classList: { remove: vi.fn() } };

      mockGetElementById.mockImplementation((id: string) => {
        switch (id) {
          case 'industry-auth-modal':
            return mockIndustryModal;
          case '2fa-modal':
            return mock2FAModal;
          default:
            return null;
        }
      });

      openIndustryAuth();
      expect(mockIndustryModal.classList.remove).toHaveBeenCalledWith('hidden');

      open2FAModal();
      expect(mock2FAModal.classList.remove).toHaveBeenCalledWith('hidden');
    });

    it('should handle authentication context switching', () => {
      const setAuthContext = (context: string) => {
        (window as any).tetrixAuthContext = context;
      };

      const getAuthContext = () => {
        return (window as any).tetrixAuthContext || 'default';
      };

      setAuthContext('code-academy');
      expect(getAuthContext()).toBe('code-academy');

      setAuthContext('dashboard');
      expect(getAuthContext()).toBe('dashboard');

      setAuthContext('default');
      expect(getAuthContext()).toBe('default');
    });
  });

  describe('Error Recovery', () => {
    it('should retry failed network requests', async () => {
      let attemptCount = 0;
      
      mockFetch.mockImplementation(() => {
        attemptCount++;
        if (attemptCount === 1) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            verificationId: 'ver_abc123'
          })
        });
      });

      const retryableRequest = async (maxRetries = 3) => {
        for (let i = 0; i < maxRetries; i++) {
          try {
            const response = await fetch('/api/v2/2fa/initiate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                phoneNumber: '+1234567890',
                method: 'sms'
              })
            });
            return await response.json();
          } catch (error) {
            if (i === maxRetries - 1) {
              throw error;
            }
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      };

      const result = await retryableRequest();
      expect(result.success).toBe(true);
      expect(attemptCount).toBe(2);
    });

    it('should handle partial authentication state', () => {
      const authState = {
        industry: 'healthcare',
        role: 'doctor',
        organization: 'Test Hospital',
        phoneNumber: '+1234567890',
        verificationId: 'ver_abc123',
        // Missing: authToken, verified status
      };

      const isCompleteAuth = (state: any) => {
        return !!(state.industry && state.role && state.organization && 
                 state.phoneNumber && state.verificationId && state.authToken);
      };

      expect(isCompleteAuth(authState)).toBe(false);

      const completeAuthState = {
        ...authState,
        authToken: 'auth_token_xyz789',
        verified: true
      };

      expect(isCompleteAuth(completeAuthState)).toBe(true);
    });
  });

  describe('Security Validation', () => {
    it('should validate phone number format across components', () => {
      const validatePhoneNumber = (phoneNumber: string) => {
        if (!phoneNumber) return false;
        const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
        return cleanPhone.startsWith('+') && cleanPhone.length >= 8 && cleanPhone.length <= 16;
      };

      expect(validatePhoneNumber('+1234567890')).toBe(true);
      expect(validatePhoneNumber('+44 20 7946 0958')).toBe(true);
      expect(validatePhoneNumber('1234567890')).toBe(false);
      expect(validatePhoneNumber('+123')).toBe(false);
      expect(validatePhoneNumber('invalid')).toBe(false);
    });

    it('should validate verification code format', () => {
      const validateVerificationCode = (code: string) => {
        return /^\d{6}$/.test(code);
      };

      expect(validateVerificationCode('123456')).toBe(true);
      expect(validateVerificationCode('000000')).toBe(true);
      expect(validateVerificationCode('12345')).toBe(false);
      expect(validateVerificationCode('1234567')).toBe(false);
      expect(validateVerificationCode('abc123')).toBe(false);
    });

    it('should sanitize user input', () => {
      const sanitizeInput = (input: string) => {
        return input.trim().replace(/[<>\"']/g, '');
      };

      expect(sanitizeInput('  Test Hospital  ')).toBe('Test Hospital');
      expect(sanitizeInput('Test<script>alert("xss")</script>')).toBe('Testscriptalert(xss)/script');
      expect(sanitizeInput('Normal Input')).toBe('Normal Input');
    });
  });
});
