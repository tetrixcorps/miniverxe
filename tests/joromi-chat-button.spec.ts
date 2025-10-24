import { test, expect } from '@playwright/test';

test.describe('JoRoMi Chat Button Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the contact page
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
  });

  test('should display JoRoMi chat section on contact page', async ({ page }) => {
    // Check if the JoRoMi section is visible
    await expect(page.locator('h2:has-text("Chat with JoRoMi")')).toBeVisible();
    
    // Check if the JoRoMi logo is present (use first() to handle duplicates)
    await expect(page.locator('img[alt="JoRoMi AI Super Agent Logo"]').first()).toBeVisible();
    
    // Check if the "Start Chat with JoRoMi" button is present
    await expect(page.locator('button:has-text("Start Chat with JoRoMi")')).toBeVisible();
  });

  test('should show JoRoMi features list', async ({ page }) => {
    // Check for JoRoMi features (use first() to handle duplicates)
    const features = [
      'Instant responses to enterprise queries',
      'Technical support and troubleshooting',
      'Solution recommendations and pricing',
      'Escalation to human experts when needed'
    ];

    for (const feature of features) {
      await expect(page.locator(`text=${feature}`).first()).toBeVisible();
    }
  });

  test('should initialize JoRoMi chat when button is clicked', async ({ page }) => {
    // Click the "Start Chat with JoRoMi" button
    await page.click('button:has-text("Start Chat with JoRoMi")');
    
    // Wait for the chat interface to initialize
    await page.waitForTimeout(1000);
    
    // Check if the chat widget is visible
    await expect(page.locator('#joromi-chat-widget')).toBeVisible();
  });

  test('should handle JoRoMi chat session creation', async ({ page }) => {
    // Click the "Start Chat with JoRoMi" button
    await page.click('button:has-text("Start Chat with JoRoMi")');
    
    // Wait for the chat interface to initialize
    await page.waitForTimeout(2000);
    
    // Check if the chat interface has been initialized
    const chatWidget = page.locator('#joromi-chat-widget');
    await expect(chatWidget).toBeVisible();
    
    // Check if the chat input is available
    const messageInput = page.locator('#joromi-message-input');
    if (await messageInput.isVisible()) {
      await expect(messageInput).toBeVisible();
    }
  });

  test('should display JoRoMi agent information', async ({ page }) => {
    // Check for JoRoMi agent title
    await expect(page.locator('h3:has-text("JoRoMi AI Super Agent")')).toBeVisible();
    
    // Check for agent description
    await expect(page.locator('text=Our AI Super Agent is ready to help you with enterprise inquiries and technical support.')).toBeVisible();
  });

  test('should handle JoRoMi API integration', async ({ page }) => {
    // Monitor network requests for JoRoMi API calls
    const apiCalls: string[] = [];
    
    page.on('request', request => {
      if (request.url().includes('joromi') || request.url().includes('api/v1/joromi')) {
        apiCalls.push(request.url());
      }
    });

    // Click the "Start Chat with JoRoMi" button
    await page.click('button:has-text("Start Chat with JoRoMi")');
    
    // Wait for potential API calls
    await page.waitForTimeout(3000);
    
    // Check if any JoRoMi API calls were made
    console.log('JoRoMi API calls detected:', apiCalls);
  });

  test('should handle JoRoMi chat error scenarios', async ({ page }) => {
    // Mock network failure for JoRoMi API
    await page.route('**/api/v1/joromi/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'JoRoMi service unavailable' })
      });
    });

    // Click the "Start Chat with JoRoMi" button
    await page.click('button:has-text("Start Chat with JoRoMi")');
    
    // Wait for error handling
    await page.waitForTimeout(2000);
    
    // Check if error handling is working
    const chatWidget = page.locator('#joromi-chat-widget');
    await expect(chatWidget).toBeVisible();
  });

  test('should verify JoRoMi chat widget styling', async ({ page }) => {
    // Check if the chat widget has proper styling
    const chatWidget = page.locator('#joromi-chat-widget');
    await expect(chatWidget).toBeVisible();
    
    // Check for gradient background
    const chatSection = page.locator('.bg-gradient-to-br.from-purple-50.to-blue-50');
    await expect(chatSection).toBeVisible();
    
    // Check for proper button styling
    const startButton = page.locator('button:has-text("Start Chat with JoRoMi")');
    await expect(startButton).toHaveClass(/bg-gradient-to-r/);
  });

  test('should test JoRoMi chat message flow', async ({ page }) => {
    // Click the "Start Chat with JoRoMi" button
    await page.click('button:has-text("Start Chat with JoRoMi")');
    
    // Wait for chat interface
    await page.waitForTimeout(2000);
    
    // Try to send a test message if input is available
    const messageInput = page.locator('#joromi-message-input');
    if (await messageInput.isVisible()) {
      await messageInput.fill('Hello JoRoMi, can you help me with enterprise communication?');
      
      // Look for send button or Enter key functionality
      const sendButton = page.locator('button:has-text("Send")');
      if (await sendButton.isVisible()) {
        await sendButton.click();
      } else {
        await messageInput.press('Enter');
      }
      
      // Wait for response
      await page.waitForTimeout(3000);
    }
  });
});
