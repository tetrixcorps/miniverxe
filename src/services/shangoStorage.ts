// SHANGO AI Storage Service
// Shared storage for sessions and messages across API endpoints

interface ChatSession {
  id: string;
  userId: string;
  agentId: string;
  status: string;
  channel: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  shangoAgent?: any;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'shango' | 'agent';
  content: string;
  timestamp: string;
  type: string;
  agentId?: string;
}

class SHANGOStorage {
  private sessions: Map<string, ChatSession> = new Map();
  private messages: Map<string, ChatMessage[]> = new Map();

  // Session management
  createSession(session: ChatSession): void {
    this.sessions.set(session.id, session);
    this.messages.set(session.id, session.messages || []);
  }

  getSession(sessionId: string): ChatSession | undefined {
    return this.sessions.get(sessionId);
  }

  updateSession(sessionId: string, updates: Partial<ChatSession>): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      const updatedSession = { ...session, ...updates, updatedAt: new Date().toISOString() };
      this.sessions.set(sessionId, updatedSession);
    }
  }

  deleteSession(sessionId: string): void {
    this.sessions.delete(sessionId);
    this.messages.delete(sessionId);
  }

  getAllSessions(): ChatSession[] {
    return Array.from(this.sessions.values());
  }

  // Message management
  addMessage(sessionId: string, message: ChatMessage): void {
    const sessionMessages = this.messages.get(sessionId) || [];
    sessionMessages.push(message);
    this.messages.set(sessionId, sessionMessages);

    // Update session messages
    const session = this.sessions.get(sessionId);
    if (session) {
      session.messages = sessionMessages;
      session.updatedAt = new Date().toISOString();
      this.sessions.set(sessionId, session);
    }
  }

  getMessages(sessionId: string): ChatMessage[] {
    return this.messages.get(sessionId) || [];
  }

  clearMessages(sessionId: string): void {
    this.messages.set(sessionId, []);
    
    // Update session messages
    const session = this.sessions.get(sessionId);
    if (session) {
      session.messages = [];
      session.updatedAt = new Date().toISOString();
      this.sessions.set(sessionId, session);
    }
  }

  // Utility methods
  getSessionCount(): number {
    return this.sessions.size;
  }

  getMessageCount(sessionId: string): number {
    return this.messages.get(sessionId)?.length || 0;
  }

  // Cleanup old sessions (optional)
  cleanupOldSessions(maxAge: number = 24 * 60 * 60 * 1000): void {
    const now = Date.now();
    for (const [sessionId, session] of this.sessions.entries()) {
      const sessionAge = now - new Date(session.createdAt).getTime();
      if (sessionAge > maxAge) {
        this.deleteSession(sessionId);
      }
    }
  }
}

// Export singleton instance
export const shangoStorage = new SHANGOStorage();
export type { ChatSession, ChatMessage };
