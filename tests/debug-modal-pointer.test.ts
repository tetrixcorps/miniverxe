import { test, expect } from '@playwright/test';

test.describe('Debug Modal Pointer Events', () => {
  test('should debug disable-pointer class application', async ({ page }) => {
    console.log('🔍 Starting disable-pointer class debug test...');
    
    // Enable comprehensive console logging
    page.on('console', msg => {
      if (msg.text().includes('🔍') || msg.text().includes('✅') || msg.text().includes('❌') || msg.text().includes('disable-pointer')) {
        console.log(`[${msg.type()}] ${msg.text()}`);
      }
    });

    // Navigate to the app
    await page.goto('https://tetrix-minimal-uzzxn.ondigitalocean.app/');
    await page.waitForLoadState('networkidle');
    console.log('✅ Page loaded');

    // Click Client Login button
    await page.locator('#client-login-2fa-btn').click();
    console.log('✅ Clicked Client Login button');

    // Wait for Industry Auth modal
    await expect(page.locator('#industry-auth-modal')).toBeVisible();
    console.log('✅ Industry Auth modal opened');

    // Fill form
    await page.locator('#industry-select').selectOption('healthcare');
    await page.locator('#role-select').selectOption('doctor');
    await page.locator('#organization-input').fill('Test Hospital');
    console.log('✅ Form filled');

    // Click Access Dashboard button
    await page.locator('#login-btn').click();
    console.log('✅ Clicked Access Dashboard button');

    // Wait for 2FA modal
    await expect(page.locator('[id="2fa-modal"]')).toBeVisible({ timeout: 10000 });
    console.log('✅ 2FA modal opened');

    // Check if Industry Auth modal has disable-pointer class
    const industryModalClasses = await page.locator('#industry-auth-modal').evaluate(el => {
      return {
        classList: Array.from(el.classList),
        hasDisablePointer: el.classList.contains('disable-pointer'),
        pointerEvents: window.getComputedStyle(el).pointerEvents,
        opacity: window.getComputedStyle(el).opacity
      };
    });
    
    console.log('🔍 Industry Auth modal state:', industryModalClasses);

    // Check if we can interact with 2FA modal
    const phoneInput = page.locator('#phone-number');
    await expect(phoneInput).toBeVisible();
    
    // Try to fill phone number
    await phoneInput.fill('+1234567890');
    console.log('✅ Phone number filled');

    // Try to click send code button
    const sendCodeBtn = page.locator('#send-code-btn');
    await expect(sendCodeBtn).toBeVisible();
    
    // Check if button is clickable
    const isClickable = await sendCodeBtn.evaluate(el => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const elementAtPoint = document.elementFromPoint(centerX, centerY);
      return elementAtPoint === el;
    });
    
    console.log('🔍 Send Code button clickable:', isClickable);

    if (isClickable) {
      await sendCodeBtn.click();
      console.log('✅ Send Code button clicked successfully');
    } else {
      console.log('❌ Send Code button not clickable - modal overlap issue persists');
    }
  });

  test('should test Telnyx API integration', async ({ page }) => {
    console.log('🧪 Testing Telnyx API integration...');
    
    // Navigate to the app
    await page.goto('https://tetrix-minimal-uzzxn.ondigitalocean.app/');
    await page.waitForLoadState('networkidle');

    // Open 2FA modal directly
    await page.evaluate(() => {
      if (typeof window.open2FAModal === 'function') {
        window.open2FAModal();
      }
    });

    // Wait for 2FA modal
    await expect(page.locator('[id="2fa-modal"]')).toBeVisible({ timeout: 10000 });

    // Fill phone number
    await page.locator('#phone-number').fill('+1234567890');
    
    // Select SMS method
    await page.locator('#verification-method').selectOption('sms');
    
    // Click send code
    await page.locator('#send-code-btn').click();
    
    // Wait for response
    await page.waitForTimeout(3000);
    
    // Check for success or error messages
    const successElement = page.locator('[id="2fa-success"], .success-message, .verification-sent').first();
    const errorElement = page.locator('[id="2fa-error"], .error-message').first();
    
    const hasSuccess = await successElement.isVisible();
    const hasError = await errorElement.isVisible();
    
    if (hasSuccess) {
      const successText = await successElement.textContent();
      console.log('✅ Telnyx API success:', successText);
    } else if (hasError) {
      const errorText = await errorElement.textContent();
      console.log('❌ Telnyx API error:', errorText);
    } else {
      console.log('ℹ️  No immediate feedback - checking for verification code input');
      
      // Check if verification code input appeared
      const codeInput = page.locator('#verification-code');
      const hasCodeInput = await codeInput.isVisible();
      
      if (hasCodeInput) {
        console.log('✅ Verification code input appeared - API call successful');
        
        // Test verification
        await codeInput.fill('123456');
        await page.locator('#verify-code-btn').click();
        
        await page.waitForTimeout(2000);
        
        // Check verification result
        const verifySuccess = await page.locator('[id="2fa-success"]').isVisible();
        const verifyError = await page.locator('[id="2fa-error"]').isVisible();
        
        if (verifySuccess) {
          console.log('✅ Verification successful');
        } else if (verifyError) {
          const verifyErrorText = await page.locator('[id="2fa-error"]').textContent();
          console.log('❌ Verification failed:', verifyErrorText);
        }
      } else {
        console.log('❌ No verification code input - API call may have failed');
      }
    }
  });
});
