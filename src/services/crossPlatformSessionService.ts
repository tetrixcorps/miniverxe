// Cross-Platform Session Management Service
// Manages authentication and session state across TETRIX and JoRoMi platforms

export interface CrossPlatformSession {
  sessionId: string;
  userId: string;
  tetrixUserId?: string;
  joromiUserId?: string;
  phoneNumber: string;
  email?: string;
  businessName?: string;
  isAuthenticated: boolean;
  twoFactorVerified: boolean;
  trialStatus: 'not_started' | 'active' | 'expired' | 'converted';
  trialEndDate?: Date;
  stripeCustomerId?: string;
  wabaStatus?: 'pending' | 'approved' | 'rejected';
  wabaId?: string;
  lastActivity: Date;
  expiresAt: Date;
  platform: 'tetrix' | 'joromi' | 'both';
  deviceInfo?: {
    userAgent: string;
    ipAddress: string;
    location?: string;
  };
}

export interface SessionConfig {
  sessionTimeout: number; // minutes
  refreshThreshold: number; // minutes before expiry to refresh
  maxSessions: number; // per user
  enableCrossPlatform: boolean;
  require2FA: boolean;
}

class CrossPlatformSessionService {
  private config: SessionConfig;
  private sessions: Map<string, CrossPlatformSession> = new Map();
  private refreshTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(config: SessionConfig) {
    this.config = config;
    this.startSessionCleanup();
  }

  /**
   * Create a new cross-platform session
   */
  async createSession(
    userId: string,
    phoneNumber: string,
    platform: 'tetrix' | 'joromi',
    deviceInfo?: CrossPlatformSession['deviceInfo']
  ): Promise<{
    success: boolean;
    session?: CrossPlatformSession;
    error?: string;
  }> {
    try {
      // Check if user already has active sessions
      const existingSessions = this.getUserSessions(userId);
      
      if (existingSessions.length >= this.config.maxSessions) {
        // Remove oldest session
        const oldestSession = existingSessions.sort((a, b) => 
          a.lastActivity.getTime() - b.lastActivity.getTime()
        )[0];
        await this.destroySession(oldestSession.sessionId);
      }

      // Create new session
      const sessionId = this.generateSessionId();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + this.config.sessionTimeout * 60 * 1000);

      const session: CrossPlatformSession = {
        sessionId,
        userId,
        phoneNumber,
        isAuthenticated: false,
        twoFactorVerified: false,
        trialStatus: 'not_started',
        lastActivity: now,
        expiresAt,
        platform,
        deviceInfo
      };

      // Store session
      this.sessions.set(sessionId, session);
      
      // Set up refresh timer
      this.setupRefreshTimer(sessionId);

      return {
        success: true,
        session
      };

    } catch (error) {
      console.error('Failed to create session:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Authenticate session with 2FA verification
   */
  async authenticateSession(
    sessionId: string,
    twoFactorVerified: boolean = true,
    additionalData?: Partial<CrossPlatformSession>
  ): Promise<{
    success: boolean;
    session?: CrossPlatformSession;
    error?: string;
  }> {
    try {
      const session = this.sessions.get(sessionId);
      
      if (!session) {
        return {
          success: false,
          error: 'Session not found'
        };
      }

      if (session.expiresAt < new Date()) {
        await this.destroySession(sessionId);
        return {
          success: false,
          error: 'Session expired'
        };
      }

      // Update session with authentication data
      const updatedSession: CrossPlatformSession = {
        ...session,
        isAuthenticated: true,
        twoFactorVerified,
        lastActivity: new Date(),
        ...additionalData
      };

      this.sessions.set(sessionId, updatedSession);

      return {
        success: true,
        session: updatedSession
      };

    } catch (error) {
      console.error('Failed to authenticate session:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): CrossPlatformSession | null {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return null;
    }

    if (session.expiresAt < new Date()) {
      this.destroySession(sessionId);
      return null;
    }

    // Update last activity
    session.lastActivity = new Date();
    this.sessions.set(sessionId, session);

    return session;
  }

  /**
   * Get all sessions for a user
   */
  getUserSessions(userId: string): CrossPlatformSession[] {
    return Array.from(this.sessions.values())
      .filter(session => session.userId === userId)
      .filter(session => session.expiresAt > new Date());
  }

  /**
   * Update session data
   */
  async updateSession(
    sessionId: string,
    updates: Partial<CrossPlatformSession>
  ): Promise<{
    success: boolean;
    session?: CrossPlatformSession;
    error?: string;
  }> {
    try {
      const session = this.sessions.get(sessionId);
      
      if (!session) {
        return {
          success: false,
          error: 'Session not found'
        };
      }

      if (session.expiresAt < new Date()) {
        await this.destroySession(sessionId);
        return {
          success: false,
          error: 'Session expired'
        };
      }

      // Update session
      const updatedSession: CrossPlatformSession = {
        ...session,
        ...updates,
        lastActivity: new Date()
      };

      this.sessions.set(sessionId, updatedSession);

      return {
        success: true,
        session: updatedSession
      };

    } catch (error) {
      console.error('Failed to update session:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Link TETRIX and JoRoMi accounts
   */
  async linkPlatforms(
    sessionId: string,
    tetrixUserId?: string,
    joromiUserId?: string
  ): Promise<{
    success: boolean;
    session?: CrossPlatformSession;
    error?: string;
  }> {
    try {
      const session = this.sessions.get(sessionId);
      
      if (!session) {
        return {
          success: false,
          error: 'Session not found'
        };
      }

      // Update session with platform user IDs
      const updatedSession: CrossPlatformSession = {
        ...session,
        tetrixUserId,
        joromiUserId,
        platform: 'both',
        lastActivity: new Date()
      };

      this.sessions.set(sessionId, updatedSession);

      return {
        success: true,
        session: updatedSession
      };

    } catch (error) {
      console.error('Failed to link platforms:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Refresh session (extend expiry)
   */
  async refreshSession(sessionId: string): Promise<{
    success: boolean;
    session?: CrossPlatformSession;
    error?: string;
  }> {
    try {
      const session = this.sessions.get(sessionId);
      
      if (!session) {
        return {
          success: false,
          error: 'Session not found'
        };
      }

      if (session.expiresAt < new Date()) {
        await this.destroySession(sessionId);
        return {
          success: false,
          error: 'Session expired'
        };
      }

      // Extend session
      const now = new Date();
      const newExpiresAt = new Date(now.getTime() + this.config.sessionTimeout * 60 * 1000);
      
      const updatedSession: CrossPlatformSession = {
        ...session,
        lastActivity: now,
        expiresAt: newExpiresAt
      };

      this.sessions.set(sessionId, updatedSession);
      
      // Reset refresh timer
      this.setupRefreshTimer(sessionId);

      return {
        success: true,
        session: updatedSession
      };

    } catch (error) {
      console.error('Failed to refresh session:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Destroy session
   */
  async destroySession(sessionId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Clear refresh timer
      const timer = this.refreshTimers.get(sessionId);
      if (timer) {
        clearTimeout(timer);
        this.refreshTimers.delete(sessionId);
      }

      // Remove session
      this.sessions.delete(sessionId);

      return {
        success: true
      };

    } catch (error) {
      console.error('Failed to destroy session:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Destroy all sessions for a user
   */
  async destroyUserSessions(userId: string): Promise<{
    success: boolean;
    destroyedCount: number;
    error?: string;
  }> {
    try {
      const userSessions = this.getUserSessions(userId);
      let destroyedCount = 0;

      for (const session of userSessions) {
        const result = await this.destroySession(session.sessionId);
        if (result.success) {
          destroyedCount++;
        }
      }

      return {
        success: true,
        destroyedCount
      };

    } catch (error) {
      console.error('Failed to destroy user sessions:', error);
      return {
        success: false,
        destroyedCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Validate session for cross-platform access
   */
  async validateCrossPlatformAccess(
    sessionId: string,
    targetPlatform: 'tetrix' | 'joromi'
  ): Promise<{
    valid: boolean;
    session?: CrossPlatformSession;
    requiresReauth: boolean;
    error?: string;
  }> {
    try {
      const session = this.getSession(sessionId);
      
      if (!session) {
        return {
          valid: false,
          requiresReauth: true,
          error: 'Session not found'
        };
      }

      if (!session.isAuthenticated || !session.twoFactorVerified) {
        return {
          valid: false,
          requiresReauth: true,
          error: 'Session not authenticated'
        };
      }

      // Check if session supports the target platform
      if (session.platform !== 'both' && session.platform !== targetPlatform) {
        return {
          valid: false,
          requiresReauth: true,
          error: 'Session not valid for target platform'
        };
      }

      return {
        valid: true,
        session,
        requiresReauth: false
      };

    } catch (error) {
      console.error('Failed to validate cross-platform access:', error);
      return {
        valid: false,
        requiresReauth: true,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Private helper methods
  private generateSessionId(): string {
    return 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  private setupRefreshTimer(sessionId: string): void {
    // Clear existing timer
    const existingTimer = this.refreshTimers.get(sessionId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new timer
    const timer = setTimeout(async () => {
      const session = this.sessions.get(sessionId);
      if (session) {
        const timeUntilExpiry = session.expiresAt.getTime() - new Date().getTime();
        const refreshThreshold = this.config.refreshThreshold * 60 * 1000;
        
        if (timeUntilExpiry <= refreshThreshold) {
          await this.refreshSession(sessionId);
        }
      }
    }, this.config.refreshThreshold * 60 * 1000);

    this.refreshTimers.set(sessionId, timer);
  }

  private startSessionCleanup(): void {
    // Clean up expired sessions every 5 minutes
    setInterval(() => {
      const now = new Date();
      const expiredSessions: string[] = [];

      for (const [sessionId, session] of this.sessions.entries()) {
        if (session.expiresAt < now) {
          expiredSessions.push(sessionId);
        }
      }

      expiredSessions.forEach(sessionId => {
        this.destroySession(sessionId);
      });

      if (expiredSessions.length > 0) {
        console.log(`Cleaned up ${expiredSessions.length} expired sessions`);
      }
    }, 5 * 60 * 1000);
  }
}

export const crossPlatformSessionService = new CrossPlatformSessionService({
  sessionTimeout: 60, // 1 hour
  refreshThreshold: 10, // 10 minutes before expiry
  maxSessions: 5, // 5 sessions per user
  enableCrossPlatform: true,
  require2FA: true
});
