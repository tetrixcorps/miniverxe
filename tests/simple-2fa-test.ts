import { test, expect } from '@playwright/test';

test('should test 2FA flow on production URL', async ({ page }) => {
  console.log('🔍 [SIMPLE-2FA] Testing 2FA flow on production URL...');
  
  // Navigate to production URL
  await page.goto('https://tetrix-minimal-uzzxn.ondigitalocean.app/');
  console.log('✅ [SIMPLE-2FA] Production URL loaded');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  console.log('✅ [SIMPLE-2FA] Page fully loaded');
  
  // Click Client Login button
  const clientLoginBtn = page.locator('#client-login-2fa-btn');
  await expect(clientLoginBtn).toBeVisible();
  console.log('✅ [SIMPLE-2FA] Client Login button found');
  
  await clientLoginBtn.click();
  console.log('🖱️ [SIMPLE-2FA] Client Login button clicked');
  
  // Wait for Industry Auth modal
  const industryModal = page.locator('#industry-auth-modal');
  await expect(industryModal).toBeVisible();
  console.log('✅ [SIMPLE-2FA] Industry Auth modal opened');
  
  // Fill out the form
  await page.selectOption('#industry-select', 'healthcare');
  console.log('✅ [SIMPLE-2FA] Healthcare industry selected');
  
  await page.waitForSelector('#role-select:not([disabled])');
  await page.selectOption('#role-select', 'doctor');
  console.log('✅ [SIMPLE-2FA] Doctor role selected');
  
  await page.fill('#organization-input', 'Test Hospital');
  console.log('✅ [SIMPLE-2FA] Organization filled');
  
  // Click Access Dashboard button
  const accessBtn = page.locator('#login-btn');
  await expect(accessBtn).toBeVisible();
  console.log('✅ [SIMPLE-2FA] Access Dashboard button found');
  
  // Set up console log capture
  const consoleLogs: string[] = [];
  page.on('console', msg => {
    consoleLogs.push(msg.text());
    console.log(`🔍 [SIMPLE-2FA] Console: ${msg.text()}`);
  });
  
  // Click Access Dashboard and monitor for 2FA modal
  console.log('🖱️ [SIMPLE-2FA] Clicking Access Dashboard button...');
  await accessBtn.click();
  
  // Wait a bit to see what happens
  await page.waitForTimeout(5000);
  
  // Check what's visible
  const twoFAModal = page.locator('#2fa-modal');
  const is2FAModalVisible = await twoFAModal.isVisible();
  console.log(`🔍 [SIMPLE-2FA] 2FA modal visible: ${is2FAModalVisible}`);
  
  const loadingElement = page.locator('#auth-loading');
  const isLoadingVisible = await loadingElement.isVisible();
  console.log(`🔍 [SIMPLE-2FA] Loading element visible: ${isLoadingVisible}`);
  
  const errorElement = page.locator('#2fa-error');
  const isErrorVisible = await errorElement.isVisible();
  console.log(`🔍 [SIMPLE-2FA] Error element visible: ${isErrorVisible}`);
  
  if (isErrorVisible) {
    const errorText = await errorElement.textContent();
    console.log(`❌ [SIMPLE-2FA] Error message: ${errorText}`);
  }
  
  console.log(`📊 [SIMPLE-2FA] Console logs captured: ${consoleLogs.length}`);
  consoleLogs.forEach(log => console.log(`📝 [SIMPLE-2FA] Log: ${log}`));
});

test('should test 2FA flow on custom domain', async ({ page }) => {
  console.log('🔍 [SIMPLE-2FA-CUSTOM] Testing 2FA flow on custom domain...');
  
  // Navigate to custom domain
  await page.goto('https://tetrixcorp.com/');
  console.log('✅ [SIMPLE-2FA-CUSTOM] Custom domain loaded');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  console.log('✅ [SIMPLE-2FA-CUSTOM] Page fully loaded');
  
  // Click Client Login button
  const clientLoginBtn = page.locator('#client-login-2fa-btn');
  await expect(clientLoginBtn).toBeVisible();
  console.log('✅ [SIMPLE-2FA-CUSTOM] Client Login button found');
  
  await clientLoginBtn.click();
  console.log('🖱️ [SIMPLE-2FA-CUSTOM] Client Login button clicked');
  
  // Wait for Industry Auth modal
  const industryModal = page.locator('#industry-auth-modal');
  await expect(industryModal).toBeVisible();
  console.log('✅ [SIMPLE-2FA-CUSTOM] Industry Auth modal opened');
  
  // Fill out the form
  await page.selectOption('#industry-select', 'healthcare');
  console.log('✅ [SIMPLE-2FA-CUSTOM] Healthcare industry selected');
  
  await page.waitForSelector('#role-select:not([disabled])');
  await page.selectOption('#role-select', 'doctor');
  console.log('✅ [SIMPLE-2FA-CUSTOM] Doctor role selected');
  
  await page.fill('#organization-input', 'Test Hospital');
  console.log('✅ [SIMPLE-2FA-CUSTOM] Organization filled');
  
  // Click Access Dashboard button
  const accessBtn = page.locator('#login-btn');
  await expect(accessBtn).toBeVisible();
  console.log('✅ [SIMPLE-2FA-CUSTOM] Access Dashboard button found');
  
  // Set up console log capture
  const consoleLogs: string[] = [];
  page.on('console', msg => {
    consoleLogs.push(msg.text());
    console.log(`🔍 [SIMPLE-2FA-CUSTOM] Console: ${msg.text()}`);
  });
  
  // Click Access Dashboard and monitor for 2FA modal
  console.log('🖱️ [SIMPLE-2FA-CUSTOM] Clicking Access Dashboard button...');
  await accessBtn.click();
  
  // Wait a bit to see what happens
  await page.waitForTimeout(5000);
  
  // Check what's visible
  const twoFAModal = page.locator('#2fa-modal');
  const is2FAModalVisible = await twoFAModal.isVisible();
  console.log(`🔍 [SIMPLE-2FA-CUSTOM] 2FA modal visible: ${is2FAModalVisible}`);
  
  const loadingElement = page.locator('#auth-loading');
  const isLoadingVisible = await loadingElement.isVisible();
  console.log(`🔍 [SIMPLE-2FA-CUSTOM] Loading element visible: ${isLoadingVisible}`);
  
  const errorElement = page.locator('#2fa-error');
  const isErrorVisible = await errorElement.isVisible();
  console.log(`🔍 [SIMPLE-2FA-CUSTOM] Error element visible: ${isErrorVisible}`);
  
  if (isErrorVisible) {
    const errorText = await errorElement.textContent();
    console.log(`❌ [SIMPLE-2FA-CUSTOM] Error message: ${errorText}`);
  }
  
  console.log(`📊 [SIMPLE-2FA-CUSTOM] Console logs captured: ${consoleLogs.length}`);
  consoleLogs.forEach(log => console.log(`📝 [SIMPLE-2FA-CUSTOM] Log: ${log}`));
});
