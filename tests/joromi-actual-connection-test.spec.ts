import { test, expect } from '@playwright/test';

test.describe('JoRoMi Actual Connection Error Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the contact page
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
  });

  test('should reproduce the actual connection error scenario', async ({ page }) => {
    // Monitor console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Monitor network requests
    const networkRequests: string[] = [];
    page.on('request', request => {
      if (request.url().includes('joromi') || request.url().includes('api/v1/joromi')) {
        networkRequests.push(`${request.method()} ${request.url()}`);
      }
    });

    // Monitor network responses
    const networkResponses: { url: string; status: number; body?: string }[] = [];
    page.on('response', response => {
      if (response.url().includes('joromi') || response.url().includes('api/v1/joromi')) {
        networkResponses.push({
          url: response.url(),
          status: response.status()
        });
      }
    });

    // Click the "Start Chat with JoRoMi" button
    await page.click('button:has-text("Start Chat with JoRoMi")');
    
    // Wait for the request to complete
    await page.waitForTimeout(5000);
    
    // Log what we found
    console.log('Console Errors:', consoleErrors);
    console.log('Network Requests:', networkRequests);
    console.log('Network Responses:', networkResponses);
    
    // Check if we can see any error messages on the page
    const errorMessages = await page.locator('text=Connection Error').count();
    const unableToStartMessages = await page.locator('text=Unable to start JoRoMi chat').count();
    const pleaseTryAgainMessages = await page.locator('text=Please try again').count();
    
    console.log('Error message counts:', {
      connectionError: errorMessages,
      unableToStart: unableToStartMessages,
      pleaseTryAgain: pleaseTryAgainMessages
    });
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/joromi-connection-debug.png' });
    
    // Check if the chat widget is still visible
    const chatWidget = page.locator('#joromi-chat-widget');
    await expect(chatWidget).toBeVisible();
    
    // Check if there are any error states visible
    const errorStates = await page.locator('[class*="error"], [class*="Error"]').count();
    console.log('Error state elements found:', errorStates);
  });

  test('should test the actual JoRoMi API endpoint', async ({ page }) => {
    // Test the actual API endpoint directly
    const response = await page.request.get('/api/v1/joromi/sessions');
    console.log('API Response Status:', response.status());
    console.log('API Response Headers:', await response.allHeaders());
    
    if (response.status() !== 200) {
      const responseText = await response.text();
      console.log('API Error Response:', responseText);
    } else {
      const responseJson = await response.json();
      console.log('API Success Response:', responseJson);
    }
  });

  test('should check for specific error messages in the page content', async ({ page }) => {
    // Get the page content and search for error-related text
    const pageContent = await page.content();
    
    // Look for common error patterns
    const errorPatterns = [
      'Connection Error',
      'Unable to start JoRoMi chat',
      'Please try again',
      'Service unavailable',
      'Network error',
      'Timeout',
      'Failed to connect',
      'Error starting chat',
      'JoRoMi service unavailable'
    ];
    
    const foundErrors: string[] = [];
    for (const pattern of errorPatterns) {
      if (pageContent.includes(pattern)) {
        foundErrors.push(pattern);
      }
    }
    
    console.log('Found error patterns in page content:', foundErrors);
    
    // Also check for any JavaScript errors that might be displayed
    const jsErrors = await page.evaluate(() => {
      const errorElements = document.querySelectorAll('[class*="error"], [class*="Error"], [id*="error"], [id*="Error"]');
      return Array.from(errorElements).map(el => el.textContent);
    });
    
    console.log('JavaScript error elements:', jsErrors);
  });

  test('should monitor the chat initialization process step by step', async ({ page }) => {
    // Set up detailed monitoring
    const steps: string[] = [];
    
    // Monitor all console messages
    page.on('console', msg => {
      steps.push(`Console ${msg.type()}: ${msg.text()}`);
    });
    
    // Monitor all network activity
    page.on('request', request => {
      steps.push(`Request: ${request.method()} ${request.url()}`);
    });
    
    page.on('response', response => {
      steps.push(`Response: ${response.status()} ${response.url()}`);
    });
    
    // Click the button and monitor the process
    await page.click('button:has-text("Start Chat with JoRoMi")');
    
    // Wait and collect all the steps
    await page.waitForTimeout(3000);
    
    console.log('Step-by-step process:');
    steps.forEach((step, index) => {
      console.log(`${index + 1}. ${step}`);
    });
    
    // Check the final state of the chat widget
    const chatWidget = page.locator('#joromi-chat-widget');
    const widgetHTML = await chatWidget.innerHTML();
    console.log('Final chat widget HTML:', widgetHTML);
  });
});
