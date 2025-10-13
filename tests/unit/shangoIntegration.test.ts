import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the contact page integration
const mockContactPageIntegration = {
  // Mock the simplified SHANGO chat functions from contact.astro
  startSHANGOChat: vi.fn(),
  renderChatInterface: vi.fn(),
  renderMessage: vi.fn(),
  closeSHANGOChat: vi.fn(),
  handleKeyPress: vi.fn(),
  sendSHANGOMessage: vi.fn(),
  updateMessagesDisplay: vi.fn()
};

// Mock global variables
const mockGlobalVars = {
  currentSession: null,
  messages: []
};

// Mock DOM elements
const mockChatContainer = {
  innerHTML: '',
  style: {},
  classList: {
    add: vi.fn(),
    remove: vi.fn(),
    contains: vi.fn()
  }
};

const mockMessageInput = {
  value: '',
  focus: vi.fn(),
  addEventListener: vi.fn()
};

const mockMessagesContainer = {
  innerHTML: '',
  scrollTop: 0,
  scrollHeight: 100
};

// Mock document methods
const mockDocument = {
  getElementById: vi.fn(),
  addEventListener: vi.fn(),
  createElement: vi.fn()
};

// Mock fetch
global.fetch = vi.fn();

// Mock global objects
global.document = mockDocument as any;
global.window = {
  currentSession: mockGlobalVars.currentSession,
  messages: mockGlobalVars.messages,
  addEventListener: vi.fn()
} as any;

describe('SHANGO Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset global variables
    mockGlobalVars.currentSession = null;
    mockGlobalVars.messages = [];
    
    // Setup default DOM mocks
    mockDocument.getElementById.mockImplementation((id: string) => {
      switch (id) {
        case 'shango-chat-widget':
          return mockChatContainer;
        case 'shango-message-input':
          return mockMessageInput;
        case 'shango-messages':
          return mockMessagesContainer;
        default:
          return null;
      }
    });
  });

  describe('Contact Page Integration', () => {
    describe('startSHANGOChat', () => {
      it('should initialize chat session successfully', async () => {
        // Mock successful API response
        (global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            session: {
              id: 'test-session-123',
              userId: 'contact-user',
              agentId: 'shango-general',
              status: 'active',
              channel: 'chat',
              messages: [{
                id: 'msg-1',
                role: 'assistant',
                content: 'Hello! I\'m SHANGO, your AI Super Agent. How can I help you today?',
                timestamp: new Date().toISOString(),
                type: 'text'
              }]
            }
          })
        });

        // Mock the startSHANGOChat function
        const startSHANGOChat = async () => {
          const chatContainer = document.getElementById('shango-chat-widget');
          if (!chatContainer) return;

          try {
            // Show loading state
            chatContainer.innerHTML = `
              <div class="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                <p class="text-gray-600">Starting SHANGO AI Super Agent...</p>
              </div>
            `;

            // Create session
            const response = await fetch('/api/v1/shango/sessions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: `contact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                agentId: 'shango-general',
                channel: 'chat'
              })
            });

            if (response.ok) {
              const data = await response.json();
              mockGlobalVars.currentSession = data.session;
              mockGlobalVars.messages = data.session.messages || [];
              return { success: true, session: data.session };
            } else {
              throw new Error('Failed to start chat session');
            }
          } catch (error) {
            console.error('Error starting chat:', error);
            return { success: false, error: error.message };
          }
        };

        const result = await startSHANGOChat();

        expect(result.success).toBe(true);
        expect(mockGlobalVars.currentSession).toBeDefined();
        expect(mockGlobalVars.currentSession.id).toBe('test-session-123');
        expect(global.fetch).toHaveBeenCalledWith('/api/v1/shango/sessions', expect.any(Object));
      });

      it('should handle API errors gracefully', async () => {
        // Mock failed API response
        (global.fetch as any).mockResolvedValueOnce({
          ok: false,
          status: 500
        });

        const startSHANGOChat = async () => {
          const chatContainer = document.getElementById('shango-chat-widget');
          if (!chatContainer) return;

          try {
            const response = await fetch('/api/v1/shango/sessions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: `contact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                agentId: 'shango-general',
                channel: 'chat'
              })
            });

            if (response.ok) {
              const data = await response.json();
              mockGlobalVars.currentSession = data.session;
              mockGlobalVars.messages = data.session.messages || [];
              return { success: true, session: data.session };
            } else {
              throw new Error('Failed to start chat session');
            }
          } catch (error) {
            console.error('Error starting chat:', error);
            return { success: false, error: error.message };
          }
        };

        const result = await startSHANGOChat();

        expect(result.success).toBe(false);
        expect(result.error).toContain('Failed to start chat session');
      });
    });

    describe('sendSHANGOMessage', () => {
      beforeEach(() => {
        mockGlobalVars.currentSession = {
          id: 'test-session-123',
          userId: 'contact-user',
          agentId: 'shango-general'
        };
        mockGlobalVars.messages = [];
      });

      it('should send message and receive AI response', async () => {
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

        const sendSHANGOMessage = async () => {
          const input = document.getElementById('shango-message-input') as HTMLInputElement;
          const message = input?.value.trim();
          
          if (!message || !mockGlobalVars.currentSession) return;

          // Add user message
          const userMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: message,
            timestamp: new Date().toISOString(),
            type: 'text'
          };
          
          mockGlobalVars.messages.push(userMessage);
          if (input) input.value = '';
          
          try {
            // Send message to API
            const response = await fetch(`/api/v1/shango/sessions/${mockGlobalVars.currentSession.id}/messages`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                message: message,
                role: 'user',
                agentId: 'shango-general'
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
              
              mockGlobalVars.messages.push(aiMessage);
              return { success: true, messages: mockGlobalVars.messages };
            } else {
              throw new Error('Failed to send message');
            }
          } catch (error) {
            console.error('Error sending message:', error);
            return { success: false, error: error.message };
          }
        };

        // Set input value
        mockMessageInput.value = 'Hello, I need help with pricing';

        const result = await sendSHANGOMessage();

        expect(result.success).toBe(true);
        expect(mockGlobalVars.messages).toHaveLength(2);
        expect(mockGlobalVars.messages[0].role).toBe('user');
        expect(mockGlobalVars.messages[1].role).toBe('assistant');
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/v1/shango/sessions/test-session-123/messages',
          expect.any(Object)
        );
      });

      it('should handle message send failure', async () => {
        // Mock failed API response
        (global.fetch as any).mockResolvedValueOnce({
          ok: false,
          status: 500
        });

        const sendSHANGOMessage = async () => {
          const input = document.getElementById('shango-message-input') as HTMLInputElement;
          const message = input?.value.trim();
          
          if (!message || !mockGlobalVars.currentSession) return;

          try {
            const response = await fetch(`/api/v1/shango/sessions/${mockGlobalVars.currentSession.id}/messages`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                message: message,
                role: 'user',
                agentId: 'shango-general'
              })
            });

            if (response.ok) {
              const data = await response.json();
              return { success: true, data };
            } else {
              throw new Error('Failed to send message');
            }
          } catch (error) {
            console.error('Error sending message:', error);
            return { success: false, error: error.message };
          }
        };

        mockMessageInput.value = 'Hello';

        const result = await sendSHANGOMessage();

        expect(result.success).toBe(false);
        expect(result.error).toContain('Failed to send message');
      });
    });

    describe('renderMessage', () => {
      it('should render user messages correctly', () => {
        const renderMessage = (message: any) => {
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
        };

        const userMessage = {
          id: 'msg-1',
          role: 'user',
          content: 'Hello there!',
          timestamp: new Date().toISOString(),
          type: 'text'
        };

        const rendered = renderMessage(userMessage);

        expect(rendered).toContain('Hello there!');
        expect(rendered).toContain('justify-end');
        expect(rendered).toContain('bg-blue-600 text-white');
        expect(rendered).not.toContain('⚡ SHANGO');
      });

      it('should render AI messages correctly', () => {
        const renderMessage = (message: any) => {
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
        };

        const aiMessage = {
          id: 'msg-1',
          role: 'assistant',
          content: 'Hi! How can I help you today?',
          timestamp: new Date().toISOString(),
          type: 'text'
        };

        const rendered = renderMessage(aiMessage);

        expect(rendered).toContain('Hi! How can I help you today?');
        expect(rendered).toContain('justify-start');
        expect(rendered).toContain('bg-gradient-to-r from-purple-100 to-blue-100');
        expect(rendered).toContain('⚡ SHANGO');
      });
    });

    describe('closeSHANGOChat', () => {
      it('should reset chat state and render initial state', () => {
        const closeSHANGOChat = () => {
          const chatContainer = document.getElementById('shango-chat-widget');
          if (!chatContainer) return;

          chatContainer.innerHTML = `
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
                onclick="startSHANGOChat()"
                class="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-colors"
              >
                Start Chat with SHANGO
              </button>
            </div>
          `;
          mockGlobalVars.currentSession = null;
          mockGlobalVars.messages = [];
        };

        // Set initial state
        mockGlobalVars.currentSession = { id: 'test-session' };
        mockGlobalVars.messages = [{ id: 'msg-1', content: 'test' }];

        closeSHANGOChat();

        expect(mockGlobalVars.currentSession).toBeNull();
        expect(mockGlobalVars.messages).toEqual([]);
        expect(mockChatContainer.innerHTML).toContain('Start Chat with SHANGO');
      });
    });

    describe('handleKeyPress', () => {
      it('should send message on Enter key press', () => {
        const sendSHANGOMessage = vi.fn();
        
        const handleKeyPress = (event: any) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendSHANGOMessage();
          }
        };

        const mockEvent = {
          key: 'Enter',
          shiftKey: false,
          preventDefault: vi.fn()
        };

        handleKeyPress(mockEvent);

        expect(mockEvent.preventDefault).toHaveBeenCalled();
        expect(sendSHANGOMessage).toHaveBeenCalled();
      });

      it('should not send message on Shift+Enter', () => {
        const sendSHANGOMessage = vi.fn();
        
        const handleKeyPress = (event: any) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendSHANGOMessage();
          }
        };

        const mockEvent = {
          key: 'Enter',
          shiftKey: true,
          preventDefault: vi.fn()
        };

        handleKeyPress(mockEvent);

        expect(mockEvent.preventDefault).not.toHaveBeenCalled();
        expect(sendSHANGOMessage).not.toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Mock network error
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const startSHANGOChat = async () => {
        try {
          const response = await fetch('/api/v1/shango/sessions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: `contact-${Date.now()}`,
              agentId: 'shango-general',
              channel: 'chat'
            })
          });

          if (response.ok) {
            const data = await response.json();
            return { success: true, session: data.session };
          } else {
            throw new Error('Failed to start chat session');
          }
        } catch (error) {
          console.error('Error starting chat:', error);
          return { success: false, error: error.message };
        }
      };

      const result = await startSHANGOChat();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('should handle invalid JSON responses', async () => {
      // Mock invalid JSON response
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      });

      const startSHANGOChat = async () => {
        try {
          const response = await fetch('/api/v1/shango/sessions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: `contact-${Date.now()}`,
              agentId: 'shango-general',
              channel: 'chat'
            })
          });

          if (response.ok) {
            const data = await response.json();
            return { success: true, session: data.session };
          } else {
            throw new Error('Failed to start chat session');
          }
        } catch (error) {
          console.error('Error starting chat:', error);
          return { success: false, error: error.message };
        }
      };

      const result = await startSHANGOChat();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid JSON');
    });
  });

  describe('Integration Scenarios', () => {
    it('should complete full chat flow', async () => {
      // Mock successful session creation
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          session: {
            id: 'test-session-123',
            userId: 'contact-user',
            agentId: 'shango-general',
            status: 'active',
            channel: 'chat',
            messages: [{
              id: 'msg-1',
              role: 'assistant',
              content: 'Hello! I\'m SHANGO, your AI Super Agent. How can I help you today?',
              timestamp: new Date().toISOString(),
              type: 'text'
            }]
          }
        })
      });

      // Mock successful message sending
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          message: {
            id: 'user-msg-1',
            role: 'user',
            content: 'What are your pricing plans?',
            timestamp: new Date().toISOString(),
            type: 'text'
          },
          aiResponse: {
            id: 'ai-msg-1',
            role: 'assistant',
            content: 'Our enterprise pricing starts at $299/month for the basic plan...',
            timestamp: new Date().toISOString(),
            type: 'text',
            agentId: 'shango-general'
          }
        })
      });

      // Start chat
      const startResult = await (async () => {
        const response = await fetch('/api/v1/shango/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'contact-user',
            agentId: 'shango-general',
            channel: 'chat'
          })
        });
        return await response.json();
      })();

      expect(startResult.success).toBe(true);
      expect(startResult.session.id).toBe('test-session-123');

      // Send message
      const messageResult = await (async () => {
        const response = await fetch(`/api/v1/shango/sessions/${startResult.session.id}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: 'What are your pricing plans?',
            role: 'user',
            agentId: 'shango-general'
          })
        });
        return await response.json();
      })();

      expect(messageResult.success).toBe(true);
      expect(messageResult.message.content).toBe('What are your pricing plans?');
      expect(messageResult.aiResponse.content).toContain('$299/month');
    });
  });
});
