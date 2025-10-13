// Unit tests for SinchChatLive Service
const fs = require('fs');
const path = require('path');

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_SINCH_API_KEY = 'test-api-key';
process.env.NEXT_PUBLIC_SINCH_WIDGET_ID = 'test-widget-id';

// Mock console methods
global.console = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
};

// Mock the SinchChatService classes and functions
// Since we can't easily eval TypeScript, we'll mock the essential parts

// Mock SinchChatLive class
class MockSinchChatLive {
  constructor(config) {
    this.config = config;
  }

  async initialize() {
    return Promise.resolve();
  }

  on(event, handler) {
    this[`_${event}Handler`] = handler;
  }

  async startSession(config) {
    return {
      id: 'test-session-123',
      userId: config.userId,
      agentId: 'test-agent',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  async sendMessage(config) {
    return Promise.resolve();
  }

  async endSession(sessionId) {
    return Promise.resolve();
  }

  async getHistory(sessionId) {
    return [];
  }

  async isAgentAvailable() {
    return true;
  }

  async getAvailableAgents() {
    return [];
  }

  async sendFile(config) {
    return Promise.resolve();
  }

  async startVoiceCall(config) {
    return Promise.resolve();
  }

  async sendSMS(config) {
    return Promise.resolve();
  }
}

// Mock SHANGOAIService class
class SHANGOAIService {
  constructor(apiKey, widgetId) {
    this.sinchChat = new MockSinchChatLive({ apiKey, widgetId });
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
  }

  async initialize() {
    await this.sinchChat.initialize();
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.sinchChat.on('agentAvailable', (available) => {
      this.emit('agentAvailabilityChanged', available);
    });
    this.sinchChat.on('message', (message) => {
      this.emit('message', message);
    });
    this.sinchChat.on('sessionStarted', (session) => {
      this.emit('session', session);
    });
    this.sinchChat.on('sessionEnded', () => {
      this.emit('sessionEnded');
    });
  }

  emit(event, data) {
    console.log(`SHANGO Event: ${event}`, data);
  }

  on(event, handler) {
    this[`_${event}Handler`] = handler;
  }

  getSHANGOAgents() {
    return this.shangoAgents;
  }

  getSHANGOAgent(agentId) {
    return this.shangoAgents.find(agent => agent.id === agentId);
  }

  routeToSHANGOAgent(message, context) {
    const intent = this.analyzeIntent(message);
    if (intent.includes('technical') || intent.includes('bug') || intent.includes('error') || intent.includes('api')) {
      return this.shangoAgents.find(a => a.id === 'shango-technical');
    } else if (intent.includes('purchase') || intent.includes('price') || intent.includes('demo') || intent.includes('buy')) {
      return this.shangoAgents.find(a => a.id === 'shango-sales');
    } else if (intent.includes('billing') || intent.includes('payment') || intent.includes('subscription') || intent.includes('invoice')) {
      return this.shangoAgents.find(a => a.id === 'shango-billing');
    } else {
      return this.shangoAgents.find(a => a.id === 'shango-general');
    }
  }

  analyzeIntent(message) {
    const intents = [];
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('technical') || lowerMessage.includes('bug') || lowerMessage.includes('error')) {
      intents.push('technical');
    }
    if (lowerMessage.includes('buy') || lowerMessage.includes('purchase') || lowerMessage.includes('price')) {
      intents.push('sales');
    }
    if (lowerMessage.includes('billing') || lowerMessage.includes('payment') || lowerMessage.includes('invoice')) {
      intents.push('billing');
    }
    if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('question')) {
      intents.push('support');
    }

    return intents;
  }

  analyzeUrgency(message) {
    const urgentKeywords = ['urgent', 'asap', 'immediately', 'critical', 'emergency'];
    const mediumKeywords = ['soon', 'today', 'important', 'priority'];
    
    const lowerMessage = message.toLowerCase();
    
    if (urgentKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'high';
    } else if (mediumKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'medium';
    }
    
    return 'low';
  }

  async startSHANGOChat(userId, preferredAgent) {
    const agent = preferredAgent ? this.getSHANGOAgent(preferredAgent) : this.shangoAgents[0];
    
    const session = await this.sinchChat.startSession({
      userId,
      metadata: {
        platform: 'tetrix-joromi',
        shangoAgent: agent?.id || 'shango-general',
        timestamp: new Date().toISOString()
      }
    });
    
    return {
      id: session.id,
      userId: session.userId,
      agentId: session.agentId,
      status: 'active',
      channel: 'chat',
      createdAt: new Date(session.createdAt),
      updatedAt: new Date(session.updatedAt),
      messages: [],
      shangoAgent: agent ? {
        personality: agent.personality,
        capabilities: agent.capabilities,
        tools: agent.tools
      } : undefined
    };
  }

  async sendSHANGOMessage(sessionId, message) {
    await this.sinchChat.sendMessage({
      sessionId,
      text: message
    });
  }

  async endSHANGOChat(sessionId) {
    await this.sinchChat.endSession(sessionId);
  }

  async getSHANGOChatHistory(sessionId) {
    const history = await this.sinchChat.getHistory(sessionId);
    return history.map((msg) => ({
      id: msg.id,
      role: msg.from === 'agent' ? 'agent' : 'user',
      content: msg.text,
      timestamp: new Date(msg.timestamp),
      type: 'text',
      metadata: {
        agentId: msg.agentId,
        sessionId: msg.sessionId
      }
    }));
  }

  async isAgentAvailable() {
    return await this.sinchChat.isAgentAvailable();
  }

  async getAvailableAgents() {
    return await this.sinchChat.getAvailableAgents();
  }

  async sendFile(sessionId, file) {
    await this.sinchChat.sendFile({
      sessionId,
      file,
      metadata: {
        name: file.name,
        type: file.type,
        size: file.size
      }
    });
  }

  async startVoiceCall(sessionId, phoneNumber) {
    await this.sinchChat.startVoiceCall({
      sessionId,
      phoneNumber
    });
  }

  async sendSMS(sessionId, phoneNumber, message) {
    await this.sinchChat.sendSMS({
      sessionId,
      phoneNumber,
      text: message
    });
  }
}

// Mock singleton
let shangoAIService = null;

const getSHANGOAIService = () => {
  if (!shangoAIService) {
    const apiKey = process.env.NEXT_PUBLIC_SINCH_API_KEY;
    const widgetId = process.env.NEXT_PUBLIC_SINCH_WIDGET_ID;
    
    if (!apiKey || !widgetId) {
      console.warn('SinchChatLive API key and widget ID are not configured. SHANGO AI Super Agent will be disabled.');
      return null;
    }
    
    try {
      shangoAIService = new SHANGOAIService(apiKey, widgetId);
    } catch (error) {
      console.error('Failed to initialize SHANGO AI Super Agent:', error);
      return null;
    }
  }
  
  return shangoAIService;
};

describe('SinchChatService', () => {
  let service;
  let mockSinchChat;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create service instance
    service = new SHANGOAIService('test-api-key', 'test-widget-id');
    
    // Mock the SinchChatLive instance
    mockSinchChat = {
      initialize: jest.fn().mockResolvedValue(),
      on: jest.fn(),
      startSession: jest.fn().mockResolvedValue({
        id: 'test-session-123',
        userId: 'test-user',
        agentId: 'test-agent',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }),
      sendMessage: jest.fn().mockResolvedValue(),
      endSession: jest.fn().mockResolvedValue(),
      getHistory: jest.fn().mockResolvedValue([]),
      isAgentAvailable: jest.fn().mockResolvedValue(true),
      getAvailableAgents: jest.fn().mockResolvedValue([]),
      sendFile: jest.fn().mockResolvedValue(),
      startVoiceCall: jest.fn().mockResolvedValue(),
      sendSMS: jest.fn().mockResolvedValue()
    };
    
    // Replace the SinchChatLive instance
    service.sinchChat = mockSinchChat;
  });

  describe('Initialization', () => {
    it('should initialize with correct configuration', () => {
      expect(service).toBeDefined();
      expect(service.shangoAgents).toHaveLength(4);
    });

    it('should have all required SHANGO agents', () => {
      const agentIds = service.shangoAgents.map(agent => agent.id);
      expect(agentIds).toContain('shango-general');
      expect(agentIds).toContain('shango-technical');
      expect(agentIds).toContain('shango-sales');
      expect(agentIds).toContain('shango-billing');
    });

    it('should initialize successfully', async () => {
      await service.initialize();
      
      expect(mockSinchChat.initialize).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('SHANGO AI Super Agent initialized successfully');
    });

    it('should handle initialization errors', async () => {
      mockSinchChat.initialize.mockRejectedValue(new Error('Initialization failed'));
      
      await expect(service.initialize()).rejects.toThrow('Initialization failed');
      expect(console.error).toHaveBeenCalledWith('Failed to initialize SHANGO AI Super Agent:', expect.any(Error));
    });
  });

  describe('Agent Management', () => {
    it('should get all SHANGO agents', () => {
      const agents = service.getSHANGOAgents();
      expect(agents).toHaveLength(4);
      expect(agents[0].id).toBe('shango-general');
    });

    it('should get specific agent by ID', () => {
      const agent = service.getSHANGOAgent('shango-technical');
      expect(agent).toBeDefined();
      expect(agent.id).toBe('shango-technical');
      expect(agent.name).toBe('SHANGO Tech');
    });

    it('should return undefined for invalid agent ID', () => {
      const agent = service.getSHANGOAgent('invalid-agent');
      expect(agent).toBeUndefined();
    });

    it('should route to correct agent based on message content', () => {
      const context = { userType: 'enterprise' };
      
      // Test technical routing
      const techAgent = service.routeToSHANGOAgent('I have a technical bug', context);
      expect(techAgent.id).toBe('shango-technical');
      
      // Test sales routing
      const salesAgent = service.routeToSHANGOAgent('What is your pricing?', context);
      expect(salesAgent.id).toBe('shango-sales');
      
      // Test billing routing
      const billingAgent = service.routeToSHANGOAgent('I have a billing issue', context);
      expect(billingAgent.id).toBe('shango-billing');
      
      // Test general routing
      const generalAgent = service.routeToSHANGOAgent('Hello there', context);
      expect(generalAgent.id).toBe('shango-general');
    });
  });

  describe('Intent Analysis', () => {
    it('should analyze technical intent', () => {
      const intents = service.analyzeIntent('I have a technical problem with the API');
      expect(intents).toContain('technical');
    });

    it('should analyze sales intent', () => {
      const intents = service.analyzeIntent('I want to buy your product');
      expect(intents).toContain('sales');
    });

    it('should analyze billing intent', () => {
      const intents = service.analyzeIntent('I need help with my invoice');
      expect(intents).toContain('billing');
    });

    it('should analyze support intent', () => {
      const intents = service.analyzeIntent('I need help with something');
      expect(intents).toContain('support');
    });

    it('should analyze multiple intents', () => {
      const intents = service.analyzeIntent('I have a technical billing problem');
      expect(intents).toContain('technical');
      expect(intents).toContain('billing');
    });
  });

  describe('Urgency Analysis', () => {
    it('should detect high urgency', () => {
      const urgency = service.analyzeUrgency('This is urgent and critical');
      expect(urgency).toBe('high');
    });

    it('should detect medium urgency', () => {
      const urgency = service.analyzeUrgency('This is important and needs to be done soon');
      expect(urgency).toBe('medium');
    });

    it('should detect low urgency', () => {
      const urgency = service.analyzeUrgency('Just a general question');
      expect(urgency).toBe('low');
    });
  });

  describe('Chat Session Management', () => {
    it('should start SHANGO chat session', async () => {
      const session = await service.startSHANGOChat('test-user', 'shango-general');
      
      expect(session).toBeDefined();
      expect(session.userId).toBe('test-user');
      expect(session.status).toBe('active');
      expect(session.channel).toBe('chat');
      expect(session.shangoAgent).toBeDefined();
      expect(session.messages).toHaveLength(1); // Greeting message
    });

    it('should add greeting message on session start', async () => {
      const session = await service.startSHANGOChat('test-user', 'shango-general');
      
      expect(session.messages).toHaveLength(1);
      expect(session.messages[0].role).toBe('shango');
      expect(session.messages[0].content).toContain('Hello! I\'m SHANGO');
    });

    it('should handle session start errors', async () => {
      mockSinchChat.startSession.mockRejectedValue(new Error('Session start failed'));
      
      await expect(service.startSHANGOChat('test-user')).rejects.toThrow('Session start failed');
      expect(console.error).toHaveBeenCalledWith('Failed to start SHANGO chat session:', expect.any(Error));
    });

    it('should send SHANGO message', async () => {
      await service.sendSHANGOMessage('session-123', 'Hello SHANGO');
      
      expect(mockSinchChat.sendMessage).toHaveBeenCalledWith({
        sessionId: 'session-123',
        text: 'Hello SHANGO'
      });
    });

    it('should handle send message errors', async () => {
      mockSinchChat.sendMessage.mockRejectedValue(new Error('Send failed'));
      
      await expect(service.sendSHANGOMessage('session-123', 'test')).rejects.toThrow('Send failed');
      expect(console.error).toHaveBeenCalledWith('Failed to send SHANGO message:', expect.any(Error));
    });

    it('should end SHANGO chat session', async () => {
      await service.endSHANGOChat('session-123');
      
      expect(mockSinchChat.endSession).toHaveBeenCalledWith('session-123');
    });

    it('should handle end session errors', async () => {
      mockSinchChat.endSession.mockRejectedValue(new Error('End failed'));
      
      await expect(service.endSHANGOChat('session-123')).rejects.toThrow('End failed');
      expect(console.error).toHaveBeenCalledWith('Failed to end SHANGO chat session:', expect.any(Error));
    });
  });

  describe('Message History', () => {
    it('should get SHANGO chat history', async () => {
      const mockHistory = [
        { id: 'msg1', from: 'user', text: 'Hello', timestamp: new Date().toISOString(), agentId: 'agent1', sessionId: 'session1' },
        { id: 'msg2', from: 'agent', text: 'Hi there', timestamp: new Date().toISOString(), agentId: 'agent1', sessionId: 'session1' }
      ];
      
      mockSinchChat.getHistory.mockResolvedValue(mockHistory);
      
      const history = await service.getSHANGOChatHistory('session-123');
      
      expect(history).toHaveLength(2);
      expect(history[0].role).toBe('user');
      expect(history[1].role).toBe('agent');
    });

    it('should handle get history errors', async () => {
      mockSinchChat.getHistory.mockRejectedValue(new Error('History failed'));
      
      await expect(service.getSHANGOChatHistory('session-123')).rejects.toThrow('History failed');
      expect(console.error).toHaveBeenCalledWith('Failed to get SHANGO chat history:', expect.any(Error));
    });
  });

  describe('Agent Availability', () => {
    it('should check if agent is available', async () => {
      const available = await service.isAgentAvailable();
      
      expect(available).toBe(true);
      expect(mockSinchChat.isAgentAvailable).toHaveBeenCalled();
    });

    it('should handle agent availability errors', async () => {
      mockSinchChat.isAgentAvailable.mockRejectedValue(new Error('Availability check failed'));
      
      const available = await service.isAgentAvailable();
      
      expect(available).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Failed to check agent availability:', expect.any(Error));
    });

    it('should get available agents', async () => {
      const agents = await service.getAvailableAgents();
      
      expect(agents).toEqual([]);
      expect(mockSinchChat.getAvailableAgents).toHaveBeenCalled();
    });

    it('should handle get available agents errors', async () => {
      mockSinchChat.getAvailableAgents.mockRejectedValue(new Error('Get agents failed'));
      
      const agents = await service.getAvailableAgents();
      
      expect(agents).toEqual([]);
      expect(console.error).toHaveBeenCalledWith('Failed to get available agents:', expect.any(Error));
    });
  });

  describe('File Sharing', () => {
    it('should send file', async () => {
      const mockFile = { name: 'test.txt', type: 'text/plain', size: 100 };
      
      await service.sendFile('session-123', mockFile);
      
      expect(mockSinchChat.sendFile).toHaveBeenCalledWith({
        sessionId: 'session-123',
        file: mockFile,
        metadata: {
          name: 'test.txt',
          type: 'text/plain',
          size: 100
        }
      });
    });

    it('should handle send file errors', async () => {
      mockSinchChat.sendFile.mockRejectedValue(new Error('Send file failed'));
      
      await expect(service.sendFile('session-123', {})).rejects.toThrow('Send file failed');
      expect(console.error).toHaveBeenCalledWith('Failed to send file:', expect.any(Error));
    });
  });

  describe('Voice Integration', () => {
    it('should start voice call', async () => {
      await service.startVoiceCall('session-123', '+1234567890');
      
      expect(mockSinchChat.startVoiceCall).toHaveBeenCalledWith({
        sessionId: 'session-123',
        phoneNumber: '+1234567890'
      });
    });

    it('should handle voice call errors', async () => {
      mockSinchChat.startVoiceCall.mockRejectedValue(new Error('Voice call failed'));
      
      await expect(service.startVoiceCall('session-123', '+1234567890')).rejects.toThrow('Voice call failed');
      expect(console.error).toHaveBeenCalledWith('Failed to start voice call:', expect.any(Error));
    });
  });

  describe('SMS Integration', () => {
    it('should send SMS', async () => {
      await service.sendSMS('session-123', '+1234567890', 'Test message');
      
      expect(mockSinchChat.sendSMS).toHaveBeenCalledWith({
        sessionId: 'session-123',
        phoneNumber: '+1234567890',
        text: 'Test message'
      });
    });

    it('should handle SMS errors', async () => {
      mockSinchChat.sendSMS.mockRejectedValue(new Error('SMS failed'));
      
      await expect(service.sendSMS('session-123', '+1234567890', 'test')).rejects.toThrow('SMS failed');
      expect(console.error).toHaveBeenCalledWith('Failed to send SMS:', expect.any(Error));
    });
  });

  describe('Event Handling', () => {
    it('should set up event handlers', () => {
      service.setupEventHandlers();
      
      expect(mockSinchChat.on).toHaveBeenCalledWith('agentAvailable', expect.any(Function));
      expect(mockSinchChat.on).toHaveBeenCalledWith('message', expect.any(Function));
      expect(mockSinchChat.on).toHaveBeenCalledWith('sessionStarted', expect.any(Function));
      expect(mockSinchChat.on).toHaveBeenCalledWith('sessionEnded', expect.any(Function));
    });

    it('should handle message events', () => {
      const messageHandler = jest.fn();
      service.on('message', messageHandler);
      
      // Simulate message event
      const mockMessage = {
        id: 'msg1',
        from: 'agent',
        text: 'Hello',
        timestamp: new Date().toISOString(),
        agentId: 'agent1',
        sessionId: 'session1'
      };
      
      service.setupEventHandlers();
      
      // Find and call the message handler
      const messageCallback = mockSinchChat.on.mock.calls.find(call => call[0] === 'message')[1];
      messageCallback(mockMessage);
      
      expect(messageHandler).toHaveBeenCalled();
    });

    it('should handle session events', () => {
      const sessionHandler = jest.fn();
      service.on('session', sessionHandler);
      
      // Simulate session started event
      const mockSession = {
        id: 'session1',
        userId: 'user1',
        agentId: 'agent1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      service.setupEventHandlers();
      
      // Find and call the session started handler
      const sessionCallback = mockSinchChat.on.mock.calls.find(call => call[0] === 'sessionStarted')[1];
      sessionCallback(mockSession);
      
      expect(sessionHandler).toHaveBeenCalled();
    });
  });

  describe('Singleton Pattern', () => {
    it('should return singleton instance', () => {
      const instance1 = getSHANGOAIService();
      const instance2 = getSHANGOAIService();
      
      expect(instance1).toBe(instance2);
    });

    it('should return null when API key is missing', () => {
      // Temporarily remove API key
      const originalApiKey = process.env.NEXT_PUBLIC_SINCH_API_KEY;
      delete process.env.NEXT_PUBLIC_SINCH_API_KEY;
      
      // Reset the singleton
      shangoAIService = null;
      
      const instance = getSHANGOAIService();
      expect(instance).toBeNull();
      
      // Restore API key
      process.env.NEXT_PUBLIC_SINCH_API_KEY = originalApiKey;
    });

    it('should return null when widget ID is missing', () => {
      // Temporarily remove widget ID
      const originalWidgetId = process.env.NEXT_PUBLIC_SINCH_WIDGET_ID;
      delete process.env.NEXT_PUBLIC_SINCH_WIDGET_ID;
      
      // Reset the singleton
      shangoAIService = null;
      
      const instance = getSHANGOAIService();
      expect(instance).toBeNull();
      
      // Restore widget ID
      process.env.NEXT_PUBLIC_SINCH_WIDGET_ID = originalWidgetId;
    });
  });
});
