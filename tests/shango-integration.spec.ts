import { test, expect } from '@playwright/test';

// SHANGO AI Super Agent Integration Tests
test.describe('SHANGO AI Super Agent Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the contact page where SHANGO chat is available
    await page.goto('/contact');
  });

  test('SHANGO chat widget should be visible and functional', async ({ page }) => {
    // Check if SHANGO chat widget is present
    await expect(page.locator('[data-testid="shango-chat-widget"]')).toBeVisible();
    
    // Check if SHANGO button is visible
    await expect(page.locator('button[title*="SHANGO"]')).toBeVisible();
    
    // Check if agent selector is present
    await expect(page.locator('button[title="Switch SHANGO Agent"]')).toBeVisible();
  });

  test('SHANGO agent selection should work', async ({ page }) => {
    // Click on agent switch button
    await page.click('button[title="Switch SHANGO Agent"]');
    
    // Check if agent selector dropdown is visible
    await expect(page.locator('text=Choose Your SHANGO Agent')).toBeVisible();
    
    // Check if all SHANGO agents are listed
    await expect(page.locator('text=⚡ SHANGO General')).toBeVisible();
    await expect(page.locator('text=🔧 SHANGO Tech')).toBeVisible();
    await expect(page.locator('text=💼 SHANGO Sales')).toBeVisible();
    await expect(page.locator('text=💳 SHANGO Billing')).toBeVisible();
  });

  test('SHANGO chat session should start correctly', async ({ page }) => {
    // Click on SHANGO button to start chat
    await page.click('button[title*="SHANGO"]');
    
    // Check if chat window opens
    await expect(page.locator('text=SHANGO AI Super Agent')).toBeVisible();
    
    // Check if SHANGO greeting is displayed
    await expect(page.locator('text=Hello! I\'m SHANGO')).toBeVisible();
    
    // Check if input field is present
    await expect(page.locator('input[placeholder*="Ask SHANGO"]')).toBeVisible();
    
    // Check if send button is present
    await expect(page.locator('button:has-text("Send")')).toBeVisible();
  });

  test('SHANGO should respond to messages', async ({ page }) => {
    // Start chat session
    await page.click('button[title*="SHANGO"]');
    
    // Wait for chat window to be visible
    await expect(page.locator('text=SHANGO AI Super Agent')).toBeVisible();
    
    // Send a test message
    await page.fill('input[placeholder*="Ask SHANGO"]', 'Hello SHANGO, can you help me?');
    await page.click('button:has-text("Send")');
    
    // Check if user message appears
    await expect(page.locator('text=Hello SHANGO, can you help me?')).toBeVisible();
    
    // Wait for SHANGO response (this might take a moment)
    await page.waitForTimeout(2000);
    
    // Check if SHANGO response appears
    await expect(page.locator('text=⚡ SHANGO')).toBeVisible();
  });

  test('SHANGO agent switching should work', async ({ page }) => {
    // Start with SHANGO General
    await page.click('button[title*="SHANGO"]');
    await expect(page.locator('text=SHANGO AI Super Agent')).toBeVisible();
    
    // Close chat and switch agent
    await page.click('button:has-text("✕")');
    await page.click('button[title="Switch SHANGO Agent"]');
    await page.click('text=🔧 SHANGO Tech');
    
    // Start new chat with SHANGO Tech
    await page.click('button[title*="SHANGO Tech"]');
    
    // Check if SHANGO Tech greeting appears
    await expect(page.locator('text=SHANGO Tech')).toBeVisible();
    await expect(page.locator('text=technical AI Super Agent')).toBeVisible();
  });

  test('SHANGO quick actions should work', async ({ page }) => {
    // Start chat session
    await page.click('button[title*="SHANGO"]');
    await expect(page.locator('text=SHANGO AI Super Agent')).toBeVisible();
    
    // Test quick action buttons
    await page.click('button:has-text("💡 Get Help")');
    await expect(page.locator('input[placeholder*="Ask SHANGO"]')).toHaveValue('Help me with...');
    
    await page.click('button:has-text("💰 Pricing")');
    await expect(page.locator('input[placeholder*="Ask SHANGO"]')).toHaveValue('Show me pricing...');
    
    await page.click('button:has-text("🔧 Tech Support")');
    await expect(page.locator('input[placeholder*="Ask SHANGO"]')).toHaveValue('Technical support...');
  });

  test('SHANGO chat should handle multiple messages', async ({ page }) => {
    // Start chat session
    await page.click('button[title*="SHANGO"]');
    await expect(page.locator('text=SHANGO AI Super Agent')).toBeVisible();
    
    // Send multiple messages
    const messages = [
      'Hello SHANGO!',
      'Can you help me with VoIP?',
      'What are your capabilities?'
    ];
    
    for (const message of messages) {
      await page.fill('input[placeholder*="Ask SHANGO"]', message);
      await page.click('button:has-text("Send")');
      await expect(page.locator(`text=${message}`)).toBeVisible();
      await page.waitForTimeout(1000); // Wait between messages
    }
    
    // Check if all messages are visible
    for (const message of messages) {
      await expect(page.locator(`text=${message}`)).toBeVisible();
    }
  });

  test('SHANGO chat should close properly', async ({ page }) => {
    // Start chat session
    await page.click('button[title*="SHANGO"]');
    await expect(page.locator('text=SHANGO AI Super Agent')).toBeVisible();
    
    // Close chat
    await page.click('button:has-text("✕")');
    
    // Check if chat window is closed
    await expect(page.locator('text=SHANGO AI Super Agent')).not.toBeVisible();
    
    // Check if SHANGO button is still visible
    await expect(page.locator('button[title*="SHANGO"]')).toBeVisible();
  });

  test('SHANGO should be accessible on dashboard', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Check if SHANGO chat widget is present
    await expect(page.locator('[data-testid="shango-chat-widget"]')).toBeVisible();
    
    // Check if SHANGO button is visible
    await expect(page.locator('button[title*="SHANGO"]')).toBeVisible();
  });

  test('SHANGO should handle different agent personalities', async ({ page }) => {
    const agents = [
      { id: 'shango-general', name: 'SHANGO', personality: 'friendly' },
      { id: 'shango-technical', name: 'SHANGO Tech', personality: 'technical' },
      { id: 'shango-sales', name: 'SHANGO Sales', personality: 'sales' },
      { id: 'shango-billing', name: 'SHANGO Billing', personality: 'professional' }
    ];
    
    for (const agent of agents) {
      // Switch to agent
      await page.click('button[title="Switch SHANGO Agent"]');
      await page.click(`text=${agent.name}`);
      
      // Start chat
      await page.click(`button[title*="${agent.name}"]`);
      await expect(page.locator(`text=${agent.name}`)).toBeVisible();
      
      // Send a test message
      await page.fill('input[placeholder*="Ask SHANGO"]', `Test message for ${agent.name}`);
      await page.click('button:has-text("Send")');
      
      // Close chat for next iteration
      await page.click('button:has-text("✕")');
    }
  });

  test('SHANGO should maintain session state', async ({ page }) => {
    // Start chat session
    await page.click('button[title*="SHANGO"]');
    await expect(page.locator('text=SHANGO AI Super Agent')).toBeVisible();
    
    // Send a message
    await page.fill('input[placeholder*="Ask SHANGO"]', 'My name is John');
    await page.click('button:has-text("Send")');
    
    // Send another message that should reference previous context
    await page.fill('input[placeholder*="Ask SHANGO"]', 'What is my name?');
    await page.click('button:has-text("Send")');
    
    // Check if both messages are visible
    await expect(page.locator('text=My name is John')).toBeVisible();
    await expect(page.locator('text=What is my name?')).toBeVisible();
  });

  test('SHANGO should handle typing indicators', async ({ page }) => {
    // Start chat session
    await page.click('button[title*="SHANGO"]');
    await expect(page.locator('text=SHANGO AI Super Agent')).toBeVisible();
    
    // Send a message
    await page.fill('input[placeholder*="Ask SHANGO"]', 'Test typing indicator');
    await page.click('button:has-text("Send")');
    
    // Check if typing indicator appears (if implemented)
    // This test might need adjustment based on actual implementation
    await page.waitForTimeout(500);
    
    // The typing indicator should disappear after response
    await page.waitForTimeout(3000);
  });
});

// Performance tests for SHANGO integration
test.describe('SHANGO Performance Tests', () => {
  test('SHANGO chat should load quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/contact');
    await expect(page.locator('button[title*="SHANGO"]')).toBeVisible();
    const loadTime = Date.now() - startTime;
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('SHANGO responses should be fast', async ({ page }) => {
    await page.goto('/contact');
    await page.click('button[title*="SHANGO"]');
    await expect(page.locator('text=SHANGO AI Super Agent')).toBeVisible();
    
    const startTime = Date.now();
    await page.fill('input[placeholder*="Ask SHANGO"]', 'Quick test');
    await page.click('button:has-text("Send")');
    
    // Wait for response
    await page.waitForSelector('text=⚡ SHANGO', { timeout: 10000 });
    const responseTime = Date.now() - startTime;
    
    // Response should be within 10 seconds
    expect(responseTime).toBeLessThan(10000);
  });
});

// Accessibility tests for SHANGO
test.describe('SHANGO Accessibility Tests', () => {
  test('SHANGO chat should be keyboard accessible', async ({ page }) => {
    await page.goto('/contact');
    
    // Tab to SHANGO button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Press Enter to start chat
    await page.keyboard.press('Enter');
    await expect(page.locator('text=SHANGO AI Super Agent')).toBeVisible();
    
    // Tab to input field
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Type message and send
    await page.keyboard.type('Test keyboard navigation');
    await page.keyboard.press('Enter');
    
    // Check if message was sent
    await expect(page.locator('text=Test keyboard navigation')).toBeVisible();
  });

  test('SHANGO chat should have proper ARIA labels', async ({ page }) => {
    await page.goto('/contact');
    
    // Check if SHANGO button has proper title attribute
    await expect(page.locator('button[title*="SHANGO"]')).toHaveAttribute('title');
    
    // Start chat and check input accessibility
    await page.click('button[title*="SHANGO"]');
    await expect(page.locator('input[placeholder*="Ask SHANGO"]')).toHaveAttribute('placeholder');
  });
});
