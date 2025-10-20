import { test, expect } from '@playwright/test';

test.describe('Debug Blocking Element', () => {
  test('should find what element is blocking the Send Code button', async ({ page }) => {
    console.log('🔍 Starting blocking element debug test...');
    
    // Enable comprehensive console logging
    page.on('console', msg => {
      if (msg.text().includes('🔍') || msg.text().includes('✅') || msg.text().includes('❌')) {
        console.log(`[${msg.type()}] ${msg.text()}`);
      }
    });

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
    await page.locator('#phone-number').fill('+1234567890');

    // Find the Send Code button
    const sendCodeBtn = page.locator('#send-code-btn');
    await expect(sendCodeBtn).toBeVisible();

    // Get button position and find what's blocking it
    const buttonInfo = await sendCodeBtn.evaluate(el => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Find all elements at the button's center point
      const elementAtPoint = document.elementFromPoint(centerX, centerY);
      const allElementsAtPoint = document.elementsFromPoint(centerX, centerY);
      
      return {
        buttonRect: rect,
        centerX,
        centerY,
        elementAtPoint: elementAtPoint ? {
          tagName: elementAtPoint.tagName,
          id: elementAtPoint.id,
          className: elementAtPoint.className,
          zIndex: window.getComputedStyle(elementAtPoint).zIndex,
          pointerEvents: window.getComputedStyle(elementAtPoint).pointerEvents
        } : null,
        allElementsAtPoint: allElementsAtPoint.map(el => ({
          tagName: el.tagName,
          id: el.id,
          className: el.className,
          zIndex: window.getComputedStyle(el).zIndex,
          pointerEvents: window.getComputedStyle(el).pointerEvents
        }))
      };
    });

    console.log('🔍 Button position and blocking elements:', JSON.stringify(buttonInfo, null, 2));

    // Check all modals and their states
    const modalStates = await page.evaluate(() => {
      const industryModal = document.getElementById('industry-auth-modal');
      const twoFAModal = document.getElementById('2fa-modal');
      
      return {
        industryModal: industryModal ? {
          visible: !industryModal.classList.contains('hidden'),
          zIndex: window.getComputedStyle(industryModal).zIndex,
          pointerEvents: window.getComputedStyle(industryModal).pointerEvents,
          display: window.getComputedStyle(industryModal).display,
          hasDisablePointer: industryModal.classList.contains('disable-pointer')
        } : null,
        twoFAModal: twoFAModal ? {
          visible: !twoFAModal.classList.contains('hidden'),
          zIndex: window.getComputedStyle(twoFAModal).zIndex,
          pointerEvents: window.getComputedStyle(twoFAModal).pointerEvents,
          display: window.getComputedStyle(twoFAModal).display
        } : null
      };
    });

    console.log('🔍 Modal states:', JSON.stringify(modalStates, null, 2));
  });
});
