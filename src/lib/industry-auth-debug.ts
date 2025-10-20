// IndustryAuth Debug Utilities
// This module provides debugging capabilities for the IndustryAuth component

export interface DebugInfo {
  timestamp: string;
  component: string;
  status: 'loading' | 'loaded' | 'error';
  details: any;
}

export class IndustryAuthDebugger {
  private debugLog: DebugInfo[] = [];
  private isEnabled: boolean = false;

  constructor() {
    // Enable debugging in development or when debug flag is present
    this.isEnabled = 
      typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || 
       window.location.search.includes('debug=true') ||
       process.env.NODE_ENV === 'development');
  }

  log(component: string, status: 'loading' | 'loaded' | 'error', details: any = {}) {
    if (!this.isEnabled) return;

    const debugInfo: DebugInfo = {
      timestamp: new Date().toISOString(),
      component,
      status,
      details
    };

    this.debugLog.push(debugInfo);
    
    console.log(`[IndustryAuth Debug] ${component}: ${status}`, details);
  }

  async testModalFunctionality() {
    if (!this.isEnabled) return;

    this.log('IndustryAuthDebugger', 'loading', 'Starting modal functionality test');

    try {
      // Test 1: Check if modal element exists
      const modal = document.getElementById('industry-auth-modal');
      this.log('Modal Element', modal ? 'loaded' : 'error', {
        exists: !!modal,
        className: modal?.className,
        hidden: modal?.classList.contains('hidden')
      });

      // Test 2: Check if openIndustryAuthModal function exists
      const hasFunction = typeof window.openIndustryAuthModal === 'function';
      this.log('openIndustryAuthModal Function', hasFunction ? 'loaded' : 'error', {
        available: hasFunction,
        type: typeof window.openIndustryAuthModal
      });

      // Test 3: Test modal opening
      if (hasFunction && modal) {
        this.log('Modal Test', 'loading', 'Testing modal open/close');
        
        // Open modal
        window.openIndustryAuthModal();
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const isVisible = !modal.classList.contains('hidden');
        this.log('Modal Open Test', isVisible ? 'loaded' : 'error', {
          visible: isVisible,
          className: modal.className
        });

        // Test form elements
        const industrySelect = document.getElementById('industry-select');
        const roleSelect = document.getElementById('role-select');
        const organizationInput = document.getElementById('organization-input');
        const loginBtn = document.getElementById('login-btn');

        this.log('Form Elements', 'loaded', {
          industrySelect: !!industrySelect,
          roleSelect: !!roleSelect,
          organizationInput: !!organizationInput,
          loginBtn: !!loginBtn
        });

        // Test industry selection
        if (industrySelect) {
          (industrySelect as HTMLSelectElement).value = 'healthcare';
          industrySelect.dispatchEvent(new Event('change'));
          
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const roleOptions = (roleSelect as HTMLSelectElement)?.options.length || 0;
          this.log('Industry Selection Test', 'loaded', {
            selectedValue: (industrySelect as HTMLSelectElement).value,
            roleOptionsCount: roleOptions
          });
        }

        // Close modal
        modal.classList.add('hidden');
        this.log('Modal Close Test', 'loaded', 'Modal closed successfully');
      }

      // Test 4: Check 2FA integration
      const has2FAFunction = typeof window.open2FAModal === 'function';
      this.log('2FA Integration', has2FAFunction ? 'loaded' : 'error', {
        open2FAModal: has2FAFunction,
        twoFAManager: typeof window.twoFAManager
      });

      this.log('IndustryAuthDebugger', 'loaded', 'Modal functionality test completed');

    } catch (error) {
      this.log('IndustryAuthDebugger', 'error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  }

  async testAPIEndpoints() {
    if (!this.isEnabled) return;

    this.log('API Test', 'loading', 'Testing API endpoints');

    const testPhoneNumbers = [
      '+1 555 123 4567',
      '+44 20 7946 0958',
      '+33 1 23 45 67 89',
      '+86 138 0013 8000',
      '+91 98765 43210'
    ];

    for (const phoneNumber of testPhoneNumbers) {
      try {
        const response = await fetch('/api/v2/2fa/initiate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phoneNumber,
            method: 'sms'
          })
        });

        const result = await response.json();
        
        this.log('API Test', result.success ? 'loaded' : 'error', {
          phoneNumber,
          success: result.success,
          status: response.status,
          message: result.message || result.error
        });

      } catch (error) {
        this.log('API Test', 'error', {
          phoneNumber,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  getDebugReport(): DebugInfo[] {
    return [...this.debugLog];
  }

  exportDebugReport(): string {
    return JSON.stringify(this.debugLog, null, 2);
  }

  clearDebugLog() {
    this.debugLog = [];
  }
}

// Global debug instance
declare global {
  interface Window {
    industryAuthDebugger: IndustryAuthDebugger;
  }
}

// Initialize debugger
if (typeof window !== 'undefined') {
  window.industryAuthDebugger = new IndustryAuthDebugger();
}
