import { test, expect } from '@playwright/test';

test.describe('JoRoMi Button Debug', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the contact page
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
  });

  test('should find and click the JoRoMi button', async ({ page }) => {
    // Take a screenshot first to see the page state
    await page.screenshot({ path: 'joromi-page-before-click.png' });
    
    // Check if the JoRoMi section exists
    const joromiSection = page.locator('#joromi-chat-widget');
    await expect(joromiSection).toBeVisible();
    
    // Look for the button with different selectors
    const buttonSelectors = [
      'button:has-text("Start Chat with JoRoMi")',
      'button:has-text("Start Chat with JoRoMi")',
      '[onclick="startJoRoMiChat()"]',
      'button[onclick*="startJoRoMiChat"]'
    ];
    
    let buttonFound = false;
    for (const selector of buttonSelectors) {
      try {
        const button = page.locator(selector);
        if (await button.isVisible()) {
          console.log(`Found button with selector: ${selector}`);
          await button.click();
          buttonFound = true;
          break;
        }
      } catch (e) {
        console.log(`Selector ${selector} failed: ${e.message}`);
      }
    }
    
    if (!buttonFound) {
      // Log all buttons on the page
      const allButtons = await page.locator('button').all();
      console.log(`Found ${allButtons.length} buttons on the page:`);
      for (let i = 0; i < allButtons.length; i++) {
        const text = await allButtons[i].textContent();
        const onclick = await allButtons[i].getAttribute('onclick');
        console.log(`Button ${i}: "${text}" onclick="${onclick}"`);
      }
    }
    
    expect(buttonFound).toBe(true);
    
    // Wait a bit and take another screenshot
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'joromi-page-after-click.png' });
  });

  test('should check if startJoRoMiChat function exists', async ({ page }) => {
    // Check if the function is defined in the global scope
    const functionExists = await page.evaluate(() => {
      return typeof window.startJoRoMiChat === 'function';
    });
    
    console.log('startJoRoMiChat function exists:', functionExists);
    
    // Check for any JavaScript errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(1000);
    
    if (errors.length > 0) {
      console.log('JavaScript errors found:', errors);
    }
    
    expect(functionExists).toBe(true);
  });

  test('should test API endpoint availability', async ({ page }) => {
    // Test if the JoRoMi API endpoint is accessible
    const response = await page.request.get('/api/v1/joromi/sessions');
    console.log('API response status:', response.status());
    
    if (response.status() !== 200) {
      const body = await response.text();
      console.log('API error response:', body);
    }
  });
});
