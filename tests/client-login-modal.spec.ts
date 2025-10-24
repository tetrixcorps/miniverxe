import { test, expect } from '@playwright/test';

test.describe('Client Login Modal', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the landing page
    await page.goto('/');
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
  });

  test('should open modal when Client Login button is clicked', async ({ page }) => {
    // Find the Client Login button
    const clientLoginBtn = page.locator('#client-login-2fa-btn');
    await expect(clientLoginBtn).toBeVisible();
    
    // Click the Client Login button
    await clientLoginBtn.click();
    
    // Wait for the modal to appear
    const modal = page.locator('#industry-auth-modal');
    await expect(modal).toBeVisible();
    
    // Verify modal content is visible
    await expect(modal.locator('h2')).toContainText('Industry Authentication');
    await expect(modal.locator('#industry-select')).toBeVisible();
    await expect(modal.locator('#role-select')).toBeVisible();
    await expect(modal.locator('#organization-input')).toBeVisible();
  });

  test('should keep modal open and not disappear immediately', async ({ page }) => {
    // Click the Client Login button
    await page.locator('#client-login-2fa-btn').click();
    
    // Wait for modal to appear
    const modal = page.locator('#industry-auth-modal');
    await expect(modal).toBeVisible();
    
    // Wait a bit to ensure modal doesn't disappear
    await page.waitForTimeout(1000);
    
    // Verify modal is still visible
    await expect(modal).toBeVisible();
    
    // Check that modal has the correct classes
    const modalClasses = await modal.getAttribute('class');
    expect(modalClasses).not.toContain('hidden');
  });

  test('should allow industry selection', async ({ page }) => {
    // Open the modal
    await page.locator('#client-login-2fa-btn').click();
    const modal = page.locator('#industry-auth-modal');
    await expect(modal).toBeVisible();
    
    // Select an industry
    const industrySelect = modal.locator('#industry-select');
    await industrySelect.selectOption('healthcare');
    
    // Verify the selection
    await expect(industrySelect).toHaveValue('healthcare');
    
    // Check that role select becomes enabled
    const roleSelect = modal.locator('#role-select');
    await expect(roleSelect).not.toBeDisabled();
  });

  test('should allow organization input', async ({ page }) => {
    // Open the modal
    await page.locator('#client-login-2fa-btn').click();
    const modal = page.locator('#industry-auth-modal');
    await expect(modal).toBeVisible();
    
    // Enter organization name
    const orgInput = modal.locator('#organization-input');
    await orgInput.fill('Test Organization');
    
    // Verify the input
    await expect(orgInput).toHaveValue('Test Organization');
  });

  test('should close modal when Cancel button is clicked', async ({ page }) => {
    // Open the modal
    await page.locator('#client-login-2fa-btn').click();
    const modal = page.locator('#industry-auth-modal');
    await expect(modal).toBeVisible();
    
    // Click Cancel button
    await modal.locator('#cancel-auth').click();
    
    // Verify modal is hidden
    await expect(modal).not.toBeVisible();
  });

  test('should close modal when clicking outside', async ({ page }) => {
    // Open the modal
    await page.locator('#client-login-2fa-btn').click();
    const modal = page.locator('#industry-auth-modal');
    await expect(modal).toBeVisible();
    
    // Click outside the modal (on the backdrop)
    await modal.click({ position: { x: 10, y: 10 } });
    
    // Verify modal is hidden
    await expect(modal).not.toBeVisible();
  });

  test('should show 2FA authentication notice', async ({ page }) => {
    // Open the modal
    await page.locator('#client-login-2fa-btn').click();
    const modal = page.locator('#industry-auth-modal');
    await expect(modal).toBeVisible();
    
    // Check for 2FA notice
    await expect(modal.locator('text=2FA Authentication Required')).toBeVisible();
    await expect(modal.locator('text=This system uses Two-Factor Authentication')).toBeVisible();
  });

  test('should have proper modal styling and positioning', async ({ page }) => {
    // Open the modal
    await page.locator('#client-login-2fa-btn').click();
    const modal = page.locator('#industry-auth-modal');
    await expect(modal).toBeVisible();
    
    // Check modal positioning
    const modalBox = await modal.boundingBox();
    expect(modalBox).toBeTruthy();
    
    // Check that modal covers the full screen
    expect(modalBox!.width).toBeGreaterThan(800);
    expect(modalBox!.height).toBeGreaterThan(600);
  });

  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Find mobile Client Login button
    const mobileClientLoginBtn = page.locator('#client-login-2fa-btn-mobile');
    await expect(mobileClientLoginBtn).toBeVisible();
    
    // Click the mobile Client Login button
    await mobileClientLoginBtn.click();
    
    // Wait for the modal to appear
    const modal = page.locator('#industry-auth-modal');
    await expect(modal).toBeVisible();
    
    // Verify modal content is visible on mobile
    await expect(modal.locator('h2')).toContainText('Industry Authentication');
  });

  test('should handle multiple rapid clicks gracefully', async ({ page }) => {
    const clientLoginBtn = page.locator('#client-login-2fa-btn');
    
    // Click multiple times rapidly
    await clientLoginBtn.click();
    await clientLoginBtn.click();
    await clientLoginBtn.click();
    
    // Wait for modal to appear
    const modal = page.locator('#industry-auth-modal');
    await expect(modal).toBeVisible();
    
    // Should only have one modal instance
    const modalCount = await page.locator('#industry-auth-modal').count();
    expect(modalCount).toBe(1);
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    // Open the modal
    await page.locator('#client-login-2fa-btn').click();
    const modal = page.locator('#industry-auth-modal');
    await expect(modal).toBeVisible();
    
    // Check for proper form labels
    await expect(modal.locator('label[for="industry-select"]')).toBeVisible();
    await expect(modal.locator('label[for="role-select"]')).toBeVisible();
    
    // Check for proper button types
    const loginBtn = modal.locator('#login-btn');
    await expect(loginBtn).toHaveAttribute('type', 'button');
    
    const cancelBtn = modal.locator('#cancel-auth');
    await expect(cancelBtn).toHaveAttribute('type', 'button');
  });
});
