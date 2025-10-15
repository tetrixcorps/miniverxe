// SHANGO AI Super Agent - Enhanced Chat Widget Component
import React, { useState, useEffect, useRef } from 'react';
import { getSHANGOAIService, ChatSession, ChatMessage, SHANGOAgent } from '../services/sinchChatService';

interface SHANGOChatWidgetProps {
  userId: string;
  onSessionStart?: (session: ChatSession) => void;
  onSessionEnd?: () => void;
  onMessage?: (message: ChatMessage) => void;
  className?: string;
  defaultAgent?: string;
}

export const SHANGOChatWidget: React.FC<SHANGOChatWidgetProps> = ({
  userId,
  onSessionStart,
  onSessionEnd,
  onMessage,
  className = '',
  defaultAgent = 'shango-general'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isAgentAvailable, setIsAgentAvailable] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string>(defaultAgent);
  const [availableAgents, setAvailableAgents] = useState<SHANGOAgent[]>([]);
  const [showAgentSelector, setShowAgentSelector] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const shangoService = getSHANGOAIService();

  useEffect(() => {
    // Initialize SHANGO AI Super Agent
    const initSHANGO = async () => {
      try {
        await shangoService.initialize();
        
        // Get available SHANGO agents
        const agents = shangoService.getSHANGOAgents();
        setAvailableAgents(agents);
        
        // Set up event listeners
        shangoService.on('message', (message: ChatMessage) => {
          setMessages(prev => [...prev, message]);
          onMessage?.(message);
        });
        
        shangoService.on('session', (session: ChatSession) => {
          setCurrentSession(session);
          onSessionStart?.(session);
        });
        
        // Check agent availability
        const available = await shangoService.isAgentAvailable();
        setIsAgentAvailable(available);
        
      } catch (error) {
        console.error('Failed to initialize SHANGO AI Super Agent:', error);
      }
    };

    initSHANGO();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startSHANGOChat = async () => {
    if (currentSession) return;
    
    setIsLoading(true);
    try {
      const session = await shangoService.startSHANGOChat(userId, selectedAgent);
      setCurrentSession(session);
      setMessages(session.messages || []);
      setIsOpen(true);
    } catch (error) {
      console.error('Failed to start SHANGO chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const endSHANGOChat = async () => {
    if (!currentSession) return;
    
    try {
      await shangoService.endSHANGOChat(currentSession.id);
      setCurrentSession(null);
      setMessages([]);
      setIsOpen(false);
      onSessionEnd?.();
    } catch (error) {
      console.error('Failed to end SHANGO chat:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !currentSession) return;
    
    const messageText = input.trim();
    setInput('');
    setIsTyping(true);
    
    try {
      await shangoService.sendSHANGOMessage(currentSession.id, messageText);
      
      // Add user message to local state
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
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

  const switchAgent = (agentId: string) => {
    setSelectedAgent(agentId);
    setShowAgentSelector(false);
    // If chat is active, restart with new agent
    if (currentSession) {
      endSHANGOChat().then(() => {
        setTimeout(() => startSHANGOChat(), 500);
      });
    }
  };

  const getAgentInfo = (agentId: string): SHANGOAgent | undefined => {
    return availableAgents.find(agent => agent.id === agentId);
  };

  const currentAgent = getAgentInfo(selectedAgent);

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* SHANGO Chat Toggle Button */}
      {!isOpen && (
        <div className="flex flex-col items-end space-y-2">
          {/* Agent Selector */}
          {showAgentSelector && (
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 mb-2 w-64">
              <h3 className="font-semibold text-gray-800 mb-3">Choose Your SHANGO Agent</h3>
              <div className="space-y-2">
                {availableAgents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => switchAgent(agent.id)}
                    className={`w-full text-left p-2 rounded-lg transition-colors ${
                      selectedAgent === agent.id 
                        ? 'bg-blue-100 border-blue-300' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{agent.avatar}</span>
                      <div>
                        <div className="font-medium text-sm">{agent.name}</div>
                        <div className="text-xs text-gray-600">{agent.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Main SHANGO Button */}
          <button
            onClick={startSHANGOChat}
            disabled={isLoading}
            className={`w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-white font-bold text-lg transition-all duration-200 hover:scale-110 ${
              isAgentAvailable ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' : 'bg-gradient-to-r from-gray-600 to-gray-700'
            }`}
            title={`Chat with ${currentAgent?.name || 'SHANGO'} - ${currentAgent?.description || 'AI Super Agent'}`}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            ) : (
              currentAgent?.avatar || '&#9889;'
            )}
          </button>
          
          {/* Agent Switch Button */}
          <button
            onClick={() => setShowAgentSelector(!showAgentSelector)}
            className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
            title="Switch SHANGO Agent"
          >
            &#8635;
          </button>
        </div>
      )}

      {/* SHANGO Chat Window */}
      {isOpen && (
        <div className="w-80 h-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col">
          {/* SHANGO Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{currentAgent?.avatar || '&#9889;'}</span>
              <div>
                <h3 className="font-semibold">{currentAgent?.name || 'SHANGO'}</h3>
                <p className="text-sm opacity-90">
                  {isAgentAvailable ? 'AI Super Agent Online' : 'AI Super Agent'}
                </p>
              </div>
            </div>
            <button
              onClick={endSHANGOChat}
              className="text-white hover:text-gray-200 transition-colors"
            >
              &#10005;
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : message.role === 'shango'
                      ? 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 border border-purple-200'
                      : message.role === 'agent'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.role === 'shango' && (
                    <div className="flex items-center space-x-1 mb-1">
                      <span className="text-xs font-semibold">&#9889; SHANGO</span>
                      {message.metadata?.shangoResponse && (
                        <span className="text-xs opacity-70">
                          ({Math.round(message.metadata.shangoResponse.confidence * 100)}% confident)
                        </span>
                      )}
                    </div>
                  )}
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 px-3 py-2 rounded-lg border border-purple-200">
                  <div className="flex items-center space-x-1">
                    <span className="text-xs font-semibold">&#9889; SHANGO</span>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
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
                placeholder={`Ask ${currentAgent?.name || 'SHANGO'} anything...`}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={!currentSession}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || !currentSession}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Send
              </button>
            </div>
            
            {/* Quick Actions */}
            <div className="mt-2 flex space-x-1">
              <button
                onClick={() => setInput('Help me with...')}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
              >
                &#128161;#128161; Get Help
              </button>
              <button
                onClick={() => setInput('Show me pricing...')}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
              >
                &#128176;#128176; Pricing
              </button>
              <button
                onClick={() => setInput('Technical support...')}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
              >
                &#128295;#128295; Tech Support
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SHANGOChatWidget;
