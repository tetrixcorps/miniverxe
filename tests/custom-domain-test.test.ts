import { test, expect } from '@playwright/test';

test.describe('Custom Domain Authentication Test', () => {
  test('should test Client Login button on custom domain', async ({ page }) => {
    console.log('🌐 Testing custom domain: https://tetrixcorp.com');
    
    // Navigate to custom domain
    await page.goto('https://tetrixcorp.com');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Look for Client Login button (try desktop first, then mobile)
    const clientLoginButton = page.locator('#client-login-2fa-btn').first();
    await expect(clientLoginButton).toBeVisible();
    
    console.log('✅ Client Login button found on custom domain');
    
    // Click the Client Login button
    await clientLoginButton.click();
    console.log('✅ Client Login button clicked');
    
    // Wait for modal to appear
    await page.waitForTimeout(2000);
    
    // Check if Industry Auth modal appears
    const industryAuthModal = page.locator('[data-testid="industry-auth-modal"], .modal:has-text("Select Your Industry")');
    
    if (await industryAuthModal.isVisible()) {
      console.log('✅ Industry Auth modal appeared on custom domain');
      
      // Fill in the form
      await page.selectOption('select[name="industry"]', 'healthcare');
      await page.selectOption('select[name="role"]', 'doctor');
      await page.fill('input[name="organization"]', 'Test Hospital');
      
      console.log('✅ Industry Auth form filled');
      
      // Click Access Dashboard
      const accessDashboardButton = page.locator('button:has-text("Access Dashboard")');
      await accessDashboardButton.click();
      console.log('✅ Access Dashboard button clicked');
      
      // Wait for 2FA modal
      await page.waitForTimeout(2000);
      
      // Check if 2FA modal appears
      const twoFAModal = page.locator('[data-testid="2fa-modal"], .modal:has-text("Enter Verification Code")');
      
      if (await twoFAModal.isVisible()) {
        console.log('✅ 2FA modal appeared on custom domain');
        
        // Fill phone number
        await page.fill('input[name="phoneNumber"]', '+15042749808');
        console.log('✅ Phone number filled');
        
        // Click Send Code
        const sendCodeButton = page.locator('button:has-text("Send Code")');
        await sendCodeButton.click();
        console.log('✅ Send Code button clicked');
        
        // Wait for verification code input
        await page.waitForTimeout(2000);
        
        const verificationInput = page.locator('input[name="verificationCode"]');
        if (await verificationInput.isVisible()) {
          console.log('✅ Verification code input appeared');
          
          // Fill verification code
          await verificationInput.fill('123456');
          console.log('✅ Verification code filled');
          
          // Click Verify Code
          const verifyCodeButton = page.locator('button:has-text("Verify Code")');
          await verifyCodeButton.click();
          console.log('✅ Verify Code button clicked');
          
          // Wait for redirect
          await page.waitForTimeout(3000);
          
          // Check if redirected to dashboard
          const currentUrl = page.url();
          console.log(`📍 Current URL after verification: ${currentUrl}`);
          
          if (currentUrl.includes('/dashboards/')) {
            console.log('✅ Successfully redirected to dashboard');
          } else {
            console.log('❌ Did not redirect to dashboard');
          }
        } else {
          console.log('❌ Verification code input did not appear');
        }
      } else {
        console.log('❌ 2FA modal did not appear on custom domain');
      }
    } else {
      console.log('❌ Industry Auth modal did not appear on custom domain');
    }
  });
});
