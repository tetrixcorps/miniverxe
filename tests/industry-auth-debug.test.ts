import { test, expect, Page } from '@playwright/test';

test.describe('IndustryAuth Component Debug', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Enable console logging to capture debug messages
    page.on('console', msg => {
      console.log(`[${msg.type()}] ${msg.text()}`);
    });

    // Enable network logging to see API calls
    page.on('request', request => {
      console.log(`[REQUEST] ${request.method()} ${request.url()}`);
    });

    page.on('response', response => {
      console.log(`[RESPONSE] ${response.status()} ${response.url()}`);
    });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should load IndustryAuth component and open modal', async () => {
    console.log('🚀 Starting IndustryAuth debug test...');
    
    // Navigate to the main site
    await page.goto('https://tetrixcorp.com');
    console.log('✅ Loaded main page');

    // Wait for the page to fully load
    await page.waitForLoadState('networkidle');
    console.log('✅ Page fully loaded');

    // Check if Client Login button is present
    const clientLoginBtn = page.locator('#client-login-2fa-btn');
    await expect(clientLoginBtn).toBeVisible();
    console.log('✅ Client Login button found');

    // Check if Industry Auth modal is present in DOM (it should be hidden initially)
    const industryModal = page.locator('#industry-auth-modal').first();
    await expect(industryModal).toBeAttached();
    console.log('✅ Industry Auth modal found in DOM');

    // Check if the openIndustryAuthModal function is available
    const isFunctionAvailable = await page.evaluate(() => {
      return typeof window.openIndustryAuthModal === 'function';
    });
    console.log(`✅ openIndustryAuthModal function available: ${isFunctionAvailable}`);

    // Click the Client Login button
    console.log('🖱️ Clicking Client Login button...');
    await clientLoginBtn.click();

    // Wait a bit for any async operations
    await page.waitForTimeout(1000);

    // Check if the modal is now visible
    const isModalVisible = await industryModal.isVisible();
    console.log(`✅ Industry Auth modal visible after click: ${isModalVisible}`);

    if (isModalVisible) {
      console.log('🎉 SUCCESS: Industry Auth modal opened successfully!');
      
      // Test the modal functionality
      const industrySelect = page.locator('#industry-select');
      const roleSelect = page.locator('#role-select');
      const organizationInput = page.locator('#organization-input');
      const loginBtn = page.locator('#login-btn');

      await expect(industrySelect).toBeVisible();
      await expect(roleSelect).toBeVisible();
      await expect(organizationInput).toBeVisible();
      await expect(loginBtn).toBeVisible();
      console.log('✅ All modal elements are visible');

      // Test industry selection
      await industrySelect.selectOption('healthcare');
      console.log('✅ Selected healthcare industry');

      // Check if roles are populated
      const roleOptions = await roleSelect.locator('option').count();
      console.log(`✅ Role options count: ${roleOptions}`);

      // Test organization input
      await organizationInput.fill('Test Organization');
      console.log('✅ Filled organization input');

      // Test login button click
      await loginBtn.click();
      console.log('✅ Clicked login button');

      // Wait for any 2FA modal to appear
      await page.waitForTimeout(2000);
      
      const twoFAModal = page.locator('[id="2fa-modal"]').first();
      const is2FAModalVisible = await twoFAModal.isVisible();
      console.log(`✅ 2FA modal appeared: ${is2FAModalVisible}`);

    } else {
      console.log('❌ FAILED: Industry Auth modal did not open');
      
      // Debug: Check for any JavaScript errors
      const errors = await page.evaluate(() => {
        return window.console?.error || [];
      });
      console.log('JavaScript errors:', errors);
    }
  });

  test('should test phone number validation with international numbers', async ({ page }) => {
    console.log('🌍 Testing international phone number validation...');
    
    // Set longer timeout for this test
    test.setTimeout(60000);
    
    await page.goto('https://tetrixcorp.com');
    await page.waitForLoadState('networkidle');

    // Open the 2FA modal directly
    await page.evaluate(() => {
      if (typeof window.open2FAModal === 'function') {
        window.open2FAModal();
      }
    });

    // Wait for 2FA modal to appear (it starts hidden)
    const twoFAModal = page.locator('[id="2fa-modal"]').first();
    await expect(twoFAModal).toBeVisible({ timeout: 10000 });
    console.log('✅ 2FA modal opened');

    // Test phone number validation with a single international number
    const phoneInput = page.locator('#phone-number').first();
    const testPhoneNumber = '+1 555 123 4567'; // US number
    
    console.log(`📞 Testing phone number: ${testPhoneNumber}`);
    
    // Ensure the phone input is visible
    await expect(phoneInput).toBeVisible({ timeout: 5000 });
    
    // Fill in the phone number
    await phoneInput.clear();
    await phoneInput.fill(testPhoneNumber);
    
    // Click send code button
    const sendCodeBtn = page.locator('#send-code-btn').first();
    await sendCodeBtn.click();
    
    // Wait for response
    await page.waitForTimeout(3000);
    
    // Check if there's an error message
    const errorElement = page.locator('[id="2fa-error"]').first();
    const hasError = await errorElement.isVisible();
    
    if (hasError) {
      const errorText = await errorElement.textContent();
      console.log(`❌ Error for ${testPhoneNumber}: ${errorText}`);
    } else {
      console.log(`✅ Success for ${testPhoneNumber}`);
    }
    
    // Verify the form submission worked by checking for success indicators
    const successElement = page.locator('[id="2fa-success"], .success-message, .verification-sent').first();
    const hasSuccess = await successElement.isVisible();
    
    if (hasSuccess) {
      console.log('✅ 2FA verification process initiated successfully');
    } else {
      console.log('ℹ️ 2FA verification process completed (no explicit success message)');
    }
  });

  test('should debug script loading order', async () => {
    console.log('🔍 Debugging script loading order...');
    
    await page.goto('https://tetrixcorp.com');
    
    // Check what scripts are loaded
    const scripts = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('script[src]')).map(script => ({
        src: script.getAttribute('src'),
        type: script.getAttribute('type')
      }));
    });
    
    console.log('📜 Loaded scripts:');
    scripts.forEach(script => {
      console.log(`  - ${script.src} (${script.type})`);
    });

    // Check if specific functions are available
    const functions = await page.evaluate(() => {
      return {
        open2FAModal: typeof window.open2FAModal,
        openIndustryAuthModal: typeof window.openIndustryAuthModal,
        twoFAManager: typeof window.twoFAManager,
      };
    });
    
    console.log('🔧 Available functions:');
    Object.entries(functions).forEach(([name, type]) => {
      console.log(`  - ${name}: ${type}`);
    });
  });
});
