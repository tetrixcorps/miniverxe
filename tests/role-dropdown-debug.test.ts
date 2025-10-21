import { test, expect } from '@playwright/test';

test.describe('Role Dropdown Debug Test', () => {
  const CUSTOM_DOMAIN_URL = 'https://tetrixcorp.com';

  test('Debug Role Dropdown Population', async ({ page }) => {
    console.log('🔍 Starting role dropdown debug test...');

    // Navigate to custom domain
    await page.goto(CUSTOM_DOMAIN_URL);
    await expect(page).toHaveURL(CUSTOM_DOMAIN_URL);
    console.log('✅ Page loaded successfully');

    // Click Client Login button
    console.log('🔧 Clicking Client Login button...');
    const clientLoginButton = page.locator('#client-login-2fa-btn');
    await expect(clientLoginButton).toBeVisible();
    await clientLoginButton.click();
    console.log('✅ Client Login button clicked');

    // Wait for Industry Auth modal
    console.log('🔧 Waiting for Industry Auth modal...');
    const industryAuthModal = page.locator('#industry-auth-modal');
    await expect(industryAuthModal).toBeVisible({ timeout: 10000 });
    console.log('✅ Industry Auth modal is visible');

    // Check initial state of role select
    const roleSelect = page.locator('#role-select');
    const isInitiallyDisabled = await roleSelect.isDisabled();
    console.log('🔍 Role select initially disabled:', isInitiallyDisabled);
    expect(isInitiallyDisabled).toBe(true);

    // Select healthcare industry
    console.log('🔧 Selecting healthcare industry...');
    const industrySelect = page.locator('#industry-select');
    await expect(industrySelect).toBeEnabled();
    await industrySelect.selectOption('healthcare');
    console.log('✅ Healthcare industry selected');

    // Wait a moment for the JavaScript to process
    await page.waitForTimeout(1000);

    // Check if role select is now enabled
    const isRoleSelectEnabled = await roleSelect.isEnabled();
    console.log('🔍 Role select enabled after industry selection:', isRoleSelectEnabled);
    expect(isRoleSelectEnabled).toBe(true);

    // Check role options
    const roleOptions = await roleSelect.locator('option').all();
    console.log('🔍 Number of role options:', roleOptions.length);
    
    // Log all role options
    for (let i = 0; i < roleOptions.length; i++) {
      const option = roleOptions[i];
      const value = await option.getAttribute('value');
      const text = await option.textContent();
      console.log(`🔍 Role option ${i}: value="${value}", text="${text}"`);
    }

    // Verify we have more than just the placeholder
    expect(roleOptions.length).toBeGreaterThan(1);
    console.log('✅ Role options populated successfully');

    // Check for specific healthcare roles
    const doctorOption = page.locator('#role-select option[value="doctor"]');
    const nurseOption = page.locator('#role-select option[value="nurse"]');
    const adminOption = page.locator('#role-select option[value="admin"]');
    const receptionistOption = page.locator('#role-select option[value="receptionist"]');

    const doctorExists = await doctorOption.count() > 0;
    const nurseExists = await nurseOption.count() > 0;
    const adminExists = await adminOption.count() > 0;
    const receptionistExists = await receptionistOption.count() > 0;

    console.log('🔍 Healthcare roles check:');
    console.log('  - Doctor option exists:', doctorExists);
    console.log('  - Nurse option exists:', nurseExists);
    console.log('  - Admin option exists:', adminExists);
    console.log('  - Receptionist option exists:', receptionistExists);

    expect(doctorExists).toBe(true);
    expect(nurseExists).toBe(true);
    expect(adminExists).toBe(true);
    expect(receptionistExists).toBe(true);

    // Test selecting a role
    console.log('🔧 Selecting doctor role...');
    await roleSelect.selectOption('doctor');
    const selectedRole = await roleSelect.inputValue();
    console.log('🔍 Selected role value:', selectedRole);
    expect(selectedRole).toBe('doctor');
    console.log('✅ Doctor role selected successfully');

    // Test organization input
    console.log('🔧 Testing organization input...');
    const organizationInput = page.locator('#organization-input');
    await expect(organizationInput).toBeEnabled();
    await organizationInput.fill('Test Hospital');
    const orgValue = await organizationInput.inputValue();
    console.log('🔍 Organization value:', orgValue);
    expect(orgValue).toBe('Test Hospital');
    console.log('✅ Organization input working');

    // Test Access Dashboard button
    console.log('🔧 Testing Access Dashboard button...');
    const loginButton = page.locator('#login-btn');
    await expect(loginButton).toBeEnabled();
    const buttonText = await loginButton.textContent();
    console.log('🔍 Access Dashboard button text:', buttonText);
    expect(buttonText).toContain('Access Dashboard');
    console.log('✅ Access Dashboard button is enabled and ready');

    console.log('🏁 Role dropdown debug test completed successfully');
  });

  test('Test Multiple Industries Role Population', async ({ page }) => {
    console.log('🔍 Testing multiple industries role population...');

    await page.goto(CUSTOM_DOMAIN_URL);
    await page.locator('#client-login-2fa-btn').click();
    await page.waitForSelector('#industry-auth-modal:not(.hidden)');

    const industries = [
      { value: 'healthcare', expectedRoles: ['doctor', 'nurse', 'admin', 'receptionist'] },
      { value: 'construction', expectedRoles: ['project_manager', 'site_supervisor', 'safety_officer', 'foreman'] },
      { value: 'logistics', expectedRoles: ['fleet_manager', 'dispatcher', 'driver', 'operations'] }
    ];

    for (const industry of industries) {
      console.log(`🔧 Testing ${industry.value} industry...`);
      
      // Select industry
      await page.selectOption('#industry-select', industry.value);
      await page.waitForTimeout(500); // Wait for JS to process
      
      // Check if role select is enabled
      const roleSelect = page.locator('#role-select');
      const isEnabled = await roleSelect.isEnabled();
      console.log(`🔍 ${industry.value} role select enabled:`, isEnabled);
      expect(isEnabled).toBe(true);
      
      // Check for expected roles
      for (const expectedRole of industry.expectedRoles) {
        const roleOption = page.locator(`#role-select option[value="${expectedRole}"]`);
        const exists = await roleOption.count() > 0;
        console.log(`🔍 ${industry.value} - ${expectedRole} exists:`, exists);
        expect(exists).toBe(true);
      }
      
      console.log(`✅ ${industry.value} industry roles populated correctly`);
    }

    console.log('🏁 Multiple industries test completed successfully');
  });
});
