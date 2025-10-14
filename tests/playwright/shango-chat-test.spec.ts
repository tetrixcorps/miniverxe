import { test, expect } from '@playwright/test';

test.describe('SHANGO Chat Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the Contact Us page
    await page.goto('http://localhost:8080/contact');
    await page.waitForLoadState('networkidle');
  });

  test('SHANGO Chat widget should be visible and clickable', async ({ page }) => {
    // Check if the SHANGO chat widget container exists
    const chatWidget = page.locator('#shango-chat-widget');
    await expect(chatWidget).toBeVisible();

    // Check if the "Start Chat with SHANGO" button exists
    const startButton = page.locator('button:has-text("Start Chat with SHANGO")');
    await expect(startButton).toBeVisible();

    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/shango-chat-initial-state.png' });
  });

  test('SHANGO Chat should start when button is clicked', async ({ page }) => {
    // Click the "Start Chat with SHANGO" button
    const startButton = page.locator('button:has-text("Start Chat with SHANGO")');
    await startButton.click();

    // Wait for the chat interface to load
    await page.waitForTimeout(2000);

    // Check if the chat interface is now visible
    const chatInterface = page.locator('.shango-chat-widget');
    await expect(chatInterface).toBeVisible();

    // Check if the chat header is visible
    const chatHeader = page.locator('text=SHANGO');
    await expect(chatHeader).toBeVisible();

    // Check if the message input field is visible
    const messageInput = page.locator('#shango-message-input');
    await expect(messageInput).toBeVisible();

    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/shango-chat-after-click.png' });
  });

  test('SHANGO Chat should handle message sending', async ({ page }) => {
    // Start the chat
    const startButton = page.locator('button:has-text("Start Chat with SHANGO")');
    await startButton.click();
    await page.waitForTimeout(2000);

    // Type a test message
    const messageInput = page.locator('#shango-message-input');
    await messageInput.fill('Hello SHANGO, this is a test message');

    // Click the send button
    const sendButton = page.locator('button:has-text("Send")');
    await sendButton.click();

    // Wait for response
    await page.waitForTimeout(3000);

    // Check if the message appears in the chat
    const userMessage = page.locator('text=Hello SHANGO, this is a test message');
    await expect(userMessage).toBeVisible();

    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/shango-chat-message-sent.png' });
  });

  test('SHANGO Chat API endpoints should be accessible', async ({ page }) => {
    // Test the sessions endpoint
    const sessionsResponse = await page.request.get('/api/v1/shango/sessions');
    console.log('Sessions API Status:', sessionsResponse.status());
    console.log('Sessions API Response:', await sessionsResponse.text());

    // Test creating a session
    const createSessionResponse = await page.request.post('/api/v1/shango/sessions', {
      data: {
        userId: 'test-user-playwright',
        agentId: 'shango-general',
        channel: 'chat'
      }
    });
    console.log('Create Session API Status:', createSessionResponse.status());
    console.log('Create Session API Response:', await createSessionResponse.text());

    // Expect the API to be accessible
    expect(sessionsResponse.status()).toBe(200);
  });

  test('SHANGO Chat should handle errors gracefully', async ({ page }) => {
    // Start the chat
    const startButton = page.locator('button:has-text("Start Chat with SHANGO")');
    await startButton.click();
    await page.waitForTimeout(2000);

    // Try to send a message with empty input
    const sendButton = page.locator('button:has-text("Send")');
    await sendButton.click();

    // Check that no error state is shown
    const errorMessage = page.locator('text=Error');
    await expect(errorMessage).not.toBeVisible();

    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/shango-chat-error-handling.png' });
  });

  test('SHANGO Chat console errors should be logged', async ({ page }) => {
    const consoleErrors: string[] = [];

    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.log('Console Error:', msg.text());
      }
    });

    // Start the chat
    const startButton = page.locator('button:has-text("Start Chat with SHANGO")');
    await startButton.click();
    await page.waitForTimeout(2000);

    // Try to send a message
    const messageInput = page.locator('#shango-message-input');
    await messageInput.fill('Test message');
    const sendButton = page.locator('button:has-text("Send")');
    await sendButton.click();

    // Wait for any async operations
    await page.waitForTimeout(3000);

    // Log all console errors found
    console.log('Total console errors found:', consoleErrors.length);
    consoleErrors.forEach((error, index) => {
      console.log(`Error ${index + 1}:`, error);
    });

    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/shango-chat-console-errors.png' });
  });
});
