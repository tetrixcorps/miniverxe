// Unified Messaging Dashboard
// Integrates WhatsApp, SMS, Voice, and AI Chat in a single interface

import React, { useState, useEffect, useRef } from 'react';
import { crossPlatformSessionService, CrossPlatformSession } from '../services/crossPlatformSessionService';
import { whatsappOnboardingService, WABAStatus } from '../services/whatsappOnboardingService';
import { stripeTrialService } from '../services/stripeTrialService';

interface UnifiedMessagingDashboardProps {
  session: CrossPlatformSession;
  onSessionUpdate: (session: CrossPlatformSession) => void;
}

interface Message {
  id: string;
  channel: 'whatsapp' | 'sms' | 'voice' | 'chat' | 'email';
  from: string;
  to: string;
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  direction: 'inbound' | 'outbound';
  metadata?: any;
}

interface Conversation {
  id: string;
  contact: {
    name: string;
    phone: string;
    email?: string;
    avatar?: string;
  };
  lastMessage: Message;
  unreadCount: number;
  channel: 'whatsapp' | 'sms' | 'voice' | 'chat' | 'email';
  status: 'active' | 'archived' | 'blocked';
}

const UnifiedMessagingDashboard: React.FC<UnifiedMessagingDashboardProps> = ({
  session,
  onSessionUpdate
}) => {
  // State management
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [wabaStatus, setWabaStatus] = useState<WABAStatus | null>(null);
  const [trialStatus, setTrialStatus] = useState({
    status: session.trialStatus,
    daysRemaining: 0,
    trialEndDate: session.trialEndDate
  });
  const [activeChannel, setActiveChannel] = useState<'whatsapp' | 'sms' | 'voice' | 'chat' | 'email'>('whatsapp');
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Load initial data
  useEffect(() => {
    loadDashboardData();
    checkWABAStatus();
    checkTrialStatus();
  }, [session]);

  // Auto-focus message input
  useEffect(() => {
    if (selectedConversation && messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [selectedConversation]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load conversations from all channels
      const allConversations = await Promise.all([
        loadWhatsAppConversations(),
        loadSMSConversations(),
        loadVoiceConversations(),
        loadChatConversations()
      ]);

      // Combine and sort by last message timestamp
      const combinedConversations = allConversations
        .flat()
        .sort((a, b) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime());

      setConversations(combinedConversations);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadWhatsAppConversations = async (): Promise<Conversation[]> => {
    // Mock WhatsApp conversations
    return [
      {
        id: 'wa_1',
        contact: {
          name: 'John Doe',
          phone: '+1234567890',
          avatar: 'https://via.placeholder.com/40'
        },
        lastMessage: {
          id: 'msg_1',
          channel: 'whatsapp',
          from: '+1234567890',
          to: session.phoneNumber,
          content: 'Hi! I\'m interested in your services.',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          status: 'read',
          direction: 'inbound'
        },
        unreadCount: 0,
        channel: 'whatsapp',
        status: 'active'
      }
    ];
  };

  const loadSMSConversations = async (): Promise<Conversation[]> => {
    // Mock SMS conversations
    return [
      {
        id: 'sms_1',
        contact: {
          name: 'Jane Smith',
          phone: '+1987654321'
        },
        lastMessage: {
          id: 'msg_2',
          channel: 'sms',
          from: '+1987654321',
          to: session.phoneNumber,
          content: 'Thanks for the quick response!',
          timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
          status: 'delivered',
          direction: 'inbound'
        },
        unreadCount: 1,
        channel: 'sms',
        status: 'active'
      }
    ];
  };

  const loadVoiceConversations = async (): Promise<Conversation[]> => {
    // Mock voice conversations
    return [
      {
        id: 'voice_1',
        contact: {
          name: 'Mike Johnson',
          phone: '+1555123456'
        },
        lastMessage: {
          id: 'msg_3',
          channel: 'voice',
          from: '+1555123456',
          to: session.phoneNumber,
          content: 'Voice call - 5 minutes',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          status: 'delivered',
          direction: 'inbound'
        },
        unreadCount: 0,
        channel: 'voice',
        status: 'active'
      }
    ];
  };

  const loadChatConversations = async (): Promise<Conversation[]> => {
    // Mock chat conversations
    return [
      {
        id: 'chat_1',
        contact: {
          name: 'Sarah Wilson',
          phone: '+1444123456'
        },
        lastMessage: {
          id: 'msg_4',
          channel: 'chat',
          from: '+1444123456',
          to: session.phoneNumber,
          content: 'Can you help me with pricing?',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
          status: 'read',
          direction: 'inbound'
        },
        unreadCount: 0,
        channel: 'chat',
        status: 'active'
      }
    ];
  };

  const checkWABAStatus = async () => {
    if (session.wabaId) {
      try {
        const status = await whatsappOnboardingService.getWABAStatus(session.wabaId);
        setWabaStatus(status);
        
        if (status.status === 'approved') {
          setShowOnboarding(false);
        } else if (status.status === 'pending' || status.status === 'in_progress') {
          setShowOnboarding(true);
        }
      } catch (error) {
        console.error('Failed to check WABA status:', error);
      }
    }
  };

  const checkTrialStatus = async () => {
    if (session.stripeCustomerId) {
      try {
        const status = await stripeTrialService.checkTrialStatus(session.stripeCustomerId);
        setTrialStatus({
          status: status.status as any,
          daysRemaining: status.daysRemaining,
          trialEndDate: status.trialEndDate
        });
      } catch (error) {
        console.error('Failed to check trial status:', error);
      }
    }
  };

  const loadMessages = async (conversationId: string) => {
    setIsLoading(true);
    try {
      // Mock messages for the selected conversation
      const mockMessages: Message[] = [
        {
          id: 'msg_1',
          channel: activeChannel,
          from: '+1234567890',
          to: session.phoneNumber,
          content: 'Hi! I\'m interested in your services.',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          status: 'read',
          direction: 'inbound'
        },
        {
          id: 'msg_2',
          channel: activeChannel,
          from: session.phoneNumber,
          to: '+1234567890',
          content: 'Hello! Thanks for reaching out. How can I help you today?',
          timestamp: new Date(Date.now() - 1000 * 60 * 25),
          status: 'delivered',
          direction: 'outbound'
        },
        {
          id: 'msg_3',
          channel: activeChannel,
          from: '+1234567890',
          to: session.phoneNumber,
          content: 'I\'d like to know more about your pricing plans.',
          timestamp: new Date(Date.now() - 1000 * 60 * 20),
          status: 'read',
          direction: 'inbound'
        }
      ];

      setMessages(mockMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: 'msg_' + Date.now(),
      channel: activeChannel,
      from: session.phoneNumber,
      to: selectedConversation.contact.phone,
      content: newMessage,
      timestamp: new Date(),
      status: 'sent',
      direction: 'outbound'
    };

    // Add message to UI immediately
    setMessages(prev => [...prev, message]);
    setNewMessage('');

    try {
      // Send message via appropriate channel
      await sendMessageViaChannel(message);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Update message status to failed
      setMessages(prev => prev.map(msg => 
        msg.id === message.id ? { ...msg, status: 'failed' } : msg
      ));
    }
  };

  const sendMessageViaChannel = async (message: Message) => {
    // Mock sending via different channels
    switch (message.channel) {
      case 'whatsapp':
        console.log('Sending WhatsApp message:', message);
        break;
      case 'sms':
        console.log('Sending SMS message:', message);
        break;
      case 'voice':
        console.log('Initiating voice call:', message);
        break;
      case 'chat':
        console.log('Sending chat message:', message);
        break;
    }
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setActiveChannel(conversation.channel);
    loadMessages(conversation.id);
  };

  const handleChannelFilter = (channel: 'whatsapp' | 'sms' | 'voice' | 'chat' | 'all') => {
    if (channel === 'all') {
      loadDashboardData();
    } else {
      const filteredConversations = conversations.filter(conv => conv.channel === channel);
      setConversations(filteredConversations);
    }
  };

  return (
    <div className="h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">Messages</h1>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Online</span>
            </div>
          </div>
          
          {/* Channel Filter */}
          <div className="flex space-x-2">
            {['all', 'whatsapp', 'sms', 'voice', 'chat'].map((channel) => (
              <button
                key={channel}
                onClick={() => handleChannelFilter(channel as any)}
                className={`px-3 py-1 text-xs rounded-full ${
                  activeChannel === channel || channel === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {channel.charAt(0).toUpperCase() + channel.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Trial Status Banner */}
        {trialStatus.status === 'active' && (
          <div className="p-4 bg-green-50 border-b border-green-200">
            <div className="flex items-center">
              <div className="text-green-600 mr-2">&#127881;</div>
              <div className="text-sm text-green-800">
                <strong>Free Trial:</strong> {trialStatus.daysRemaining} days remaining
              </div>
            </div>
          </div>
        )}

        {/* WABA Status Banner */}
        {wabaStatus && wabaStatus.status !== 'approved' && (
          <div className="p-4 bg-yellow-50 border-b border-yellow-200">
            <div className="flex items-center">
              <div className="text-yellow-600 mr-2">&#8987;</div>
              <div className="text-sm text-yellow-800">
                <strong>WhatsApp:</strong> {wabaStatus.message}
              </div>
            </div>
          </div>
        )}

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Loading conversations...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No conversations yet</div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleConversationSelect(conversation)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    {conversation.contact.avatar ? (
                      <img
                        src={conversation.contact.avatar}
                        alt={conversation.contact.name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <span className="text-gray-600 font-medium">
                        {conversation.contact.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {conversation.contact.name}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {new Date(conversation.lastMessage.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessage.content}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        conversation.channel === 'whatsapp' ? 'bg-green-100 text-green-800' :
                        conversation.channel === 'sms' ? 'bg-blue-100 text-blue-800' :
                        conversation.channel === 'voice' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {conversation.channel.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  {selectedConversation.contact.avatar ? (
                    <img
                      src={selectedConversation.contact.avatar}
                      alt={selectedConversation.contact.name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <span className="text-gray-600 font-medium">
                      {selectedConversation.contact.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-medium text-gray-900">
                    {selectedConversation.contact.name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {selectedConversation.contact.phone} &#8226; {activeChannel.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.direction === 'outbound'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs opacity-75">
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {message.direction === 'outbound' && (
                        <span className="text-xs opacity-75 ml-2">
                          {message.status === 'sent' ? '&#10003;' : 
                           message.status === 'delivered' ? '&#10003;&#10003;' :
                           message.status === 'read' ? '&#10003;&#10003;' : '&#10007;'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  ref={messageInputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      sendMessage();
                    }
                  }}
                  placeholder={`Type a ${activeChannel} message...`}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl text-gray-300 mb-4">&#128172;</div>
              <h2 className="text-xl font-medium text-gray-900 mb-2">Select a conversation</h2>
              <p className="text-gray-500">Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedMessagingDashboard;
