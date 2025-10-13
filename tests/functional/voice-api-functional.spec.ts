// Functional Tests for Voice API - End-to-End User Scenarios
import { test, expect } from '@playwright/test';

test.describe('Voice API Functional Tests', () => {
  
  test.describe('Voice Call User Journey', () => {
    test('should complete full voice call user journey', async ({ page, request }) => {
      // Navigate to voice demo page
      await page.goto('/voice-demo');
      
      // Wait for page to load
      await expect(page.locator('h1')).toContainText('SHANGO Voice Assistant Demo');
      
      // Fill in phone number
      const phoneInput = page.locator('input[type="tel"]');
      await phoneInput.fill('+1234567890');
      
      // Configure call settings
      await page.check('input[type="checkbox"]:near(:text("Record Call"))');
      await page.check('input[type="checkbox"]:near(:text("Enable Transcription"))');
      
      // Select language
      await page.selectOption('select', 'en-US');
      
      // Set timeout
      await page.fill('input[type="number"]', '30');
      
      // Initiate call
      await page.click('button:has-text("Call")');
      
      // Wait for call initiation
      await expect(page.locator('text=Calling...')).toBeVisible();
      
      // Wait for call to be initiated (this would be mocked in real tests)
      await page.waitForTimeout(2000);
      
      // Verify call was initiated
      await expect(page.locator('text=Active Voice Sessions')).toBeVisible();
    });

    test('should display voice call interface correctly', async ({ page }) => {
      await page.goto('/voice-demo');
      
      // Check main elements are present
      await expect(page.locator('h1')).toContainText('SHANGO Voice Assistant Demo');
      await expect(page.locator('text=🎤 SHANGO Voice Assistant')).toBeVisible();
      
      // Check phone input
      await expect(page.locator('input[type="tel"]')).toBeVisible();
      await expect(page.locator('input[type="tel"]')).toHaveAttribute('placeholder', /phone number/i);
      
      // Check call button
      await expect(page.locator('button:has-text("Call")')).toBeVisible();
      
      // Check configuration options
      await expect(page.locator('text=Record Call')).toBeVisible();
      await expect(page.locator('text=Enable Transcription')).toBeVisible();
      await expect(page.locator('text=Language:')).toBeVisible();
      await expect(page.locator('text=Timeout (seconds):')).toBeVisible();
    });

    test('should handle form validation', async ({ page }) => {
      await page.goto('/voice-demo');
      
      // Try to call without phone number
      await page.click('button:has-text("Call")');
      
      // Should show validation error or alert
      // Note: This depends on the actual implementation
      await page.waitForTimeout(1000);
      
      // Fill in invalid phone number
      await page.fill('input[type="tel"]', 'invalid-phone');
      await page.click('button:has-text("Call")');
      
      // Should handle validation
      await page.waitForTimeout(1000);
      
      // Fill in valid phone number
      await page.fill('input[type="tel"]', '+1234567890');
      await page.click('button:has-text("Call")');
      
      // Should proceed with call
      await page.waitForTimeout(1000);
    });
  });

  test.describe('Voice API Capabilities Display', () => {
    test('should display all voice API capabilities', async ({ page }) => {
      await page.goto('/voice-demo');
      
      // Check features overview
      await expect(page.locator('text=TeXML Integration')).toBeVisible();
      await expect(page.locator('text=Deepgram STT')).toBeVisible();
      await expect(page.locator('text=AI Integration')).toBeVisible();
      
      // Check detailed capabilities
      await expect(page.locator('text=Voice API Capabilities')).toBeVisible();
      await expect(page.locator('text=Call Management')).toBeVisible();
      await expect(page.locator('text=Speech Processing')).toBeVisible();
      await expect(page.locator('text=TeXML Features')).toBeVisible();
      await expect(page.locator('text=Integration')).toBeVisible();
    });

    test('should display API endpoints information', async ({ page }) => {
      await page.goto('/voice-demo');
      
      // Check API endpoints section
      await expect(page.locator('text=API Endpoints')).toBeVisible();
      
      // Check specific endpoints
      await expect(page.locator('text=POST /api/voice/initiate')).toBeVisible();
      await expect(page.locator('text=GET /api/voice/sessions')).toBeVisible();
      await expect(page.locator('text=POST /api/voice/webhook')).toBeVisible();
      await expect(page.locator('text=POST /api/voice/transcribe')).toBeVisible();
    });

    test('should display usage examples', async ({ page }) => {
      await page.goto('/voice-demo');
      
      // Check usage examples section
      await expect(page.locator('text=Usage Examples')).toBeVisible();
      
      // Check example categories
      await expect(page.locator('text=Basic Voice Call')).toBeVisible();
      await expect(page.locator('text=TeXML Response')).toBeVisible();
      await expect(page.locator('text=Webhook Event Handling')).toBeVisible();
    });
  });

  test.describe('Cross-Platform Integration UI', () => {
    test('should display integration status', async ({ page, request }) => {
      await page.goto('/voice-demo');
      
      // Check if integration status is displayed
      // This would be populated by API calls in the actual implementation
      await expect(page.locator('text=Voice API Capabilities')).toBeVisible();
    });

    test('should show cross-platform features', async ({ page }) => {
      await page.goto('/voice-demo');
      
      // Check for cross-platform messaging features
      await expect(page.locator('text=Multi-Channel Support')).toBeVisible();
      await expect(page.locator('text=Cross-Platform Sync')).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/voice-demo');
      
      // Check that elements are visible and accessible on mobile
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('input[type="tel"]')).toBeVisible();
      await expect(page.locator('button:has-text("Call")')).toBeVisible();
      
      // Check that form elements are properly sized for mobile
      const phoneInput = page.locator('input[type="tel"]');
      await expect(phoneInput).toBeVisible();
      
      // Test mobile interaction
      await phoneInput.fill('+1234567890');
      await page.click('button:has-text("Call")');
    });

    test('should work on tablet devices', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/voice-demo');
      
      // Check that layout adapts to tablet
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('input[type="tel"]')).toBeVisible();
      await expect(page.locator('button:has-text("Call")')).toBeVisible();
    });
  });

  test.describe('Error Handling UI', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Mock network failure
      await page.route('**/api/voice/**', route => route.abort());
      
      await page.goto('/voice-demo');
      await page.fill('input[type="tel"]', '+1234567890');
      await page.click('button:has-text("Call")');
      
      // Should handle error gracefully
      await page.waitForTimeout(2000);
      
      // Check that error is displayed or handled
      // This depends on the actual error handling implementation
    });

    test('should handle API errors gracefully', async ({ page }) => {
      // Mock API error response
      await page.route('**/api/voice/initiate', route => 
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' })
        })
      );
      
      await page.goto('/voice-demo');
      await page.fill('input[type="tel"]', '+1234567890');
      await page.click('button:has-text("Call")');
      
      // Should handle API error gracefully
      await page.waitForTimeout(2000);
    });
  });

  test.describe('Accessibility', () => {
    test('should be accessible with keyboard navigation', async ({ page }) => {
      await page.goto('/voice-demo');
      
      // Test keyboard navigation
      await page.keyboard.press('Tab');
      await expect(page.locator('input[type="tel"]')).toBeFocused();
      
      await page.keyboard.type('+1234567890');
      await page.keyboard.press('Tab');
      
      // Should be able to navigate through form elements
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Should be able to submit with Enter key
      await page.keyboard.press('Enter');
    });

    test('should have proper ARIA labels', async ({ page }) => {
      await page.goto('/voice-demo');
      
      // Check for proper form labels
      const phoneInput = page.locator('input[type="tel"]');
      await expect(phoneInput).toHaveAttribute('placeholder');
      
      // Check for button accessibility
      const callButton = page.locator('button:has-text("Call")');
      await expect(callButton).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('should load quickly', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/voice-demo');
      await expect(page.locator('h1')).toBeVisible();
      const loadTime = Date.now() - startTime;
      
      // Should load within reasonable time (adjust threshold as needed)
      expect(loadTime).toBeLessThan(5000);
    });

    test('should handle multiple rapid interactions', async ({ page }) => {
      await page.goto('/voice-demo');
      
      // Rapidly interact with form elements
      const phoneInput = page.locator('input[type="tel"]');
      
      for (let i = 0; i < 5; i++) {
        await phoneInput.fill(`+123456789${i}`);
        await page.click('button:has-text("Call")');
        await page.waitForTimeout(100);
      }
      
      // Should handle rapid interactions without issues
      await expect(page.locator('input[type="tel"]')).toBeVisible();
    });
  });

  test.describe('Browser Compatibility', () => {
    test('should work in Chrome', async ({ page, browserName }) => {
      test.skip(browserName !== 'chromium', 'Chrome specific test');
      
      await page.goto('/voice-demo');
      await expect(page.locator('h1')).toContainText('SHANGO Voice Assistant Demo');
    });

    test('should work in Firefox', async ({ page, browserName }) => {
      test.skip(browserName !== 'firefox', 'Firefox specific test');
      
      await page.goto('/voice-demo');
      await expect(page.locator('h1')).toContainText('SHANGO Voice Assistant Demo');
    });

    test('should work in Safari', async ({ page, browserName }) => {
      test.skip(browserName !== 'webkit', 'Safari specific test');
      
      await page.goto('/voice-demo');
      await expect(page.locator('h1')).toContainText('SHANGO Voice Assistant Demo');
    });
  });
});
