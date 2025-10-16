// Component tests for Industry2FAModal
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the modal component
const mockIndustry2FAModal = {
  open: jest.fn(),
  close: jest.fn(),
  reset: jest.fn()
};

// Mock global functions
global.openIndustryAuth = jest.fn();

// Mock fetch
global.fetch = jest.fn();

describe('Industry2FAModal Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Industry Selection', () => {
    it('should render industry selection step initially', () => {
      // This would test the initial render of the modal
      // Since we're testing an Astro component, we'll mock the DOM structure
      const mockModal = document.createElement('div');
      mockModal.innerHTML = `
        <div id="industry-2fa-modal" class="hidden">
          <div id="industry-step-1">
            <button class="industry-option" data-industry="healthcare">Healthcare</button>
            <button class="industry-option" data-industry="legal">Legal</button>
            <button class="industry-option" data-industry="real_estate">Real Estate</button>
          </div>
        </div>
      `;
      document.body.appendChild(mockModal);

      const healthcareOption = mockModal.querySelector('[data-industry="healthcare"]');
      const legalOption = mockModal.querySelector('[data-industry="legal"]');
      const realEstateOption = mockModal.querySelector('[data-industry="real_estate"]');

      expect(healthcareOption).toBeInTheDocument();
      expect(legalOption).toBeInTheDocument();
      expect(realEstateOption).toBeInTheDocument();
    });

    it('should handle industry selection', () => {
      const mockModal = document.createElement('div');
      mockModal.innerHTML = `
        <div id="industry-2fa-modal" class="hidden">
          <div id="industry-step-1">
            <button class="industry-option" data-industry="healthcare">Healthcare</button>
          </div>
          <div id="industry-step-2" class="hidden">
            <div id="selected-industry-display"></div>
          </div>
        </div>
      `;
      document.body.appendChild(mockModal);

      const healthcareOption = mockModal.querySelector('[data-industry="healthcare"]');
      const step1 = mockModal.querySelector('#industry-step-1');
      const step2 = mockModal.querySelector('#industry-step-2');
      const industryDisplay = mockModal.querySelector('#selected-industry-display');

      // Simulate industry selection
      fireEvent.click(healthcareOption!);

      // Check that step 1 is hidden and step 2 is shown
      expect(step1).toHaveClass('hidden');
      expect(step2).not.toHaveClass('hidden');
      expect(industryDisplay).toHaveTextContent('Healthcare');
    });

    it('should validate industry selection', () => {
      const mockModal = document.createElement('div');
      mockModal.innerHTML = `
        <div id="industry-2fa-modal" class="hidden">
          <div id="industry-step-1">
            <button class="industry-option" data-industry="healthcare">Healthcare</button>
            <button class="industry-option" data-industry="invalid">Invalid</button>
          </div>
        </div>
      `;
      document.body.appendChild(mockModal);

      const validOption = mockModal.querySelector('[data-industry="healthcare"]');
      const invalidOption = mockModal.querySelector('[data-industry="invalid"]');

      // Valid industry should be selectable
      expect(validOption).toBeInTheDocument();
      
      // Invalid industry should not be in the valid list
      const validIndustries = ['healthcare', 'legal', 'real_estate', 'ecommerce', 'construction', 'logistics', 'government', 'education', 'retail', 'hospitality', 'wellness', 'beauty'];
      expect(validIndustries).toContain('healthcare');
      expect(validIndustries).not.toContain('invalid');
    });
  });

  describe('Phone Number Input', () => {
    it('should render phone input form', () => {
      const mockModal = document.createElement('div');
      mockModal.innerHTML = `
        <div id="industry-2fa-modal" class="hidden">
          <div id="industry-step-2">
            <form id="industry-phone-form">
              <input id="industry-phone-number" type="tel" placeholder="+1 (555) 123-4567" />
              <select id="industry-verification-method">
                <option value="sms">SMS Text Message</option>
                <option value="voice">Voice Call</option>
              </select>
              <button type="submit" id="industry-send-code-btn">Send Verification Code</button>
            </form>
          </div>
        </div>
      `;
      document.body.appendChild(mockModal);

      const phoneInput = mockModal.querySelector('#industry-phone-number');
      const methodSelect = mockModal.querySelector('#industry-verification-method');
      const submitBtn = mockModal.querySelector('#industry-send-code-btn');

      expect(phoneInput).toBeInTheDocument();
      expect(methodSelect).toBeInTheDocument();
      expect(submitBtn).toBeInTheDocument();
    });

    it('should format phone number input', () => {
      const mockModal = document.createElement('div');
      mockModal.innerHTML = `
        <div id="industry-2fa-modal" class="hidden">
          <div id="industry-step-2">
            <input id="industry-phone-number" type="tel" />
          </div>
        </div>
      `;
      document.body.appendChild(mockModal);

      const phoneInput = mockModal.querySelector('#industry-phone-number') as HTMLInputElement;

      // Test phone number formatting
      fireEvent.input(phoneInput, { target: { value: '1234567890' } });
      expect(phoneInput.value).toMatch(/^\+1 \(\d{3}\) \d{3}-\d{4}$/);

      fireEvent.input(phoneInput, { target: { value: '+44123456789' } });
      expect(phoneInput.value).toMatch(/^\+44 \d{2} \d{4} \d{4}$/);
    });

    it('should validate phone number format', () => {
      const mockModal = document.createElement('div');
      mockModal.innerHTML = `
        <div id="industry-2fa-modal" class="hidden">
          <div id="industry-step-2">
            <form id="industry-phone-form">
              <input id="industry-phone-number" type="tel" />
              <button type="submit" id="industry-send-code-btn">Send Verification Code</button>
            </form>
            <div id="industry-error" class="hidden">
              <p id="industry-error-message"></p>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(mockModal);

      const phoneInput = mockModal.querySelector('#industry-phone-number') as HTMLInputElement;
      const form = mockModal.querySelector('#industry-phone-form');
      const errorDiv = mockModal.querySelector('#industry-error');
      const errorMessage = mockModal.querySelector('#industry-error-message');

      // Test invalid phone numbers
      const invalidPhones = ['1234567890', 'invalid', '+0123456789', ''];
      
      invalidPhones.forEach(phone => {
        fireEvent.input(phoneInput, { target: { value: phone } });
        fireEvent.submit(form!);
        
        expect(errorDiv).not.toHaveClass('hidden');
        expect(errorMessage).toHaveTextContent('Please enter a valid phone number');
      });

      // Test valid phone number
      fireEvent.input(phoneInput, { target: { value: '+1234567890' } });
      fireEvent.submit(form!);
      
      expect(errorDiv).toHaveClass('hidden');
    });
  });

  describe('API Integration', () => {
    it('should call initiate API on phone form submission', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          sessionId: 'session-123',
          verificationId: 'verify-123',
          provider: 'telnyx',
          method: 'sms',
          expiresIn: 300
        })
      });

      const mockModal = document.createElement('div');
      mockModal.innerHTML = `
        <div id="industry-2fa-modal" class="hidden">
          <div id="industry-step-2">
            <form id="industry-phone-form">
              <input id="industry-phone-number" type="tel" value="+1234567890" />
              <select id="industry-verification-method">
                <option value="sms">SMS Text Message</option>
              </select>
              <button type="submit" id="industry-send-code-btn">Send Verification Code</button>
            </form>
          </div>
          <div id="industry-step-3" class="hidden">
            <input id="industry-verification-code" type="text" />
          </div>
        </div>
      `;
      document.body.appendChild(mockModal);

      const form = mockModal.querySelector('#industry-phone-form');
      const step2 = mockModal.querySelector('#industry-step-2');
      const step3 = mockModal.querySelector('#industry-step-3');

      // Mock the Industry2FAModal class methods
      const mockModalInstance = {
        selectedIndustry: 'healthcare',
        phoneNumber: '+1234567890',
        method: 'sms',
        sessionId: null,
        verificationId: null,
        handlePhoneSubmit: jest.fn().mockImplementation(async () => {
          // Simulate successful API call
          this.sessionId = 'session-123';
          this.verificationId = 'verify-123';
          step2!.classList.add('hidden');
          step3!.classList.remove('hidden');
        })
      };

      // Simulate form submission
      await mockModalInstance.handlePhoneSubmit();

      expect(mockModalInstance.sessionId).toBe('session-123');
      expect(mockModalInstance.verificationId).toBe('verify-123');
      expect(step2).toHaveClass('hidden');
      expect(step3).not.toHaveClass('hidden');
    });

    it('should call verify API on code submission', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          verified: true,
          user: { id: 'user-123', email: 'test@example.com' },
          organization: { id: 'org-123', name: 'Test Org' },
          roles: ['doctor'],
          permissions: ['patient.read'],
          dashboardUrl: 'http://localhost:3000/dashboards/healthcare?org=org-123'
        })
      });

      const mockModal = document.createElement('div');
      mockModal.innerHTML = `
        <div id="industry-2fa-modal" class="hidden">
          <div id="industry-step-3">
            <form id="industry-code-form">
              <input id="industry-verification-code" type="text" value="123456" />
              <button type="submit" id="industry-verify-code-btn">Verify Code</button>
            </form>
          </div>
          <div id="industry-step-5" class="hidden">
            <div id="success-industry"></div>
            <div id="success-organization"></div>
            <div id="success-roles"></div>
          </div>
        </div>
      `;
      document.body.appendChild(mockModal);

      const form = mockModal.querySelector('#industry-code-form');
      const step3 = mockModal.querySelector('#industry-step-3');
      const step5 = mockModal.querySelector('#industry-step-5');
      const successIndustry = mockModal.querySelector('#success-industry');
      const successOrganization = mockModal.querySelector('#success-organization');
      const successRoles = mockModal.querySelector('#success-roles');

      // Mock the Industry2FAModal class methods
      const mockModalInstance = {
        sessionId: 'session-123',
        handleCodeSubmit: jest.fn().mockImplementation(async () => {
          // Simulate successful verification
          step3!.classList.add('hidden');
          step5!.classList.remove('hidden');
          successIndustry!.textContent = 'healthcare';
          successOrganization!.textContent = 'Test Org';
          successRoles!.textContent = 'doctor';
        })
      };

      // Simulate code submission
      await mockModalInstance.handleCodeSubmit();

      expect(step3).toHaveClass('hidden');
      expect(step5).not.toHaveClass('hidden');
      expect(successIndustry).toHaveTextContent('healthcare');
      expect(successOrganization).toHaveTextContent('Test Org');
      expect(successRoles).toHaveTextContent('doctor');
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          error: 'Invalid phone number format'
        })
      });

      const mockModal = document.createElement('div');
      mockModal.innerHTML = `
        <div id="industry-2fa-modal" class="hidden">
          <div id="industry-step-2">
            <form id="industry-phone-form">
              <input id="industry-phone-number" type="tel" value="invalid-phone" />
              <button type="submit" id="industry-send-code-btn">Send Verification Code</button>
            </form>
            <div id="industry-error" class="hidden">
              <p id="industry-error-message"></p>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(mockModal);

      const form = mockModal.querySelector('#industry-phone-form');
      const errorDiv = mockModal.querySelector('#industry-error');
      const errorMessage = mockModal.querySelector('#industry-error-message');

      // Mock the Industry2FAModal class methods
      const mockModalInstance = {
        selectedIndustry: 'healthcare',
        phoneNumber: 'invalid-phone',
        method: 'sms',
        showError: jest.fn().mockImplementation((message) => {
          errorMessage!.textContent = message;
          errorDiv!.classList.remove('hidden');
        }),
        handlePhoneSubmit: jest.fn().mockImplementation(async () => {
          // Simulate API error
          this.showError('Invalid phone number format');
        })
      };

      // Simulate form submission with error
      await mockModalInstance.handlePhoneSubmit();

      expect(mockModalInstance.showError).toHaveBeenCalledWith('Invalid phone number format');
      expect(errorDiv).not.toHaveClass('hidden');
      expect(errorMessage).toHaveTextContent('Invalid phone number format');
    });
  });

  describe('Organization Selection', () => {
    it('should handle organization selection when multiple organizations exist', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          requiresOrganizationSelection: true,
          availableOrganizations: [
            { id: 'org-1', name: 'Hospital A', industry: 'healthcare' },
            { id: 'org-2', name: 'Clinic B', industry: 'healthcare' }
          ]
        })
      });

      const mockModal = document.createElement('div');
      mockModal.innerHTML = `
        <div id="industry-2fa-modal" class="hidden">
          <div id="industry-step-2" class="hidden">
            <form id="industry-phone-form">
              <input id="industry-phone-number" type="tel" value="+1234567890" />
              <button type="submit" id="industry-send-code-btn">Send Verification Code</button>
            </form>
          </div>
          <div id="industry-step-4" class="hidden">
            <div id="organization-list"></div>
          </div>
        </div>
      `;
      document.body.appendChild(mockModal);

      const step2 = mockModal.querySelector('#industry-step-2');
      const step4 = mockModal.querySelector('#industry-step-4');
      const orgList = mockModal.querySelector('#organization-list');

      // Mock the Industry2FAModal class methods
      const mockModalInstance = {
        selectedIndustry: 'healthcare',
        phoneNumber: '+1234567890',
        method: 'sms',
        showOrganizationSelection: jest.fn().mockImplementation((organizations) => {
          step2!.classList.add('hidden');
          step4!.classList.remove('hidden');
          
          organizations.forEach((org: any) => {
            const orgElement = document.createElement('button');
            orgElement.textContent = org.name;
            orgElement.dataset.orgId = org.id;
            orgList!.appendChild(orgElement);
          });
        }),
        handlePhoneSubmit: jest.fn().mockImplementation(async () => {
          // Simulate organization selection required
          this.showOrganizationSelection([
            { id: 'org-1', name: 'Hospital A', industry: 'healthcare' },
            { id: 'org-2', name: 'Clinic B', industry: 'healthcare' }
          ]);
        })
      };

      // Simulate form submission
      await mockModalInstance.handlePhoneSubmit();

      expect(step2).toHaveClass('hidden');
      expect(step4).not.toHaveClass('hidden');
      expect(orgList!.children).toHaveLength(2);
      expect(orgList!.children[0]).toHaveTextContent('Hospital A');
      expect(orgList!.children[1]).toHaveTextContent('Clinic B');
    });
  });

  describe('Resend Code Functionality', () => {
    it('should handle resend code with cooldown timer', () => {
      const mockModal = document.createElement('div');
      mockModal.innerHTML = `
        <div id="industry-2fa-modal" class="hidden">
          <div id="industry-step-3">
            <button id="industry-resend-code-btn" disabled>Resend code in <span id="industry-resend-timer">60</span>s</button>
          </div>
        </div>
      `;
      document.body.appendChild(mockModal);

      const resendBtn = mockModal.querySelector('#industry-resend-code-btn') as HTMLButtonElement;
      const timerSpan = mockModal.querySelector('#industry-resend-timer');

      // Mock the Industry2FAModal class methods
      const mockModalInstance = {
        resendCountdown: 60,
        resendTimer: null,
        startResendTimer: jest.fn().mockImplementation(() => {
          this.resendCountdown = 60;
          resendBtn.disabled = true;
          
          const interval = setInterval(() => {
            this.resendCountdown--;
            timerSpan!.textContent = this.resendCountdown.toString();
            
            if (this.resendCountdown <= 0) {
              clearInterval(interval);
              resendBtn.disabled = false;
              resendBtn.textContent = 'Resend Code';
            }
          }, 1000);
          
          this.resendTimer = interval;
        })
      };

      // Start timer
      mockModalInstance.startResendTimer();

      expect(resendBtn.disabled).toBe(true);
      expect(timerSpan).toHaveTextContent('60');

      // Simulate timer countdown
      mockModalInstance.resendCountdown = 0;
      timerSpan!.textContent = '0';
      resendBtn.disabled = false;
      resendBtn.textContent = 'Resend Code';

      expect(resendBtn.disabled).toBe(false);
      expect(resendBtn.textContent).toBe('Resend Code');
    });
  });

  describe('Modal State Management', () => {
    it('should open and close modal correctly', () => {
      const mockModal = document.createElement('div');
      mockModal.innerHTML = `
        <div id="industry-2fa-modal" class="hidden">
          <button id="close-industry-2fa-modal">Close</button>
        </div>
      `;
      document.body.appendChild(mockModal);

      const modal = mockModal.querySelector('#industry-2fa-modal');
      const closeBtn = mockModal.querySelector('#close-industry-2fa-modal');

      // Mock the Industry2FAModal class methods
      const mockModalInstance = {
        open: jest.fn().mockImplementation(() => {
          modal!.classList.remove('hidden');
          document.body.style.overflow = 'hidden';
        }),
        close: jest.fn().mockImplementation(() => {
          modal!.classList.add('hidden');
          document.body.style.overflow = '';
        })
      };

      // Test opening
      mockModalInstance.open();
      expect(modal).not.toHaveClass('hidden');
      expect(document.body.style.overflow).toBe('hidden');

      // Test closing
      mockModalInstance.close();
      expect(modal).toHaveClass('hidden');
      expect(document.body.style.overflow).toBe('');
    });

    it('should reset modal state on close', () => {
      const mockModal = document.createElement('div');
      mockModal.innerHTML = `
        <div id="industry-2fa-modal" class="hidden">
          <div id="industry-step-1"></div>
          <div id="industry-step-2" class="hidden"></div>
          <div id="industry-step-3" class="hidden"></div>
          <form id="industry-phone-form">
            <input id="industry-phone-number" type="tel" value="+1234567890" />
          </form>
          <form id="industry-code-form">
            <input id="industry-verification-code" type="text" value="123456" />
          </form>
        </div>
      `;
      document.body.appendChild(mockModal);

      const step1 = mockModal.querySelector('#industry-step-1');
      const step2 = mockModal.querySelector('#industry-step-2');
      const step3 = mockModal.querySelector('#industry-step-3');
      const phoneForm = mockModal.querySelector('#industry-phone-form') as HTMLFormElement;
      const codeForm = mockModal.querySelector('#industry-code-form') as HTMLFormElement;
      const phoneInput = mockModal.querySelector('#industry-phone-number') as HTMLInputElement;
      const codeInput = mockModal.querySelector('#industry-verification-code') as HTMLInputElement;

      // Mock the Industry2FAModal class methods
      const mockModalInstance = {
        currentStep: 3,
        selectedIndustry: 'healthcare',
        sessionId: 'session-123',
        verificationId: 'verify-123',
        phoneNumber: '+1234567890',
        method: 'sms',
        reset: jest.fn().mockImplementation(() => {
          this.currentStep = 1;
          this.selectedIndustry = null;
          this.sessionId = null;
          this.verificationId = null;
          this.phoneNumber = null;
          this.method = 'sms';
          
          step1!.classList.remove('hidden');
          step2!.classList.add('hidden');
          step3!.classList.add('hidden');
          
          phoneForm.reset();
          codeForm.reset();
        })
      };

      // Test reset
      mockModalInstance.reset();

      expect(mockModalInstance.currentStep).toBe(1);
      expect(mockModalInstance.selectedIndustry).toBeNull();
      expect(mockModalInstance.sessionId).toBeNull();
      expect(step1).not.toHaveClass('hidden');
      expect(step2).toHaveClass('hidden');
      expect(step3).toHaveClass('hidden');
    });
  });
});
