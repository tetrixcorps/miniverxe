import { test, expect } from '@playwright/test';

test.describe('Industry Auth Spinning Issue Debug', () => {
  test('should debug the spinning Access Dashboard button', async ({ page }) => {
    console.log('🚀 Starting industry auth spinning debug test...');
    
    // Enable console logging
    page.on('console', msg => {
      console.log(`[${msg.type()}] ${msg.text()}`);
    });

    // Enable network logging
    page.on('request', request => {
      console.log(`[REQUEST] ${request.method()} ${request.url()}`);
    });

    page.on('response', response => {
      console.log(`[RESPONSE] ${response.status()} ${response.url()}`);
    });

    // Navigate to the app
    await page.goto('/');
    console.log('✅ Loaded main page');

    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    console.log('✅ Page loaded completely');

    // Click the Client Login button
    const clientLoginBtn = page.locator('#client-login-2fa-btn');
    await expect(clientLoginBtn).toBeVisible();
    console.log('✅ Client Login button found');
    
    await clientLoginBtn.click();
    console.log('✅ Clicked Client Login button');

    // Wait for the Industry Auth modal to appear
    const industryModal = page.locator('#industry-auth-modal');
    await expect(industryModal).toBeVisible();
    console.log('✅ Industry Auth modal opened');

    // Fill in the form
    const industrySelect = page.locator('#industry-select');
    const roleSelect = page.locator('#role-select');
    const organizationInput = page.locator('#organization-input');
    const loginBtn = page.locator('#login-btn');

    await industrySelect.selectOption('healthcare');
    console.log('✅ Selected Healthcare industry');

    await roleSelect.waitFor({ state: 'visible' });
    await roleSelect.selectOption('doctor');
    console.log('✅ Selected Doctor role');

    await organizationInput.fill('Test Hospital');
    console.log('✅ Entered organization name');

    // Click the Access Dashboard button
    console.log('🖱️ Clicking Access Dashboard button...');
    await loginBtn.click();
    console.log('✅ Clicked Access Dashboard button');

    // Check if loading state appears
    const authLoading = page.locator('#auth-loading');
    await expect(authLoading).toBeVisible();
    console.log('✅ Loading state appeared');

    // Wait for 2FA modal to appear
    const twoFAModal = page.locator('[id="2fa-modal"]');
    await expect(twoFAModal).toBeVisible({ timeout: 10000 });
    console.log('✅ 2FA modal opened');

    // Fill in phone number
    const phoneInput = page.locator('#phone-number');
    await phoneInput.fill('+1234567890');
    console.log('✅ Entered phone number');

    // Click send code button
    const sendCodeBtn = page.locator('#send-code-btn');
    await sendCodeBtn.click();
    console.log('✅ Clicked send code button');

    // Wait for verification code input to appear
    const codeInput = page.locator('#verification-code');
    await expect(codeInput).toBeVisible({ timeout: 10000 });
    console.log('✅ Verification code input appeared');

    // Enter verification code
    await codeInput.fill('123456');
    console.log('✅ Entered verification code');

    // Click verify code button
    const verifyBtn = page.locator('#verify-code-btn');
    await verifyBtn.click();
    console.log('✅ Clicked verify code button');

    // Wait for the process to complete
    console.log('⏳ Waiting for authentication to complete...');
    
    // Check if the loading state disappears
    try {
      await expect(authLoading).toBeHidden({ timeout: 15000 });
      console.log('✅ Loading state disappeared - authentication completed');
    } catch (error) {
      console.log('❌ Loading state still visible after 15 seconds - this is the spinning issue!');
      
      // Take a screenshot for debugging
      await page.screenshot({ path: 'debug-spinning-issue.png' });
      console.log('📸 Screenshot saved as debug-spinning-issue.png');
      
      // Check what's happening with the 2FA modal
      const twoFAModalVisible = await twoFAModal.isVisible();
      console.log(`2FA Modal visible: ${twoFAModalVisible}`);
      
      // Check if there are any error messages
      const errorElement = page.locator('[id="2fa-error"]');
      const hasError = await errorElement.isVisible();
      if (hasError) {
        const errorText = await errorElement.textContent();
        console.log(`❌ Error message: ${errorText}`);
      }
      
      // Check if the industry modal is still visible
      const industryModalVisible = await industryModal.isVisible();
      console.log(`Industry Modal visible: ${industryModalVisible}`);
      
      // Check if the login button is still disabled
      const loginBtnDisabled = await loginBtn.isDisabled();
      console.log(`Login button disabled: ${loginBtnDisabled}`);
      
      throw new Error('Authentication process is stuck in loading state');
    }

    // If we get here, the authentication completed successfully
    console.log('🎉 Authentication completed successfully!');
  });

  test('should test 2FA modal integration directly', async ({ page }) => {
    console.log('🔍 Testing 2FA modal integration directly...');
    
    // Enable console logging
    page.on('console', msg => {
      console.log(`[${msg.type()}] ${msg.text()}`);
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Test if the 2FA modal can be opened directly
    const canOpen2FA = await page.evaluate(() => {
      return typeof window.open2FAModal === 'function';
    });
    console.log(`open2FAModal function available: ${canOpen2FA}`);

    if (canOpen2FA) {
      // Set up a handler to capture the result
      await page.evaluate(() => {
        window.handle2FAResult = (result) => {
          console.log('2FA Result received:', result);
          window.last2FAResult = result;
        };
      });

      // Open the 2FA modal
      await page.evaluate(() => {
        window.open2FAModal();
      });

      // Wait for the modal to appear
      const twoFAModal = page.locator('[id="2fa-modal"]');
      await expect(twoFAModal).toBeVisible({ timeout: 5000 });
      console.log('✅ 2FA modal opened directly');

      // Fill in phone number and code
      await page.locator('#phone-number').fill('+1234567890');
      await page.locator('#send-code-btn').click();
      
      await page.locator('#verification-code').fill('123456');
      await page.locator('#verify-code-btn').click();

      // Wait a bit and check if the handler was called
      await page.waitForTimeout(3000);
      
      const result = await page.evaluate(() => {
        return window.last2FAResult;
      });
      
      console.log('2FA Result:', result);
      
      if (result) {
        console.log('✅ 2FA modal integration working correctly');
      } else {
        console.log('❌ 2FA modal integration not working - no result received');
      }
    }
  });
});
