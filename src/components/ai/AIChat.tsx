import React, { useState, useEffect, useRef } from 'react';
import { openWebUIService, industryAIFunctions } from '../../services/openwebui';
import type { ChatMessage } from '../../services/openwebui';

interface AIChatProps {
  industry: string;
  context?: any;
  onMessageSent?: (message: ChatMessage) => void;
  onInsightGenerated?: (insight: any) => void;
  className?: string;
}

const AIChat: React.FC<AIChatProps> = ({
  industry,
  context = {},
  onMessageSent,
  onInsightGenerated,
  className = ''
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize connection
    initializeConnection();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeConnection = async () => {
    try {
      const connected = await openWebUIService.connect();
      setIsConnected(connected);
      
      if (connected) {
        // Add welcome message
        const welcomeMessage: ChatMessage = {
          id: 'welcome',
          role: 'assistant',
          content: `Hello! I'm your AI assistant for ${industry} operations. How can I help you today?`,
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error('Failed to initialize AI chat:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !isConnected) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Send message with industry context
      const response = await openWebUIService.sendMessage(inputMessage, {
        industry,
        ...context
      });

      setMessages(prev => [...prev, response]);
      onMessageSent?.(response);

      // Generate insights if applicable
      if (shouldGenerateInsights(inputMessage)) {
        await generateInsights(inputMessage, response);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const shouldGenerateInsights = (message: string): boolean => {
    const insightKeywords = ['analyze', 'insight', 'recommendation', 'suggestion', 'help'];
    return insightKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
  };

  const generateInsights = async (userMessage: string, aiResponse: ChatMessage) => {
    try {
      const insights = await openWebUIService.generateInsights({
        userMessage,
        aiResponse: aiResponse.content,
        industry
      }, industry);

      insights.forEach(insight => {
        onInsightGenerated?.(insight);
      });
    } catch (error) {
      console.error('Error generating insights:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const executeIndustryFunction = async (functionName: string, parameters: any) => {
    try {
      setIsLoading(true);
      const industryFunctions = industryAIFunctions[industry as keyof typeof industryAIFunctions];
      const result = industryFunctions && functionName in industryFunctions 
        ? await (industryFunctions as any)[functionName](parameters)
        : null;
      
      const functionMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Function executed: ${functionName}\n\nResult: ${JSON.stringify(result, null, 2)}`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, functionMessage]);
    } catch (error) {
      console.error('Error executing function:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`ai-chat-container ${className}`}>
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            AI Assistant - {industry.charAt(0).toUpperCase() + industry.slice(1)}
          </h3>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-sm">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="bg-white h-96 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-800 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                <span className="text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-gray-100 p-4 rounded-b-lg">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Ask me anything about ${industry} operations...`}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading || !isConnected}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading || !isConnected}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
        
        {/* Quick Actions */}
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            onClick={() => setInputMessage(`Analyze my ${industry} data`)}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200"
            disabled={isLoading || !isConnected}
          >
            Analyze Data
          </button>
          <button
            onClick={() => setInputMessage(`Generate insights for ${industry}`)}
            className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full hover:bg-green-200"
            disabled={isLoading || !isConnected}
          >
            Generate Insights
          </button>
          <button
            onClick={() => setInputMessage(`Help me with ${industry} best practices`)}
            className="px-3 py-1 text-xs bg-purple-100 text-purple-800 rounded-full hover:bg-purple-200"
            disabled={isLoading || !isConnected}
          >
            Best Practices
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
