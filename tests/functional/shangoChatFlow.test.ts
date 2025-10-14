import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { shangoStorage } from '../../src/services/shangoStorage';

describe('SHANGO Chat Flow Integration', () => {
  beforeEach(() => {
    // Clear storage before each test
    shangoStorage['sessions'].clear();
    shangoStorage['messages'].clear();
  });

  afterEach(() => {
    // Clean up after each test
    shangoStorage['sessions'].clear();
    shangoStorage['messages'].clear();
  });

  describe('Complete Chat Session Flow', () => {
    it('should handle a complete conversation from start to finish', () => {
      // 1. Create a new session
      const session = {
        id: 'test-session-1',
        userId: 'user-123',
        agentId: 'shango-general',
        status: 'active',
        channel: 'chat',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: []
      };

      shangoStorage.createSession(session);
      expect(shangoStorage.getSessionCount()).toBe(1);

      // 2. Add greeting message
      const greetingMessage = {
        id: 'msg-greeting',
        role: 'assistant',
        content: 'Hello! I\'m SHANGO, your AI Super Agent. How can I help you today?',
        timestamp: new Date().toISOString(),
        type: 'text'
      };

      shangoStorage.addMessage('test-session-1', greetingMessage);
      expect(shangoStorage.getMessageCount('test-session-1')).toBe(1);

      // 3. User sends a message
      const userMessage = {
        id: 'msg-user-1',
        role: 'user',
        content: 'Hello SHANGO! I need help with pricing.',
        timestamp: new Date().toISOString(),
        type: 'text'
      };

      shangoStorage.addMessage('test-session-1', userMessage);
      expect(shangoStorage.getMessageCount('test-session-1')).toBe(2);

      // 4. AI responds (simulating the API response)
      const aiResponse = {
        id: 'msg-ai-1',
        role: 'assistant',
        content: 'Our enterprise pricing starts at $299/month for the basic plan, with custom solutions available for larger organizations. Would you like me to connect you with our sales team for a detailed quote?',
        timestamp: new Date().toISOString(),
        type: 'text',
        agentId: 'shango-general'
      };

      shangoStorage.addMessage('test-session-1', aiResponse);
      expect(shangoStorage.getMessageCount('test-session-1')).toBe(3);

      // 5. Verify the conversation
      const messages = shangoStorage.getMessages('test-session-1');
      expect(messages).toHaveLength(3);
      expect(messages[0].role).toBe('assistant');
      expect(messages[1].role).toBe('user');
      expect(messages[2].role).toBe('assistant');
      expect(messages[1].content).toContain('pricing');
      expect(messages[2].content).toContain('$299/month');

      // 6. Update session status
      shangoStorage.updateSession('test-session-1', { status: 'ended' });
      const updatedSession = shangoStorage.getSession('test-session-1');
      expect(updatedSession?.status).toBe('ended');
    });

    it('should handle multiple conversation threads', () => {
      // Create two separate sessions
      const session1 = {
        id: 'session-1',
        userId: 'user-1',
        agentId: 'shango-general',
        status: 'active',
        channel: 'chat',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: []
      };

      const session2 = {
        id: 'session-2',
        userId: 'user-2',
        agentId: 'shango-technical',
        status: 'active',
        channel: 'chat',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: []
      };

      shangoStorage.createSession(session1);
      shangoStorage.createSession(session2);
      expect(shangoStorage.getSessionCount()).toBe(2);

      // Add messages to both sessions
      const message1 = {
        id: 'msg-1',
        role: 'user',
        content: 'Hello from user 1',
        timestamp: new Date().toISOString(),
        type: 'text'
      };

      const message2 = {
        id: 'msg-2',
        role: 'user',
        content: 'Hello from user 2',
        timestamp: new Date().toISOString(),
        type: 'text'
      };

      shangoStorage.addMessage('session-1', message1);
      shangoStorage.addMessage('session-2', message2);

      // Verify messages are isolated
      expect(shangoStorage.getMessageCount('session-1')).toBe(1);
      expect(shangoStorage.getMessageCount('session-2')).toBe(1);
      expect(shangoStorage.getMessages('session-1')[0].content).toBe('Hello from user 1');
      expect(shangoStorage.getMessages('session-2')[0].content).toBe('Hello from user 2');
    });

    it('should handle session cleanup', () => {
      // Create multiple sessions with different ages
      const oldSession = {
        id: 'old-session',
        userId: 'user-1',
        agentId: 'shango-general',
        status: 'active',
        channel: 'chat',
        createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // 25 hours ago
        updatedAt: new Date().toISOString(),
        messages: []
      };

      const newSession = {
        id: 'new-session',
        userId: 'user-2',
        agentId: 'shango-general',
        status: 'active',
        channel: 'chat',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: []
      };

      shangoStorage.createSession(oldSession);
      shangoStorage.createSession(newSession);
      expect(shangoStorage.getSessionCount()).toBe(2);

      // Cleanup old sessions
      shangoStorage.cleanupOldSessions(24 * 60 * 60 * 1000); // 24 hours
      expect(shangoStorage.getSessionCount()).toBe(1);
      expect(shangoStorage.getSession('old-session')).toBeUndefined();
      expect(shangoStorage.getSession('new-session')).toBeDefined();
    });
  });

  describe('Message Types and Content', () => {
    it('should handle different message types', () => {
      const session = {
        id: 'test-session',
        userId: 'user-123',
        agentId: 'shango-general',
        status: 'active',
        channel: 'chat',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: []
      };

      shangoStorage.createSession(session);

      const textMessage = {
        id: 'msg-1',
        role: 'user',
        content: 'Hello SHANGO!',
        timestamp: new Date().toISOString(),
        type: 'text'
      };

      const imageMessage = {
        id: 'msg-2',
        role: 'user',
        content: 'https://example.com/image.jpg',
        timestamp: new Date().toISOString(),
        type: 'image'
      };

      const fileMessage = {
        id: 'msg-3',
        role: 'assistant',
        content: 'Here is the document you requested',
        timestamp: new Date().toISOString(),
        type: 'file',
        metadata: { filename: 'document.pdf', size: 1024 }
      };

      shangoStorage.addMessage('test-session', textMessage);
      shangoStorage.addMessage('test-session', imageMessage);
      shangoStorage.addMessage('test-session', fileMessage);

      const messages = shangoStorage.getMessages('test-session');
      expect(messages).toHaveLength(3);
      expect(messages[0].type).toBe('text');
      expect(messages[1].type).toBe('image');
      expect(messages[2].type).toBe('file');
    });

    it('should handle long conversations', () => {
      const session = {
        id: 'test-session',
        userId: 'user-123',
        agentId: 'shango-general',
        status: 'active',
        channel: 'chat',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: []
      };

      shangoStorage.createSession(session);

      // Add 50 messages
      for (let i = 0; i < 50; i++) {
        const message = {
          id: `msg-${i}`,
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: `Message ${i}`,
          timestamp: new Date().toISOString(),
          type: 'text'
        };
        shangoStorage.addMessage('test-session', message);
      }

      expect(shangoStorage.getMessageCount('test-session')).toBe(50);
      const messages = shangoStorage.getMessages('test-session');
      expect(messages).toHaveLength(50);
      expect(messages[0].content).toBe('Message 0');
      expect(messages[49].content).toBe('Message 49');
    });
  });

  describe('Error Handling', () => {
    it('should handle adding messages to non-existent session gracefully', () => {
      const message = {
        id: 'msg-1',
        role: 'user',
        content: 'Hello SHANGO!',
        timestamp: new Date().toISOString(),
        type: 'text'
      };

      // This should not throw an error
      expect(() => {
        shangoStorage.addMessage('non-existent-session', message);
      }).not.toThrow();

      // Messages should be stored even if session doesn't exist
      const messages = shangoStorage.getMessages('non-existent-session');
      expect(messages).toHaveLength(1);
      expect(messages[0]).toEqual(message);
    });

    it('should handle clearing messages from non-existent session', () => {
      // This should not throw an error
      expect(() => {
        shangoStorage.clearMessages('non-existent-session');
      }).not.toThrow();
    });

    it('should handle updating non-existent session', () => {
      // This should not throw an error
      expect(() => {
        shangoStorage.updateSession('non-existent-session', { status: 'ended' });
      }).not.toThrow();
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle multiple concurrent sessions efficiently', () => {
      const startTime = Date.now();
      
      // Create 100 sessions
      for (let i = 0; i < 100; i++) {
        const session = {
          id: `session-${i}`,
          userId: `user-${i}`,
          agentId: 'shango-general',
          status: 'active',
          channel: 'chat',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: []
        };
        shangoStorage.createSession(session);
      }

      const createTime = Date.now() - startTime;
      expect(shangoStorage.getSessionCount()).toBe(100);
      expect(createTime).toBeLessThan(1000); // Should complete in less than 1 second

      // Add messages to all sessions
      const messageStartTime = Date.now();
      for (let i = 0; i < 100; i++) {
        const message = {
          id: `msg-${i}`,
          role: 'user',
          content: `Message from session ${i}`,
          timestamp: new Date().toISOString(),
          type: 'text'
        };
        shangoStorage.addMessage(`session-${i}`, message);
      }

      const messageTime = Date.now() - messageStartTime;
      expect(messageTime).toBeLessThan(1000); // Should complete in less than 1 second

      // Verify all messages were added
      for (let i = 0; i < 100; i++) {
        expect(shangoStorage.getMessageCount(`session-${i}`)).toBe(1);
      }
    });
  });
});
