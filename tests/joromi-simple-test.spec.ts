import { test, expect } from '@playwright/test';

test.describe('JoRoMi Button Simple Test', () => {
  test('should test JoRoMi button functionality', async ({ page }) => {
    // Navigate to the contact page
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
    
    // Check if the button exists
    const button = page.locator('button:has-text("Start Chat with JoRoMi")');
    await expect(button).toBeVisible();
    
    // Check if the function exists in the global scope
    const functionExists = await page.evaluate(() => {
      return typeof window.startJoRoMiChat === 'function';
    });
    
    console.log('startJoRoMiChat function exists:', functionExists);
    expect(functionExists).toBe(true);
    
    // Click the button and check for any errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await button.click();
    
    // Wait a bit for any async operations
    await page.waitForTimeout(2000);
    
    // Check for JavaScript errors
    if (errors.length > 0) {
      console.log('JavaScript errors found:', errors);
    }
    
    // Check if the chat interface changed (loading state or error state)
    const chatWidget = page.locator('#joromi-chat-widget');
    await expect(chatWidget).toBeVisible();
    
    // Check if there's a loading spinner or error message in the JoRoMi widget
    const joromiLoadingSpinner = page.locator('#joromi-chat-widget .animate-spin');
    const errorMessage = page.locator('#joromi-chat-widget:has-text("Connection Error")');
    
    if (await joromiLoadingSpinner.isVisible()) {
      console.log('JoRoMi loading spinner is visible - API call is in progress');
    } else if (await errorMessage.isVisible()) {
      console.log('JoRoMi error message is visible - API call failed');
    } else {
      console.log('No JoRoMi loading or error state detected');
    }
  });
});
