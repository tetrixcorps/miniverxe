import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock DOM environment
const mockDOM = {
  getElementById: vi.fn(),
  createElement: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  innerHTML: '',
  style: {},
  classList: {
    add: vi.fn(),
    remove: vi.fn(),
    contains: vi.fn(),
    toggle: vi.fn()
  },
  appendChild: vi.fn(),
  removeChild: vi.fn(),
  querySelector: vi.fn(),
  querySelectorAll: vi.fn(),
  scrollTop: 0,
  scrollHeight: 100,
  value: '',
  disabled: false,
  focus: vi.fn(),
  click: vi.fn()
};

// Mock global objects
global.document = {
  getElementById: mockDOM.getElementById,
  createElement: mockDOM.createElement,
  addEventListener: mockDOM.addEventListener,
  removeEventListener: mockDOM.removeEventListener,
  querySelector: mockDOM.querySelector,
  querySelectorAll: mockDOM.querySelectorAll
} as any;

global.window = {
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  postMessage: vi.fn(),
  location: { href: 'http://localhost:3000' },
  localStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  }
} as any;

// Mock fetch
global.fetch = vi.fn();

// Mock SHANGO Chat Widget class
class SHANGOChatWidget {
  containerId: string;
  userId: string;
  defaultAgent: string;
  isOpen: boolean;
  isLoading: boolean;
  currentSession: any;
  messages: any[];
  isTyping: boolean;
  selectedAgent: string;
  shangoAgents: any[];

  constructor(containerId: string, options: any = {}) {
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

  renderChatInterface(currentAgent: any) {
    return `
      <div class="h-96 flex flex-col">
        <!-- Header -->
        <div class="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
          <div class="flex items-center space-x-2">
            <span class="text-lg">${currentAgent?.avatar || '⚡'}</span>
            <div>
              <h3 class="font-semibold">${currentAgent?.name || 'SHANGO'}</h3>
              <p class="text-sm opacity-90">AI Super Agent Online</p>
            </div>
          </div>
          <button id="shango-close-chat" class="text-white hover:text-gray-200 transition-colors">
            ✕
          </button>
        </div>

        <!-- Messages -->
        <div id="shango-messages" class="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
          ${this.messages.map(message => this.renderMessage(message)).join('')}
        </div>

        <!-- Input -->
        <div class="p-4 border-t border-gray-200 bg-white">
          <div class="flex space-x-2">
            <input
              type="text"
              id="shango-message-input"
              placeholder="Ask SHANGO anything..."
              class="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              id="shango-send-message"
              class="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    `;
  }

  renderMessage(message: any) {
    const isUser = message.role === 'user';
    const isSHANGO = message.role === 'assistant';
    
    return `
      <div class="flex ${isUser ? 'justify-end' : 'justify-start'}">
        <div class="max-w-xs px-3 py-2 rounded-lg ${
          isUser 
            ? 'bg-blue-600 text-white' 
            : isSHANGO
            ? 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 border border-purple-200'
            : 'bg-gray-100 text-gray-800'
        }">
          ${isSHANGO ? '<div class="flex items-center space-x-1 mb-1"><span class="text-xs font-semibold">⚡ SHANGO</span></div>' : ''}
          <p class="text-sm">${message.content}</p>
          <p class="text-xs opacity-70 mt-1">${new Date(message.timestamp).toLocaleTimeString()}</p>
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
      messageInput.addEventListener('keypress', (e: any) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
    }
  }

  getAgentInfo(agentId: string) {
    return this.shangoAgents.find(agent => agent.id === agentId);
  }

  async startChat() {
    this.isOpen = true;
    this.isLoading = true;
    this.render();

    try {
      const response = await fetch('/api/v1/shango/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: this.userId,
          agentId: this.selectedAgent,
          channel: 'chat'
        })
      });

      if (response.ok) {
        const data = await response.json();
        this.currentSession = data.session;
        this.messages = data.session.messages || [];
        this.isLoading = false;
        this.render();
      } else {
        throw new Error('Failed to start chat session');
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      this.isLoading = false;
      this.render();
    }
  }

  closeChat() {
    this.isOpen = false;
    this.currentSession = null;
    this.messages = [];
    this.render();
  }

  addMessage(message: any) {
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
    const input = document.getElementById('shango-message-input') as HTMLInputElement;
    const message = input?.value.trim();
    
    if (!message || !this.currentSession) return;

    // Add user message
    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
      type: 'text'
    };
    
    this.addMessage(userMessage);
    if (input) input.value = '';
    
    try {
      // Send message to API
      const response = await fetch(`/api/v1/shango/sessions/${this.currentSession.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          role: 'user',
          agentId: this.selectedAgent
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Add AI response
        const aiMessage = {
          id: data.aiResponse.id,
          role: 'assistant',
          content: data.aiResponse.content,
          timestamp: data.aiResponse.timestamp,
          type: 'text',
          agentId: data.aiResponse.agentId
        };
        
        this.addMessage(aiMessage);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
        type: 'text'
      };
      
      this.addMessage(errorMessage);
    }
  }
}

describe('SHANGO Chat Widget', () => {
  let widget: SHANGOChatWidget;
  let mockContainer: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock container element
    mockContainer = {
      ...mockDOM,
      innerHTML: ''
    };
    
    mockDOM.getElementById.mockReturnValue(mockContainer);
    mockDOM.createElement.mockReturnValue(mockContainer);
    
    // Mock fetch responses
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        session: {
          id: 'test-session-123',
          userId: 'test-user',
          agentId: 'shango-general',
          status: 'active',
          channel: 'chat',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: [{
            id: 'msg-1',
            role: 'assistant',
            content: 'Hello! I\'m SHANGO, your AI Super Agent. How can I help you today?',
            timestamp: new Date().toISOString(),
            type: 'text'
          }],
          shangoAgent: {
            id: 'shango-general',
            name: 'SHANGO',
            avatar: '⚡'
          }
        }
      })
    });

    // Create widget instance
    widget = new SHANGOChatWidget('test-container', {
      userId: 'test-user',
      defaultAgent: 'shango-general'
    });
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      expect(widget.containerId).toBe('test-container');
      expect(widget.userId).toBe('test-user');
      expect(widget.defaultAgent).toBe('shango-general');
      expect(widget.isOpen).toBe(false);
      expect(widget.isLoading).toBe(false);
      expect(widget.currentSession).toBeNull();
      expect(widget.messages).toEqual([]);
      expect(widget.selectedAgent).toBe('shango-general');
    });

    it('should have all SHANGO agents available', () => {
      expect(widget.shangoAgents).toHaveLength(4);
      expect(widget.shangoAgents[0].id).toBe('shango-general');
      expect(widget.shangoAgents[1].id).toBe('shango-technical');
      expect(widget.shangoAgents[2].id).toBe('shango-sales');
      expect(widget.shangoAgents[3].id).toBe('shango-billing');
    });

    it('should render toggle button initially', () => {
      widget.render();
      expect(mockContainer.innerHTML).toContain('Start Chat with SHANGO');
      expect(mockContainer.innerHTML).toContain('SHANGO AI Super Agent');
    });
  });

  describe('Agent Management', () => {
    it('should get agent info by ID', () => {
      const agent = widget.getAgentInfo('shango-technical');
      expect(agent).toBeDefined();
      expect(agent?.name).toBe('SHANGO Tech');
      expect(agent?.avatar).toBe('🔧');
    });

    it('should return undefined for non-existent agent', () => {
      const agent = widget.getAgentInfo('non-existent');
      expect(agent).toBeUndefined();
    });
  });

  describe('Chat Interface', () => {
    it('should render chat interface when opened', () => {
      widget.isOpen = true;
      widget.render();
      
      expect(mockContainer.innerHTML).toContain('shango-messages');
      expect(mockContainer.innerHTML).toContain('shango-message-input');
      expect(mockContainer.innerHTML).toContain('shango-send-message');
    });

    it('should render messages correctly', () => {
      const message = {
        id: 'msg-1',
        role: 'user',
        content: 'Hello',
        timestamp: new Date().toISOString(),
        type: 'text'
      };
      
      const rendered = widget.renderMessage(message);
      expect(rendered).toContain('Hello');
      expect(rendered).toContain('justify-end'); // User messages align right
    });

    it('should render AI messages correctly', () => {
      const message = {
        id: 'msg-1',
        role: 'assistant',
        content: 'Hi there!',
        timestamp: new Date().toISOString(),
        type: 'text'
      };
      
      const rendered = widget.renderMessage(message);
      expect(rendered).toContain('Hi there!');
      expect(rendered).toContain('justify-start'); // AI messages align left
      expect(rendered).toContain('⚡ SHANGO');
    });
  });

  describe('Chat Session Management', () => {
    it('should start chat session successfully', async () => {
      await widget.startChat();
      
      expect(widget.isOpen).toBe(true);
      expect(widget.isLoading).toBe(false);
      expect(widget.currentSession).toBeDefined();
      expect(widget.currentSession.id).toBe('test-session-123');
      expect(global.fetch).toHaveBeenCalledWith('/api/v1/shango/sessions', expect.any(Object));
    });

    it('should handle chat session start failure', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      await widget.startChat();
      
      expect(widget.isOpen).toBe(true);
      expect(widget.isLoading).toBe(false);
      expect(widget.currentSession).toBeNull();
    });

    it('should close chat session', () => {
      widget.isOpen = true;
      widget.currentSession = { id: 'test-session' };
      widget.messages = [{ id: 'msg-1', content: 'test' }];
      
      widget.closeChat();
      
      expect(widget.isOpen).toBe(false);
      expect(widget.currentSession).toBeNull();
      expect(widget.messages).toEqual([]);
    });
  });

  describe('Message Handling', () => {
    beforeEach(() => {
      widget.currentSession = { id: 'test-session-123' };
      widget.isOpen = true;
    });

    it('should add message to messages array', () => {
      const message = {
        id: 'msg-1',
        role: 'user',
        content: 'Hello',
        timestamp: new Date().toISOString(),
        type: 'text'
      };
      
      widget.addMessage(message);
      
      expect(widget.messages).toContain(message);
    });

    it('should send message successfully', async () => {
      // Mock input element
      const mockInput = { ...mockDOM, value: 'Hello, I need help with pricing' };
      mockDOM.getElementById.mockImplementation((id: string) => {
        if (id === 'shango-message-input') return mockInput;
        return mockContainer;
      });

      // Mock successful API response
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          message: {
            id: 'user-msg-1',
            role: 'user',
            content: 'Hello, I need help with pricing',
            timestamp: new Date().toISOString(),
            type: 'text'
          },
          aiResponse: {
            id: 'ai-msg-1',
            role: 'assistant',
            content: 'Our enterprise pricing starts at $299/month...',
            timestamp: new Date().toISOString(),
            type: 'text',
            agentId: 'shango-general'
          }
        })
      });

      await widget.sendMessage();
      
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/shango/sessions/test-session-123/messages',
        expect.any(Object)
      );
      expect(widget.messages).toHaveLength(2); // User message + AI response
    });

    it('should handle message send failure', async () => {
      // Mock input element
      const mockInput = { ...mockDOM, value: 'Hello' };
      mockDOM.getElementById.mockImplementation((id: string) => {
        if (id === 'shango-message-input') return mockInput;
        return mockContainer;
      });

      // Mock failed API response
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      await widget.sendMessage();
      
      expect(widget.messages).toHaveLength(2); // User message + error message
      expect(widget.messages[1].content).toContain('Sorry, I encountered an error');
    });

    it('should not send empty messages', async () => {
      // Mock input element with empty value
      const mockInput = { ...mockDOM, value: '' };
      mockDOM.getElementById.mockImplementation((id: string) => {
        if (id === 'shango-message-input') return mockInput;
        return mockContainer;
      });

      await widget.sendMessage();
      
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should not send message without active session', async () => {
      widget.currentSession = null;
      
      // Mock input element
      const mockInput = { ...mockDOM, value: 'Hello' };
      mockDOM.getElementById.mockImplementation((id: string) => {
        if (id === 'shango-message-input') return mockInput;
        return mockContainer;
      });

      await widget.sendMessage();
      
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('Event Listeners', () => {
    it('should set up event listeners on initialization', () => {
      expect(mockDOM.addEventListener).toHaveBeenCalled();
    });

    it('should handle start chat button click', () => {
      const startButton = { ...mockDOM, addEventListener: vi.fn() };
      mockDOM.getElementById.mockReturnValue(startButton);
      
      widget.setupEventListeners();
      
      expect(startButton.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    });

    it('should handle close chat button click', () => {
      const closeButton = { ...mockDOM, addEventListener: vi.fn() };
      mockDOM.getElementById.mockImplementation((id: string) => {
        if (id === 'shango-close-chat') return closeButton;
        return mockContainer;
      });
      
      widget.setupEventListeners();
      
      expect(closeButton.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    });

    it('should handle send message button click', () => {
      const sendButton = { ...mockDOM, addEventListener: vi.fn() };
      mockDOM.getElementById.mockImplementation((id: string) => {
        if (id === 'shango-send-message') return sendButton;
        return mockContainer;
      });
      
      widget.setupEventListeners();
      
      expect(sendButton.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    });

    it('should handle enter key press in message input', () => {
      const messageInput = { ...mockDOM, addEventListener: vi.fn() };
      mockDOM.getElementById.mockImplementation((id: string) => {
        if (id === 'shango-message-input') return messageInput;
        return mockContainer;
      });
      
      widget.setupEventListeners();
      
      expect(messageInput.addEventListener).toHaveBeenCalledWith('keypress', expect.any(Function));
    });
  });

  describe('Scroll Management', () => {
    it('should scroll to bottom when adding message', () => {
      const mockMessagesContainer = { ...mockDOM, scrollTop: 0, scrollHeight: 100 };
      mockDOM.getElementById.mockImplementation((id: string) => {
        if (id === 'shango-messages') return mockMessagesContainer;
        return mockContainer;
      });

      const message = {
        id: 'msg-1',
        role: 'user',
        content: 'Hello',
        timestamp: new Date().toISOString(),
        type: 'text'
      };
      
      widget.addMessage(message);
      
      expect(mockMessagesContainer.scrollTop).toBe(100);
    });
  });
});
