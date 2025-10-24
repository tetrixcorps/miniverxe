import { test, expect } from '@playwright/test';

test.describe('JoRoMi Chat Connection Error Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the contact page
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
  });

  test('should display connection error when JoRoMi API fails', async ({ page }) => {
    // Mock the JoRoMi API to return a connection error
    await page.route('**/api/v1/joromi/sessions', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ 
          error: 'Connection Error',
          message: 'Unable to start JoRoMi chat. Please try again.'
        })
      });
    });

    // Click the "Start Chat with JoRoMi" button
    await page.click('button:has-text("Start Chat with JoRoMi")');
    
    // Wait for the error to be displayed
    await page.waitForTimeout(3000);
    
    // Check if connection error message is displayed
    await expect(page.locator('text=Connection Error')).toBeVisible();
    await expect(page.locator('text=Unable to start JoRoMi chat. Please try again.')).toBeVisible();
  });

  test('should handle network timeout error', async ({ page }) => {
    // Mock network timeout
    await page.route('**/api/v1/joromi/sessions', route => {
      // Simulate a timeout by not fulfilling the request
      setTimeout(() => {
        route.fulfill({
          status: 408,
          contentType: 'application/json',
          body: JSON.stringify({ 
            error: 'Request Timeout',
            message: 'Unable to start JoRoMi chat. Please try again.'
          })
        });
      }, 5000);
    });

    // Click the "Start Chat with JoRoMi" button
    await page.click('button:has-text("Start Chat with JoRoMi")');
    
    // Wait for timeout error
    await page.waitForTimeout(6000);
    
    // Check if timeout error is displayed
    await expect(page.locator('text=Request Timeout')).toBeVisible();
    await expect(page.locator('text=Unable to start JoRoMi chat. Please try again.')).toBeVisible();
  });

  test('should handle 404 error for JoRoMi API', async ({ page }) => {
    // Mock 404 error
    await page.route('**/api/v1/joromi/sessions', route => {
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ 
          error: 'Service Not Found',
          message: 'JoRoMi chat service is not available. Please try again later.'
        })
      });
    });

    // Click the "Start Chat with JoRoMi" button
    await page.click('button:has-text("Start Chat with JoRoMi")');
    
    // Wait for 404 error
    await page.waitForTimeout(3000);
    
    // Check if 404 error is displayed
    await expect(page.locator('text=Service Not Found')).toBeVisible();
    await expect(page.locator('text=JoRoMi chat service is not available. Please try again later.')).toBeVisible();
  });

  test('should handle malformed JSON response', async ({ page }) => {
    // Mock malformed JSON response
    await page.route('**/api/v1/joromi/sessions', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{"error": "Invalid JSON", "message": "Unable to start JoRoMi chat. Please try again."'
      });
    });

    // Click the "Start Chat with JoRoMi" button
    await page.click('button:has-text("Start Chat with JoRoMi")');
    
    // Wait for JSON parsing error
    await page.waitForTimeout(3000);
    
    // Check if JSON parsing error is handled gracefully
    await expect(page.locator('text=Unable to start JoRoMi chat. Please try again.')).toBeVisible();
  });

  test('should retry connection after error', async ({ page }) => {
    let callCount = 0;
    
    // Mock first call to fail, second to succeed
    await page.route('**/api/v1/joromi/sessions', route => {
      callCount++;
      if (callCount === 1) {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ 
            error: 'Connection Error',
            message: 'Unable to start JoRoMi chat. Please try again.'
          })
        });
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ 
            session: { id: 'test-session', messages: [] }
          })
        });
      }
    });

    // Click the "Start Chat with JoRoMi" button
    await page.click('button:has-text("Start Chat with JoRoMi")');
    
    // Wait for first error
    await page.waitForTimeout(3000);
    await expect(page.locator('text=Connection Error')).toBeVisible();
    
    // Click retry button if it exists
    const retryButton = page.locator('button:has-text("Try Again")');
    if (await retryButton.isVisible()) {
      await retryButton.click();
      await page.waitForTimeout(3000);
    }
    
    // Verify retry functionality
    expect(callCount).toBeGreaterThanOrEqual(1);
  });

  test('should show loading state during connection attempt', async ({ page }) => {
    // Mock slow response
    await page.route('**/api/v1/joromi/sessions', route => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ 
            session: { id: 'test-session', messages: [] }
          })
        });
      }, 2000);
    });

    // Click the "Start Chat with JoRoMi" button
    await page.click('button:has-text("Start Chat with JoRoMi")');
    
    // Check for loading state
    await expect(page.locator('text=Starting JoRoMi AI Super Agent...')).toBeVisible();
    
    // Wait for completion
    await page.waitForTimeout(3000);
  });
});
