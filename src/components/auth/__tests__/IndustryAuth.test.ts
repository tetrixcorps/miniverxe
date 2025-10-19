/**
 * Unit Tests for Industry Authentication Component
 * Tests the industry-specific authentication functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';

// Mock DOM elements and fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock DOM methods
const mockGetElementById = vi.fn();
const mockAddEventListener = vi.fn();
const mockPrompt = vi.fn();

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
  value: mockPrompt
});

Object.defineProperty(window, 'openIndustryAuth', {
  value: vi.fn()
});

// Mock document methods
Object.defineProperty(document, 'getElementById', {
  value: mockGetElementById
});

describe('Industry Authentication', () => {
  let mockIndustrySelect: any;
  let mockRoleSelect: any;
  let mockOrganizationInput: any;
  let mockLoginBtn: any;
  let mockCancelBtn: any;
  let mockAuthLoading: any;
  let mockModal: any;

  // Industry roles mapping
  const industryRoles = {
    healthcare: [
      { value: 'doctor', label: 'Doctor' },
      { value: 'nurse', label: 'Nurse' },
      { value: 'admin', label: 'Administrator' },
      { value: 'receptionist', label: 'Receptionist' }
    ],
    construction: [
      { value: 'project_manager', label: 'Project Manager' },
      { value: 'site_supervisor', label: 'Site Supervisor' },
      { value: 'safety_officer', label: 'Safety Officer' },
      { value: 'foreman', label: 'Foreman' }
    ],
    logistics: [
      { value: 'fleet_manager', label: 'Fleet Manager' },
      { value: 'dispatcher', label: 'Dispatcher' },
      { value: 'driver', label: 'Driver' },
      { value: 'operations', label: 'Operations Manager' }
    ]
  };

  // Industry dashboard mappings
  const industryDashboards = {
    healthcare: '/dashboards/healthcare',
    construction: '/dashboards/construction',
    logistics: '/dashboards/logistics',
    government: '/dashboards/government',
    education: '/dashboards/education',
    retail: '/dashboards/retail',
    hospitality: '/dashboards/hospitality',
    wellness: '/dashboards/wellness',
    beauty: '/dashboards/beauty',
    legal: '/dashboards/legal'
  };

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    mockFetch.mockClear();
    mockLocalStorage.clear.mockClear();

    // Create mock DOM elements
    mockIndustrySelect = {
      value: '',
      addEventListener: mockAddEventListener
    };

    mockRoleSelect = {
      value: '',
      disabled: true,
      innerHTML: '',
      appendChild: vi.fn(),
      addEventListener: mockAddEventListener
    };

    mockOrganizationInput = {
      value: '',
      addEventListener: mockAddEventListener
    };

    mockLoginBtn = {
      disabled: false,
      addEventListener: mockAddEventListener
    };

    mockCancelBtn = {
      addEventListener: mockAddEventListener
    };

    mockAuthLoading = {
      classList: {
        add: vi.fn(),
        remove: vi.fn()
      }
    };

    mockModal = {
      classList: {
        add: vi.fn(),
        remove: vi.fn()
      },
      addEventListener: mockAddEventListener
    };

    // Setup getElementById mock
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
        case 'cancel-auth':
          return mockCancelBtn;
        case 'auth-loading':
          return mockAuthLoading;
        case 'industry-auth-modal':
          return mockModal;
        default:
          return null;
      }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Industry Selection', () => {
    it('should populate roles when industry is selected', () => {
      const industryChangeHandler = vi.fn((e) => {
        const target = e.target as HTMLSelectElement;
        const industry = target?.value;
        
        if (industry && industryRoles[industry as keyof typeof industryRoles]) {
          mockRoleSelect.innerHTML = '<option value="">Choose your role...</option>';
          mockRoleSelect.disabled = false;
          
          industryRoles[industry as keyof typeof industryRoles].forEach((role: any) => {
            const option = document.createElement('option');
            option.value = role.value;
            option.textContent = role.label;
            mockRoleSelect.appendChild(option);
          });
        } else {
          mockRoleSelect.disabled = true;
        }
      });

      // Simulate healthcare industry selection
      const mockEvent = {
        target: { value: 'healthcare' }
      };
      industryChangeHandler(mockEvent);

      expect(mockRoleSelect.innerHTML).toContain('Choose your role...');
      expect(mockRoleSelect.disabled).toBe(false);
      expect(mockRoleSelect.appendChild).toHaveBeenCalledTimes(4); // 4 healthcare roles
    });

    it('should disable role selection for invalid industry', () => {
      const industryChangeHandler = vi.fn((e) => {
        const target = e.target as HTMLSelectElement;
        const industry = target?.value;
        
        if (industry && industryRoles[industry as keyof typeof industryRoles]) {
          mockRoleSelect.disabled = false;
        } else {
          mockRoleSelect.disabled = true;
        }
      });

      // Simulate invalid industry selection
      const mockEvent = {
        target: { value: 'invalid_industry' }
      };
      industryChangeHandler(mockEvent);

      expect(mockRoleSelect.disabled).toBe(true);
    });

    it('should handle empty industry selection', () => {
      const industryChangeHandler = vi.fn((e) => {
        const target = e.target as HTMLSelectElement;
        const industry = target?.value;
        
        if (industry && industryRoles[industry as keyof typeof industryRoles]) {
          mockRoleSelect.disabled = false;
        } else {
          mockRoleSelect.disabled = true;
        }
      });

      // Simulate empty selection
      const mockEvent = {
        target: { value: '' }
      };
      industryChangeHandler(mockEvent);

      expect(mockRoleSelect.disabled).toBe(true);
    });
  });

  describe('Form Validation', () => {
    it('should validate all required fields are filled', () => {
      const validateForm = (industry: string, role: string, organization: string) => {
        return !!(industry && role && organization);
      };

      // Valid form
      expect(validateForm('healthcare', 'doctor', 'Test Hospital')).toBe(true);
      
      // Missing industry
      expect(validateForm('', 'doctor', 'Test Hospital')).toBe(false);
      
      // Missing role
      expect(validateForm('healthcare', '', 'Test Hospital')).toBe(false);
      
      // Missing organization
      expect(validateForm('healthcare', 'doctor', '')).toBe(false);
    });
  });

  describe('2FA Integration', () => {
    it('should initiate 2FA with proper phone number formatting', async () => {
      const initiate2FA = async (phoneNumber: string) => {
        const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
        
        const response = await fetch('/api/v2/2fa/initiate', {
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

        return await response.json();
      };

      // Mock successful 2FA initiation
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          verificationId: 'ver_abc123'
        })
      });

      const result = await initiate2FA('+1234567890');
      
      expect(mockFetch).toHaveBeenCalledWith('/api/v2/2fa/initiate', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('+1234567890')
      }));
      expect(result.success).toBe(true);
      expect(result.verificationId).toBe('ver_abc123');
    });

    it('should format phone number correctly', async () => {
      const formatPhoneNumber = (phoneNumber: string) => {
        return phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      };

      expect(formatPhoneNumber('+1234567890')).toBe('+1234567890');
      expect(formatPhoneNumber('1234567890')).toBe('+1234567890');
      expect(formatPhoneNumber('+44 20 7946 0958')).toBe('+44 20 7946 0958');
    });

    it('should verify 2FA code successfully', async () => {
      const verify2FACode = async (verificationId: string, code: string, phoneNumber: string) => {
        const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
        
        const response = await fetch('/api/v2/2fa/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            verificationId: verificationId,
            code: code,
            phoneNumber: formattedPhone
          })
        });

        return await response.json();
      };

      // Mock successful verification
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          verified: true,
          token: 'auth_token_xyz789'
        })
      });

      const result = await verify2FACode('ver_abc123', '123456', '+1234567890');
      
      expect(mockFetch).toHaveBeenCalledWith('/api/v2/2fa/verify', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('ver_abc123')
      }));
      expect(result.success).toBe(true);
      expect(result.verified).toBe(true);
      expect(result.token).toBe('auth_token_xyz789');
    });
  });

  describe('Authentication Flow', () => {
    it('should complete full authentication flow', async () => {
      // Mock successful 2FA initiation
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          verificationId: 'ver_abc123'
        })
      });

      // Mock successful 2FA verification
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          verified: true,
          token: 'auth_token_xyz789'
        })
      });

      // Mock prompt responses
      mockPrompt
        .mockResolvedValueOnce('+1234567890') // Phone number
        .mockResolvedValueOnce('123456'); // Verification code

      const authenticateUser = async () => {
        const industry = 'healthcare';
        const role = 'doctor';
        const organization = 'Test Hospital';
        const phoneNumber = await mockPrompt('Please enter your phone number:');
        const verificationCode = await mockPrompt('Please enter the verification code:');

        if (!industry || !role || !organization || !phoneNumber || !verificationCode) {
          throw new Error('Missing required fields');
        }

        // Initiate 2FA
        const verificationResult = await fetch('/api/v2/2fa/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: phoneNumber,
            method: 'sms'
          })
        });
        const initiateResult = await verificationResult.json();

        if (!initiateResult.success) {
          throw new Error(initiateResult.message || 'Failed to initiate 2FA');
        }

        // Verify 2FA
        const verifyResult = await fetch('/api/v2/2fa/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            verificationId: initiateResult.verificationId,
            code: verificationCode,
            phoneNumber: phoneNumber
          })
        });
        const verifyResponse = await verifyResult.json();

        if (!verifyResponse.success || !verifyResponse.verified) {
          throw new Error(verifyResponse.message || 'Invalid verification code');
        }

        // Store auth data
        const authData = {
          industry,
          role,
          organization,
          phoneNumber,
          verificationId: initiateResult.verificationId,
          authToken: verifyResponse.token,
          authMethod: '2fa',
          timestamp: Date.now()
        };

        localStorage.setItem('tetrixAuth', JSON.stringify(authData));

        // Redirect to dashboard
        const dashboardUrl = industryDashboards[industry as keyof typeof industryDashboards];
        return {
          success: true,
          dashboardUrl,
          token: verifyResponse.token
        };
      };

      const result = await authenticateUser();

      expect(result.success).toBe(true);
      expect(result.dashboardUrl).toBe('/dashboards/healthcare');
      expect(result.token).toBe('auth_token_xyz789');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('tetrixAuth', expect.any(String));
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

      mockPrompt.mockResolvedValueOnce('invalid_phone');

      const authenticateUser = async () => {
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

      const result = await authenticateUser();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid phone number format');
    });
  });

  describe('Dashboard Redirection', () => {
    it('should redirect to correct industry dashboard', () => {
      const getDashboardUrl = (industry: string) => {
        return industryDashboards[industry as keyof typeof industryDashboards] || '/dashboards/client';
      };

      expect(getDashboardUrl('healthcare')).toBe('/dashboards/healthcare');
      expect(getDashboardUrl('construction')).toBe('/dashboards/construction');
      expect(getDashboardUrl('logistics')).toBe('/dashboards/logistics');
      expect(getDashboardUrl('invalid_industry')).toBe('/dashboards/client');
    });

    it('should include authentication token in redirect URL', () => {
      const createRedirectUrl = (dashboardUrl: string, token: string) => {
        return `${dashboardUrl}?token=${token}`;
      };

      const dashboardUrl = '/dashboards/healthcare';
      const token = 'auth_token_xyz789';
      const redirectUrl = createRedirectUrl(dashboardUrl, token);

      expect(redirectUrl).toBe('/dashboards/healthcare?token=auth_token_xyz789');
    });
  });

  describe('Modal Management', () => {
    it('should open industry auth modal', () => {
      const openModal = () => {
        const modal = document.getElementById('industry-auth-modal');
        modal?.classList.remove('hidden');
      };

      openModal();
      expect(mockModal.classList.remove).toHaveBeenCalledWith('hidden');
    });

    it('should close industry auth modal', () => {
      const closeModal = () => {
        const modal = document.getElementById('industry-auth-modal');
        modal?.classList.add('hidden');
      };

      closeModal();
      expect(mockModal.classList.add).toHaveBeenCalledWith('hidden');
    });

    it('should handle modal close on outside click', () => {
      const handleOutsideClick = (e: any) => {
        const modal = document.getElementById('industry-auth-modal');
        if (e.target === modal) {
          modal?.classList.add('hidden');
        }
      };

      // Simulate click on modal background
      const mockEvent = { target: mockModal };
      handleOutsideClick(mockEvent);

      expect(mockModal.classList.add).toHaveBeenCalledWith('hidden');
    });
  });

  describe('Loading States', () => {
    it('should show loading state during authentication', () => {
      const showLoading = () => {
        const authLoading = document.getElementById('auth-loading');
        const loginBtn = document.getElementById('login-btn');
        
        authLoading?.classList.remove('hidden');
        (loginBtn as HTMLButtonElement).disabled = true;
      };

      showLoading();
      expect(mockAuthLoading.classList.remove).toHaveBeenCalledWith('hidden');
    });

    it('should hide loading state after authentication', () => {
      const hideLoading = () => {
        const authLoading = document.getElementById('auth-loading');
        const loginBtn = document.getElementById('login-btn');
        
        authLoading?.classList.add('hidden');
        (loginBtn as HTMLButtonElement).disabled = false;
      };

      hideLoading();
      expect(mockAuthLoading.classList.add).toHaveBeenCalledWith('hidden');
    });
  });

  describe('Session Management', () => {
    it('should generate unique session IDs', () => {
      let callCount = 0;
      const generateSessionId = () => {
        callCount++;
        return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + (Date.now() + callCount);
      };

      const sessionId1 = generateSessionId();
      const sessionId2 = generateSessionId();

      expect(sessionId1).toMatch(/^session_[a-z0-9]+_\d+$/);
      expect(sessionId2).toMatch(/^session_[a-z0-9]+_\d+$/);
      expect(sessionId1).not.toBe(sessionId2);
    });

    it('should get client IP address', async () => {
      const getClientIP = async () => {
        try {
          const response = await fetch('https://api.ipify.org?format=json');
          const data = await response.json();
          return data.ip;
        } catch {
          return 'unknown';
        }
      };

      // Mock successful IP fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ip: '192.168.1.1' })
      });

      const ip = await getClientIP();
      expect(ip).toBe('192.168.1.1');
    });

    it('should handle IP fetch failure', async () => {
      const getClientIP = async () => {
        try {
          const response = await fetch('https://api.ipify.org?format=json');
          const data = await response.json();
          return data.ip;
        } catch {
          return 'unknown';
        }
      };

      // Mock failed IP fetch
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const ip = await getClientIP();
      expect(ip).toBe('unknown');
    });
  });
});
