import { test, expect } from '@playwright/test';

test.describe('2FA Flow Analysis', () => {
  test('should test complete 2FA flow on production URL', async ({ page }) => {
    console.log('🔍 [2FA-FLOW] Starting comprehensive 2FA flow analysis...');
    
    // Navigate to production URL
    await page.goto('https://tetrix-minimal-uzzxn.ondigitalocean.app/');
    console.log('✅ [2FA-FLOW] Production URL loaded');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    console.log('✅ [2FA-FLOW] Page fully loaded');
    
    // Click Client Login button
    const clientLoginBtn = page.locator('#client-login-2fa-btn');
    await expect(clientLoginBtn).toBeVisible();
    console.log('✅ [2FA-FLOW] Client Login button found');
    
    await clientLoginBtn.click();
    console.log('🖱️ [2FA-FLOW] Client Login button clicked');
    
    // Wait for Industry Auth modal
    const industryModal = page.locator('#industry-auth-modal');
    await expect(industryModal).toBeVisible();
    console.log('✅ [2FA-FLOW] Industry Auth modal opened');
    
    // Fill out the form
    await page.selectOption('#industry-select', 'healthcare');
    console.log('✅ [2FA-FLOW] Healthcare industry selected');
    
    await page.waitForSelector('#role-select:not([disabled])');
    await page.selectOption('#role-select', 'doctor');
    console.log('✅ [2FA-FLOW] Doctor role selected');
    
    await page.fill('#organization-input', 'Test Hospital');
    console.log('✅ [2FA-FLOW] Organization filled');
    
    // Click Access Dashboard button
    const accessBtn = page.locator('#login-btn');
    await expect(accessBtn).toBeVisible();
    console.log('✅ [2FA-FLOW] Access Dashboard button found');
    
    // Set up console log capture for 2FA flow
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('2FA') || msg.text().includes('modal') || msg.text().includes('phone') || msg.text().includes('OTP')) {
        consoleLogs.push(msg.text());
        console.log(`🔍 [2FA-FLOW] Console: ${msg.text()}`);
      }
    });
    
    // Click Access Dashboard and monitor for 2FA modal
    console.log('🖱️ [2FA-FLOW] Clicking Access Dashboard button...');
    await accessBtn.click();
    
    // Wait for either 2FA modal or error
    try {
      // Wait for 2FA modal to appear
      const twoFAModal = page.locator('#2fa-modal');
      await expect(twoFAModal).toBeVisible({ timeout: 10000 });
      console.log('✅ [2FA-FLOW] 2FA modal opened successfully');
      
      // Check if phone input is visible
      const phoneInput = page.locator('#phone-number');
      await expect(phoneInput).toBeVisible();
      console.log('✅ [2FA-FLOW] Phone number input is visible');
      
      // Check if OTP input is visible
      const otpInput = page.locator('#otp-code');
      const otpVisible = await otpInput.isVisible();
      console.log(`🔍 [2FA-FLOW] OTP input visible: ${otpVisible}`);
      
      // Check for loading states
      const loadingElement = page.locator('#auth-loading');
      const isLoading = await loadingElement.isVisible();
      console.log(`🔍 [2FA-FLOW] Loading state visible: ${isLoading}`);
      
      // Check for error messages
      const errorElement = page.locator('#2fa-error');
      const hasError = await errorElement.isVisible();
      console.log(`🔍 [2FA-FLOW] Error message visible: ${hasError}`);
      
      if (hasError) {
        const errorText = await errorElement.textContent();
        console.log(`❌ [2FA-FLOW] Error message: ${errorText}`);
      }
      
    } catch (error) {
      console.log('❌ [2FA-FLOW] 2FA modal did not appear within timeout');
      console.log('❌ [2FA-FLOW] Error:', error);
      
      // Check what's currently visible
      const visibleModals = await page.locator('[id*="modal"]').all();
      console.log(`🔍 [2FA-FLOW] Visible modals: ${visibleModals.length}`);
      
      for (const modal of visibleModals) {
        const isVisible = await modal.isVisible();
        const modalId = await modal.getAttribute('id');
        console.log(`🔍 [2FA-FLOW] Modal ${modalId}: visible=${isVisible}`);
      }
      
      // Check for any loading states
      const loadingStates = await page.locator('[id*="loading"], [class*="loading"], [class*="spinner"]').all();
      console.log(`🔍 [2FA-FLOW] Loading states found: ${loadingStates.length}`);
      
      for (const loading of loadingStates) {
        const isVisible = await loading.isVisible();
        const loadingId = await loading.getAttribute('id');
        const loadingClass = await loading.getAttribute('class');
        console.log(`🔍 [2FA-FLOW] Loading ${loadingId}: visible=${isVisible}, class=${loadingClass}`);
      }
    }
    
    console.log(`📊 [2FA-FLOW] Console logs captured: ${consoleLogs.length}`);
    consoleLogs.forEach(log => console.log(`📝 [2FA-FLOW] Log: ${log}`));
  });
  
  test('should test complete 2FA flow on custom domain', async ({ page }) => {
    console.log('🔍 [2FA-FLOW-CUSTOM] Starting comprehensive 2FA flow analysis on custom domain...');
    
    // Navigate to custom domain
    await page.goto('https://tetrixcorp.com/');
    console.log('✅ [2FA-FLOW-CUSTOM] Custom domain loaded');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    console.log('✅ [2FA-FLOW-CUSTOM] Page fully loaded');
    
    // Click Client Login button
    const clientLoginBtn = page.locator('#client-login-2fa-btn');
    await expect(clientLoginBtn).toBeVisible();
    console.log('✅ [2FA-FLOW-CUSTOM] Client Login button found');
    
    await clientLoginBtn.click();
    console.log('🖱️ [2FA-FLOW-CUSTOM] Client Login button clicked');
    
    // Wait for Industry Auth modal
    const industryModal = page.locator('#industry-auth-modal');
    await expect(industryModal).toBeVisible();
    console.log('✅ [2FA-FLOW-CUSTOM] Industry Auth modal opened');
    
    // Fill out the form
    await page.selectOption('#industry-select', 'healthcare');
    console.log('✅ [2FA-FLOW-CUSTOM] Healthcare industry selected');
    
    await page.waitForSelector('#role-select:not([disabled])');
    await page.selectOption('#role-select', 'doctor');
    console.log('✅ [2FA-FLOW-CUSTOM] Doctor role selected');
    
    await page.fill('#organization-input', 'Test Hospital');
    console.log('✅ [2FA-FLOW-CUSTOM] Organization filled');
    
    // Click Access Dashboard button
    const accessBtn = page.locator('#login-btn');
    await expect(accessBtn).toBeVisible();
    console.log('✅ [2FA-FLOW-CUSTOM] Access Dashboard button found');
    
    // Set up console log capture for 2FA flow
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('2FA') || msg.text().includes('modal') || msg.text().includes('phone') || msg.text().includes('OTP')) {
        consoleLogs.push(msg.text());
        console.log(`🔍 [2FA-FLOW-CUSTOM] Console: ${msg.text()}`);
      }
    });
    
    // Click Access Dashboard and monitor for 2FA modal
    console.log('🖱️ [2FA-FLOW-CUSTOM] Clicking Access Dashboard button...');
    await accessBtn.click();
    
    // Wait for either 2FA modal or error
    try {
      // Wait for 2FA modal to appear
      const twoFAModal = page.locator('#2fa-modal');
      await expect(twoFAModal).toBeVisible({ timeout: 10000 });
      console.log('✅ [2FA-FLOW-CUSTOM] 2FA modal opened successfully');
      
      // Check if phone input is visible
      const phoneInput = page.locator('#phone-number');
      await expect(phoneInput).toBeVisible();
      console.log('✅ [2FA-FLOW-CUSTOM] Phone number input is visible');
      
      // Check if OTP input is visible
      const otpInput = page.locator('#otp-code');
      const otpVisible = await otpInput.isVisible();
      console.log(`🔍 [2FA-FLOW-CUSTOM] OTP input visible: ${otpVisible}`);
      
      // Check for loading states
      const loadingElement = page.locator('#auth-loading');
      const isLoading = await loadingElement.isVisible();
      console.log(`🔍 [2FA-FLOW-CUSTOM] Loading state visible: ${isLoading}`);
      
      // Check for error messages
      const errorElement = page.locator('#2fa-error');
      const hasError = await errorElement.isVisible();
      console.log(`🔍 [2FA-FLOW-CUSTOM] Error message visible: ${hasError}`);
      
      if (hasError) {
        const errorText = await errorElement.textContent();
        console.log(`❌ [2FA-FLOW-CUSTOM] Error message: ${errorText}`);
      }
      
    } catch (error) {
      console.log('❌ [2FA-FLOW-CUSTOM] 2FA modal did not appear within timeout');
      console.log('❌ [2FA-FLOW-CUSTOM] Error:', error);
      
      // Check what's currently visible
      const visibleModals = await page.locator('[id*="modal"]').all();
      console.log(`🔍 [2FA-FLOW-CUSTOM] Visible modals: ${visibleModals.length}`);
      
      for (const modal of visibleModals) {
        const isVisible = await modal.isVisible();
        const modalId = await modal.getAttribute('id');
        console.log(`🔍 [2FA-FLOW-CUSTOM] Modal ${modalId}: visible=${isVisible}`);
      }
      
      // Check for any loading states
      const loadingStates = await page.locator('[id*="loading"], [class*="loading"], [class*="spinner"]').all();
      console.log(`🔍 [2FA-FLOW-CUSTOM] Loading states found: ${loadingStates.length}`);
      
      for (const loading of loadingStates) {
        const isVisible = await loading.isVisible();
        const loadingId = await loading.getAttribute('id');
        const loadingClass = await loading.getAttribute('class');
        console.log(`🔍 [2FA-FLOW-CUSTOM] Loading ${loadingId}: visible=${isVisible}, class=${loadingClass}`);
      }
    }
    
    console.log(`📊 [2FA-FLOW-CUSTOM] Console logs captured: ${consoleLogs.length}`);
    consoleLogs.forEach(log => console.log(`📝 [2FA-FLOW-CUSTOM] Log: ${log}`));
  });
});
