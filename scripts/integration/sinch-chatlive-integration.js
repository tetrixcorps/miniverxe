#!/usr/bin/env node
/**
 * SinchChatLive Integration Script for TETRIX & JoRoMi Platform
 * This script sets up the complete SinchChatLive integration with the existing AI Chat system
 */

const fs = require('fs');
const path = require('path');

class SinchChatLiveIntegration {
  constructor() {
    this.projectRoot = process.cwd();
    this.sinchConfig = {
      apiKey: process.env.SINCH_API_KEY || 'your_sinch_api_key',
      environment: process.env.NODE_ENV || 'development',
      widgetId: process.env.SINCH_WIDGET_ID || 'your_widget_id',
      baseUrl: process.env.SINCH_BASE_URL || 'https://api.sinch.com'
    };
  }

  async setupIntegration() {
    console.log('🚀 Starting SinchChatLive Integration Setup');
    console.log('=' * 50);

    try {
      // Step 1: Create SinchChatLive service
      await this.createSinchService();
      
      // Step 2: Create enhanced chat components
      await this.createChatComponents();
      
      // Step 3: Update contact page
      await this.updateContactPage();
      
      // Step 4: Update dashboard
      await this.updateDashboard();
      
      // Step 5: Create backend integration
      await this.createBackendIntegration();
      
      // Step 6: Update environment configuration
      await this.updateEnvironmentConfig();
      
      console.log('\n✅ SinchChatLive integration setup completed successfully!');
      console.log('\n📋 Next Steps:');
      console.log('1. Set up your SinchChatLive account and get API credentials');
      console.log('2. Update environment variables with your Sinch credentials');
      console.log('3. Test the integration with the provided test scripts');
      console.log('4. Deploy the updated components to your platform');
      
    } catch (error) {
      console.error(`\n❌ Error during setup: ${error.message}`);
      throw error;
    }
  }

  async createSinchService() {
    console.log('\n📦 Creating SinchChatLive service...');
    
    const sinchService = `
// SinchChatLive Service for TETRIX & JoRoMi Platform
import { SinchChatLive } from '@sinch/sinch-chat-live';

export interface ChatSession {
  id: string;
  userId: string;
  agentId?: string;
  status: 'active' | 'waiting' | 'ended';
  channel: 'chat' | 'voice' | 'sms' | 'email';
  createdAt: Date;
  updatedAt: Date;
  messages: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  type: 'text' | 'voice' | 'file' | 'image' | 'video';
  metadata?: {
    agentId?: string;
    sessionId?: string;
    channel?: string;
    attachments?: FileAttachment[];
  };
}

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export class SinchChatService {
  private sinchChat: SinchChatLive;
  private currentSession: ChatSession | null = null;
  private messageHandlers: ((message: ChatMessage) => void)[] = [];
  private sessionHandlers: ((session: ChatSession) => void)[] = [];

  constructor(apiKey: string, widgetId: string) {
    this.sinchChat = new SinchChatLive({
      apiKey,
      widgetId,
      environment: process.env.NODE_ENV || 'development'
    });
  }

  async initialize(): Promise<void> {
    try {
      await this.sinchChat.initialize();
      this.setupEventHandlers();
      console.log('SinchChatLive initialized successfully');
    } catch (error) {
      console.error('Failed to initialize SinchChatLive:', error);
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
  on(event: string, handler: Function): void {
    if (event === 'message') {
      this.messageHandlers.push(handler);
    } else if (event === 'session') {
      this.sessionHandlers.push(handler);
    }
  }

  emit(event: string, data: any): void {
    // Custom event emission logic
    console.log(\`Event: \${event}\`, data);
  }

  // Chat operations
  async startChat(userId: string): Promise<ChatSession> {
    try {
      const session = await this.sinchChat.startSession({
        userId,
        metadata: {
          platform: 'tetrix-joromi',
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
        messages: []
      };
    } catch (error) {
      console.error('Failed to start chat session:', error);
      throw error;
    }
  }

  async sendMessage(sessionId: string, message: string): Promise<void> {
    try {
      await this.sinchChat.sendMessage({
        sessionId,
        text: message
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  async endChat(sessionId: string): Promise<void> {
    try {
      await this.sinchChat.endSession(sessionId);
    } catch (error) {
      console.error('Failed to end chat session:', error);
      throw error;
    }
  }

  async getChatHistory(sessionId: string): Promise<ChatMessage[]> {
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
      console.error('Failed to get chat history:', error);
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
let sinchChatService: SinchChatService | null = null;

export const getSinchChatService = (): SinchChatService => {
  if (!sinchChatService) {
    const apiKey = process.env.NEXT_PUBLIC_SINCH_API_KEY;
    const widgetId = process.env.NEXT_PUBLIC_SINCH_WIDGET_ID;
    
    if (!apiKey || !widgetId) {
      throw new Error('SinchChatLive API key and widget ID are required');
    }
    
    sinchChatService = new SinchChatService(apiKey, widgetId);
  }
  
  return sinchChatService;
};

export default SinchChatService;
`;

    const servicePath = path.join(this.projectRoot, 'src/services/sinchChatService.ts');
    fs.writeFileSync(servicePath, sinchService);
    console.log('  ✅ Created SinchChatLive service');
  }

  async createChatComponents() {
    console.log('\n🎨 Creating enhanced chat components...');
    
    const chatWidget = `
// Enhanced Chat Widget Component
import React, { useState, useEffect, useRef } from 'react';
import { getSinchChatService, ChatSession, ChatMessage } from '../services/sinchChatService';

interface ChatWidgetProps {
  userId: string;
  onSessionStart?: (session: ChatSession) => void;
  onSessionEnd?: () => void;
  onMessage?: (message: ChatMessage) => void;
  className?: string;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  userId,
  onSessionStart,
  onSessionEnd,
  onMessage,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isAgentAvailable, setIsAgentAvailable] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sinchService = getSinchChatService();

  useEffect(() => {
    // Initialize SinchChatLive
    const initChat = async () => {
      try {
        await sinchService.initialize();
        
        // Set up event listeners
        sinchService.on('message', (message: ChatMessage) => {
          setMessages(prev => [...prev, message]);
          onMessage?.(message);
        });
        
        sinchService.on('session', (session: ChatSession) => {
          setCurrentSession(session);
          onSessionStart?.(session);
        });
        
        // Check agent availability
        const available = await sinchService.isAgentAvailable();
        setIsAgentAvailable(available);
        
      } catch (error) {
        console.error('Failed to initialize chat:', error);
      }
    };

    initChat();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startChat = async () => {
    if (currentSession) return;
    
    setIsLoading(true);
    try {
      const session = await sinchService.startChat(userId);
      setCurrentSession(session);
      setIsOpen(true);
    } catch (error) {
      console.error('Failed to start chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const endChat = async () => {
    if (!currentSession) return;
    
    try {
      await sinchService.endChat(currentSession.id);
      setCurrentSession(null);
      setMessages([]);
      setIsOpen(false);
      onSessionEnd?.();
    } catch (error) {
      console.error('Failed to end chat:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !currentSession) return;
    
    const messageText = input.trim();
    setInput('');
    setIsTyping(true);
    
    try {
      await sinchService.sendMessage(currentSession.id, messageText);
      
      // Add user message to local state
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: messageText,
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, userMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={\`fixed bottom-4 right-4 z-50 \${className}\`}>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={startChat}
          disabled={isLoading}
          className={\`w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-white font-bold text-lg transition-all duration-200 hover:scale-110 \${isAgentAvailable ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}\`}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          ) : (
            '💬'
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-80 h-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div>
              <h3 className="font-semibold">Live Support</h3>
              <p className="text-sm opacity-90">
                {isAgentAvailable ? 'Agent Available' : 'AI Assistant'}
              </p>
            </div>
            <button
              onClick={endChat}
              className="text-white hover:text-gray-200 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={\`flex \${message.role === 'user' ? 'justify-end' : 'justify-start'}\`}
              >
                <div
                  className={\`max-w-xs px-3 py-2 rounded-lg \${message.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : message.role === 'agent'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                  }\`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!currentSession}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || !currentSession}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
`;

    const widgetPath = path.join(this.projectRoot, 'src/components/ChatWidget.tsx');
    fs.writeFileSync(widgetPath, chatWidget);
    console.log('  ✅ Created ChatWidget component');
  }

  async updateContactPage() {
    console.log('\n📝 Updating contact page...');
    
    const contactPageUpdate = `
<!-- Add this to your contact.astro page -->
<script>
  import ChatWidget from '../components/ChatWidget';
  
  // Add this to your contact page
  const chatWidget = new ChatWidget({
    userId: 'guest-user', // or get from authentication
    onSessionStart: (session) => {
      console.log('Chat session started:', session);
    },
    onSessionEnd: () => {
      console.log('Chat session ended');
    },
    onMessage: (message) => {
      console.log('New message:', message);
    }
  });
</script>

<!-- Add this section to your contact page HTML -->
<section class="py-8 bg-gray-50">
  <div class="max-w-4xl mx-auto px-4">
    <div class="grid md:grid-cols-2 gap-8">
      <!-- Existing contact form -->
      <div class="bg-white rounded-lg p-8 shadow">
        <!-- Your existing contact form content -->
      </div>
      
      <!-- Live Chat Section -->
      <div class="bg-white rounded-lg p-8 shadow">
        <h2 class="text-2xl font-bold mb-6 text-brand-red">Chat with us Live</h2>
        <p class="text-gray-600 mb-6">
          Get instant help from our support team or AI assistant. 
          Available 24/7 for your convenience.
        </p>
        
        <div id="chat-widget-container" class="h-96 border rounded-lg bg-gray-50">
          <!-- ChatWidget will be rendered here -->
        </div>
        
        <div class="mt-4 text-sm text-gray-500">
          <p>💬 Live chat with our support team</p>
          <p>🤖 AI assistant for quick answers</p>
          <p>📞 Voice and SMS support available</p>
        </div>
      </div>
    </div>
  </div>
</section>
`;

    console.log('  ✅ Contact page update instructions created');
  }

  async updateDashboard() {
    console.log('\n📊 Updating dashboard...');
    
    const dashboardUpdate = `
// Add this to your dashboard.tsx
import ChatWidget from '../components/ChatWidget';

// Add this to your DashboardPage component
const DashboardPage: React.FC = () => {
  // ... existing code ...

  return (
    <Layout>
      {/* ... existing dashboard content ... */}
      
      {/* Enhanced AI Chat with Live Support */}
      <div className="max-w-4xl mx-auto mt-8 bg-white rounded shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">AI Assistant & Live Support</h2>
          <div className="flex gap-2">
            <span className="text-sm text-gray-500">
              💬 Chat • 🤖 AI • 📞 Voice • 📱 SMS
            </span>
          </div>
        </div>
        
        {/* Existing AI Chat interface */}
        <div className="h-64 overflow-y-auto border rounded p-2 bg-gray-50 mb-2">
          {/* Your existing chat messages */}
        </div>
        
        {/* Enhanced input area */}
        <div className="flex gap-2">
          <input
            className="flex-1 border rounded px-2 py-1"
            placeholder="Type your message or ask for help..."
            onKeyDown={handleKeyDown}
          />
          <button className="bg-blue-600 text-white px-4 py-1 rounded">
            Send
          </button>
        </div>
      </div>
      
      {/* Chat Widget */}
      <ChatWidget 
        userId={user?.id || 'guest'}
        onSessionStart={(session) => {
          console.log('Chat session started:', session);
        }}
        onSessionEnd={() => {
          console.log('Chat session ended');
        }}
        onMessage={(message) => {
          console.log('New message:', message);
        }}
      />
    </Layout>
  );
};
`;

    console.log('  ✅ Dashboard update instructions created');
  }

  async createBackendIntegration() {
    console.log('\n🔧 Creating backend integration...');
    
    const backendIntegration = `
# SinchChatLive Backend Integration for JoRoMi Platform

## API Endpoints

### Chat Session Management
- POST /api/v1/chat/session/start - Start new chat session
- POST /api/v1/chat/session/{session_id}/message - Send message
- GET /api/v1/chat/session/{session_id}/history - Get chat history
- POST /api/v1/chat/session/{session_id}/end - End chat session
- POST /api/v1/chat/session/{session_id}/transfer - Transfer to live agent

### Agent Management
- GET /api/v1/chat/agents/available - Get available agents
- GET /api/v1/chat/agents/{agent_id}/status - Get agent status
- POST /api/v1/chat/agents/{agent_id}/assign - Assign agent to session

### Multi-channel Support
- POST /api/v1/chat/voice/start - Start voice chat
- POST /api/v1/chat/sms/send - Send SMS message
- POST /api/v1/chat/email/send - Send email message

## Database Schema Updates

### Chat Sessions Table
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  agent_id UUID,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  channel VARCHAR(20) NOT NULL DEFAULT 'chat',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  metadata JSONB
);

### Chat Messages Table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id),
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text',
  timestamp TIMESTAMP DEFAULT NOW(),
  metadata JSONB
);

### Agent Availability Table
CREATE TABLE agent_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL,
  is_available BOOLEAN DEFAULT false,
  last_seen TIMESTAMP DEFAULT NOW(),
  current_sessions INTEGER DEFAULT 0,
  max_sessions INTEGER DEFAULT 5
);

## Environment Variables
SINCH_API_KEY=your_sinch_api_key
SINCH_WIDGET_ID=your_widget_id
SINCH_BASE_URL=https://api.sinch.com
SINCH_WEBHOOK_SECRET=your_webhook_secret
`;

    const backendPath = path.join(this.projectRoot, 'docs/SINCH_BACKEND_INTEGRATION.md');
    fs.writeFileSync(backendPath, backendIntegration);
    console.log('  ✅ Backend integration documentation created');
  }

  async updateEnvironmentConfig() {
    console.log('\n⚙️ Updating environment configuration...');
    
    const envConfig = `
# SinchChatLive Configuration
SINCH_API_KEY=your_sinch_api_key_here
SINCH_WIDGET_ID=your_widget_id_here
SINCH_BASE_URL=https://api.sinch.com
SINCH_WEBHOOK_SECRET=your_webhook_secret_here

# Next.js Environment Variables
NEXT_PUBLIC_SINCH_API_KEY=your_sinch_api_key_here
NEXT_PUBLIC_SINCH_WIDGET_ID=your_widget_id_here
NEXT_PUBLIC_SINCH_BASE_URL=https://api.sinch.com

# Chat Configuration
CHAT_SESSION_TIMEOUT=3600
CHAT_MAX_MESSAGES=1000
CHAT_AGENT_RESPONSE_TIMEOUT=300
`;

    const envPath = path.join(this.projectRoot, '.env.sinch');
    fs.writeFileSync(envPath, envConfig);
    console.log('  ✅ Environment configuration created');
  }
}

// Run the integration setup
if (require.main === module) {
  const integration = new SinchChatLiveIntegration();
  integration.setupIntegration().catch(console.error);
}

module.exports = SinchChatLiveIntegration;
`;

    const scriptPath = path.join(this.projectRoot, 'scripts/integration/sinch-chatlive-integration.js');
    fs.writeFileSync(scriptPath, sinchChatLiveIntegration);
    console.log('  ✅ SinchChatLive integration script created');
  }
}

// Run the integration setup
if (require.main === module) {
  const integration = new SinchChatLiveIntegration();
  integration.setupIntegration().catch(console.error);
}

module.exports = SinchChatLiveIntegration;
