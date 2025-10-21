import { test, expect } from '@playwright/test';

test.describe('Production URL Authentication Analysis', () => {
  test.beforeEach(async ({ page }) => {
    // Capture all console output
    page.on('console', msg => {
      console.log(`[PRODUCTION] [${msg.type()}] ${msg.text()}`);
    });
    
    // Capture network requests
    page.on('request', request => {
      console.log(`[PRODUCTION] [REQUEST] ${request.method()} ${request.url()}`);
    });
    
    page.on('response', response => {
      console.log(`[PRODUCTION] [RESPONSE] ${response.status()} ${response.url()}`);
    });
  });

  test('should analyze production URL authentication system', async ({ page }) => {
    console.log('🔍 [PRODUCTION] Starting comprehensive analysis of production URL...');
    
    // Navigate to production URL
    await page.goto('https://tetrix-minimal-uzzxn.ondigitalocean.app/');
    console.log('✅ [PRODUCTION] Page loaded successfully');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    console.log('✅ [PRODUCTION] Page fully loaded');
    
    // Check if Client Login button exists
    const clientLoginBtn = page.locator('#client-login-2fa-btn');
    await expect(clientLoginBtn).toBeVisible();
    console.log('✅ [PRODUCTION] Client Login button found and visible');
    
    // Check if Industry Auth modal exists
    const industryAuthModal = page.locator('#industry-auth-modal');
    await expect(industryAuthModal).toBeAttached();
    console.log('✅ [PRODUCTION] Industry Auth modal element found');
    
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
    
    console.log('🔍 [PRODUCTION] Function availability:', functions);
    
    // Test Client Login button click
    console.log('🖱️ [PRODUCTION] Clicking Client Login button...');
    await clientLoginBtn.click();
    
    // Wait for modal to appear
    await page.waitForTimeout(2000);
    
    // Check if modal is visible
    const isModalVisible = await page.evaluate(() => {
      const modal = document.getElementById('industry-auth-modal');
      return modal && !modal.classList.contains('hidden');
    });
    
    console.log(`🔍 [PRODUCTION] Modal visible after click: ${isModalVisible}`);
    
    if (isModalVisible) {
      console.log('✅ [PRODUCTION] Industry Auth modal opened successfully');
      
      // Check modal elements
      const industrySelect = page.locator('#industry-select');
      const roleSelect = page.locator('#role-select');
      const organizationInput = page.locator('#organization-input');
      const loginBtn = page.locator('#login-btn');
      
      await expect(industrySelect).toBeVisible();
      await expect(roleSelect).toBeVisible();
      await expect(organizationInput).toBeVisible();
      await expect(loginBtn).toBeVisible();
      
      console.log('✅ [PRODUCTION] All modal elements present and visible');
      
      // Test industry selection
      await industrySelect.selectOption('healthcare');
      console.log('✅ [PRODUCTION] Healthcare industry selected');
      
      // Check if role select is enabled
      const isRoleSelectEnabled = await roleSelect.isEnabled();
      console.log(`🔍 [PRODUCTION] Role select enabled: ${isRoleSelectEnabled}`);
      
      if (isRoleSelectEnabled) {
        // Check if roles are populated
        const roleOptions = await roleSelect.locator('option').all();
        console.log(`🔍 [PRODUCTION] Role options count: ${roleOptions.length}`);
        
        if (roleOptions.length > 1) {
          console.log('✅ [PRODUCTION] Role options populated successfully');
          
          // Select a role
          await roleSelect.selectOption('doctor');
          console.log('✅ [PRODUCTION] Doctor role selected');
          
          // Fill organization
          await organizationInput.fill('Test Hospital');
          console.log('✅ [PRODUCTION] Organization filled');
        }
      }
    } else {
      console.log('❌ [PRODUCTION] Industry Auth modal did not open');
    }
    
    // Capture console logs for analysis
    const consoleLogs = await page.evaluate(() => {
      return window.consoleLogs || [];
    });
    
    console.log('📊 [PRODUCTION] Console logs captured:', consoleLogs.length);
  });

  test('should analyze script loading and timing', async ({ page }) => {
    console.log('🔍 [PRODUCTION] Analyzing script loading and timing...');
    
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
        console.log(`📜 [PRODUCTION] Script loaded: ${response.url()} (${response.status()})`);
      }
    });
    
    await page.goto('https://tetrix-minimal-uzzxn.ondigitalocean.app/');
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
      console.log(`🔍 [PRODUCTION] Function check ${i + 1}:`, functions);
      
      await page.waitForTimeout(500);
    }
    
    console.log('📊 [PRODUCTION] Script load times:', scriptLoadTimes);
    console.log('📊 [PRODUCTION] Function availability over time:', functionAvailability);
  });

  test('should test authentication flow end-to-end', async ({ page }) => {
    console.log('🔍 [PRODUCTION] Testing end-to-end authentication flow...');
    
    await page.goto('https://tetrix-minimal-uzzxn.ondigitalocean.app/');
    await page.waitForLoadState('networkidle');
    
    // Click Client Login button
    await page.locator('#client-login-2fa-btn').click();
    console.log('✅ [PRODUCTION] Client Login button clicked');
    
    // Wait for modal
    await page.waitForSelector('#industry-auth-modal:not(.hidden)', { timeout: 5000 });
    console.log('✅ [PRODUCTION] Industry Auth modal opened');
    
    // Fill form
    await page.selectOption('#industry-select', 'healthcare');
    await page.selectOption('#role-select', 'doctor');
    await page.fill('#organization-input', 'Test Hospital');
    console.log('✅ [PRODUCTION] Form filled');
    
    // Click login button
    await page.locator('#login-btn').click();
    console.log('✅ [PRODUCTION] Login button clicked');
    
    // Wait for 2FA modal
    await page.waitForTimeout(2000);
    
    // Check if 2FA modal appeared
    const twoFAModal = page.locator('#2fa-modal');
    const is2FAModalVisible = await twoFAModal.isVisible();
    console.log(`🔍 [PRODUCTION] 2FA modal visible: ${is2FAModalVisible}`);
    
    if (is2FAModalVisible) {
      console.log('✅ [PRODUCTION] 2FA modal opened successfully');
    } else {
      console.log('❌ [PRODUCTION] 2FA modal did not open');
    }
  });
});
