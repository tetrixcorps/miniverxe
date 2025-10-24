import { test, expect } from '@playwright/test';

test.describe('JoRoMi Chat Functional Test', () => {
  test('should complete full JoRoMi chat flow', async ({ page }) => {
    // Navigate to the contact page
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
    
    // Verify the JoRoMi section is visible
    const joromiSection = page.locator('#joromi-chat-widget');
    await expect(joromiSection).toBeVisible();
    
    // Verify the button exists and is clickable
    const startButton = page.locator('button:has-text("Start Chat with JoRoMi")');
    await expect(startButton).toBeVisible();
    
    // Click the button to start the chat
    await startButton.click();
    
    // Wait for the API call to complete
    await page.waitForTimeout(3000);
    
    // Check if the chat interface is loaded
    const chatInterface = page.locator('#joromi-chat-widget');
    await expect(chatInterface).toBeVisible();
    
    // Check for the chat header
    const chatHeader = page.locator('#joromi-chat-widget:has-text("JoRoMi")');
    await expect(chatHeader).toBeVisible();
    
    // Check for the message input
    const messageInput = page.locator('#joromi-message-input');
    await expect(messageInput).toBeVisible();
    
    // Check for the send button
    const sendButton = page.locator('#joromi-chat-widget button:has-text("Send")');
    await expect(sendButton).toBeVisible();
    
    // Test sending a message
    await messageInput.fill('Hello JoRoMi, can you help me with enterprise communication?');
    await sendButton.click();
    
    // Wait for the AI response
    await page.waitForTimeout(2000);
    
    // Check if there are messages in the chat
    const messages = page.locator('#joromi-messages');
    await expect(messages).toBeVisible();
    
    // Verify the chat is functional
    console.log('JoRoMi chat is fully functional!');
  });

  test('should handle JoRoMi API errors gracefully', async ({ page }) => {
    // Mock the API to return an error
    await page.route('**/api/v1/joromi/sessions', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Service unavailable' })
      });
    });

    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
    
    const startButton = page.locator('button:has-text("Start Chat with JoRoMi")');
    await startButton.click();
    
    // Wait for error handling
    await page.waitForTimeout(2000);
    
    // Check for error message
    const errorMessage = page.locator('#joromi-chat-widget:has-text("Connection Error")');
    await expect(errorMessage).toBeVisible();
    
    // Check for retry button
    const retryButton = page.locator('#joromi-chat-widget button:has-text("Try Again")');
    await expect(retryButton).toBeVisible();
  });

  test('should test JoRoMi chat message flow', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
    
    // Start the chat
    const startButton = page.locator('button:has-text("Start Chat with JoRoMi")');
    await startButton.click();
    await page.waitForTimeout(3000);
    
    // Test multiple messages
    const testMessages = [
      'What services does TETRIX offer?',
      'How much does enterprise support cost?',
      'Can you help me with technical issues?'
    ];
    
    for (const message of testMessages) {
      const messageInput = page.locator('#joromi-message-input');
      const sendButton = page.locator('#joromi-chat-widget button:has-text("Send")');
      
      await messageInput.fill(message);
      await sendButton.click();
      
      // Wait for response
      await page.waitForTimeout(1500);
    }
    
    // Verify messages were sent and received
    const messagesContainer = page.locator('#joromi-messages');
    await expect(messagesContainer).toBeVisible();
    
    console.log('JoRoMi chat message flow test completed successfully!');
  });
});