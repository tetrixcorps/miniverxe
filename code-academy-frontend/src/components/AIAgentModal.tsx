import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Send, 
  X, 
  Loader, 
  Settings, 
  MessageSquare,
  Code,
  Lightbulb,
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { updatedAIService } from '../services/updatedAIService';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type: 'text' | 'code' | 'analysis';
  metadata?: any;
}

interface AIAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  context?: 'code-review' | 'learning' | 'general';
  initialCode?: string;
  language?: string;
}

const AIAgentModal: React.FC<AIAgentModalProps> = ({
  isOpen,
  onClose,
  context = 'general',
  initialCode,
  language = 'javascript'
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('qwen3:latest');
  const [showSettings, setShowSettings] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Initialize with context-specific greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = getContextualGreeting(context, initialCode, language);
      setMessages([{
        id: '1',
        role: 'assistant',
        content: greeting,
        timestamp: new Date(),
        type: 'text'
      }]);
    }
  }, [isOpen, context, initialCode, language]);

  const getContextualGreeting = (context: string, code?: string, lang?: string): string => {
    switch (context) {
      case 'code-review':
        return `Hello! I'm your AI coding assistant. I can help you review and improve your ${lang} code. ${code ? 'I can see you have some code ready for review.' : 'Paste your code and I\'ll analyze it for you.'}`;
      case 'learning':
        return "Hi! I'm here to help you learn programming. I can explain concepts, provide examples, answer questions, and guide you through coding exercises. What would you like to learn today?";
      default:
        return "Hello! I'm your AI assistant. I can help with coding questions, explain concepts, review code, and provide learning guidance. How can I assist you today?";
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsStreaming(true);
    setStreamingMessage('');

    try {
      // Determine if this is a code analysis request
      const isCodeAnalysis = context === 'code-review' && (
        input.toLowerCase().includes('analyze') ||
        input.toLowerCase().includes('review') ||
        input.toLowerCase().includes('check') ||
        input.toLowerCase().includes('fix')
      );

      if (isCodeAnalysis && initialCode) {
        // Use the code analysis functionality
        const analysis = await updatedAIService.analyzeCode(initialCode, language);
        const analysisMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `I've analyzed your ${language} code. Here's what I found:`,
          timestamp: new Date(),
          type: 'analysis',
          metadata: analysis
        };
        setMessages(prev => [...prev, analysisMessage]);
      } else {
        // Use streaming chat
        let fullResponse = '';
        
        await updatedAIService.streamOllamaResponse(
          userMessage.content,
          selectedModel,
          (chunk) => {
            fullResponse += chunk;
            setStreamingMessage(fullResponse);
          },
          () => {
            const assistantMessage: Message = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: fullResponse,
              timestamp: new Date(),
              type: 'text'
            };
            setMessages(prev => [...prev, assistantMessage]);
            setStreamingMessage('');
            setIsStreaming(false);
          },
          (error) => {
            console.error('Streaming error:', error);
            const errorMessage: Message = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: `I apologize, but I encountered an error: ${error}. Please try again.`,
              timestamp: new Date(),
              type: 'text'
            };
            setMessages(prev => [...prev, errorMessage]);
            setStreamingMessage('');
            setIsStreaming(false);
          }
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I apologize, but I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user';
    const isAnalysis = message.type === 'analysis';

    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
          <div className={`flex items-start space-x-2 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
            {!isUser && (
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            <div className={`rounded-lg px-4 py-2 ${
              isUser 
                ? 'bg-blue-600 text-white' 
                : isAnalysis
                ? 'bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200'
                : 'bg-gray-100 text-gray-900'
            }`}>
              {isAnalysis && message.metadata ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-900 mb-2">{message.content}</p>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">Code Analysis</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        message.metadata.score >= 80 ? 'bg-green-100 text-green-800' :
                        message.metadata.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        Score: {message.metadata.score}/100
                      </span>
                    </div>
                    <div className="space-y-2">
                      {message.metadata.suggestions?.slice(0, 3).map((suggestion: any, index: number) => (
                        <div key={index} className="text-xs text-gray-600">
                          <span className="font-medium">💡 {suggestion.message}</span>
                        </div>
                      ))}
                      {message.metadata.errors?.slice(0, 2).map((error: any, index: number) => (
                        <div key={index} className="text-xs text-red-600">
                          <span className="font-medium">⚠️ {error.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="whitespace-pre-wrap text-sm">{message.content}</div>
              )}
              <div className={`text-xs mt-1 ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">AI Coding Assistant</h2>
                <p className="text-blue-100 text-sm">
                  Powered by {selectedModel} • {context === 'code-review' ? 'Code Review Mode' : 'Learning Mode'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-white hover:text-blue-200 transition-colors p-2"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="text-white hover:text-blue-200 transition-colors p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-gray-50 border-b border-gray-200 p-4"
            >
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    AI Model
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="qwen3:latest">Qwen3 (Latest)</option>
                    <option value="qwen2.5:latest">Qwen2.5 (Latest)</option>
                    <option value="llama3.1:latest">Llama 3.1 (Latest)</option>
                  </select>
                </div>
                <div className="text-xs text-gray-500">
                  Current model: {selectedModel} • Ollama API: http://localhost:11434
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map(renderMessage)}
            {isStreaming && streamingMessage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start mb-4"
              >
                <div className="max-w-[80%]">
                  <div className="flex items-start space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-gray-100 text-gray-900 rounded-lg px-4 py-2">
                      <div className="whitespace-pre-wrap text-sm">{streamingMessage}</div>
                      <div className="flex items-center mt-1">
                        <Loader className="w-3 h-3 animate-spin text-gray-500 mr-1" />
                        <span className="text-xs text-gray-500">AI is typing...</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-3">
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  context === 'code-review' 
                    ? "Ask me to analyze your code, suggest improvements, or explain concepts..."
                    : "Ask me anything about programming, coding, or learning..."
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={2}
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              <span>Send</span>
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AIAgentModal;
