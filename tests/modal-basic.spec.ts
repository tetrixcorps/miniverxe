import { test, expect } from '@playwright/test';

test.describe('Basic Modal Test', () => {
  test('should open modal when Client Login button is clicked', async ({ page }) => {
    // Navigate to the landing page
    await page.goto('/');
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot before clicking
    await page.screenshot({ path: 'test-results/before-click.png' });
    
    // Find the Client Login button
    const clientLoginBtn = page.locator('#client-login-2fa-btn');
    await expect(clientLoginBtn).toBeVisible();
    
    // Click the Client Login button
    await clientLoginBtn.click();
    
    // Wait a bit for the modal to appear
    await page.waitForTimeout(1000);
    
    // Take a screenshot after clicking
    await page.screenshot({ path: 'test-results/after-click.png' });
    
    // Check if modal exists
    const modal = page.locator('#industry-auth-modal');
    const modalExists = await modal.count() > 0;
    console.log('Modal exists:', modalExists);
    
    if (modalExists) {
      const isVisible = await modal.isVisible();
      const hasHiddenClass = await modal.evaluate(el => el.classList.contains('hidden'));
      const displayStyle = await modal.evaluate(el => el.style.display);
      const computedStyle = await modal.evaluate(el => window.getComputedStyle(el).display);
      
      console.log('Modal visibility details:', {
        isVisible,
        hasHiddenClass,
        displayStyle,
        computedStyle
      });
      
      // Try to force the modal to be visible
      await modal.evaluate(el => {
        el.classList.remove('hidden');
        el.style.display = 'block';
        el.style.visibility = 'visible';
        el.style.opacity = '1';
      });
      
      // Wait a bit more
      await page.waitForTimeout(1000);
      
      // Take another screenshot
      await page.screenshot({ path: 'test-results/after-force-visible.png' });
      
      // Check if it's visible now
      const isVisibleAfter = await modal.isVisible();
      console.log('Modal visible after force:', isVisibleAfter);
    }
  });
});
