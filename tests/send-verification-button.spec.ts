import { test, expect } from '@playwright/test';

test.describe('Send Verification Button - Telnyx API Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the landing page
    await page.goto('/');
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    
    // Click the Client Login button to open the modal
    const clientLoginBtn = page.locator('#client-login-2fa-btn');
    await expect(clientLoginBtn).toBeVisible();
    await clientLoginBtn.click();
    
    // Wait for the modal to appear
    const modal = page.locator('#industry-auth-modal');
    await expect(modal).toBeVisible();
    
    // Click "Continue with 2FA" to proceed to 2FA modal
    const continueBtn = page.locator('button:has-text("Continue with 2FA")');
    await expect(continueBtn).toBeVisible();
    await continueBtn.click();
    
    // Wait for 2FA modal to appear
    const twoFAModal = page.locator('#2fa-modal');
    await expect(twoFAModal).toBeVisible();
  });

  test('should display Send Verification button and form elements', async ({ page }) => {
    // Verify the Send Verification button is visible
    const sendBtn = page.locator('#send-code-btn');
    await expect(sendBtn).toBeVisible();
    await expect(sendBtn).toHaveText('Send Verification Code');
    
    // Verify phone number input is present
    const phoneInput = page.locator('#phone-number');
    await expect(phoneInput).toBeVisible();
    await expect(phoneInput).toHaveAttribute('placeholder', '+1 (555) 123-4567');
    
    // Verify verification method selector is present
    const methodSelect = page.locator('#verification-method');
    await expect(methodSelect).toBeVisible();
    
    // Verify method options are present
    await expect(page.locator('option[value="sms"]')).toBeVisible();
    await expect(page.locator('option[value="voice"]')).toBeVisible();
    await expect(page.locator('option[value="whatsapp"]')).toBeVisible();
  });

  test('should validate phone number before sending verification', async ({ page }) => {
    // Try to submit with empty phone number
    const sendBtn = page.locator('#send-code-btn');
    await sendBtn.click();
    
    // Should show error for empty phone number
    const errorMessage = page.locator('.error-message, [role="alert"]');
    await expect(errorMessage).toBeVisible();
  });

  test('should format phone number as user types', async ({ page }) => {
    const phoneInput = page.locator('#phone-number');
    
    // Test US number formatting
    await phoneInput.fill('15551234567');
    await expect(phoneInput).toHaveValue('+1 (555) 123-4567');
    
    // Test UK number formatting
    await phoneInput.clear();
    await phoneInput.fill('442079460958');
    await expect(phoneInput).toHaveValue('+44 20 7946 0958');
    
    // Test France number formatting
    await phoneInput.clear();
    await phoneInput.fill('33123456789');
    await expect(phoneInput).toHaveValue('+33 1 23 45 67 89');
  });

  test('should call Telnyx Verify API when Send Verification is clicked', async ({ page }) => {
    // Set up network request interception
    const apiRequests: any[] = [];
    
    page.on('request', request => {
      if (request.url().includes('/api/v2/2fa/initiate')) {
        apiRequests.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
          postData: request.postData()
        });
      }
    });

    // Fill in valid phone number
    const phoneInput = page.locator('#phone-number');
    await phoneInput.fill('+15551234567');
    
    // Select verification method
    const methodSelect = page.locator('#verification-method');
    await methodSelect.selectOption('sms');
    
    // Click Send Verification button
    const sendBtn = page.locator('#send-code-btn');
    await sendBtn.click();
    
    // Wait for API request to be made
    await page.waitForTimeout(2000);
    
    // Verify API request was made
    expect(apiRequests.length).toBeGreaterThan(0);
    
    const request = apiRequests[0];
    expect(request.method).toBe('POST');
    expect(request.url).toContain('/api/v2/2fa/initiate');
    
    // Verify request body contains correct data
    const requestBody = JSON.parse(request.postData || '{}');
    expect(requestBody.phoneNumber).toBe('+15551234567');
    expect(requestBody.method).toBe('sms');
    expect(requestBody.userAgent).toBeDefined();
    expect(requestBody.sessionId).toBeDefined();
  });

  test('should handle API response and show success state', async ({ page }) => {
    // Mock successful API response
    await page.route('**/api/v2/2fa/initiate', async route => {
      const response = {
        success: true,
        verificationId: 'test_verification_123',
        phoneNumber: '+15551234567',
        method: 'sms',
        status: 'pending',
        expiresAt: new Date(Date.now() + 300000).toISOString(),
        estimatedDelivery: 30
      };
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response)
      });
    });

    // Fill in phone number and submit
    const phoneInput = page.locator('#phone-number');
    await phoneInput.fill('+15551234567');
    
    const sendBtn = page.locator('#send-code-btn');
    await sendBtn.click();
    
    // Wait for response and verify success state
    await page.waitForTimeout(1000);
    
    // Should show code input form
    const codeInput = page.locator('#verification-code');
    await expect(codeInput).toBeVisible();
    
    // Should show phone number in display
    const phoneDisplay = page.locator('#phone-display');
    await expect(phoneDisplay).toContainText('+1 (555) 123-4567');
    
    // Should show resend button
    const resendBtn = page.locator('#resend-code-btn');
    await expect(resendBtn).toBeVisible();
  });

  test('should handle API error responses gracefully', async ({ page }) => {
    // Mock API error response
    await page.route('**/api/v2/2fa/initiate', async route => {
      const errorResponse = {
        success: false,
        error: 'Invalid phone number format',
        status: 400,
        details: {
          message: 'Phone number must be in E.164 format',
          type: 'validation_error',
          field: 'phoneNumber'
        }
      };
      
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify(errorResponse)
      });
    });

    // Fill in invalid phone number
    const phoneInput = page.locator('#phone-number');
    await phoneInput.fill('123'); // Invalid format
    
    const sendBtn = page.locator('#send-code-btn');
    await sendBtn.click();
    
    // Wait for error response
    await page.waitForTimeout(1000);
    
    // Should show error message
    const errorMessage = page.locator('.error-message, [role="alert"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Invalid phone number format');
  });

  test('should show loading state during API call', async ({ page }) => {
    // Mock delayed API response
    await page.route('**/api/v2/2fa/initiate', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
      
      const response = {
        success: true,
        verificationId: 'test_verification_123',
        phoneNumber: '+15551234567',
        method: 'sms',
        status: 'pending'
      };
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response)
      });
    });

    // Fill in phone number
    const phoneInput = page.locator('#phone-number');
    await phoneInput.fill('+15551234567');
    
    // Click send button
    const sendBtn = page.locator('#send-code-btn');
    await sendBtn.click();
    
    // Verify loading state is shown
    const spinner = page.locator('#send-code-spinner');
    await expect(spinner).toBeVisible();
    
    // Verify button text changes
    const buttonText = page.locator('#send-code-text');
    await expect(buttonText).toHaveText('Sending...');
    
    // Wait for API call to complete
    await page.waitForTimeout(3000);
    
    // Verify loading state is removed
    await expect(spinner).toBeHidden();
  });

  test('should support different verification methods', async ({ page }) => {
    const phoneInput = page.locator('#phone-number');
    await phoneInput.fill('+15551234567');
    
    // Test SMS method
    const methodSelect = page.locator('#verification-method');
    await methodSelect.selectOption('sms');
    
    // Mock API response for SMS
    await page.route('**/api/v2/2fa/initiate', async route => {
      const requestBody = JSON.parse(route.request().postData() || '{}');
      
      const response = {
        success: true,
        verificationId: 'test_verification_123',
        phoneNumber: '+15551234567',
        method: requestBody.method,
        status: 'pending'
      };
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response)
      });
    });
    
    const sendBtn = page.locator('#send-code-btn');
    await sendBtn.click();
    
    await page.waitForTimeout(1000);
    
    // Verify SMS was selected
    const codeInput = page.locator('#verification-code');
    await expect(codeInput).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network error
    await page.route('**/api/v2/2fa/initiate', async route => {
      await route.abort('failed');
    });

    // Fill in phone number
    const phoneInput = page.locator('#phone-number');
    await phoneInput.fill('+15551234567');
    
    const sendBtn = page.locator('#send-code-btn');
    await sendBtn.click();
    
    // Wait for error to be handled
    await page.waitForTimeout(1000);
    
    // Should show network error message
    const errorMessage = page.locator('.error-message, [role="alert"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Network error');
  });

  test('should validate phone number format before API call', async ({ page }) => {
    // Test with invalid phone number format
    const phoneInput = page.locator('#phone-number');
    await phoneInput.fill('123'); // Too short
    
    const sendBtn = page.locator('#send-code-btn');
    await sendBtn.click();
    
    // Should show validation error without making API call
    const errorMessage = page.locator('.error-message, [role="alert"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Invalid phone number format');
  });

  test('should handle international phone numbers correctly', async ({ page }) => {
    // Test with UK number
    const phoneInput = page.locator('#phone-number');
    await phoneInput.fill('+442079460958');
    
    // Mock API response
    await page.route('**/api/v2/2fa/initiate', async route => {
      const requestBody = JSON.parse(route.request().postData() || '{}');
      
      expect(requestBody.phoneNumber).toBe('+442079460958');
      
      const response = {
        success: true,
        verificationId: 'test_verification_123',
        phoneNumber: '+442079460958',
        method: 'sms',
        status: 'pending'
      };
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response)
      });
    });
    
    const sendBtn = page.locator('#send-code-btn');
    await sendBtn.click();
    
    await page.waitForTimeout(1000);
    
    // Should successfully process international number
    const codeInput = page.locator('#verification-code');
    await expect(codeInput).toBeVisible();
  });

  test('should show proper error messages for different validation failures', async ({ page }) => {
    const phoneInput = page.locator('#phone-number');
    const sendBtn = page.locator('#send-code-btn');
    
    // Test empty phone number
    await phoneInput.fill('');
    await sendBtn.click();
    
    let errorMessage = page.locator('.error-message, [role="alert"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Phone number is required');
    
    // Test invalid US number (wrong length)
    await phoneInput.fill('+15551234'); // Too short
    await sendBtn.click();
    
    errorMessage = page.locator('.error-message, [role="alert"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('US/Canada numbers must be 11 digits');
    
    // Test number starting with 0
    await phoneInput.fill('+15550123456'); // Starts with 0
    await sendBtn.click();
    
    errorMessage = page.locator('.error-message, [role="alert"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Invalid phone number format');
  });
});
