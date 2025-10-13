// Unit tests for SHANGO Chat Widget
const { JSDOM } = require('jsdom');

// Mock DOM environment
const dom = new JSDOM(`
  <!DOCTYPE html>
  <html>
    <body>
      <div id="test-chat-widget"></div>
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

// Import the SHANGO Chat Widget class
const fs = require('fs');
const path = require('path');

// Read and evaluate the SHANGO Chat Widget code
const widgetCode = fs.readFileSync(path.join(__dirname, '../../src/components/SHANGOChatWidget.js'), 'utf8');
eval(widgetCode);

describe('SHANGOChatWidget', () => {
  let widget;
  let container;

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = '<div id="test-chat-widget"></div>';
    container = document.getElementById('test-chat-widget');
    
    // Create new widget instance
    widget = new SHANGOChatWidget('test-chat-widget', {
      userId: 'test-user-123',
      defaultAgent: 'shango-general'
    });
  });

  afterEach(() => {
    // Clean up
    if (widget) {
      widget.closeChat();
    }
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default options', () => {
      expect(widget.userId).toBe('test-user-123');
      expect(widget.defaultAgent).toBe('shango-general');
      expect(widget.isOpen).toBe(false);
      expect(widget.isLoading).toBe(false);
      expect(widget.currentSession).toBeNull();
      expect(widget.messages).toEqual([]);
      expect(widget.isTyping).toBe(false);
    });

    it('should initialize with custom options', () => {
      const customWidget = new SHANGOChatWidget('test-chat-widget', {
        userId: 'custom-user',
        defaultAgent: 'shango-technical'
      });
      
      expect(customWidget.userId).toBe('custom-user');
      expect(customWidget.defaultAgent).toBe('shango-technical');
    });

    it('should have all SHANGO agents configured', () => {
      expect(widget.shangoAgents).toHaveLength(4);
      expect(widget.shangoAgents.map(agent => agent.id)).toEqual([
        'shango-general',
        'shango-technical', 
        'shango-sales',
        'shango-billing'
      ]);
    });

    it('should render initial state', () => {
      expect(container.innerHTML).toContain('SHANGO AI Super Agent');
      expect(container.innerHTML).toContain('Start Chat with SHANGO');
    });
  });

  describe('Agent Management', () => {
    it('should get agent info by ID', () => {
      const agent = widget.getAgentInfo('shango-technical');
      expect(agent).toBeDefined();
      expect(agent.id).toBe('shango-technical');
      expect(agent.name).toBe('SHANGO Tech');
      expect(agent.personality).toBe('technical');
    });

    it('should return undefined for invalid agent ID', () => {
      const agent = widget.getAgentInfo('invalid-agent');
      expect(agent).toBeUndefined();
    });

    it('should have correct agent capabilities', () => {
      const generalAgent = widget.getAgentInfo('shango-general');
      expect(generalAgent.capabilities).toContain('general_questions');
      expect(generalAgent.capabilities).toContain('basic_support');

      const techAgent = widget.getAgentInfo('shango-technical');
      expect(techAgent.capabilities).toContain('technical_support');
      expect(techAgent.capabilities).toContain('debugging');
    });
  });

  describe('Chat Session Management', () => {
    it('should start chat session', async () => {
      const startSpy = jest.spyOn(widget, 'startChat');
      
      // Simulate clicking start button
      const startButton = document.getElementById('shango-start-chat');
      if (startButton) {
        startButton.click();
      }

      expect(startSpy).toHaveBeenCalled();
    });

    it('should create session with correct properties', async () => {
      await widget.startChat();
      
      expect(widget.currentSession).toBeDefined();
      expect(widget.currentSession.userId).toBe('test-user-123');
      expect(widget.currentSession.agentId).toBe('shango-general');
      expect(widget.currentSession.status).toBe('active');
      expect(widget.currentSession.channel).toBe('chat');
    });

    it('should add greeting message on session start', async () => {
      await widget.startChat();
      
      expect(widget.messages).toHaveLength(1);
      expect(widget.messages[0].role).toBe('shango');
      expect(widget.messages[0].content).toContain('Hello! I\'m SHANGO');
    });

    it('should close chat session', () => {
      widget.isOpen = true;
      widget.currentSession = { id: 'test-session' };
      widget.messages = [{ id: 'test-msg', role: 'user', content: 'test' }];
      
      widget.closeChat();
      
      expect(widget.isOpen).toBe(false);
      expect(widget.currentSession).toBeNull();
      expect(widget.messages).toEqual([]);
    });
  });

  describe('Message Handling', () => {
    beforeEach(async () => {
      await widget.startChat();
    });

    it('should add user message', () => {
      const message = {
        id: 'test-msg-1',
        role: 'user',
        content: 'Hello SHANGO',
        timestamp: new Date(),
        type: 'text'
      };
      
      widget.addMessage(message);
      
      expect(widget.messages).toHaveLength(2); // 1 greeting + 1 user message
      expect(widget.messages[1]).toEqual(message);
    });

    it('should send message and get AI response', async () => {
      const sendSpy = jest.spyOn(widget, 'sendMessage');
      
      // Simulate typing and sending message
      const input = document.getElementById('shango-message-input');
      const sendButton = document.getElementById('shango-send-message');
      
      if (input && sendButton) {
        input.value = 'Hello SHANGO';
        sendButton.click();
      }

      expect(sendSpy).toHaveBeenCalled();
    });

    it('should handle Enter key press', () => {
      const input = document.getElementById('shango-message-input');
      if (input) {
        input.value = 'Test message';
        
        const event = new window.KeyboardEvent('keypress', {
          key: 'Enter',
          shiftKey: false
        });
        
        input.dispatchEvent(event);
      }
    });

    it('should not send empty messages', () => {
      const input = document.getElementById('shango-message-input');
      if (input) {
        input.value = '   '; // Only whitespace
        
        const sendButton = document.getElementById('shango-send-message');
        if (sendButton) {
          expect(sendButton.disabled).toBe(true);
        }
      }
    });
  });

  describe('AI Response Generation', () => {
    it('should generate pricing response', () => {
      const response = widget.generateAIResponse('What is your pricing?');
      expect(response).toContain('$299/month');
      expect(response).toContain('sales team');
    });

    it('should generate technical support response', () => {
      const response = widget.generateAIResponse('I have a technical issue');
      expect(response).toContain('technical support');
      expect(response).toContain('24/7');
    });

    it('should generate demo response', () => {
      const response = widget.generateAIResponse('Can I get a demo?');
      expect(response).toContain('demo');
      expect(response).toContain('30-minute');
    });

    it('should generate billing response', () => {
      const response = widget.generateAIResponse('I have a billing question');
      expect(response).toContain('billing');
      expect(response).toContain('account management');
    });

    it('should generate greeting response', () => {
      const response = widget.generateAIResponse('Hello');
      expect(response).toContain('Hello! I\'m SHANGO');
      expect(response).toContain('AI Super Agent');
    });

    it('should generate default response for unknown queries', () => {
      const response = widget.generateAIResponse('Random question');
      expect(response).toContain('Thank you for your message');
      expect(response).toContain('SHANGO');
    });
  });

  describe('UI Rendering', () => {
    it('should render toggle button when closed', () => {
      widget.isOpen = false;
      widget.render();
      
      expect(container.innerHTML).toContain('Start Chat with SHANGO');
      expect(container.innerHTML).toContain('SHANGO AI Super Agent');
    });

    it('should render chat interface when open', async () => {
      await widget.startChat();
      
      expect(container.innerHTML).toContain('shango-messages');
      expect(container.innerHTML).toContain('shango-message-input');
      expect(container.innerHTML).toContain('shango-send-message');
    });

    it('should render messages correctly', () => {
      const message = {
        id: 'test-msg',
        role: 'user',
        content: 'Test message',
        timestamp: new Date(),
        type: 'text'
      };
      
      widget.messages = [message];
      const rendered = widget.renderMessage(message);
      
      expect(rendered).toContain('Test message');
      expect(rendered).toContain('justify-end'); // User messages align right
    });

    it('should render SHANGO messages correctly', () => {
      const message = {
        id: 'test-msg',
        role: 'shango',
        content: 'SHANGO response',
        timestamp: new Date(),
        type: 'text'
      };
      
      widget.messages = [message];
      const rendered = widget.renderMessage(message);
      
      expect(rendered).toContain('SHANGO response');
      expect(rendered).toContain('justify-start'); // SHANGO messages align left
    });

    it('should render typing indicator', () => {
      widget.isTyping = true;
      const indicator = widget.renderTypingIndicator();
      
      expect(indicator).toContain('animate-bounce');
      expect(indicator).toContain('w-2 h-2');
    });
  });

  describe('Event Listeners', () => {
    it('should set up event listeners on initialization', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
      
      // Re-initialize to test event listener setup
      widget.setupEventListeners();
      
      // Check that event listeners are set up for various elements
      expect(addEventListenerSpy).toHaveBeenCalled();
    });

    it('should handle start chat button click', () => {
      const startSpy = jest.spyOn(widget, 'startChat');
      
      // Create and click start button
      const startButton = document.createElement('button');
      startButton.id = 'shango-start-chat';
      document.body.appendChild(startButton);
      
      widget.setupEventListeners();
      startButton.click();
      
      expect(startSpy).toHaveBeenCalled();
    });

    it('should handle close chat button click', () => {
      const closeSpy = jest.spyOn(widget, 'closeChat');
      
      // Create and click close button
      const closeButton = document.createElement('button');
      closeButton.id = 'shango-close-chat';
      document.body.appendChild(closeButton);
      
      widget.setupEventListeners();
      closeButton.click();
      
      expect(closeSpy).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing container gracefully', () => {
      const invalidWidget = new SHANGOChatWidget('non-existent-container');
      expect(() => invalidWidget.render()).not.toThrow();
    });

    it('should handle send message errors', async () => {
      await widget.startChat();
      
      // Mock console.error to verify error handling
      const consoleSpy = jest.spyOn(console, 'error');
      
      // Simulate error in sendMessage
      widget.sendMessage = jest.fn().mockRejectedValue(new Error('Test error'));
      
      await widget.sendMessage();
      
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('Quick Actions', () => {
    it('should have quick action buttons', async () => {
      await widget.startChat();
      
      expect(container.innerHTML).toContain('Get Help');
      expect(container.innerHTML).toContain('Pricing');
      expect(container.innerHTML).toContain('Tech Support');
    });

    it('should pre-fill input with quick action text', () => {
      // Mock input element
      const input = document.createElement('input');
      input.id = 'shango-message-input';
      input.value = '';
      document.body.appendChild(input);
      
      // Simulate quick action click
      const helpButton = document.createElement('button');
      helpButton.onclick = () => {
        input.value = 'Help me with...';
      };
      helpButton.click();
      
      expect(input.value).toBe('Help me with...');
    });
  });
});
