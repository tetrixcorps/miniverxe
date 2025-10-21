import { test, expect } from '@playwright/test';

test.describe('Authentication Flow Comprehensive Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Enable console logging
    page.on('console', msg => {
      console.log(`[${msg.type()}] ${msg.text()}`);
    });
    
    // Enable network logging
    page.on('request', request => {
      console.log(`[REQUEST] ${request.method()} ${request.url()}`);
    });
    
    page.on('response', response => {
      console.log(`[RESPONSE] ${response.status()} ${response.url()}`);
    });
  });

  test('should load page and verify Client Login button exists', async ({ page }) => {
    console.log('🔍 [TEST] Starting authentication flow test...');
    
    await page.goto('http://localhost:8080/');
    console.log('✅ [TEST] Page loaded successfully');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    console.log('✅ [TEST] Page fully loaded');
    
    // Check if Client Login button exists
    const clientLoginBtn = page.locator('#client-login-2fa-btn');
    await expect(clientLoginBtn).toBeVisible();
    console.log('✅ [TEST] Client Login button found and visible');
    
    // Check if Industry Auth modal exists
    const industryAuthModal = page.locator('#industry-auth-modal');
    await expect(industryAuthModal).toBeAttached();
    console.log('✅ [TEST] Industry Auth modal element found');
  });

  test('should test Client Login button click and modal opening', async ({ page }) => {
    console.log('🔍 [TEST] Starting Client Login button test...');
    
    await page.goto('http://localhost:8080/');
    await page.waitForLoadState('networkidle');
    
    // Click Client Login button
    const clientLoginBtn = page.locator('#client-login-2fa-btn');
    await clientLoginBtn.click();
    console.log('✅ [TEST] Client Login button clicked');
    
    // Wait for modal to appear
    const industryAuthModal = page.locator('#industry-auth-modal');
    await expect(industryAuthModal).toBeVisible();
    console.log('✅ [TEST] Industry Auth modal opened successfully');
    
    // Check if modal has required elements
    const industrySelect = page.locator('#industry-select');
    const roleSelect = page.locator('#role-select');
    const organizationInput = page.locator('#organization-input');
    const loginBtn = page.locator('#login-btn');
    
    await expect(industrySelect).toBeVisible();
    await expect(roleSelect).toBeVisible();
    await expect(organizationInput).toBeVisible();
    await expect(loginBtn).toBeVisible();
    
    console.log('✅ [TEST] All modal elements present and visible');
  });

  test('should test industry selection and role population', async ({ page }) => {
    console.log('🔍 [TEST] Starting industry selection test...');
    
    await page.goto('http://localhost:8080/');
    await page.waitForLoadState('networkidle');
    
    // Open modal
    await page.locator('#client-login-2fa-btn').click();
    await page.waitForSelector('#industry-auth-modal:not(.hidden)');
    
    // Select healthcare industry
    await page.selectOption('#industry-select', 'healthcare');
    console.log('✅ [TEST] Healthcare industry selected');
    
    // Check if role select is enabled and has options
    const roleSelect = page.locator('#role-select');
    await expect(roleSelect).toBeEnabled();
    
    // Check if roles are populated
    const roleOptions = await roleSelect.locator('option').all();
    expect(roleOptions.length).toBeGreaterThan(1); // More than just the placeholder
    console.log('✅ [TEST] Role options populated successfully');
    
    // Select a role
    await page.selectOption('#role-select', 'doctor');
    console.log('✅ [TEST] Doctor role selected');
    
    // Fill organization
    await page.fill('#organization-input', 'Test Hospital');
    console.log('✅ [TEST] Organization filled');
  });

  test('should test console logging and error detection', async ({ page }) => {
    console.log('🔍 [TEST] Starting console logging test...');
    
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
    });
    
    await page.goto('http://localhost:8080/');
    await page.waitForLoadState('networkidle');
    
    // Click Client Login button
    await page.locator('#client-login-2fa-btn').click();
    
    // Wait a bit for all console messages
    await page.waitForTimeout(2000);
    
    // Check for verbose logging
    const verboseLogs = consoleMessages.filter(msg => msg.includes('[VERBOSE]'));
    expect(verboseLogs.length).toBeGreaterThan(0);
    console.log(`✅ [TEST] Found ${verboseLogs.length} verbose log messages`);
    
    // Check for error messages
    const errorLogs = consoleMessages.filter(msg => msg.includes('❌'));
    if (errorLogs.length > 0) {
      console.log(`⚠️ [TEST] Found ${errorLogs.length} error messages:`, errorLogs);
    } else {
      console.log('✅ [TEST] No error messages found');
    }
    
    // Log all console messages for debugging
    console.log('📋 [TEST] All console messages:', consoleMessages);
  });

  test('should test script loading and function availability', async ({ page }) => {
    console.log('🔍 [TEST] Starting script loading test...');
    
    await page.goto('http://localhost:8080/');
    await page.waitForLoadState('networkidle');
    
    // Check if required functions are available
    const openIndustryAuthModal = await page.evaluate(() => typeof window.openIndustryAuthModal);
    const openClientLogin = await page.evaluate(() => typeof window.openClientLogin);
    const tetrixAuthContext = await page.evaluate(() => typeof window.tetrixAuthContext);
    
    console.log('🔍 [TEST] Function availability:', {
      openIndustryAuthModal,
      openClientLogin,
      tetrixAuthContext
    });
    
    expect(openIndustryAuthModal).toBe('function');
    expect(openClientLogin).toBe('function');
    
    console.log('✅ [TEST] Required functions are available');
    
    // Test function execution
    await page.evaluate(() => {
      if (typeof window.openClientLogin === 'function') {
        window.openClientLogin();
      }
    });
    
    // Check if modal opened
    const modal = page.locator('#industry-auth-modal');
    await expect(modal).toBeVisible();
    console.log('✅ [TEST] Modal opened via function call');
  });

  test('should test error handling and retry logic', async ({ page }) => {
    console.log('🔍 [TEST] Starting error handling test...');
    
    // Intercept and block IndustryAuth script to test retry logic
    await page.route('**/IndustryAuth.astro*', route => {
      console.log('🚫 [TEST] Blocking IndustryAuth script to test retry logic');
      route.abort();
    });
    
    await page.goto('http://localhost:8080/');
    await page.waitForLoadState('networkidle');
    
    // Click Client Login button
    await page.locator('#client-login-2fa-btn').click();
    
    // Wait for retry attempts
    await page.waitForTimeout(5000);
    
    // Check console for retry messages
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
    });
    
    const retryMessages = consoleMessages.filter(msg => 
      msg.includes('attempt') || msg.includes('waiting') || msg.includes('not available')
    );
    
    expect(retryMessages.length).toBeGreaterThan(0);
    console.log(`✅ [TEST] Found ${retryMessages.length} retry messages`);
    console.log('📋 [TEST] Retry messages:', retryMessages);
  });
});
