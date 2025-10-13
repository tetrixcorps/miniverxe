// SHANGO AI Super Agent - Vanilla JavaScript Chat Widget
// This version works without React for Astro pages

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
    
    // SHANGO AI Agents
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
      },
      {
        id: 'shango-technical',
        name: 'SHANGO Tech',
        description: 'Specialized in technical issues and advanced troubleshooting',
        capabilities: ['technical_support', 'api_integration', 'debugging', 'system_analysis'],
        tools: ['n8n', 'api_docs', 'system_logs', 'debugging_tools'],
        personality: 'technical',
        avatar: '🔧',
        greeting: 'Hi! I\'m SHANGO Tech, your technical AI Super Agent. What technical challenge can I help you solve?'
      },
      {
        id: 'shango-sales',
        name: 'SHANGO Sales',
        description: 'Expert in sales, pricing, and product recommendations',
        capabilities: ['sales', 'product_recommendations', 'pricing_info', 'demo_requests', 'lead_qualification'],
        tools: ['n8n', 'crm', 'pricing_engine', 'product_catalog'],
        personality: 'sales',
        avatar: '💰',
        greeting: 'Welcome! I\'m SHANGO Sales, your AI Super Agent for all sales inquiries. How can I help you succeed today?'
      },
      {
        id: 'shango-billing',
        name: 'SHANGO Billing',
        description: 'Specialized in billing, payments, and account management',
        capabilities: ['billing_support', 'payment_issues', 'subscription_management', 'account_updates'],
        tools: ['n8n', 'stripe', 'billing_system', 'account_management'],
        personality: 'professional',
        avatar: '💳',
        greeting: 'Hello! I\'m SHANGO Billing, your AI Super Agent for billing and account matters. How can I assist you?'
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

    const currentAgent = this.getAgentInfo(this.selectedAgent);
    
    container.innerHTML = `
      <div class="shango-chat-widget">
        ${!this.isOpen ? this.renderToggleButton() : ''}
        ${this.isOpen ? this.renderChatInterface(currentAgent) : ''}
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
        <div class="space-y-2 text-sm text-gray-500 mb-6">
          <p>• Instant responses to enterprise queries</p>
          <p>• Technical support and troubleshooting</p>
          <p>• Solution recommendations and pricing</p>
          <p>• Escalation to human experts when needed</p>
        </div>
        <button 
          id="shango-start-chat"
          class="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-colors"
        >
          Start Chat with SHANGO
        </button>
      </div>
    `;
  }

  renderChatInterface(currentAgent) {
    return `
      <div class="flex flex-col h-[400px] bg-white rounded-lg border border-gray-200 shadow-lg">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
          <div class="flex items-center space-x-2">
            <span class="text-xl">${currentAgent?.avatar || '⚡'}</span>
            <div>
              <h3 class="font-semibold">${currentAgent?.name || 'SHANGO'}</h3>
              <p class="text-xs opacity-90">AI Super Agent</p>
            </div>
          </div>
          <button id="shango-close-chat" class="text-white hover:text-gray-200">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Messages -->
        <div id="shango-messages" class="flex-1 overflow-y-auto p-4 space-y-4">
          ${this.messages.map(msg => this.renderMessage(msg)).join('')}
          ${this.isTyping ? this.renderTypingIndicator() : ''}
        </div>

        <!-- Input -->
        <div class="p-4 border-t border-gray-200">
          <div class="flex space-x-2">
            <input
              type="text"
              id="shango-message-input"
              placeholder="Ask ${currentAgent?.name || 'SHANGO'} anything..."
              class="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              ${!this.currentSession ? 'disabled' : ''}
            />
            <button
              id="shango-send-message"
              class="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              ${!this.currentSession ? 'disabled' : ''}
            >
              Send
            </button>
          </div>
          
          <!-- Quick Actions -->
          <div class="mt-2 flex space-x-1">
            <button
              class="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
              onclick="document.getElementById('shango-message-input').value = 'Help me with...'"
            >
              💡 Get Help
            </button>
            <button
              class="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
              onclick="document.getElementById('shango-message-input').value = 'Show me pricing...'"
            >
              💰 Pricing
            </button>
            <button
              class="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
              onclick="document.getElementById('shango-message-input').value = 'Technical support...'"
            >
              🔧 Tech Support
            </button>
          </div>
        </div>
      </div>
    `;
  }

  renderMessage(message) {
    const isUser = message.role === 'user';
    const isShango = message.role === 'shango';
    
    return `
      <div class="flex ${isUser ? 'justify-end' : 'justify-start'}">
        <div class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isUser 
            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
            : isShango
            ? 'bg-gradient-to-r from-purple-100 to-blue-100 text-gray-800 border border-purple-200'
            : 'bg-gray-100 text-gray-800'
        }">
          <div class="text-sm">${message.content}</div>
          <div class="text-xs mt-1 opacity-70">
            ${new Date(message.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>
    `;
  }

  renderTypingIndicator() {
    return `
      <div class="flex justify-start">
        <div class="bg-gray-100 rounded-lg px-4 py-2">
          <div class="flex space-x-1">
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
          </div>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    // Start chat button
    const startButton = document.getElementById('shango-start-chat');
    if (startButton) {
      startButton.addEventListener('click', () => this.startChat());
    }

    // Close chat button
    const closeButton = document.getElementById('shango-close-chat');
    if (closeButton) {
      closeButton.addEventListener('click', () => this.closeChat());
    }

    // Send message button
    const sendButton = document.getElementById('shango-send-message');
    if (sendButton) {
      sendButton.addEventListener('click', () => this.sendMessage());
    }

    // Message input
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

  getAgentInfo(agentId) {
    return this.shangoAgents.find(agent => agent.id === agentId);
  }

  async startChat() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.render();
    
    try {
      // Simulate starting a chat session
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

      // Add SHANGO greeting message
      const currentAgent = this.getAgentInfo(this.selectedAgent);
      if (currentAgent) {
        this.addMessage({
          id: `shango-greeting-${Date.now()}`,
          role: 'shango',
          content: currentAgent.greeting,
          timestamp: new Date(),
          type: 'text'
        });
      }

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
    this.scrollToBottom();
  }

  scrollToBottom() {
    const messagesContainer = document.getElementById('shango-messages');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  async sendMessage() {
    const input = document.getElementById('shango-message-input');
    if (!input || !input.value.trim() || !this.currentSession) return;

    const messageText = input.value.trim();
    input.value = '';

    // Add user message
    this.addMessage({
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date(),
      type: 'text'
    });

    // Show typing indicator
    this.isTyping = true;
    this.render();

    try {
      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock AI response based on message content
      const aiResponse = this.generateAIResponse(messageText);
      
      this.addMessage({
        id: `shango-${Date.now()}`,
        role: 'shango',
        content: aiResponse,
        timestamp: new Date(),
        type: 'text'
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      this.addMessage({
        id: `error-${Date.now()}`,
        role: 'system',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        type: 'text'
      });
    } finally {
      this.isTyping = false;
      this.render();
    }
  }

  generateAIResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('pricing') || lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return 'Our enterprise pricing starts at $299/month for the basic plan, with custom solutions available for larger organizations. Would you like me to connect you with our sales team for a detailed quote?';
    } else if (lowerMessage.includes('technical') || lowerMessage.includes('bug') || lowerMessage.includes('error')) {
      return 'I can help you with technical issues! Our platform offers 24/7 technical support. Can you describe the specific problem you\'re experiencing? I can also connect you with our technical team if needed.';
    } else if (lowerMessage.includes('demo') || lowerMessage.includes('trial')) {
      return 'I\'d be happy to arrange a demo for you! Our team can show you how our enterprise communication platform can transform your business. When would be a good time for a 30-minute demonstration?';
    } else if (lowerMessage.includes('billing') || lowerMessage.includes('payment') || lowerMessage.includes('invoice')) {
      return 'For billing and payment inquiries, I can help you with account management, subscription changes, or payment issues. What specific billing question do you have?';
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return 'Hello! I\'m SHANGO, your AI Super Agent. I\'m here to help you with any questions about our enterprise communication platform, technical support, pricing, or general inquiries. How can I assist you today?';
    } else {
      return 'Thank you for your message! I\'m SHANGO, your AI Super Agent. I can help you with information about our enterprise communication platform, technical support, pricing, demos, or any other questions you might have. What would you like to know more about?';
    }
  }
}

// Export for use in other files
window.SHANGOChatWidget = SHANGOChatWidget;
