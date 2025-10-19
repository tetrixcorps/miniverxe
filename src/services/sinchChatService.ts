// SHANGO AI Super Agent - SinchChatLive Service for TETRIX & JoRoMi Platform
// Note: SinchChatLive integration is mocked for development
// In production, uncomment the import below and install the package
// import { SinchChatLive } from '@sinch/sinch-chat-live';

// Mock SinchChatLive for development
class MockSinchChatLive {
  constructor(config: any) {
    console.log('MockSinchChatLive initialized with config:', config);
  }

  async initialize() {
    console.log('MockSinchChatLive initialized');
    return Promise.resolve();
  }

  on(event: string, handler: Function) {
    console.log(`MockSinchChatLive: Event listener added for ${event}`);
  }

  async startSession(config: any) {
    return {
      id: `session-${Date.now()}`,
      userId: config.userId,
      agentId: 'mock-agent',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  async sendMessage(config: any) {
    console.log('MockSinchChatLive: Message sent', config);
    // Simulate AI response after a delay
    setTimeout(() => {
      const mockResponse = {
        id: `msg-${Date.now()}`,
        from: 'agent',
        text: 'Thank you for your message! This is a mock response from SHANGO AI Super Agent. In production, this would be connected to our real AI system.',
        timestamp: new Date().toISOString(),
        agentId: 'mock-agent',
        sessionId: config.sessionId
      };
      // Trigger message event
      this.emit('message', mockResponse);
    }, 1000);
  }

  async endSession(sessionId: string) {
    console.log('MockSinchChatLive: Session ended', sessionId);
  }

  async getHistory(sessionId: string) {
    return [];
  }

  async isAgentAvailable() {
    return true;
  }

  async getAvailableAgents() {
    return [];
  }

  async sendFile(config: any) {
    console.log('MockSinchChatLive: File sent', config);
  }

  async startVoiceCall(config: any) {
    console.log('MockSinchChatLive: Voice call started', config);
  }

  async sendSMS(config: any) {
    console.log('MockSinchChatLive: SMS sent', config);
  }

  emit(event: string, data: any) {
    console.log(`MockSinchChatLive: Event ${event} emitted`, data);
  }
}

// Use mock in development, real SinchChatLive in production
const SinchChatLive = MockSinchChatLive;

export interface ChatSession {
  id: string;
  userId: string;
  agentId?: string;
  status: 'active' | 'waiting' | 'ended';
  channel: 'chat' | 'voice' | 'sms' | 'email';
  createdAt: Date;
  updatedAt: Date;
  messages: ChatMessage[];
  shangoAgent?: {
    personality: 'professional' | 'friendly' | 'technical' | 'sales';
    capabilities: string[];
    tools: string[];
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'shango' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  type: 'text' | 'voice' | 'file' | 'image' | 'video';
  metadata?: {
    agentId?: string;
    sessionId?: string;
    channel?: string;
    attachments?: FileAttachment[];
    shangoResponse?: {
      confidence: number;
      intent: string;
      entities: any[];
    };
  };
}

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface SHANGOAgent {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  tools: string[];
  personality: 'professional' | 'friendly' | 'technical' | 'sales';
  avatar: string;
  greeting: string;
}

export class SHANGOAIService {
  private sinchChat: MockSinchChatLive;
  private currentSession: ChatSession | null = null;
  private messageHandlers: ((message: ChatMessage) => void)[] = [];
  private sessionHandlers: ((session: ChatSession) => void)[] = [];
  private shangoAgents: SHANGOAgent[] = [];

  constructor(apiKey: string, widgetId: string) {
    this.sinchChat = new SinchChatLive({
      apiKey,
      widgetId,
      environment: process.env.NODE_ENV || 'development'
    });

    // Initialize SHANGO AI Agents
    this.initializeSHANGOAgents();
  }

  private initializeSHANGOAgents(): void {
    this.shangoAgents = [
      {
        id: 'shango-general',
        name: 'SHANGO',
        description: 'Your AI Super Agent for general assistance and support',
        capabilities: ['general_questions', 'basic_support', 'product_info', 'troubleshooting'],
        tools: ['n8n', 'knowledge_base', 'api_docs'],
        personality: 'friendly',
        avatar: '&#9889;',
        greeting: 'Hello! I\'m SHANGO, your AI Super Agent. How can I help you today?'
      },
      {
        id: 'shango-technical',
        name: 'SHANGO Tech',
        description: 'Specialized in technical issues and advanced troubleshooting',
        capabilities: ['technical_support', 'api_integration', 'debugging', 'system_analysis'],
        tools: ['n8n', 'api_docs', 'system_logs', 'debugging_tools'],
        personality: 'technical',
        avatar: '&#128295;#128295;',
        greeting: 'Hi! I\'m SHANGO Tech, your technical AI Super Agent. What technical challenge can I help you solve?'
      },
      {
        id: 'shango-sales',
        name: 'SHANGO Sales',
        description: 'Expert in sales, pricing, and product recommendations',
        capabilities: ['sales', 'product_recommendations', 'pricing_info', 'demo_requests', 'lead_qualification'],
        tools: ['n8n', 'crm', 'pricing_engine', 'product_catalog'],
        personality: 'sales',
        avatar: '&#128188;#128188;',
        greeting: 'Welcome! I\'m SHANGO Sales, your AI Super Agent for all sales inquiries. How can I help you succeed today?'
      },
      {
        id: 'shango-billing',
        name: 'SHANGO Billing',
        description: 'Specialized in billing, payments, and account management',
        capabilities: ['billing_support', 'payment_issues', 'subscription_management', 'account_updates'],
        tools: ['n8n', 'stripe', 'billing_system', 'account_management'],
        personality: 'professional',
        avatar: '&#128179;#128179;',
        greeting: 'Hello! I\'m SHANGO Billing, your AI Super Agent for billing and account matters. How can I assist you?'
      }
    ];
  }

  async initialize(): Promise<void> {
    try {
      await this.sinchChat.initialize();
      this.setupEventHandlers();
      console.log('SHANGO AI Super Agent initialized successfully');
    } catch (error) {
      console.error('Failed to initialize SHANGO AI Super Agent:', error);
      throw error;
    }
  }

  private setupEventHandlers(): void {
    // Agent availability
    this.sinchChat.on('agentAvailable', (available: boolean) => {
      this.emit('agentAvailabilityChanged', available);
    });

    // New message
    this.sinchChat.on('message', (message: any) => {
      const chatMessage: ChatMessage = {
        id: message.id,
        role: message.from === 'agent' ? 'agent' : 'user',
        content: message.text,
        timestamp: new Date(message.timestamp),
        type: 'text',
        metadata: {
          agentId: message.agentId,
          sessionId: message.sessionId
        }
      };
      
      this.messageHandlers.forEach(handler => handler(chatMessage));
    });

    // Session events
    this.sinchChat.on('sessionStarted', (session: any) => {
      const chatSession: ChatSession = {
        id: session.id,
        userId: session.userId,
        agentId: session.agentId,
        status: 'active',
        channel: 'chat',
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt),
        messages: []
      };
      
      this.currentSession = chatSession;
      this.sessionHandlers.forEach(handler => handler(chatSession));
    });

    this.sinchChat.on('sessionEnded', () => {
      if (this.currentSession) {
        this.currentSession.status = 'ended';
        this.currentSession.updatedAt = new Date();
        this.sessionHandlers.forEach(handler => handler(this.currentSession!));
      }
      this.currentSession = null;
    });
  }

  // Event listeners
  on(event: string, handler: ((message: ChatMessage) => void) | ((session: ChatSession) => void)): void {
    if (event === 'message') {
      this.messageHandlers.push(handler as (message: ChatMessage) => void);
    } else if (event === 'session') {
      this.sessionHandlers.push(handler as (session: ChatSession) => void);
    }
  }

  emit(event: string, data: any): void {
    console.log(`SHANGO Event: ${event}`, data);
  }

  // SHANGO Agent Management
  getSHANGOAgents(): SHANGOAgent[] {
    return this.shangoAgents;
  }

  getSHANGOAgent(agentId: string): SHANGOAgent | undefined {
    return this.shangoAgents.find(agent => agent.id === agentId);
  }

  routeToSHANGOAgent(message: string, context: any): SHANGOAgent {
    const intent = this.analyzeIntent(message);
    const urgency = this.analyzeUrgency(message);
    const userType = context.userType;

    // Route to appropriate SHANGO agent
    if (intent.includes('technical') || intent.includes('bug') || intent.includes('error') || intent.includes('api')) {
      return this.shangoAgents.find(a => a.id === 'shango-technical')!;
    } else if (intent.includes('purchase') || intent.includes('price') || intent.includes('demo') || intent.includes('buy')) {
      return this.shangoAgents.find(a => a.id === 'shango-sales')!;
    } else if (intent.includes('billing') || intent.includes('payment') || intent.includes('subscription') || intent.includes('invoice')) {
      return this.shangoAgents.find(a => a.id === 'shango-billing')!;
    } else {
      return this.shangoAgents.find(a => a.id === 'shango-general')!;
    }
  }

  private analyzeIntent(message: string): string[] {
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

  private analyzeUrgency(message: string): 'low' | 'medium' | 'high' {
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

  // Chat operations
  async startSHANGOChat(userId: string, preferredAgent?: string): Promise<ChatSession> {
    try {
      const agent = preferredAgent ? this.getSHANGOAgent(preferredAgent) : this.shangoAgents[0];
      
      const session = await this.sinchChat.startSession({
        userId,
        metadata: {
          platform: 'tetrix-joromi',
          shangoAgent: agent?.id || 'shango-general',
          timestamp: new Date().toISOString()
        }
      });
      
      const chatSession: ChatSession = {
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

      // Send SHANGO greeting
      if (agent) {
        const greetingMessage: ChatMessage = {
          id: `shango-greeting-${Date.now()}`,
          role: 'shango',
          content: agent.greeting,
          timestamp: new Date(),
          type: 'text',
          metadata: {
            shangoResponse: {
              confidence: 1.0,
              intent: 'greeting',
              entities: []
            }
          }
        };
        
        chatSession.messages.push(greetingMessage);
      }

      return chatSession;
    } catch (error) {
      console.error('Failed to start SHANGO chat session:', error);
      throw error;
    }
  }

  async sendSHANGOMessage(sessionId: string, message: string): Promise<void> {
    try {
      await this.sinchChat.sendMessage({
        sessionId,
        text: message
      });
    } catch (error) {
      console.error('Failed to send SHANGO message:', error);
      throw error;
    }
  }

  async endSHANGOChat(sessionId: string): Promise<void> {
    try {
      await this.sinchChat.endSession(sessionId);
    } catch (error) {
      console.error('Failed to end SHANGO chat session:', error);
      throw error;
    }
  }

  async getSHANGOChatHistory(sessionId: string): Promise<ChatMessage[]> {
    try {
      const history = await this.sinchChat.getHistory(sessionId);
      return history.map((msg: any) => ({
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
    } catch (error) {
      console.error('Failed to get SHANGO chat history:', error);
      throw error;
    }
  }

  // Agent operations
  async isAgentAvailable(): Promise<boolean> {
    try {
      return await this.sinchChat.isAgentAvailable();
    } catch (error) {
      console.error('Failed to check agent availability:', error);
      return false;
    }
  }

  async getAvailableAgents(): Promise<any[]> {
    try {
      return await this.sinchChat.getAvailableAgents();
    } catch (error) {
      console.error('Failed to get available agents:', error);
      return [];
    }
  }

  // File sharing
  async sendFile(sessionId: string, file: File): Promise<void> {
    try {
      await this.sinchChat.sendFile({
        sessionId,
        file,
        metadata: {
          name: file.name,
          type: file.type,
          size: file.size
        }
      });
    } catch (error) {
      console.error('Failed to send file:', error);
      throw error;
    }
  }

  // Voice integration
  async startVoiceCall(sessionId: string, phoneNumber: string): Promise<void> {
    try {
      await this.sinchChat.startVoiceCall({
        sessionId,
        phoneNumber
      });
    } catch (error) {
      console.error('Failed to start voice call:', error);
      throw error;
    }
  }

  // SMS integration
  async sendSMS(sessionId: string, phoneNumber: string, message: string): Promise<void> {
    try {
      await this.sinchChat.sendSMS({
        sessionId,
        phoneNumber,
        text: message
      });
    } catch (error) {
      console.error('Failed to send SMS:', error);
      throw error;
    }
  }
}

// Singleton instance
let shangoAIService: SHANGOAIService | null = null;

export const getSHANGOAIService = (): SHANGOAIService | null => {
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

export default SHANGOAIService;
