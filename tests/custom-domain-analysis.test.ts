import { test, expect } from '@playwright/test';

test.describe('Custom Domain Authentication Analysis', () => {
  test.beforeEach(async ({ page }) => {
    // Capture all console output
    page.on('console', msg => {
      console.log(`[CUSTOM] [${msg.type()}] ${msg.text()}`);
    });
    
    // Capture network requests
    page.on('request', request => {
      console.log(`[CUSTOM] [REQUEST] ${request.method()} ${request.url()}`);
    });
    
    page.on('response', response => {
      console.log(`[CUSTOM] [RESPONSE] ${response.status()} ${response.url()}`);
    });
  });

  test('should analyze custom domain authentication system', async ({ page }) => {
    console.log('🔍 [CUSTOM] Starting comprehensive analysis of custom domain...');
    
    // Navigate to custom domain
    await page.goto('https://tetrixcorp.com/');
    console.log('✅ [CUSTOM] Page loaded successfully');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    console.log('✅ [CUSTOM] Page fully loaded');
    
    // Check if Client Login button exists
    const clientLoginBtn = page.locator('#client-login-2fa-btn');
    await expect(clientLoginBtn).toBeVisible();
    console.log('✅ [CUSTOM] Client Login button found and visible');
    
    // Check if Industry Auth modal exists
    const industryAuthModal = page.locator('#industry-auth-modal');
    await expect(industryAuthModal).toBeAttached();
    console.log('✅ [CUSTOM] Industry Auth modal element found');
    
    // Test function availability
    const functions = await page.evaluate(() => {
      return {
        openIndustryAuthModal: typeof window.openIndustryAuthModal,
        open2FAModal: typeof window.open2FAModal,
        openClientLogin: typeof window.openClientLogin,
        tetrixAuthContext: typeof window.tetrixAuthContext,
        dashboardRoutingService: typeof window.dashboardRoutingService
      };
    });
    
    console.log('🔍 [CUSTOM] Function availability:', functions);
    
    // Test Client Login button click
    console.log('🖱️ [CUSTOM] Clicking Client Login button...');
    await clientLoginBtn.click();
    
    // Wait for modal to appear
    await page.waitForTimeout(2000);
    
    // Check if modal is visible
    const isModalVisible = await page.evaluate(() => {
      const modal = document.getElementById('industry-auth-modal');
      return modal && !modal.classList.contains('hidden');
    });
    
    console.log(`🔍 [CUSTOM] Modal visible after click: ${isModalVisible}`);
    
    if (isModalVisible) {
      console.log('✅ [CUSTOM] Industry Auth modal opened successfully');
      
      // Check modal elements
      const industrySelect = page.locator('#industry-select');
      const roleSelect = page.locator('#role-select');
      const organizationInput = page.locator('#organization-input');
      const loginBtn = page.locator('#login-btn');
      
      await expect(industrySelect).toBeVisible();
      await expect(roleSelect).toBeVisible();
      await expect(organizationInput).toBeVisible();
      await expect(loginBtn).toBeVisible();
      
      console.log('✅ [CUSTOM] All modal elements present and visible');
    } else {
      console.log('❌ [CUSTOM] Industry Auth modal did not open');
      
      // Check for error messages
      const errorMessages = await page.evaluate(() => {
        const alerts = [];
        // Check for any alert messages
        const alertElements = document.querySelectorAll('[class*="error"], [class*="alert"]');
        alertElements.forEach(el => {
          if (el.textContent && el.textContent.includes('Authentication service')) {
            alerts.push(el.textContent);
          }
        });
        return alerts;
      });
      
      console.log('🔍 [CUSTOM] Error messages found:', errorMessages);
    }
    
    // Capture console logs for analysis
    const consoleLogs = await page.evaluate(() => {
      return window.consoleLogs || [];
    });
    
    console.log('📊 [CUSTOM] Console logs captured:', consoleLogs.length);
  });

  test('should analyze script loading and timing on custom domain', async ({ page }) => {
    console.log('🔍 [CUSTOM] Analyzing script loading and timing...');
    
    const scriptLoadTimes = [];
    const functionAvailability = [];
    
    // Monitor script loading
    page.on('response', async response => {
      if (response.url().includes('.js')) {
        const loadTime = Date.now();
        scriptLoadTimes.push({
          url: response.url(),
          status: response.status(),
          loadTime
        });
        console.log(`📜 [CUSTOM] Script loaded: ${response.url()} (${response.status()})`);
      }
    });
    
    await page.goto('https://tetrixcorp.com/');
    await page.waitForLoadState('networkidle');
    
    // Check function availability over time
    for (let i = 0; i < 10; i++) {
      const functions = await page.evaluate(() => {
        return {
          openIndustryAuthModal: typeof window.openIndustryAuthModal,
          open2FAModal: typeof window.open2FAModal,
          openClientLogin: typeof window.openClientLogin,
          timestamp: Date.now()
        };
      });
      
      functionAvailability.push(functions);
      console.log(`🔍 [CUSTOM] Function check ${i + 1}:`, functions);
      
      await page.waitForTimeout(500);
    }
    
    console.log('📊 [CUSTOM] Script load times:', scriptLoadTimes);
    console.log('📊 [CUSTOM] Function availability over time:', functionAvailability);
  });

  test('should test authentication flow end-to-end on custom domain', async ({ page }) => {
    console.log('🔍 [CUSTOM] Testing end-to-end authentication flow...');
    
    await page.goto('https://tetrixcorp.com/');
    await page.waitForLoadState('networkidle');
    
    // Click Client Login button
    await page.locator('#client-login-2fa-btn').click();
    console.log('✅ [CUSTOM] Client Login button clicked');
    
    // Wait for modal with timeout
    try {
      await page.waitForSelector('#industry-auth-modal:not(.hidden)', { timeout: 5000 });
      console.log('✅ [CUSTOM] Industry Auth modal opened');
      
      // Fill form
      await page.selectOption('#industry-select', 'healthcare');
      await page.selectOption('#role-select', 'doctor');
      await page.fill('#organization-input', 'Test Hospital');
      console.log('✅ [CUSTOM] Form filled');
      
      // Click login button
      await page.locator('#login-btn').click();
      console.log('✅ [CUSTOM] Login button clicked');
      
      // Wait for 2FA modal
      await page.waitForTimeout(2000);
      
      // Check if 2FA modal appeared
      const twoFAModal = page.locator('#2fa-modal');
      const is2FAModalVisible = await twoFAModal.isVisible();
      console.log(`🔍 [CUSTOM] 2FA modal visible: ${is2FAModalVisible}`);
      
      if (is2FAModalVisible) {
        console.log('✅ [CUSTOM] 2FA modal opened successfully');
      } else {
        console.log('❌ [CUSTOM] 2FA modal did not open');
      }
    } catch (error) {
      console.log('❌ [CUSTOM] Authentication flow failed:', error.message);
      
      // Check for error messages
      const errorMessages = await page.evaluate(() => {
        const alerts = [];
        const alertElements = document.querySelectorAll('[class*="error"], [class*="alert"]');
        alertElements.forEach(el => {
          if (el.textContent && el.textContent.includes('Authentication service')) {
            alerts.push(el.textContent);
          }
        });
        return alerts;
      });
      
      console.log('🔍 [CUSTOM] Error messages found:', errorMessages);
    }
  });
});
