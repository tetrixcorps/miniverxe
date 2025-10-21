import { test, expect } from '@playwright/test';

test.describe('Check Event Listeners Test', () => {
  test('should check if event listeners are attached on custom domain', async ({ page }) => {
    console.log('🌐 Testing custom domain event listeners...');
    
    // Navigate to custom domain
    await page.goto('https://tetrixcorp.com');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if the Client Login button exists
    const clientLoginButton = page.locator('#client-login-2fa-btn');
    await expect(clientLoginButton).toBeVisible();
    
    console.log('✅ Client Login button found');
    
    // Check if event listeners are attached
    const hasEventListeners = await page.evaluate(() => {
      const button = document.getElementById('client-login-2fa-btn');
      if (!button) return false;
      
      // Check if the button has any event listeners
      const events = (button as any)._events || {};
      const hasListeners = Object.keys(events).length > 0;
      
      console.log('Button event listeners:', Object.keys(events));
      
      // Also check if the global function exists
      const hasGlobalFunction = typeof window.openIndustryAuthModal === 'function';
      console.log('Global function exists:', hasGlobalFunction);
      
      return { hasListeners, hasGlobalFunction, events: Object.keys(events) };
    });
    
    console.log('🔍 Event listener check result:', hasEventListeners);
    
    // Check if the global function is available
    const globalFunctionExists = await page.evaluate(() => {
      return typeof window.openIndustryAuthModal === 'function';
    });
    
    console.log('🔍 Global function available:', globalFunctionExists);
    
    // Try to manually attach the event listener
    console.log('🔧 Manually attaching event listener...');
    await page.evaluate(() => {
      const button = document.getElementById('client-login-2fa-btn');
      if (button) {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Manual event listener triggered!');
          if (window.openIndustryAuthModal) {
            window.openIndustryAuthModal();
          }
        });
        console.log('✅ Manual event listener attached');
      } else {
        console.log('❌ Button not found for manual attachment');
      }
    });
    
    // Now try clicking the button
    console.log('🖱️ Clicking button with manual event listener...');
    await clientLoginButton.click();
    
    // Wait for modal
    await page.waitForTimeout(2000);
    
    // Check if modal opened
    const industryAuthModal = page.locator('#industry-auth-modal');
    const isVisible = await industryAuthModal.isVisible();
    
    console.log(`🔍 Industry Auth modal visible after manual click: ${isVisible}`);
    
    if (isVisible) {
      console.log('✅ SUCCESS! Manual event listener worked. The issue is with automatic event listener attachment.');
    } else {
      console.log('❌ Manual event listener also failed. Checking for JavaScript errors...');
    }
    
    // Take a screenshot
    await page.screenshot({ path: 'test-results/check-event-listeners.png' });
    console.log('📸 Screenshot saved to test-results/check-event-listeners.png');
  });
});

