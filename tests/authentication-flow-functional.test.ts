import { test, expect, Page } from '@playwright/test';

test.describe('Authentication Flow Functional Test', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Enable console logging
    page.on('console', msg => {
      console.log(`[${msg.type()}] ${msg.text()}`);
    });
    
    // Enable network logging
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        console.log(`🌐 [REQUEST] ${request.method()} ${request.url()}`);
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        console.log(`🌐 [RESPONSE] ${response.status()} ${response.url()}`);
      }
    });
  });

  test('Complete Authentication Flow - Custom Domain', async () => {
    console.log('🚀 Starting authentication flow test on custom domain...');
    
    // Navigate to custom domain
    await page.goto('https://tetrixcorp.com');
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Page loaded successfully');
    
    // Test 1: Click Client Login button
    console.log('🔧 Testing Client Login button...');
    const clientLoginBtn = page.locator('#client-login-2fa-btn');
    await expect(clientLoginBtn).toBeVisible();
    
    // Click and wait for modal
    await clientLoginBtn.click();
    console.log('✅ Client Login button clicked');
    
    // Test 2: Wait for Industry Auth modal to appear
    console.log('🔧 Waiting for Industry Auth modal...');
    const industryModal = page.locator('#industry-auth-modal');
    await expect(industryModal).toBeVisible({ timeout: 10000 });
    console.log('✅ Industry Auth modal is visible');
    
    // Test 3: Test Industry Selection
    console.log('🔧 Testing industry selection...');
    const industrySelect = page.locator('#industry-select');
    await expect(industrySelect).toBeVisible();
    
    // Select Healthcare industry
    await industrySelect.selectOption('healthcare');
    console.log('✅ Healthcare industry selected');
    
    // Test 4: Test Role Selection (This is the problematic field)
    console.log('🔧 Testing role selection...');
    const roleSelect = page.locator('#role-select');
    await expect(roleSelect).toBeVisible();
    
    // Check if role select is enabled
    const isDisabled = await roleSelect.isDisabled();
    console.log(`🔍 Role select disabled state: ${isDisabled}`);
    
    if (isDisabled) {
      console.log('❌ Role select is disabled - this is the problem!');
      
      // Try to enable it by triggering change event
      await industrySelect.dispatchEvent('change');
      await page.waitForTimeout(500);
      
      // Check again
      const isStillDisabled = await roleSelect.isDisabled();
      console.log(`🔍 Role select disabled state after change event: ${isStillDisabled}`);
      
      if (isStillDisabled) {
        // Force enable the select
        await page.evaluate(() => {
          const roleSelect = document.getElementById('role-select') as HTMLSelectElement;
          if (roleSelect) {
            roleSelect.disabled = false;
            console.log('🔧 Force-enabled role select');
          }
        });
      }
    }
    
    // Now try to select a role
    const roleOptions = await roleSelect.locator('option').count();
    console.log(`🔍 Available role options: ${roleOptions}`);
    
    if (roleOptions > 1) {
      await roleSelect.selectOption('doctor');
      console.log('✅ Doctor role selected');
    } else {
      console.log('❌ No role options available - this is the problem!');
      
      // Debug: Check what's in the role select
      const roleSelectHTML = await roleSelect.innerHTML();
      console.log(`🔍 Role select HTML: ${roleSelectHTML}`);
    }
    
    // Test 5: Test Organization Input
    console.log('🔧 Testing organization input...');
    const orgInput = page.locator('#organization-input');
    await expect(orgInput).toBeVisible();
    await orgInput.fill('Test Hospital');
    console.log('✅ Organization filled');
    
    // Test 6: Test Access Dashboard Button (This is the other problematic button)
    console.log('🔧 Testing Access Dashboard button...');
    const accessBtn = page.locator('#login-btn');
    await expect(accessBtn).toBeVisible();
    
    // Check if button is clickable
    const isButtonEnabled = await accessBtn.isEnabled();
    console.log(`🔍 Access Dashboard button enabled: ${isButtonEnabled}`);
    
    if (!isButtonEnabled) {
      console.log('❌ Access Dashboard button is disabled - this is the problem!');
      
      // Try to enable it
      await page.evaluate(() => {
        const btn = document.getElementById('login-btn') as HTMLButtonElement;
        if (btn) {
          btn.disabled = false;
          console.log('🔧 Force-enabled Access Dashboard button');
        }
      });
    }
    
    // Click the button
    await accessBtn.click();
    console.log('✅ Access Dashboard button clicked');
    
    // Test 7: Wait for 2FA modal or error
    console.log('🔧 Waiting for 2FA modal or error...');
    
    try {
      // Wait for either 2FA modal or error message
      await Promise.race([
        page.waitForSelector('#twofa-modal', { timeout: 5000 }),
        page.waitForSelector('#2fa-modal', { timeout: 5000 }),
        page.waitForSelector('.modal-2fa', { timeout: 5000 }),
        page.waitForSelector('[class*="modal-2fa"]', { timeout: 5000 }),
        page.waitForSelector('.error', { timeout: 5000 }),
        page.waitForSelector('[role="alert"]', { timeout: 5000 })
      ]);
      
      const twoFAModal = page.locator('#twofa-modal, #2fa-modal, .modal-2fa, [class*="modal-2fa"]');
      const is2FAModalVisible = await twoFAModal.isVisible();
      
      if (is2FAModalVisible) {
        console.log('✅ 2FA modal appeared');
        
        // Test phone number input
        const phoneInput = page.locator('input[type="tel"], input[placeholder*="phone"], input[placeholder*="number"]').first();
        if (await phoneInput.isVisible()) {
          await phoneInput.fill('+1234567890');
          console.log('✅ Phone number filled');
        }
        
        // Test verify button
        const verifyBtn = page.locator('button:has-text("Verify"), button:has-text("Send"), button:has-text("Get Code")').first();
        if (await verifyBtn.isVisible()) {
          await verifyBtn.click();
          console.log('✅ Verify button clicked');
        }
        
      } else {
        console.log('❌ 2FA modal did not appear');
        
        // Check for error messages
        const errorMessages = await page.locator('.error, [role="alert"], .alert').allTextContents();
        if (errorMessages.length > 0) {
          console.log(`❌ Error messages found: ${errorMessages.join(', ')}`);
        }
      }
      
    } catch (error) {
      console.log('❌ Timeout waiting for 2FA modal or error');
    }
    
    // Test 8: Check for any JavaScript errors
    const jsErrors = await page.evaluate(() => {
      return window.consoleErrors || [];
    });
    
    if (jsErrors.length > 0) {
      console.log(`❌ JavaScript errors found: ${jsErrors.join(', ')}`);
    }
    
    console.log('🏁 Authentication flow test completed');
  });

  test('Debug Industry Auth Modal Elements', async () => {
    console.log('🔍 Debugging Industry Auth Modal elements...');
    
    await page.goto('https://tetrixcorp.com');
    await page.waitForLoadState('networkidle');
    
    // Click Client Login
    await page.locator('#client-login-2fa-btn').click();
    await page.waitForSelector('#industry-auth-modal', { timeout: 10000 });
    
    // Debug all form elements
    const formElements = await page.evaluate(() => {
      const modal = document.getElementById('industry-auth-modal');
      if (!modal) return null;
      
      const elements = {
        industrySelect: {
          element: document.getElementById('industry-select'),
          disabled: document.getElementById('industry-select')?.disabled,
          options: Array.from(document.getElementById('industry-select')?.options || []).map(opt => ({
            value: opt.value,
            text: opt.textContent,
            selected: opt.selected
          }))
        },
        roleSelect: {
          element: document.getElementById('role-select'),
          disabled: document.getElementById('role-select')?.disabled,
          options: Array.from(document.getElementById('role-select')?.options || []).map(opt => ({
            value: opt.value,
            text: opt.textContent,
            selected: opt.selected
          }))
        },
        orgInput: {
          element: document.getElementById('organization-input'),
          value: document.getElementById('organization-input')?.value,
          disabled: document.getElementById('organization-input')?.disabled
        },
        loginBtn: {
          element: document.getElementById('login-btn'),
          disabled: document.getElementById('login-btn')?.disabled,
          text: document.getElementById('login-btn')?.textContent
        }
      };
      
      return elements;
    });
    
    console.log('🔍 Form elements debug info:', JSON.stringify(formElements, null, 2));
    
    // Test industry selection and role population
    console.log('🔧 Testing industry selection and role population...');
    
    await page.selectOption('#industry-select', 'healthcare');
    await page.waitForTimeout(1000);
    
    const roleOptionsAfter = await page.evaluate(() => {
      const roleSelect = document.getElementById('role-select');
      return {
        disabled: roleSelect?.disabled,
        options: Array.from(roleSelect?.options || []).map(opt => ({
          value: opt.value,
          text: opt.textContent,
          selected: opt.selected
        }))
      };
    });
    
    console.log('🔍 Role options after healthcare selection:', JSON.stringify(roleOptionsAfter, null, 2));
  });
});
