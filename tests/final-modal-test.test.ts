import { test, expect } from '@playwright/test';

test.describe('Final Modal Test', () => {
  test('should confirm modal overlap is fixed and 2FA works', async ({ page }) => {
    console.log('🎯 Starting final confirmation test...');
    
    // Navigate to the app
    await page.goto('https://tetrix-minimal-uzzxn.ondigitalocean.app/');
    await page.waitForLoadState('networkidle');

    // Click Client Login button
    await page.locator('#client-login-2fa-btn').click();
    await expect(page.locator('#industry-auth-modal')).toBeVisible();

    // Fill form and click Access Dashboard
    await page.locator('#industry-select').selectOption('healthcare');
    await page.locator('#role-select').selectOption('doctor');
    await page.locator('#organization-input').fill('Test Hospital');
    await page.locator('#login-btn').click();

    // Wait for 2FA modal
    await expect(page.locator('[id="2fa-modal"]')).toBeVisible({ timeout: 10000 });
    
    // Fill phone number
    await page.locator('#phone-number').fill('+1234567890');
    console.log('✅ Phone number filled');

    // Click Send Code button - this should work now
    await page.locator('#send-code-btn').click();
    console.log('✅ Send Code button clicked successfully!');

    // Wait for verification code input to appear
    await expect(page.locator('#verification-code')).toBeVisible({ timeout: 10000 });
    console.log('✅ Verification code input appeared');

    // Fill verification code
    await page.locator('#verification-code').fill('123456');
    console.log('✅ Verification code filled');

    // Click Verify Code button
    await page.locator('#verify-code-btn').click();
    console.log('✅ Verify Code button clicked');

    // Wait for success message
    await expect(page.locator('[id="2fa-success"]')).toBeVisible({ timeout: 10000 });
    console.log('✅ 2FA verification successful!');

    console.log('🎉 MODAL OVERLAP ISSUE IS COMPLETELY RESOLVED!');
  });
});
