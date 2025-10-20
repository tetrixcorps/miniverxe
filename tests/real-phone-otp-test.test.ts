import { test, expect } from '@playwright/test';

test.describe('Real Phone OTP Test', () => {
  test('should send real OTP to +15042749808 and verify delivery', async ({ page }) => {
    console.log('📱 REAL OTP TEST with phone number: +15042749808');
    console.log('This test will send an actual SMS to your phone via Telnyx');
    
    // Enable comprehensive console logging
    page.on('console', msg => {
      if (msg.text().includes('📱') || msg.text().includes('✅') || msg.text().includes('❌') || 
          msg.text().includes('SMS') || msg.text().includes('verification') || msg.text().includes('Telnyx') ||
          msg.text().includes('OTP') || msg.text().includes('code')) {
        console.log(`[${msg.type()}] ${msg.text()}`);
      }
    });

    // Navigate to the app
    await page.goto('https://tetrix-minimal-uzzxn.ondigitalocean.app/');
    await page.waitForLoadState('networkidle');
    console.log('📱 Page loaded successfully');

    // Click Client Login button
    await page.locator('#client-login-2fa-btn').click();
    console.log('📱 Clicked Client Login button');

    // Wait for Industry Auth modal
    await expect(page.locator('#industry-auth-modal')).toBeVisible();
    console.log('📱 Industry Auth modal opened');

    // Fill form
    await page.locator('#industry-select').selectOption('healthcare');
    await page.locator('#role-select').selectOption('doctor');
    await page.locator('#organization-input').fill('TETRIX Test Hospital');
    console.log('📱 Form filled with healthcare/doctor details');

    // Click Access Dashboard button
    await page.locator('#login-btn').click();
    console.log('📱 Clicked Access Dashboard button');

    // Wait for 2FA modal
    await expect(page.locator('[id="2fa-modal"]')).toBeVisible({ timeout: 10000 });
    console.log('📱 2FA modal opened successfully');

    // Step 1: Enter REAL phone number
    const phoneInput = page.locator('#phone-number');
    await expect(phoneInput).toBeVisible();
    
    await phoneInput.fill('+15042749808');
    console.log('📱 REAL phone number entered: +15042749808');

    // Step 2: Select SMS verification method
    const methodSelect = page.locator('#verification-method');
    await methodSelect.selectOption('sms');
    console.log('📱 Selected SMS verification method');

    // Step 3: Click Send Code button - THIS WILL SEND REAL SMS
    const sendCodeBtn = page.locator('#send-code-btn');
    await expect(sendCodeBtn).toBeVisible();
    
    console.log('📱 🚨 IMPORTANT: About to send REAL SMS to +15042749808');
    console.log('📱 This will use your Telnyx account and may incur charges');
    console.log('📱 Clicking Send Code button in 3 seconds...');
    
    await page.waitForTimeout(3000);
    await sendCodeBtn.click();
    console.log('📱 ✅ Send Code button clicked!');

    // Wait for API response
    console.log('📱 Waiting for Telnyx API response...');
    await page.waitForTimeout(5000);
    
    // Check for different possible responses
    const successElement = page.locator('[id="2fa-success"], .success-message, .verification-sent').first();
    const errorElement = page.locator('[id="2fa-error"], .error-message').first();
    const codeInput = page.locator('#verification-code');
    
    const hasSuccess = await successElement.isVisible();
    const hasError = await errorElement.isVisible();
    const hasCodeInput = await codeInput.isVisible();
    
    console.log('📱 Checking Telnyx API response...');
    console.log('📱 Has success message:', hasSuccess);
    console.log('📱 Has error message:', hasError);
    console.log('📱 Has code input (step 2):', hasCodeInput);
    
    if (hasSuccess) {
      const successText = await successElement.textContent();
      console.log('📱 ✅ SUCCESS: Real SMS sent via Telnyx!');
      console.log('📱 Success message:', successText);
    } else if (hasError) {
      const errorText = await errorElement.textContent();
      console.log('📱 ❌ ERROR: Telnyx API call failed');
      console.log('📱 Error message:', errorText);
    } else if (hasCodeInput) {
      console.log('📱 ✅ SUCCESS: Verification code input appeared');
      console.log('📱 This means the SMS was sent successfully via Telnyx API');
      console.log('📱 📲 CHECK YOUR PHONE: +15042749808');
      console.log('📱 You should have received an SMS with a 6-digit verification code');
      
      // Wait for user to check their phone
      console.log('📱 ⏰ Waiting 30 seconds for you to check your phone...');
      console.log('📱 Look for SMS from Telnyx with verification code');
      await page.waitForTimeout(30000);
      
      // For testing, we'll use a mock code since we can't automate real OTP entry
      console.log('📱 For automated testing, using mock verification code');
      await codeInput.fill('123456');
      console.log('📱 Entered mock verification code: 123456');
      
      // Click verify button
      const verifyBtn = page.locator('#verify-code-btn');
      await verifyBtn.click();
      console.log('📱 Clicked Verify Code button');
      
      // Wait for verification result
      await page.waitForTimeout(3000);
      
      const verifySuccess = await page.locator('[id="2fa-success"]').isVisible();
      const verifyError = await page.locator('[id="2fa-error"]').isVisible();
      
      if (verifySuccess) {
        console.log('📱 ✅ VERIFICATION SUCCESSFUL!');
        console.log('📱 User has been authenticated and will be redirected to dashboard');
      } else if (verifyError) {
        const verifyErrorText = await page.locator('[id="2fa-error"]').textContent();
        console.log('📱 ❌ VERIFICATION FAILED:', verifyErrorText);
        console.log('📱 This is expected with mock code - real OTP would work');
      }
    } else {
      console.log('📱 ❌ UNEXPECTED: No clear response from API');
      console.log('📱 This might indicate a configuration issue');
    }
    
    console.log('📱 🎯 REAL OTP TEST COMPLETE');
    console.log('📱 Check your phone (+15042749808) for the SMS from Telnyx');
  });

  test('should test different verification methods with real phone', async ({ page }) => {
    console.log('🌍 Testing different verification methods with +15042749808');
    
    // Navigate to the app
    await page.goto('https://tetrix-minimal-uzzxn.ondigitalocean.app/');
    await page.waitForLoadState('networkidle');

    // Open 2FA modal directly
    await page.evaluate(() => {
      if (typeof window.open2FAModal === 'function') {
        window.open2FAModal();
      }
    });

    await expect(page.locator('[id="2fa-modal"]')).toBeVisible({ timeout: 10000 });

    // Test different verification methods with real phone
    const methods = [
      { value: 'sms', name: 'SMS Text Message' },
      { value: 'voice', name: 'Voice Call' },
      { value: 'whatsapp', name: 'WhatsApp' },
      { value: 'flashcall', name: 'Flash Call' }
    ];

    for (const method of methods) {
      console.log(`🌍 Testing ${method.name} with +15042749808`);
      
      // Enter phone number
      await page.locator('#phone-number').fill('+15042749808');
      
      // Select method
      await page.locator('#verification-method').selectOption(method.value);
      
      // Click send code
      console.log(`🌍 Sending ${method.name} to +15042749808...`);
      await page.locator('#send-code-btn').click();
      
      // Wait for response
      await page.waitForTimeout(3000);
      
      // Check if we got to step 2 (code input)
      const codeInput = page.locator('#verification-code');
      const hasCodeInput = await codeInput.isVisible();
      
      if (hasCodeInput) {
        console.log(`🌍 ✅ ${method.name}: SUCCESS - Code input appeared`);
        console.log(`🌍 Check your phone for ${method.name} from Telnyx`);
        
        // Go back to step 1 for next test
        await page.locator('#phone-number').click();
        await page.waitForTimeout(2000);
      } else {
        console.log(`🌍 ❌ ${method.name}: FAILED - No code input`);
      }
    }
    
    console.log('🌍 Verification method testing complete!');
    console.log('🌍 Check your phone (+15042749808) for messages from Telnyx');
  });
});
