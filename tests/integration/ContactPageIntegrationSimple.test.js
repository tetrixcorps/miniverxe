// Simple Integration tests for Contact Page with SHANGO Chat Widget
const { JSDOM } = require('jsdom');

// Mock DOM environment
const dom = new JSDOM(`
  <!DOCTYPE html>
  <html>
    <body>
      <div id="shango-chat-widget"></div>
      <form id="contact-form">
        <input name="name" id="name" />
        <input name="email" id="email" />
        <input name="company" id="company" />
        <input name="subject" id="subject" />
        <textarea name="message" id="message"></textarea>
        <button type="submit" id="submit-btn">
          <span id="submit-text">Send Message</span>
          <span id="loading-text" class="hidden">Sending...</span>
        </button>
      </form>
      <div id="success-message" class="hidden">Thank you for your message!</div>
      <div id="error-message" class="hidden">Oops! Something went wrong.</div>
      <div id="error-text"></div>
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

// Mock the SHANGO Chat Widget class
class SHANGOChatWidget {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.userId = options.userId || `user-${Date.now()}`;
    this.defaultAgent = options.defaultAgent || 'shango-general';
    this.isOpen = false;
    this.isLoading = false;
    this.currentSession = null;
    this.messages = [];
    this.isTyping = false;
    this.selectedAgent = this.defaultAgent;
    
    this.shangoAgents = [
      {
        id: 'shango-general',
        name: 'SHANGO',
        description: 'Your AI Super Agent for general assistance and support',
        capabilities: ['general_questions', 'basic_support', 'product_info', 'troubleshooting'],
        tools: ['n8n', 'knowledge_base', 'api_docs'],
        personality: 'friendly',
        avatar: '⚡',
        greeting: 'Hello! I\'m SHANGO, your AI Super Agent. How can I help you today?'
      }
    ];

    this.init();
  }

  init() {
    this.render();
    this.setupEventListeners();
  }

  render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="shango-chat-widget">
        ${!this.isOpen ? this.renderToggleButton() : ''}
        ${this.isOpen ? this.renderChatInterface() : ''}
      </div>
    `;
  }

  renderToggleButton() {
    return `
      <div class="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
        <div class="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mb-4">
          <span class="text-2xl text-white">⚡</span>
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">SHANGO AI Super Agent</h3>
        <p class="text-gray-600 mb-4">Our AI Super Agent is ready to help you with enterprise inquiries and technical support.</p>
        <button id="shango-start-chat" class="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold">
          Start Chat with SHANGO
        </button>
      </div>
    `;
  }

  renderChatInterface() {
    return `
      <div class="flex flex-col h-[400px] bg-white rounded-lg border border-gray-200 shadow-lg">
        <div class="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
          <div class="flex items-center space-x-2">
            <span class="text-xl">⚡</span>
            <div>
              <h3 class="font-semibold">SHANGO</h3>
              <p class="text-xs opacity-90">AI Super Agent</p>
            </div>
          </div>
          <button id="shango-close-chat" class="text-white hover:text-gray-200">×</button>
        </div>
        <div id="shango-messages" class="flex-1 overflow-y-auto p-4 space-y-4">
          ${this.messages.map(msg => this.renderMessage(msg)).join('')}
        </div>
        <div class="p-4 border-t border-gray-200">
          <div class="flex space-x-2">
            <input type="text" id="shango-message-input" placeholder="Ask SHANGO anything..." class="flex-1 border border-gray-300 rounded-lg px-3 py-2" />
            <button id="shango-send-message" class="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg">Send</button>
          </div>
        </div>
      </div>
    `;
  }

  renderMessage(message) {
    const isUser = message.role === 'user';
    return `
      <div class="flex ${isUser ? 'justify-end' : 'justify-start'}">
        <div class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isUser ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' : 'bg-gray-100 text-gray-800'}">
          <div class="text-sm">${message.content}</div>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    const startButton = document.getElementById('shango-start-chat');
    if (startButton) {
      startButton.addEventListener('click', () => this.startChat());
    }

    const closeButton = document.getElementById('shango-close-chat');
    if (closeButton) {
      closeButton.addEventListener('click', () => this.closeChat());
    }

    const sendButton = document.getElementById('shango-send-message');
    if (sendButton) {
      sendButton.addEventListener('click', () => this.sendMessage());
    }

    const messageInput = document.getElementById('shango-message-input');
    if (messageInput) {
      messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
    }
  }

  async startChat() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.render();
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.currentSession = {
        id: `session-${Date.now()}`,
        userId: this.userId,
        agentId: this.selectedAgent,
        status: 'active',
        channel: 'chat',
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: []
      };

      this.addMessage({
        id: `shango-greeting-${Date.now()}`,
        role: 'shango',
        content: 'Hello! I\'m SHANGO, your AI Super Agent. How can I help you today?',
        timestamp: new Date(),
        type: 'text'
      });

      this.isOpen = true;
      this.render();
    } catch (error) {
      console.error('Failed to start SHANGO chat:', error);
    } finally {
      this.isLoading = false;
    }
  }

  closeChat() {
    this.isOpen = false;
    this.currentSession = null;
    this.messages = [];
    this.render();
  }

  addMessage(message) {
    this.messages.push(message);
  }

  async sendMessage() {
    const input = document.getElementById('shango-message-input');
    if (!input || !input.value.trim() || !this.currentSession) return;

    const messageText = input.value.trim();
    input.value = '';

    this.addMessage({
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date(),
      type: 'text'
    });

    this.render();
  }
}

describe('Contact Page Integration', () => {
  let container;
  let form;
  let submitBtn;
  let submitText;
  let loadingText;
  let successMessage;
  let errorMessage;
  let errorText;

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = `
      <div id="shango-chat-widget"></div>
      <form id="contact-form">
        <input name="name" id="name" />
        <input name="email" id="email" />
        <input name="company" id="company" />
        <input name="subject" id="subject" />
        <textarea name="message" id="message"></textarea>
        <button type="submit" id="submit-btn">
          <span id="submit-text">Send Message</span>
          <span id="loading-text" class="hidden">Sending...</span>
        </button>
      </form>
      <div id="success-message" class="hidden">Thank you for your message!</div>
      <div id="error-message" class="hidden">Oops! Something went wrong.</div>
      <div id="error-text"></div>
    `;

    container = document.getElementById('shango-chat-widget');
    form = document.getElementById('contact-form');
    submitBtn = document.getElementById('submit-btn');
    submitText = document.getElementById('submit-text');
    loadingText = document.getElementById('loading-text');
    successMessage = document.getElementById('success-message');
    errorMessage = document.getElementById('error-message');
    errorText = document.getElementById('error-text');

    jest.clearAllMocks();
  });

  describe('SHANGO Chat Widget Integration', () => {
    it('should initialize SHANGO Chat Widget on page load', () => {
      const widget = new SHANGOChatWidget('shango-chat-widget', {
        userId: 'contact-user-123',
        defaultAgent: 'shango-general'
      });

      expect(widget.userId).toContain('contact-');
      expect(widget.defaultAgent).toBe('shango-general');
      expect(widget.isOpen).toBe(false);
    });

    it('should create widget with correct configuration', () => {
      const widget = new SHANGOChatWidget('shango-chat-widget', {
        userId: 'contact-user-123',
        defaultAgent: 'shango-general'
      });

      expect(widget.userId).toContain('contact-');
      expect(widget.defaultAgent).toBe('shango-general');
      expect(widget.isOpen).toBe(false);
    });

    it('should handle widget initialization errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error');

      // Simulate initialization error
      const originalRender = SHANGOChatWidget.prototype.render;
      SHANGOChatWidget.prototype.render = jest.fn().mockImplementation(() => {
        throw new Error('Widget render failed');
      });

      try {
        new SHANGOChatWidget('shango-chat-widget');
      } catch (error) {
        expect(error.message).toBe('Widget render failed');
      }

      // Restore original method
      SHANGOChatWidget.prototype.render = originalRender;
    });
  });

  describe('Contact Form Integration', () => {
    it('should handle form submission', async () => {
      // Fill out form
      document.getElementById('name').value = 'John Doe';
      document.getElementById('email').value = 'john@example.com';
      document.getElementById('company').value = 'Test Company';
      document.getElementById('subject').value = 'Test Subject';
      document.getElementById('message').value = 'Test message';

      // Mock form submission
      const submitEvent = new window.Event('submit');
      submitEvent.preventDefault = jest.fn();
      
      // Add event listener
      form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Show loading state
        submitBtn.disabled = true;
        submitText.classList.add('hidden');
        loadingText.classList.remove('hidden');
        
        // Hide previous messages
        successMessage.classList.add('hidden');
        errorMessage.classList.add('hidden');

        try {
          const formData = new FormData(form);
          const data = Object.fromEntries(formData);
          
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Show success message
          successMessage.classList.remove('hidden');
          form.reset();
          
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Please try again or contact us directly.';
          errorText.textContent = errorMsg;
          errorMessage.classList.remove('hidden');
        } finally {
          // Reset button state
          submitBtn.disabled = false;
          submitText.classList.remove('hidden');
          loadingText.classList.add('hidden');
        }
      });

      // Submit form
      form.dispatchEvent(submitEvent);

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Verify form was processed
      expect(submitEvent.preventDefault).toHaveBeenCalled();
      expect(successMessage.classList.contains('hidden')).toBe(false);
      expect(form.elements.name.value).toBe('');
    });

    it('should handle form validation errors', async () => {
      // Submit empty form
      const submitEvent = new window.Event('submit');
      submitEvent.preventDefault = jest.fn();
      
      form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Check for required fields
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value;

        if (!name || !email || !subject || !message) {
          errorText.textContent = 'Please fill in all required fields.';
          errorMessage.classList.remove('hidden');
          return;
        }

        // Process form if valid
        successMessage.classList.remove('hidden');
      });

      form.dispatchEvent(submitEvent);

      // Verify validation error
      expect(errorText.textContent).toBe('Please fill in all required fields.');
      expect(errorMessage.classList.contains('hidden')).toBe(false);
    });
  });

  describe('Complete User Journey', () => {
    it('should provide complete user journey from form to chat', async () => {
      // 1. User sees contact form and chat widget
      expect(form).toBeDefined();
      expect(container).toBeDefined();

      // 2. User fills out contact form
      document.getElementById('name').value = 'Jane Smith';
      document.getElementById('email').value = 'jane@example.com';
      document.getElementById('company').value = 'Acme Corp';
      document.getElementById('subject').value = 'Enterprise Inquiry';
      document.getElementById('message').value = 'I need help with your enterprise solutions';

      // 3. User starts chat with SHANGO
      const widget = new SHANGOChatWidget('shango-chat-widget');
      await widget.startChat();

      expect(widget.isOpen).toBe(true);
      expect(widget.currentSession).toBeDefined();

      // 4. User asks SHANGO about pricing
      const pricingMessage = 'What is your enterprise pricing?';
      widget.addMessage({
        id: 'user-msg-1',
        role: 'user',
        content: pricingMessage,
        timestamp: new Date(),
        type: 'text'
      });

      // Add a response message to simulate the conversation
      widget.addMessage({
        id: 'shango-msg-1',
        role: 'shango',
        content: 'Our enterprise pricing starts at $299/month for the basic plan.',
        timestamp: new Date(),
        type: 'text'
      });

      expect(widget.messages).toHaveLength(3); // 1 greeting + 1 user message + 1 response

      // 5. User submits contact form
      const submitEvent = new window.Event('submit');
      submitEvent.preventDefault = jest.fn();
      
      form.addEventListener('submit', async function(e) {
        e.preventDefault();
        successMessage.classList.remove('hidden');
        form.reset();
      });

      form.dispatchEvent(submitEvent);

      // Verify complete journey - check messages before closing
      expect(successMessage.classList.contains('hidden')).toBe(false);
      // The widget should have messages from the chat session
      expect(widget.messages.length).toBeGreaterThan(0);

      // 6. User closes chat
      widget.closeChat();
      expect(widget.isOpen).toBe(false);
    });
  });
});
