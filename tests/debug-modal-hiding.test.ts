import { test, expect } from '@playwright/test';

test.describe('Debug Modal Hiding', () => {
  test('should debug modal hiding behavior', async ({ page }) => {
    console.log('🔍 Starting modal hiding debug test...');
    
    // Enable console logging
    page.on('console', msg => {
      console.log(`[${msg.type()}] ${msg.text()}`);
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    console.log('✅ Page loaded');

    // Click Client Login button
    await page.locator('#client-login-2fa-btn').click();
    console.log('✅ Clicked Client Login button');

    // Wait for Industry Auth modal
    await expect(page.locator('#industry-auth-modal')).toBeVisible();
    console.log('✅ Industry Auth modal opened');

    // Check initial state
    const industryModalClasses = await page.locator('#industry-auth-modal').getAttribute('class');
    console.log(`Initial Industry Auth modal classes: ${industryModalClasses}`);

    // Fill form
    await page.locator('#industry-select').selectOption('healthcare');
    await page.locator('#role-select').selectOption('doctor');
    await page.locator('#organization-input').fill('Test Hospital');
    console.log('✅ Form filled');

    // Click Access Dashboard
    await page.locator('#login-btn').click();
    console.log('✅ Clicked Access Dashboard button');

    // Wait for loading state
    await expect(page.locator('#auth-loading')).toBeVisible();
    console.log('✅ Loading state appeared');

    // Wait for 2FA modal
    await expect(page.locator('[id="2fa-modal"]')).toBeVisible({ timeout: 10000 });
    console.log('✅ 2FA modal opened');

    // Check Industry Auth modal state after 2FA modal opens
    const industryModalClassesAfter = await page.locator('#industry-auth-modal').getAttribute('class');
    console.log(`Industry Auth modal classes after 2FA opens: ${industryModalClassesAfter}`);

    // Check if Industry Auth modal is visible
    const isIndustryModalVisible = await page.locator('#industry-auth-modal').isVisible();
    console.log(`Industry Auth modal visible: ${isIndustryModalVisible}`);

    // Check z-index values
    const industryModalZIndex = await page.locator('#industry-auth-modal').evaluate(el => {
      return window.getComputedStyle(el).zIndex;
    });
    const twoFAModalZIndex = await page.locator('[id="2fa-modal"]').evaluate(el => {
      return window.getComputedStyle(el).zIndex;
    });
    console.log(`Industry Auth modal z-index: ${industryModalZIndex}`);
    console.log(`2FA modal z-index: ${twoFAModalZIndex}`);

    // Test if we can interact with 2FA modal elements
    try {
      await page.locator('#phone-number').fill('+1234567890');
      console.log('✅ Can interact with 2FA modal phone input');
    } catch (error) {
      console.log('❌ Cannot interact with 2FA modal phone input:', error);
    }

    // Take a screenshot for debugging
    await page.screenshot({ path: 'debug-modal-hiding.png' });
    console.log('📸 Screenshot saved as debug-modal-hiding.png');
  });
});
