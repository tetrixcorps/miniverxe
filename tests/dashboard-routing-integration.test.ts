import { test, expect } from '@playwright/test';

test.describe('Dashboard Routing Integration', () => {
  test('should redirect to healthcare dashboard after successful 2FA', async ({ page }) => {
    console.log('🏥 Testing healthcare dashboard routing...');
    
    // Navigate to the app
    await page.goto('https://tetrix-minimal-uzzxn.ondigitalocean.app/');
    await page.waitForLoadState('networkidle');

    // Click Client Login button
    await page.locator('#client-login-2fa-btn').click();
    await expect(page.locator('#industry-auth-modal')).toBeVisible();

    // Fill healthcare form
    await page.locator('#industry-select').selectOption('healthcare');
    await page.locator('#role-select').selectOption('doctor');
    await page.locator('#organization-input').fill('TETRIX Medical Center');
    console.log('🏥 Filled healthcare form: doctor at TETRIX Medical Center');

    // Click Access Dashboard button
    await page.locator('#login-btn').click();
    console.log('🏥 Clicked Access Dashboard button');

    // Wait for 2FA modal
    await expect(page.locator('[id="2fa-modal"]')).toBeVisible({ timeout: 10000 });
    
    // Fill phone number and send code
    await page.locator('#phone-number').fill('+15042749808');
    await page.locator('#verification-method').selectOption('sms');
    await page.locator('#send-code-btn').click();
    console.log('🏥 Sent verification code to +15042749808');

    // Wait for verification code input
    await expect(page.locator('#verification-code')).toBeVisible({ timeout: 10000 });
    
    // Enter verification code
    await page.locator('#verification-code').fill('123456');
    await page.locator('#verify-code-btn').click();
    console.log('🏥 Entered verification code');

    // Wait for redirect to healthcare dashboard
    await page.waitForURL('**/dashboards/healthcare**', { timeout: 15000 });
    console.log('🏥 ✅ Successfully redirected to healthcare dashboard!');

    // Verify URL parameters are present
    const currentUrl = page.url();
    console.log('🏥 Current URL:', currentUrl);
    
    expect(currentUrl).toContain('/dashboards/healthcare');
    expect(currentUrl).toContain('token=');
    expect(currentUrl).toContain('role=doctor');
    expect(currentUrl).toContain('org=TETRIX+Medical+Center');
    expect(currentUrl).toContain('phone=%2B15042749808');
    expect(currentUrl).toContain('industry=healthcare');
    
    console.log('🏥 ✅ All URL parameters present: token, role, org, phone, industry');
  });

  test('should redirect to construction dashboard after successful 2FA', async ({ page }) => {
    console.log('🏗️ Testing construction dashboard routing...');
    
    // Navigate to the app
    await page.goto('https://tetrix-minimal-uzzxn.ondigitalocean.app/');
    await page.waitForLoadState('networkidle');

    // Click Client Login button
    await page.locator('#client-login-2fa-btn').click();
    await expect(page.locator('#industry-auth-modal')).toBeVisible();

    // Fill construction form
    await page.locator('#industry-select').selectOption('construction');
    await page.locator('#role-select').selectOption('project_manager');
    await page.locator('#organization-input').fill('TETRIX Construction Co.');
    console.log('🏗️ Filled construction form: project_manager at TETRIX Construction Co.');

    // Click Access Dashboard button
    await page.locator('#login-btn').click();
    console.log('🏗️ Clicked Access Dashboard button');

    // Wait for 2FA modal
    await expect(page.locator('[id="2fa-modal"]')).toBeVisible({ timeout: 10000 });
    
    // Fill phone number and send code
    await page.locator('#phone-number').fill('+15042749808');
    await page.locator('#verification-method').selectOption('sms');
    await page.locator('#send-code-btn').click();
    console.log('🏗️ Sent verification code to +15042749808');

    // Wait for verification code input
    await expect(page.locator('#verification-code')).toBeVisible({ timeout: 10000 });
    
    // Enter verification code
    await page.locator('#verification-code').fill('123456');
    await page.locator('#verify-code-btn').click();
    console.log('🏗️ Entered verification code');

    // Wait for redirect to construction dashboard
    await page.waitForURL('**/dashboards/construction**', { timeout: 15000 });
    console.log('🏗️ ✅ Successfully redirected to construction dashboard!');

    // Verify URL parameters are present
    const currentUrl = page.url();
    console.log('🏗️ Current URL:', currentUrl);
    
    expect(currentUrl).toContain('/dashboards/construction');
    expect(currentUrl).toContain('token=');
    expect(currentUrl).toContain('role=project_manager');
    expect(currentUrl).toContain('org=TETRIX+Construction+Co.');
    expect(currentUrl).toContain('phone=%2B15042749808');
    expect(currentUrl).toContain('industry=construction');
    
    console.log('🏗️ ✅ All URL parameters present: token, role, org, phone, industry');
  });

  test('should redirect to logistics dashboard after successful 2FA', async ({ page }) => {
    console.log('🚛 Testing logistics dashboard routing...');
    
    // Navigate to the app
    await page.goto('https://tetrix-minimal-uzzxn.ondigitalocean.app/');
    await page.waitForLoadState('networkidle');

    // Click Client Login button
    await page.locator('#client-login-2fa-btn').click();
    await expect(page.locator('#industry-auth-modal')).toBeVisible();

    // Fill logistics form
    await page.locator('#industry-select').selectOption('logistics');
    await page.locator('#role-select').selectOption('fleet_manager');
    await page.locator('#organization-input').fill('TETRIX Fleet Solutions');
    console.log('🚛 Filled logistics form: fleet_manager at TETRIX Fleet Solutions');

    // Click Access Dashboard button
    await page.locator('#login-btn').click();
    console.log('🚛 Clicked Access Dashboard button');

    // Wait for 2FA modal
    await expect(page.locator('[id="2fa-modal"]')).toBeVisible({ timeout: 10000 });
    
    // Fill phone number and send code
    await page.locator('#phone-number').fill('+15042749808');
    await page.locator('#verification-method').selectOption('sms');
    await page.locator('#send-code-btn').click();
    console.log('🚛 Sent verification code to +15042749808');

    // Wait for verification code input
    await expect(page.locator('#verification-code')).toBeVisible({ timeout: 10000 });
    
    // Enter verification code
    await page.locator('#verification-code').fill('123456');
    await page.locator('#verify-code-btn').click();
    console.log('🚛 Entered verification code');

    // Wait for redirect to logistics dashboard
    await page.waitForURL('**/dashboards/logistics**', { timeout: 15000 });
    console.log('🚛 ✅ Successfully redirected to logistics dashboard!');

    // Verify URL parameters are present
    const currentUrl = page.url();
    console.log('🚛 Current URL:', currentUrl);
    
    expect(currentUrl).toContain('/dashboards/logistics');
    expect(currentUrl).toContain('token=');
    expect(currentUrl).toContain('role=fleet_manager');
    expect(currentUrl).toContain('org=TETRIX+Fleet+Solutions');
    expect(currentUrl).toContain('phone=%2B15042749808');
    expect(currentUrl).toContain('industry=logistics');
    
    console.log('🚛 ✅ All URL parameters present: token, role, org, phone, industry');
  });

  test('should fallback to client dashboard for unknown industry', async ({ page }) => {
    console.log('🔧 Testing fallback to client dashboard...');
    
    // Navigate to the app
    await page.goto('https://tetrix-minimal-uzzxn.ondigitalocean.app/');
    await page.waitForLoadState('networkidle');

    // Click Client Login button
    await page.locator('#client-login-2fa-btn').click();
    await expect(page.locator('#industry-auth-modal')).toBeVisible();

    // Fill form with unknown industry (simulate by selecting first available)
    await page.locator('#industry-select').selectOption('healthcare');
    await page.locator('#role-select').selectOption('doctor');
    await page.locator('#organization-input').fill('Test Organization');
    console.log('🔧 Filled form for fallback test');

    // Click Access Dashboard button
    await page.locator('#login-btn').click();
    console.log('🔧 Clicked Access Dashboard button');

    // Wait for 2FA modal
    await expect(page.locator('[id="2fa-modal"]')).toBeVisible({ timeout: 10000 });
    
    // Fill phone number and send code
    await page.locator('#phone-number').fill('+15042749808');
    await page.locator('#verification-method').selectOption('sms');
    await page.locator('#send-code-btn').click();
    console.log('🔧 Sent verification code to +15042749808');

    // Wait for verification code input
    await expect(page.locator('#verification-code')).toBeVisible({ timeout: 10000 });
    
    // Enter verification code
    await page.locator('#verification-code').fill('123456');
    await page.locator('#verify-code-btn').click();
    console.log('🔧 Entered verification code');

    // Wait for redirect (should go to healthcare dashboard, not client)
    await page.waitForURL('**/dashboards/**', { timeout: 15000 });
    console.log('🔧 ✅ Successfully redirected to dashboard!');

    // Verify URL parameters are present
    const currentUrl = page.url();
    console.log('🔧 Current URL:', currentUrl);
    
    expect(currentUrl).toContain('/dashboards/');
    expect(currentUrl).toContain('token=');
    expect(currentUrl).toContain('role=doctor');
    expect(currentUrl).toContain('org=Test+Organization');
    expect(currentUrl).toContain('phone=%2B15042749808');
    expect(currentUrl).toContain('industry=healthcare');
    
    console.log('🔧 ✅ All URL parameters present: token, role, org, phone, industry');
  });
});
