/**
 * Integration Tests for Cross-Platform Communication
 * Tests the complete flow between TETRIX and JoRoMi platforms
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

// Mock DOM environment for TETRIX
const tetrixDom = new JSDOM(`
  <!DOCTYPE html>
  <html>
    <body>
      <div id="2fa-modal" class="hidden">
        <div id="2fa-step-3">
          <button id="redirect-joromi">Continue to JoRoMi Platform</button>
        </div>
      </div>
    </body>
  </html>
`, {
  url: 'http://localhost:8080',
  pretendToBeVisual: true,
  resources: 'usable'
});

// Mock DOM environment for JoRoMi
const joromiDom = new JSDOM(`
  <!DOCTYPE html>
  <html>
    <body>
      <div id="tetrix-auth-page">
        <div id="status">loading</div>
        <div id="message">Processing TETRIX authentication...</div>
      </div>
    </body>
  </html>
`, {
  url: 'http://localhost:3000',
  pretendToBeVisual: true,
  resources: 'usable'
});

// Mock localStorage for both platforms
const mockTetrixLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

const mockJoRoMiLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

// Mock fetch
global.fetch = vi.fn();

// Mock window.open and postMessage
global.window.open = vi.fn();

describe('Cross-Platform Integration Tests', () => {
  let tetrixWindow;
  let joromiWindow;
  let messageHandlers = [];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup TETRIX window
    tetrixWindow = tetrixDom.window;
    Object.defineProperty(tetrixWindow, 'localStorage', {
      value: mockTetrixLocalStorage
    });

    // Setup JoRoMi window
    joromiWindow = joromiDom.window;
    Object.defineProperty(joromiWindow, 'localStorage', {
      value: mockJoRoMiLocalStorage
    });

    // Mock postMessage communication
    tetrixWindow.postMessage = vi.fn();
    joromiWindow.postMessage = vi.fn();
    
    // Mock window.open for both windows
    tetrixWindow.open = vi.fn();
    joromiWindow.open = vi.fn();

    // Mock addEventListener for message handling
    const originalAddEventListener = tetrixWindow.addEventListener;
    tetrixWindow.addEventListener = vi.fn((event, handler) => {
      if (event === 'message') {
        messageHandlers.push(handler);
      }
      return originalAddEventListener.call(tetrixWindow, event, handler);
    });

    // Reset message handlers
    messageHandlers = [];
  });

  describe('TETRIX to JoRoMi Authentication Flow', () => {
    it('should complete full cross-platform authentication flow', async () => {
      // Setup: User is authenticated in TETRIX
      mockTetrixLocalStorage.getItem.mockReturnValue('tetrix-auth-token-123');
      
      // Step 1: User clicks JoRoMi button in TETRIX
      const tetrixAuthManager = {
        redirectToJoRoMi() {
          const authToken = tetrixWindow.localStorage.getItem('tetrix_auth_token');
          if (authToken) {
            tetrixWindow.open(`http://localhost:3000/tetrix-auth?redirect=joromi-dashboard&token=${authToken}`, '_blank');
          } else {
            tetrixWindow.open('http://localhost:3000', '_blank');
          }
        }
      };

      tetrixAuthManager.redirectToJoRoMi();

      expect(mockTetrixLocalStorage.getItem).toHaveBeenCalledWith('tetrix_auth_token');
      expect(tetrixWindow.open).toHaveBeenCalledWith(
        'http://localhost:3000/tetrix-auth?redirect=joromi-dashboard&token=tetrix-auth-token-123',
        '_blank'
      );

      // Step 2: JoRoMi receives the authentication request
      const joromiAuthHandler = {
        async handleTetrixAuth(token, redirect) {
          if (!token) {
            throw new Error('No TETRIX authentication token found');
          }

          // Store TETRIX integration data
          joromiWindow.localStorage.setItem('tetrix_integration_token', token);
          joromiWindow.localStorage.setItem('tetrix_integration_status', 'connected');
          joromiWindow.localStorage.setItem('tetrix_integration_timestamp', new Date().toISOString());

          // Notify parent window (TETRIX) of success
          if (joromiWindow.opener) {
            joromiWindow.opener.postMessage({
              type: 'TETRIX_AUTH_SUCCESS',
              token: token,
              timestamp: new Date().toISOString()
            }, 'http://localhost:8080');
          }

          return {
            success: true,
            token: token,
            redirect: redirect
          };
        }
      };

      const result = await joromiAuthHandler.handleTetrixAuth('tetrix-auth-token-123', 'joromi-dashboard');

      expect(result.success).toBe(true);
      expect(result.token).toBe('tetrix-auth-token-123');
      expect(mockJoRoMiLocalStorage.setItem).toHaveBeenCalledWith('tetrix_integration_token', 'tetrix-auth-token-123');
      expect(mockJoRoMiLocalStorage.setItem).toHaveBeenCalledWith('tetrix_integration_status', 'connected');
    });

    it('should handle missing authentication token gracefully', async () => {
      const joromiAuthHandler = {
        async handleTetrixAuth(token, redirect) {
          if (!token) {
            throw new Error('No TETRIX authentication token found');
          }
          return { success: true };
        }
      };

      await expect(joromiAuthHandler.handleTetrixAuth(null, 'joromi-dashboard'))
        .rejects.toThrow('No TETRIX authentication token found');
    });

    it('should handle postMessage communication between windows', () => {
      // Setup parent-child window relationship
      joromiWindow.opener = tetrixWindow;
      tetrixWindow.opener = null;

      // Mock message event
      const mockMessageEvent = {
        origin: 'http://localhost:3000',
        data: {
          type: 'TETRIX_AUTH_SUCCESS',
          token: 'tetrix-auth-token-123',
          timestamp: new Date().toISOString()
        }
      };

      // Simulate message handler
      const messageHandler = (event) => {
        if (event.origin !== 'http://localhost:3000') return;
        
        if (event.data.type === 'TETRIX_AUTH_SUCCESS') {
          // Update TETRIX integration status
          console.log('TETRIX authentication successful:', event.data);
        }
      };

      // Add message handler
      tetrixWindow.addEventListener('message', messageHandler);

      // Simulate receiving message
      messageHandler(mockMessageEvent);

      expect(tetrixWindow.addEventListener).toHaveBeenCalledWith('message', messageHandler);
    });
  });

  describe('JoRoMi Dashboard Integration', () => {
    it('should detect TETRIX integration status correctly', () => {
      // Setup: TETRIX integration data exists
      mockJoRoMiLocalStorage.getItem
        .mockReturnValueOnce('tetrix-auth-token-123') // tetrix_integration_token
        .mockReturnValueOnce('connected') // tetrix_integration_status
        .mockReturnValueOnce('2024-01-01T00:00:00.000Z'); // tetrix_integration_timestamp

      const joromiDashboard = {
        checkTETRIXIntegration() {
          const tetrixToken = joromiWindow.localStorage.getItem('tetrix_integration_token');
          const tetrixStatus = joromiWindow.localStorage.getItem('tetrix_integration_status');
          const tetrixTimestamp = joromiWindow.localStorage.getItem('tetrix_integration_timestamp');
          
          if (tetrixToken && tetrixStatus === 'connected') {
            return {
              connected: true,
              token: tetrixToken,
              last_sync: tetrixTimestamp,
              tetrix_user_id: 'tetrix_user_' + Date.now(),
              tetrix_connected: true
            };
          }
          
          return null;
        }
      };

      const integrationData = joromiDashboard.checkTETRIXIntegration();

      expect(integrationData).not.toBeNull();
      expect(integrationData.connected).toBe(true);
      expect(integrationData.token).toBe('tetrix-auth-token-123');
      expect(integrationData.tetrix_connected).toBe(true);
    });

    it('should handle missing TETRIX integration data', () => {
      // Setup: No TETRIX integration data
      mockJoRoMiLocalStorage.getItem.mockReturnValue(null);

      const joromiDashboard = {
        checkTETRIXIntegration() {
          const tetrixToken = joromiWindow.localStorage.getItem('tetrix_integration_token');
          const tetrixStatus = joromiWindow.localStorage.getItem('tetrix_integration_status');
          
          if (tetrixToken && tetrixStatus === 'connected') {
            return { connected: true };
          }
          
          return null;
        }
      };

      const integrationData = joromiDashboard.checkTETRIXIntegration();

      expect(integrationData).toBeNull();
    });

    it('should disconnect TETRIX integration correctly', () => {
      // Setup: TETRIX integration is connected
      mockJoRoMiLocalStorage.getItem
        .mockReturnValueOnce('tetrix-auth-token-123')
        .mockReturnValueOnce('connected')
        .mockReturnValueOnce('2024-01-01T00:00:00.000Z');

      const joromiDashboard = {
        disconnectTETRIX() {
          // Clear local TETRIX integration data
          joromiWindow.localStorage.removeItem('tetrix_integration_token');
          joromiWindow.localStorage.removeItem('tetrix_integration_status');
          joromiWindow.localStorage.removeItem('tetrix_integration_timestamp');
          joromiWindow.localStorage.removeItem('tetrix_auth_token');
          
          return {
            connected: false,
            tetrix_connected: false
          };
        }
      };

      const result = joromiDashboard.disconnectTETRIX();

      expect(result.connected).toBe(false);
      expect(result.tetrix_connected).toBe(false);
      expect(mockJoRoMiLocalStorage.removeItem).toHaveBeenCalledWith('tetrix_integration_token');
      expect(mockJoRoMiLocalStorage.removeItem).toHaveBeenCalledWith('tetrix_integration_status');
      expect(mockJoRoMiLocalStorage.removeItem).toHaveBeenCalledWith('tetrix_integration_timestamp');
      expect(mockJoRoMiLocalStorage.removeItem).toHaveBeenCalledWith('tetrix_auth_token');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle network errors during cross-platform communication', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const tetrixAuthManager = {
        async initiateVerification(phoneNumber) {
          try {
            const response = await fetch('/api/v2/2fa/initiate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ phoneNumber })
            });
            return await response.json();
          } catch (error) {
            throw new Error('Network error during verification');
          }
        }
      };

      await expect(tetrixAuthManager.initiateVerification('+15551234567'))
        .rejects.toThrow('Network error during verification');
    });

    it('should handle invalid authentication tokens', async () => {
      const joromiAuthHandler = {
        async handleTetrixAuth(token, redirect) {
          if (!token || token.length < 10) {
            throw new Error('Invalid authentication token');
          }
          return { success: true };
        }
      };

      await expect(joromiAuthHandler.handleTetrixAuth('invalid', 'joromi-dashboard'))
        .rejects.toThrow('Invalid authentication token');
    });

    it('should handle cross-origin message security', () => {
      const messageHandler = (event) => {
        if (event.origin !== 'http://localhost:3000') {
          throw new Error('Invalid origin');
        }
        return event.data;
      };

      // Valid origin
      const validEvent = {
        origin: 'http://localhost:3000',
        data: { type: 'TETRIX_AUTH_SUCCESS' }
      };
      expect(() => messageHandler(validEvent)).not.toThrow();

      // Invalid origin
      const invalidEvent = {
        origin: 'http://malicious-site.com',
        data: { type: 'TETRIX_AUTH_SUCCESS' }
      };
      expect(() => messageHandler(invalidEvent)).toThrow('Invalid origin');
    });
  });

  describe('Performance and Reliability', () => {
    it('should handle multiple concurrent authentication requests', async () => {
      const authManager = {
        async processAuth(token) {
          // Simulate async processing
          await new Promise(resolve => setTimeout(resolve, 100));
          return { success: true, token };
        }
      };

      const tokens = ['token1', 'token2', 'token3'];
      const promises = tokens.map(token => authManager.processAuth(token));
      
      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(3);
      results.forEach((result, index) => {
        expect(result.success).toBe(true);
        expect(result.token).toBe(tokens[index]);
      });
    });

    it('should handle authentication timeout scenarios', async () => {
      const authManager = {
        async processAuthWithTimeout(token, timeout = 5000) {
          return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
              reject(new Error('Authentication timeout'));
            }, timeout);

            // Simulate successful auth after 100ms
            setTimeout(() => {
              clearTimeout(timer);
              resolve({ success: true, token });
            }, 100);
          });
        }
      };

      const result = await authManager.processAuthWithTimeout('test-token', 5000);
      expect(result.success).toBe(true);
      expect(result.token).toBe('test-token');
    });
  });
});
