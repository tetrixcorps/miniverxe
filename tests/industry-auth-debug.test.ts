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

    // Check if Industry Auth modal is present in DOM
    const industryModal = page.locator('#industry-auth-modal');
    await expect(industryModal).toBeInViewport();
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
      
      const twoFAModal = page.locator('#2fa-modal');
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

  test('should test phone number validation with international numbers', async () => {
    console.log('🌍 Testing international phone number validation...');
    
    await page.goto('https://tetrixcorp.com');
    await page.waitForLoadState('networkidle');

    // Open the 2FA modal directly
    await page.evaluate(() => {
      if (typeof window.open2FAModal === 'function') {
        window.open2FAModal();
      }
    });

    // Wait for 2FA modal to appear
    const twoFAModal = page.locator('#2fa-modal');
    await expect(twoFAModal).toBeVisible();
    console.log('✅ 2FA modal opened');

    // Test various international phone numbers
    const phoneInput = page.locator('#phone-number');
    const testNumbers = [
      '+1 555 123 4567',  // US
      '+44 20 7946 0958', // UK
      '+33 1 23 45 67 89', // France
      '+86 138 0013 8000', // China
      '+91 98765 43210',   // India
    ];

    for (const phoneNumber of testNumbers) {
      console.log(`📞 Testing phone number: ${phoneNumber}`);
      
      await phoneInput.clear();
      await phoneInput.fill(phoneNumber);
      
      // Click send code button
      const sendCodeBtn = page.locator('#send-code-btn');
      await sendCodeBtn.click();
      
      // Wait for response
      await page.waitForTimeout(2000);
      
      // Check if there's an error message
      const errorElement = page.locator('#2fa-error');
      const hasError = await errorElement.isVisible();
      
      if (hasError) {
        const errorText = await errorElement.textContent();
        console.log(`❌ Error for ${phoneNumber}: ${errorText}`);
      } else {
        console.log(`✅ Success for ${phoneNumber}`);
      }
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
