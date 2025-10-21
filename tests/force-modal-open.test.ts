import { test, expect } from '@playwright/test';

test.describe('Force Modal Open Test', () => {
  test('should force Industry Auth modal to open on custom domain', async ({ page }) => {
    console.log('🌐 Testing custom domain with forced modal opening...');
    
    // Navigate to custom domain
    await page.goto('https://tetrixcorp.com');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Force the modal to open using JavaScript
    console.log('🔧 Forcing Industry Auth modal to open...');
    await page.evaluate(() => {
      // Call the global function directly
      if (window.openIndustryAuthModal) {
        window.openIndustryAuthModal();
        console.log('✅ openIndustryAuthModal called successfully');
      } else {
        console.log('❌ openIndustryAuthModal not available');
      }
    });
    
    // Wait for modal to appear
    await page.waitForTimeout(2000);
    
    // Check if modal is visible
    const industryAuthModal = page.locator('#industry-auth-modal');
    const isVisible = await industryAuthModal.isVisible();
    
    console.log(`🔍 Industry Auth modal visible after forced opening: ${isVisible}`);
    
    if (isVisible) {
      console.log('✅ Modal opened successfully! The issue is with the button click handler.');
      
      // Test the form functionality
      await page.selectOption('#industry-select', 'healthcare');
      await page.selectOption('#role-select', 'doctor');
      await page.fill('#organization-input', 'Test Hospital');
      
      console.log('✅ Form filled successfully');
      
      // Click the login button
      await page.click('#login-btn');
      console.log('✅ Login button clicked');
      
      // Wait for 2FA modal
      await page.waitForTimeout(3000);
      
      const twoFAModal = page.locator('#2fa-modal');
      const twoFAModalVisible = await twoFAModal.isVisible();
      
      console.log(`🔍 2FA modal visible: ${twoFAModalVisible}`);
      
    } else {
      console.log('❌ Modal did not open even when forced. Checking for JavaScript errors...');
      
      // Check for any error messages
      const errorMessages = await page.locator('.error, .alert-error, [class*="error"]').allTextContents();
      if (errorMessages.length > 0) {
        console.log(`❌ Error messages found: ${errorMessages.join(', ')}`);
      }
    }
    
    // Take a screenshot
    await page.screenshot({ path: 'test-results/force-modal-open.png' });
    console.log('📸 Screenshot saved to test-results/force-modal-open.png');
  });
});

