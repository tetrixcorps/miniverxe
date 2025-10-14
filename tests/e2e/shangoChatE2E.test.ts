import { test, expect, Page } from '@playwright/test';

test.describe('SHANGO Chat E2E Tests', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    // Navigate to the Contact Us page
    await page.goto('http://localhost:8082/contact');
    await page.waitForLoadState('networkidle');
  });

  test('should display SHANGO chat widget on Contact Us page', async () => {
    // Check if the SHANGO chat widget is visible
    const shangoWidget = page.locator('#shango-chat-widget');
    await expect(shangoWidget).toBeVisible();

    // Check if the initial state shows the start button
    const startButton = page.locator('button:has-text("Start Chat with SHANGO")');
    await expect(startButton).toBeVisible();

    // Check if the SHANGO branding is present
    const shangoTitle = page.locator('h3:has-text("SHANGO AI Super Agent")');
    await expect(shangoTitle).toBeVisible();

    // Check if the features list is displayed
    const featuresList = page.locator('text=Instant responses to enterprise queries');
    await expect(featuresList).toBeVisible();
  });

  test('should start chat session when clicking start button', async () => {
    // Click the start chat button
    const startButton = page.locator('button:has-text("Start Chat with SHANGO")');
    await startButton.click();

    // Wait for the chat interface to load
    await page.waitForTimeout(2000);

    // Check if the chat interface is displayed
    const chatInterface = page.locator('.h-96.flex.flex-col');
    await expect(chatInterface).toBeVisible();

    // Check if the SHANGO header is present
    const shangoHeader = page.locator('text=SHANGO');
    await expect(shangoHeader).toBeVisible();

    // Check if the message input is present
    const messageInput = page.locator('#shango-message-input');
    await expect(messageInput).toBeVisible();

    // Check if the send button is present
    const sendButton = page.locator('button:has-text("Send")');
    await expect(sendButton).toBeVisible();

    // Check if there's a greeting message from SHANGO
    const greetingMessage = page.locator('text=Hello! I\'m SHANGO');
    await expect(greetingMessage).toBeVisible();
  });

  test('should send and receive messages', async () => {
    // Start the chat
    const startButton = page.locator('button:has-text("Start Chat with SHANGO")');
    await startButton.click();
    await page.waitForTimeout(2000);

    // Type a message
    const messageInput = page.locator('#shango-message-input');
    await messageInput.fill('Hello SHANGO!');

    // Send the message
    const sendButton = page.locator('button:has-text("Send")');
    await sendButton.click();

    // Wait for the message to be processed
    await page.waitForTimeout(2000);

    // Check if the user message appears
    const userMessage = page.locator('text=Hello SHANGO!');
    await expect(userMessage).toBeVisible();

    // Check if an AI response appears
    const aiResponse = page.locator('text=SHANGO').first();
    await expect(aiResponse).toBeVisible();
  });

  test('should handle different types of queries', async () => {
    // Start the chat
    const startButton = page.locator('button:has-text("Start Chat with SHANGO")');
    await startButton.click();
    await page.waitForTimeout(2000);

    const testQueries = [
      'What is your pricing?',
      'I have a technical issue',
      'Can I get a demo?',
      'I have a billing question'
    ];

    for (const query of testQueries) {
      // Type the query
      const messageInput = page.locator('#shango-message-input');
      await messageInput.fill(query);

      // Send the message
      const sendButton = page.locator('button:has-text("Send")');
      await sendButton.click();

      // Wait for response
      await page.waitForTimeout(2000);

      // Check if the user message appears
      await expect(page.locator(`text=${query}`)).toBeVisible();

      // Check if an AI response appears
      const aiResponse = page.locator('text=SHANGO').first();
      await expect(aiResponse).toBeVisible();

      // Clear input for next message
      await messageInput.clear();
    }
  });

  test('should handle Enter key to send messages', async () => {
    // Start the chat
    const startButton = page.locator('button:has-text("Start Chat with SHANGO")');
    await startButton.click();
    await page.waitForTimeout(2000);

    // Type a message and press Enter
    const messageInput = page.locator('#shango-message-input');
    await messageInput.fill('Hello SHANGO!');
    await messageInput.press('Enter');

    // Wait for the message to be processed
    await page.waitForTimeout(2000);

    // Check if the user message appears
    const userMessage = page.locator('text=Hello SHANGO!');
    await expect(userMessage).toBeVisible();
  });

  test('should close chat and return to initial state', async () => {
    // Start the chat
    const startButton = page.locator('button:has-text("Start Chat with SHANGO")');
    await startButton.click();
    await page.waitForTimeout(2000);

    // Close the chat
    const closeButton = page.locator('button:has-text("✕")');
    await closeButton.click();

    // Check if we're back to the initial state
    const startButtonAgain = page.locator('button:has-text("Start Chat with SHANGO")');
    await expect(startButtonAgain).toBeVisible();

    // Check if the SHANGO title is still visible
    const shangoTitle = page.locator('h3:has-text("SHANGO AI Super Agent")');
    await expect(shangoTitle).toBeVisible();
  });

  test('should handle multiple chat sessions', async () => {
    // Start first chat
    const startButton = page.locator('button:has-text("Start Chat with SHANGO")');
    await startButton.click();
    await page.waitForTimeout(2000);

    // Send a message
    const messageInput = page.locator('#shango-message-input');
    await messageInput.fill('First message');
    await messageInput.press('Enter');
    await page.waitForTimeout(2000);

    // Close the chat
    const closeButton = page.locator('button:has-text("✕")');
    await closeButton.click();

    // Start second chat
    const startButton2 = page.locator('button:has-text("Start Chat with SHANGO")');
    await startButton2.click();
    await page.waitForTimeout(2000);

    // Send another message
    const messageInput2 = page.locator('#shango-message-input');
    await messageInput2.fill('Second message');
    await messageInput2.press('Enter');
    await page.waitForTimeout(2000);

    // Check if the second message appears
    const secondMessage = page.locator('text=Second message');
    await expect(secondMessage).toBeVisible();
  });

  test('should display error message when chat fails to start', async () => {
    // Mock a failed API response
    await page.route('**/api/v1/shango/sessions', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Internal server error'
        })
      });
    });

    // Try to start the chat
    const startButton = page.locator('button:has-text("Start Chat with SHANGO")');
    await startButton.click();
    await page.waitForTimeout(2000);

    // Check if error message is displayed
    const errorMessage = page.locator('text=Connection Error');
    await expect(errorMessage).toBeVisible();

    // Check if try again button is present
    const tryAgainButton = page.locator('button:has-text("Try Again")');
    await expect(tryAgainButton).toBeVisible();
  });

  test('should handle message sending errors gracefully', async () => {
    // Start the chat
    const startButton = page.locator('button:has-text("Start Chat with SHANGO")');
    await startButton.click();
    await page.waitForTimeout(2000);

    // Mock a failed message response
    await page.route('**/api/v1/shango/sessions/*/messages', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Failed to send message'
        })
      });
    });

    // Try to send a message
    const messageInput = page.locator('#shango-message-input');
    await messageInput.fill('Test message');
    await messageInput.press('Enter');
    await page.waitForTimeout(2000);

    // Check if error message appears in chat
    const errorMessage = page.locator('text=Sorry, I encountered an error');
    await expect(errorMessage).toBeVisible();
  });

  test('should be responsive on mobile devices', async () => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check if the SHANGO widget is still visible
    const shangoWidget = page.locator('#shango-chat-widget');
    await expect(shangoWidget).toBeVisible();

    // Start the chat
    const startButton = page.locator('button:has-text("Start Chat with SHANGO")');
    await startButton.click();
    await page.waitForTimeout(2000);

    // Check if the chat interface is properly displayed on mobile
    const chatInterface = page.locator('.h-96.flex.flex-col');
    await expect(chatInterface).toBeVisible();

    // Check if input and send button are accessible
    const messageInput = page.locator('#shango-message-input');
    const sendButton = page.locator('button:has-text("Send")');
    
    await expect(messageInput).toBeVisible();
    await expect(sendButton).toBeVisible();

    // Test sending a message on mobile
    await messageInput.fill('Mobile test message');
    await sendButton.click();
    await page.waitForTimeout(2000);

    // Check if message was sent
    const userMessage = page.locator('text=Mobile test message');
    await expect(userMessage).toBeVisible();
  });

  test('should maintain chat state during page interactions', async () => {
    // Start the chat
    const startButton = page.locator('button:has-text("Start Chat with SHANGO")');
    await startButton.click();
    await page.waitForTimeout(2000);

    // Send a message
    const messageInput = page.locator('#shango-message-input');
    await messageInput.fill('State test message');
    await messageInput.press('Enter');
    await page.waitForTimeout(2000);

    // Navigate to another page and back
    await page.goto('http://localhost:8082/');
    await page.goto('http://localhost:8082/contact');
    await page.waitForLoadState('networkidle');

    // Check if we're back to the initial state (chat state is not persisted)
    const startButtonAgain = page.locator('button:has-text("Start Chat with SHANGO")');
    await expect(startButtonAgain).toBeVisible();
  });
});
