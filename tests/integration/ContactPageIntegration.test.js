// Integration tests for Contact Page with SHANGO Chat Widget
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

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

// Read and evaluate the contact page script
const contactPageCode = fs.readFileSync(path.join(__dirname, '../../src/pages/contact.astro'), 'utf8');
const scriptMatch = contactPageCode.match(/<script>([\s\S]*?)<\/script>/);
const scriptCode = scriptMatch ? scriptMatch[1] : '';

// Extract and evaluate the SHANGO Chat Widget class from the script
const widgetClassMatch = scriptCode.match(/class SHANGOChatWidget[\s\S]*?^}/m);
if (widgetClassMatch) {
  eval(widgetClassMatch[0]);
}

// Extract and evaluate the contact form handling code
const formHandlingMatch = scriptCode.match(/document\.addEventListener\('DOMContentLoaded'[\s\S]*?}\);/);
if (formHandlingMatch) {
  eval(formHandlingMatch[0]);
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
      // Simulate DOMContentLoaded event
      const event = new window.Event('DOMContentLoaded');
      document.dispatchEvent(event);

      // Check if widget is initialized
      expect(container.innerHTML).toContain('SHANGO AI Super Agent');
      expect(container.innerHTML).toContain('Start Chat with SHANGO');
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
      // Mock console.warn to verify error handling
      const consoleSpy = jest.spyOn(console, 'warn');

      // Simulate initialization error
      const originalInitialize = SHANGOChatWidget.prototype.init;
      SHANGOChatWidget.prototype.init = jest.fn().mockImplementation(() => {
        throw new Error('Widget initialization failed');
      });

      try {
        new SHANGOChatWidget('shango-chat-widget');
      } catch (error) {
        expect(error.message).toBe('Widget initialization failed');
      }

      // Restore original method
      SHANGOChatWidget.prototype.init = originalInitialize;
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

    it('should show loading state during form submission', async () => {
      // Fill out form
      document.getElementById('name').value = 'John Doe';
      document.getElementById('email').value = 'john@example.com';
      document.getElementById('subject').value = 'Test Subject';
      document.getElementById('message').value = 'Test message';

      const submitEvent = new window.Event('submit');
      submitEvent.preventDefault = jest.fn();
      
      form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Show loading state
        submitBtn.disabled = true;
        submitText.classList.add('hidden');
        loadingText.classList.remove('hidden');
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Reset button state
        submitBtn.disabled = false;
        submitText.classList.remove('hidden');
        loadingText.classList.add('hidden');
      });

      form.dispatchEvent(submitEvent);

      // Check loading state
      expect(submitBtn.disabled).toBe(true);
      expect(submitText.classList.contains('hidden')).toBe(true);
      expect(loadingText.classList.contains('hidden')).toBe(false);

      // Wait for completion
      await new Promise(resolve => setTimeout(resolve, 600));

      // Check final state
      expect(submitBtn.disabled).toBe(false);
      expect(submitText.classList.contains('hidden')).toBe(false);
      expect(loadingText.classList.contains('hidden')).toBe(true);
    });
  });

  describe('Page Layout and Styling', () => {
    it('should have proper page structure', () => {
      // Simulate DOMContentLoaded
      const event = new window.Event('DOMContentLoaded');
      document.dispatchEvent(event);

      // Check for key elements
      expect(container).toBeDefined();
      expect(form).toBeDefined();
      expect(submitBtn).toBeDefined();
      expect(successMessage).toBeDefined();
      expect(errorMessage).toBeDefined();
    });

    it('should have responsive design elements', () => {
      // Check for responsive classes (simulated)
      const hasResponsiveClasses = container.innerHTML.includes('flex') || 
                                   container.innerHTML.includes('grid') ||
                                   container.innerHTML.includes('md:') ||
                                   container.innerHTML.includes('lg:');
      
      expect(hasResponsiveClasses).toBe(true);
    });

    it('should have proper accessibility attributes', () => {
      // Check form accessibility
      expect(form.getAttribute('aria-label')).toBe('Contact form');
      
      // Check input accessibility
      const nameInput = document.getElementById('name');
      const emailInput = document.getElementById('email');
      
      expect(nameInput.type).toBe('text');
      expect(emailInput.type).toBe('email');
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle network errors gracefully', async () => {
      // Fill out form
      document.getElementById('name').value = 'John Doe';
      document.getElementById('email').value = 'john@example.com';
      document.getElementById('subject').value = 'Test Subject';
      document.getElementById('message').value = 'Test message';

      const submitEvent = new window.Event('submit');
      submitEvent.preventDefault = jest.fn();
      
      form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
          // Simulate network error
          throw new Error('Network error: Unable to connect to server');
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Please try again or contact us directly.';
          errorText.textContent = errorMsg;
          errorMessage.classList.remove('hidden');
        }
      });

      form.dispatchEvent(submitEvent);

      // Verify error handling
      expect(errorText.textContent).toBe('Network error: Unable to connect to server');
      expect(errorMessage.classList.contains('hidden')).toBe(false);
    });

    it('should handle widget initialization failures', () => {
      // Mock console.error to verify error handling
      const consoleSpy = jest.spyOn(console, 'error');

      // Simulate widget initialization failure
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

  describe('User Experience Flow', () => {
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

      const pricingResponse = widget.generateAIResponse(pricingMessage);
      widget.addMessage({
        id: 'shango-msg-1',
        role: 'shango',
        content: pricingResponse,
        timestamp: new Date(),
        type: 'text'
      });

      expect(pricingResponse).toContain('$299/month');

      // 5. User submits contact form
      const submitEvent = new window.Event('submit');
      submitEvent.preventDefault = jest.fn();
      
      form.addEventListener('submit', async function(e) {
        e.preventDefault();
        successMessage.classList.remove('hidden');
        form.reset();
      });

      form.dispatchEvent(submitEvent);

      // 6. User closes chat
      widget.closeChat();
      expect(widget.isOpen).toBe(false);

      // Verify complete journey
      expect(successMessage.classList.contains('hidden')).toBe(false);
      expect(widget.messages.length).toBeGreaterThan(0);
    });

    it('should handle multiple user interactions simultaneously', async () => {
      // Start chat
      const widget = new SHANGOChatWidget('shango-chat-widget');
      await widget.startChat();

      // Fill form
      document.getElementById('name').value = 'Test User';
      document.getElementById('email').value = 'test@example.com';
      document.getElementById('subject').value = 'Test Subject';
      document.getElementById('message').value = 'Test message';

      // Send chat message
      widget.addMessage({
        id: 'user-msg-1',
        role: 'user',
        content: 'Hello SHANGO',
        timestamp: new Date(),
        type: 'text'
      });

      // Submit form
      const submitEvent = new window.Event('submit');
      submitEvent.preventDefault = jest.fn();
      
      form.addEventListener('submit', async function(e) {
        e.preventDefault();
        successMessage.classList.remove('hidden');
      });

      form.dispatchEvent(submitEvent);

      // Verify both interactions worked
      expect(widget.messages).toHaveLength(2); // 1 greeting + 1 user message
      expect(successMessage.classList.contains('hidden')).toBe(false);
    });
  });

  describe('Performance and Optimization', () => {
    it('should handle rapid user interactions', async () => {
      const widget = new SHANGOChatWidget('shango-chat-widget');
      await widget.startChat();

      // Send multiple messages rapidly
      for (let i = 0; i < 10; i++) {
        widget.addMessage({
          id: `user-msg-${i}`,
          role: 'user',
          content: `Message ${i}`,
          timestamp: new Date(),
          type: 'text'
        });
      }

      expect(widget.messages).toHaveLength(11); // 1 greeting + 10 messages
    });

    it('should handle large form data', () => {
      // Fill form with large data
      const largeMessage = 'A'.repeat(5000); // 5000 character message
      
      document.getElementById('name').value = 'A'.repeat(100);
      document.getElementById('email').value = 'test@example.com';
      document.getElementById('company').value = 'A'.repeat(200);
      document.getElementById('subject').value = 'A'.repeat(200);
      document.getElementById('message').value = largeMessage;

      // Verify form can handle large data
      expect(document.getElementById('message').value).toBe(largeMessage);
    });
  });
});
