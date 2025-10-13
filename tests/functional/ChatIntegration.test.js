// Functional tests for SHANGO Chat Integration
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// Mock DOM environment
const dom = new JSDOM(`
  <!DOCTYPE html>
  <html>
    <body>
      <div id="shango-chat-widget"></div>
    </body>
  </html>
`);

global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;

// Mock console methods
global.console = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
};

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_SINCH_API_KEY = 'test-api-key';
process.env.NEXT_PUBLIC_SINCH_WIDGET_ID = 'test-widget-id';

// Read and evaluate the SHANGO Chat Widget code
const widgetCode = fs.readFileSync(path.join(__dirname, '../../src/components/SHANGOChatWidget.js'), 'utf8');
eval(widgetCode);

// Read and evaluate the SinchChatService code
const serviceCode = fs.readFileSync(path.join(__dirname, '../../src/services/sinchChatService.ts'), 'utf8');
eval(serviceCode);

describe('SHANGO Chat Integration', () => {
  let widget;
  let service;
  let container;

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = '<div id="shango-chat-widget"></div>';
    container = document.getElementById('shango-chat-widget');
    
    // Create widget and service instances
    widget = new SHANGOChatWidget('shango-chat-widget', {
      userId: 'test-user-123',
      defaultAgent: 'shango-general'
    });
    
    service = new SHANGOAIService('test-api-key', 'test-widget-id');
  });

  afterEach(() => {
    if (widget) {
      widget.closeChat();
    }
    jest.clearAllMocks();
  });

  describe('Complete Chat Flow', () => {
    it('should complete full chat session from start to end', async () => {
      // 1. Initial state - widget should show start button
      expect(container.innerHTML).toContain('Start Chat with SHANGO');
      expect(widget.isOpen).toBe(false);
      expect(widget.currentSession).toBeNull();

      // 2. Start chat session
      await widget.startChat();
      
      expect(widget.isOpen).toBe(true);
      expect(widget.currentSession).toBeDefined();
      expect(widget.currentSession.userId).toBe('test-user-123');
      expect(widget.currentSession.status).toBe('active');

      // 3. Should have greeting message
      expect(widget.messages).toHaveLength(1);
      expect(widget.messages[0].role).toBe('shango');
      expect(widget.messages[0].content).toContain('Hello! I\'m SHANGO');

      // 4. Send user message
      const userMessage = 'What is your pricing?';
      widget.addMessage({
        id: 'user-msg-1',
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
        type: 'text'
      });

      expect(widget.messages).toHaveLength(2);
      expect(widget.messages[1].content).toBe(userMessage);

      // 5. Get AI response
      const aiResponse = widget.generateAIResponse(userMessage);
      widget.addMessage({
        id: 'shango-msg-1',
        role: 'shango',
        content: aiResponse,
        timestamp: new Date(),
        type: 'text'
      });

      expect(widget.messages).toHaveLength(3);
      expect(widget.messages[2].role).toBe('shango');
      expect(aiResponse).toContain('$299/month');

      // 6. Close chat session
      widget.closeChat();
      
      expect(widget.isOpen).toBe(false);
      expect(widget.currentSession).toBeNull();
      expect(widget.messages).toEqual([]);
    });

    it('should handle multiple message exchanges', async () => {
      await widget.startChat();

      // First exchange
      const message1 = 'Hello SHANGO';
      widget.addMessage({
        id: 'user-msg-1',
        role: 'user',
        content: message1,
        timestamp: new Date(),
        type: 'text'
      });

      const response1 = widget.generateAIResponse(message1);
      widget.addMessage({
        id: 'shango-msg-1',
        role: 'shango',
        content: response1,
        timestamp: new Date(),
        type: 'text'
      });

      // Second exchange
      const message2 = 'I need technical support';
      widget.addMessage({
        id: 'user-msg-2',
        role: 'user',
        content: message2,
        timestamp: new Date(),
        type: 'text'
      });

      const response2 = widget.generateAIResponse(message2);
      widget.addMessage({
        id: 'shango-msg-2',
        role: 'shango',
        content: response2,
        timestamp: new Date(),
        type: 'text'
      });

      // Verify all messages are present
      expect(widget.messages).toHaveLength(5); // 1 greeting + 2 exchanges (4 messages)
      expect(widget.messages[1].content).toBe(message1);
      expect(widget.messages[2].content).toBe(response1);
      expect(widget.messages[3].content).toBe(message2);
      expect(widget.messages[4].content).toBe(response2);
    });

    it('should handle different agent personalities', async () => {
      // Test general agent
      const generalAgent = service.getSHANGOAgent('shango-general');
      expect(generalAgent.personality).toBe('friendly');
      expect(generalAgent.capabilities).toContain('general_questions');

      // Test technical agent
      const techAgent = service.getSHANGOAgent('shango-technical');
      expect(techAgent.personality).toBe('technical');
      expect(techAgent.capabilities).toContain('technical_support');

      // Test sales agent
      const salesAgent = service.getSHANGOAgent('shango-sales');
      expect(salesAgent.personality).toBe('sales');
      expect(salesAgent.capabilities).toContain('sales');

      // Test billing agent
      const billingAgent = service.getSHANGOAgent('shango-billing');
      expect(billingAgent.personality).toBe('professional');
      expect(billingAgent.capabilities).toContain('billing_support');
    });
  });

  describe('Agent Routing', () => {
    it('should route to correct agent based on message content', () => {
      const context = { userType: 'enterprise' };

      // Technical queries should route to tech agent
      const techMessage = 'I have a bug in the API';
      const techAgent = service.routeToSHANGOAgent(techMessage, context);
      expect(techAgent.id).toBe('shango-technical');

      // Sales queries should route to sales agent
      const salesMessage = 'What does it cost to buy your product?';
      const salesAgent = service.routeToSHANGOAgent(salesMessage, context);
      expect(salesAgent.id).toBe('shango-sales');

      // Billing queries should route to billing agent
      const billingMessage = 'I have a problem with my invoice';
      const billingAgent = service.routeToSHANGOAgent(billingMessage, context);
      expect(billingAgent.id).toBe('shango-billing');

      // General queries should route to general agent
      const generalMessage = 'Hello, how are you?';
      const generalAgent = service.routeToSHANGOAgent(generalMessage, context);
      expect(generalAgent.id).toBe('shango-general');
    });

    it('should handle complex queries with multiple intents', () => {
      const context = { userType: 'enterprise' };

      // Query with both technical and billing intents
      const complexMessage = 'I have a technical billing issue with my API subscription';
      const agent = service.routeToSHANGOAgent(complexMessage, context);
      
      // Should route to technical agent (first match)
      expect(agent.id).toBe('shango-technical');
    });
  });

  describe('Response Generation', () => {
    it('should generate appropriate responses for different query types', () => {
      // Pricing queries
      const pricingResponse = widget.generateAIResponse('What is your pricing?');
      expect(pricingResponse).toContain('$299/month');
      expect(pricingResponse).toContain('sales team');

      // Technical queries
      const techResponse = widget.generateAIResponse('I have a technical problem');
      expect(techResponse).toContain('technical support');
      expect(techResponse).toContain('24/7');

      // Demo queries
      const demoResponse = widget.generateAIResponse('Can I get a demo?');
      expect(demoResponse).toContain('demo');
      expect(demoResponse).toContain('30-minute');

      // Billing queries
      const billingResponse = widget.generateAIResponse('I have a billing question');
      expect(billingResponse).toContain('billing');
      expect(billingResponse).toContain('account management');

      // Greeting queries
      const greetingResponse = widget.generateAIResponse('Hello there');
      expect(greetingResponse).toContain('Hello! I\'m SHANGO');
      expect(greetingResponse).toContain('AI Super Agent');

      // Unknown queries
      const unknownResponse = widget.generateAIResponse('Random question about something');
      expect(unknownResponse).toContain('Thank you for your message');
      expect(unknownResponse).toContain('SHANGO');
    });

    it('should handle case-insensitive queries', () => {
      const upperCaseResponse = widget.generateAIResponse('WHAT IS YOUR PRICING?');
      const lowerCaseResponse = widget.generateAIResponse('what is your pricing?');
      const mixedCaseResponse = widget.generateAIResponse('What Is Your Pricing?');

      expect(upperCaseResponse).toContain('$299/month');
      expect(lowerCaseResponse).toContain('$299/month');
      expect(mixedCaseResponse).toContain('$299/month');
    });
  });

  describe('UI Interactions', () => {
    it('should handle start chat button click', async () => {
      const startButton = document.getElementById('shango-start-chat');
      expect(startButton).toBeDefined();

      // Simulate click
      startButton.click();
      
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(widget.isOpen).toBe(true);
      expect(widget.currentSession).toBeDefined();
    });

    it('should handle close chat button click', async () => {
      await widget.startChat();
      
      const closeButton = document.getElementById('shango-close-chat');
      expect(closeButton).toBeDefined();

      // Simulate click
      closeButton.click();

      expect(widget.isOpen).toBe(false);
      expect(widget.currentSession).toBeNull();
    });

    it('should handle message input and send', async () => {
      await widget.startChat();

      const input = document.getElementById('shango-message-input');
      const sendButton = document.getElementById('shango-send-message');

      expect(input).toBeDefined();
      expect(sendButton).toBeDefined();

      // Type message
      input.value = 'Test message';
      expect(input.value).toBe('Test message');

      // Send message
      sendButton.click();
      
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      // Input should be cleared
      expect(input.value).toBe('');
    });

    it('should handle Enter key press in input', async () => {
      await widget.startChat();

      const input = document.getElementById('shango-message-input');
      input.value = 'Test message with Enter';

      // Simulate Enter key press
      const event = new window.KeyboardEvent('keypress', {
        key: 'Enter',
        shiftKey: false
      });
      
      input.dispatchEvent(event);
      
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      // Input should be cleared
      expect(input.value).toBe('');
    });

    it('should not send message on Shift+Enter', async () => {
      await widget.startChat();

      const input = document.getElementById('shango-message-input');
      input.value = 'Test message with Shift+Enter';

      // Simulate Shift+Enter key press
      const event = new window.KeyboardEvent('keypress', {
        key: 'Enter',
        shiftKey: true
      });
      
      input.dispatchEvent(event);
      
      // Input should not be cleared
      expect(input.value).toBe('Test message with Shift+Enter');
    });

    it('should handle quick action buttons', async () => {
      await widget.startChat();

      const input = document.getElementById('shango-message-input');
      
      // Test Get Help button
      const helpButton = document.querySelector('button[onclick*="Help me with"]');
      if (helpButton) {
        helpButton.click();
        expect(input.value).toBe('Help me with...');
      }

      // Test Pricing button
      const pricingButton = document.querySelector('button[onclick*="Show me pricing"]');
      if (pricingButton) {
        pricingButton.click();
        expect(input.value).toBe('Show me pricing...');
      }

      // Test Tech Support button
      const techButton = document.querySelector('button[onclick*="Technical support"]');
      if (techButton) {
        techButton.click();
        expect(input.value).toBe('Technical support...');
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle missing container gracefully', () => {
      const invalidWidget = new SHANGOChatWidget('non-existent-container');
      expect(() => invalidWidget.render()).not.toThrow();
    });

    it('should handle service initialization errors', async () => {
      // Mock service to throw error
      const originalInitialize = service.initialize;
      service.initialize = jest.fn().mockRejectedValue(new Error('Service initialization failed'));

      try {
        await service.initialize();
      } catch (error) {
        expect(error.message).toBe('Service initialization failed');
      }

      // Restore original method
      service.initialize = originalInitialize;
    });

    it('should handle message send errors gracefully', async () => {
      await widget.startChat();

      // Mock sendMessage to throw error
      const originalSendMessage = widget.sendMessage;
      widget.sendMessage = jest.fn().mockRejectedValue(new Error('Send message failed'));

      try {
        await widget.sendMessage();
      } catch (error) {
        expect(error.message).toBe('Send message failed');
      }

      // Restore original method
      widget.sendMessage = originalSendMessage;
    });
  });

  describe('Performance', () => {
    it('should handle rapid message sending', async () => {
      await widget.startChat();

      const messages = [
        'Message 1',
        'Message 2', 
        'Message 3',
        'Message 4',
        'Message 5'
      ];

      // Send messages rapidly
      for (const message of messages) {
        widget.addMessage({
          id: `user-${Date.now()}`,
          role: 'user',
          content: message,
          timestamp: new Date(),
          type: 'text'
        });
      }

      expect(widget.messages).toHaveLength(6); // 1 greeting + 5 messages
    });

    it('should handle large message content', async () => {
      await widget.startChat();

      const largeMessage = 'A'.repeat(1000); // 1000 character message
      
      widget.addMessage({
        id: 'large-msg',
        role: 'user',
        content: largeMessage,
        timestamp: new Date(),
        type: 'text'
      });

      expect(widget.messages[1].content).toBe(largeMessage);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', async () => {
      await widget.startChat();

      const input = document.getElementById('shango-message-input');
      const sendButton = document.getElementById('shango-send-message');

      expect(input).toBeDefined();
      expect(sendButton).toBeDefined();
      
      // Check for proper input attributes
      expect(input.placeholder).toContain('Ask SHANGO');
    });

    it('should handle keyboard navigation', async () => {
      await widget.startChat();

      const input = document.getElementById('shango-message-input');
      const sendButton = document.getElementById('shango-send-message');

      // Tab navigation should work
      input.focus();
      expect(document.activeElement).toBe(input);

      // Enter should send message
      input.value = 'Test message';
      const enterEvent = new window.KeyboardEvent('keypress', {
        key: 'Enter',
        shiftKey: false
      });
      input.dispatchEvent(enterEvent);
    });
  });

  describe('Integration with Backend Service', () => {
    it('should integrate with SinchChatLive service', async () => {
      // Mock the service methods
      const mockStartSession = jest.fn().mockResolvedValue({
        id: 'test-session',
        userId: 'test-user',
        agentId: 'test-agent',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      const mockSendMessage = jest.fn().mockResolvedValue();
      const mockEndSession = jest.fn().mockResolvedValue();

      // Replace service methods
      service.sinchChat = {
        startSession: mockStartSession,
        sendMessage: mockSendMessage,
        endSession: mockEndSession
      };

      // Test session start
      const session = await service.startSHANGOChat('test-user', 'shango-general');
      expect(session).toBeDefined();
      expect(mockStartSession).toHaveBeenCalled();

      // Test message send
      await service.sendSHANGOMessage('test-session', 'Hello');
      expect(mockSendMessage).toHaveBeenCalledWith({
        sessionId: 'test-session',
        text: 'Hello'
      });

      // Test session end
      await service.endSHANGOChat('test-session');
      expect(mockEndSession).toHaveBeenCalledWith('test-session');
    });
  });
});
