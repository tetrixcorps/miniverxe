import { test, expect } from '@playwright/test';

test.describe('Custom Domain Debug Test', () => {
  test('should debug Client Login button on custom domain', async ({ page }) => {
    console.log('🌐 Testing custom domain: https://tetrixcorp.com');
    
    // Capture console logs and errors
    const consoleLogs: string[] = [];
    const consoleErrors: string[] = [];
    
    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error') {
        consoleErrors.push(text);
        console.log(`❌ Console Error: ${text}`);
      } else {
        consoleLogs.push(text);
        console.log(`📝 Console Log: ${text}`);
      }
    });
    
    page.on('pageerror', error => {
      consoleErrors.push(error.message);
      console.log(`💥 Page Error: ${error.message}`);
    });
    
    // Navigate to custom domain
    await page.goto('https://tetrixcorp.com');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    console.log('📊 Page loaded, checking for Client Login button...');
    
    // Look for Client Login button
    const clientLoginButton = page.locator('#client-login-2fa-btn').first();
    await expect(clientLoginButton).toBeVisible();
    
    console.log('✅ Client Login button found on custom domain');
    
    // Check if the button has click handlers
    const hasClickHandler = await clientLoginButton.evaluate(el => {
      const events = (el as any)._events || {};
      return Object.keys(events).length > 0;
    });
    
    console.log(`🔍 Button has click handlers: ${hasClickHandler}`);
    
    // Check if Industry Auth modal exists in DOM
    const industryAuthModal = page.locator('[data-testid="industry-auth-modal"], .modal:has-text("Select Your Industry")');
    const modalExists = await industryAuthModal.count() > 0;
    console.log(`🔍 Industry Auth modal exists in DOM: ${modalExists}`);
    
    // Check if 2FA modal exists in DOM
    const twoFAModal = page.locator('[data-testid="2fa-modal"], .modal:has-text("Enter Verification Code")');
    const twoFAModalExists = await twoFAModal.count() > 0;
    console.log(`🔍 2FA modal exists in DOM: ${twoFAModalExists}`);
    
    // Click the Client Login button
    console.log('🖱️ Clicking Client Login button...');
    await clientLoginButton.click();
    console.log('✅ Client Login button clicked');
    
    // Wait for any potential modals
    await page.waitForTimeout(3000);
    
    // Check if any modals appeared
    const modalsAfterClick = await page.locator('.modal, [role="dialog"]').count();
    console.log(`🔍 Number of modals after click: ${modalsAfterClick}`);
    
    // Check for Industry Auth modal again
    const industryAuthVisible = await industryAuthModal.isVisible();
    console.log(`🔍 Industry Auth modal visible after click: ${industryAuthVisible}`);
    
    // Check for 2FA modal
    const twoFAModalVisible = await twoFAModal.isVisible();
    console.log(`🔍 2FA modal visible after click: ${twoFAModalVisible}`);
    
    // Check for any error messages
    const errorMessages = await page.locator('.error, .alert-error, [class*="error"]').allTextContents();
    if (errorMessages.length > 0) {
      console.log(`❌ Error messages found: ${errorMessages.join(', ')}`);
    }
    
    // Check for "Authentication service is temporarily unavailable" message
    const authUnavailableMessage = await page.locator('text="Authentication service is temporarily unavailable"').count();
    console.log(`🔍 "Authentication service is temporarily unavailable" message count: ${authUnavailableMessage}`);
    
    // Print all console errors
    if (consoleErrors.length > 0) {
      console.log('📋 All console errors:');
      consoleErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }
    
    // Print all console logs
    if (consoleLogs.length > 0) {
      console.log('📋 All console logs:');
      consoleLogs.forEach((log, index) => {
        console.log(`  ${index + 1}. ${log}`);
      });
    }
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/custom-domain-debug.png' });
    console.log('📸 Screenshot saved to test-results/custom-domain-debug.png');
  });
});

