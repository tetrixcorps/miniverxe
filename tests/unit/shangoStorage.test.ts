import { describe, it, expect, beforeEach } from 'vitest';
import { shangoStorage, type ChatSession, type ChatMessage } from '../../src/services/shangoStorage';

describe('SHANGO Storage Service', () => {
  beforeEach(() => {
    // Clear storage before each test
    shangoStorage['sessions'].clear();
    shangoStorage['messages'].clear();
  });

  describe('Session Management', () => {
    it('should create a new session', () => {
      const session: ChatSession = {
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
      const retrievedSession = shangoStorage.getSession('test-session-1');

      expect(retrievedSession).toEqual(session);
      expect(shangoStorage.getSessionCount()).toBe(1);
    });

    it('should update an existing session', async () => {
      const session: ChatSession = {
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
      const originalUpdatedAt = session.updatedAt;
      
      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));
      
      shangoStorage.updateSession('test-session-1', { status: 'ended' });

      const updatedSession = shangoStorage.getSession('test-session-1');
      expect(updatedSession?.status).toBe('ended');
      expect(updatedSession?.updatedAt).not.toBe(originalUpdatedAt);
    });

    it('should delete a session', () => {
      const session: ChatSession = {
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

      shangoStorage.deleteSession('test-session-1');
      expect(shangoStorage.getSessionCount()).toBe(0);
      expect(shangoStorage.getSession('test-session-1')).toBeUndefined();
    });

    it('should return undefined for non-existent session', () => {
      const session = shangoStorage.getSession('non-existent');
      expect(session).toBeUndefined();
    });
  });

  describe('Message Management', () => {
    it('should add a message to a session', () => {
      const session: ChatSession = {
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

      const message: ChatMessage = {
        id: 'msg-1',
        role: 'user',
        content: 'Hello SHANGO!',
        timestamp: new Date().toISOString(),
        type: 'text'
      };

      shangoStorage.addMessage('test-session-1', message);
      const messages = shangoStorage.getMessages('test-session-1');

      expect(messages).toHaveLength(1);
      expect(messages[0]).toEqual(message);
      expect(shangoStorage.getMessageCount('test-session-1')).toBe(1);
    });

    it('should add multiple messages to a session', () => {
      const session: ChatSession = {
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

      const message1: ChatMessage = {
        id: 'msg-1',
        role: 'user',
        content: 'Hello SHANGO!',
        timestamp: new Date().toISOString(),
        type: 'text'
      };

      const message2: ChatMessage = {
        id: 'msg-2',
        role: 'assistant',
        content: 'Hello! How can I help you today?',
        timestamp: new Date().toISOString(),
        type: 'text'
      };

      shangoStorage.addMessage('test-session-1', message1);
      shangoStorage.addMessage('test-session-1', message2);

      const messages = shangoStorage.getMessages('test-session-1');
      expect(messages).toHaveLength(2);
      expect(messages[0]).toEqual(message1);
      expect(messages[1]).toEqual(message2);
    });

    it('should clear messages from a session', () => {
      const session: ChatSession = {
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

      const message: ChatMessage = {
        id: 'msg-1',
        role: 'user',
        content: 'Hello SHANGO!',
        timestamp: new Date().toISOString(),
        type: 'text'
      };

      shangoStorage.addMessage('test-session-1', message);
      expect(shangoStorage.getMessageCount('test-session-1')).toBe(1);

      shangoStorage.clearMessages('test-session-1');
      expect(shangoStorage.getMessageCount('test-session-1')).toBe(0);
    });

    it('should return empty array for non-existent session messages', () => {
      const messages = shangoStorage.getMessages('non-existent');
      expect(messages).toEqual([]);
    });

    it('should update session messages when adding messages', () => {
      const session: ChatSession = {
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

      const message: ChatMessage = {
        id: 'msg-1',
        role: 'user',
        content: 'Hello SHANGO!',
        timestamp: new Date().toISOString(),
        type: 'text'
      };

      shangoStorage.addMessage('test-session-1', message);
      const updatedSession = shangoStorage.getSession('test-session-1');

      expect(updatedSession?.messages).toHaveLength(1);
      expect(updatedSession?.messages[0]).toEqual(message);
    });
  });

  describe('Utility Methods', () => {
    it('should return correct session count', () => {
      expect(shangoStorage.getSessionCount()).toBe(0);

      const session1: ChatSession = {
        id: 'test-session-1',
        userId: 'user-123',
        agentId: 'shango-general',
        status: 'active',
        channel: 'chat',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: []
      };

      const session2: ChatSession = {
        id: 'test-session-2',
        userId: 'user-456',
        agentId: 'shango-technical',
        status: 'active',
        channel: 'chat',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: []
      };

      shangoStorage.createSession(session1);
      expect(shangoStorage.getSessionCount()).toBe(1);

      shangoStorage.createSession(session2);
      expect(shangoStorage.getSessionCount()).toBe(2);
    });

    it('should return correct message count for session', () => {
      const session: ChatSession = {
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
      expect(shangoStorage.getMessageCount('test-session-1')).toBe(0);

      const message: ChatMessage = {
        id: 'msg-1',
        role: 'user',
        content: 'Hello SHANGO!',
        timestamp: new Date().toISOString(),
        type: 'text'
      };

      shangoStorage.addMessage('test-session-1', message);
      expect(shangoStorage.getMessageCount('test-session-1')).toBe(1);
    });

    it('should cleanup old sessions', () => {
      const oldSession: ChatSession = {
        id: 'old-session',
        userId: 'user-123',
        agentId: 'shango-general',
        status: 'active',
        channel: 'chat',
        createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // 25 hours ago
        updatedAt: new Date().toISOString(),
        messages: []
      };

      const newSession: ChatSession = {
        id: 'new-session',
        userId: 'user-456',
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

      // Cleanup sessions older than 24 hours
      shangoStorage.cleanupOldSessions(24 * 60 * 60 * 1000);
      expect(shangoStorage.getSessionCount()).toBe(1);
      expect(shangoStorage.getSession('old-session')).toBeUndefined();
      expect(shangoStorage.getSession('new-session')).toBeDefined();
    });
  });
});
