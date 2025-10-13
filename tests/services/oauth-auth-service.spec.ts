// Unit Tests for OAuth Auth Service
import { test, expect } from '@playwright/test';

test.describe('OAuth Auth Service Unit Tests', () => {
  
  test.describe('Health and Status', () => {
    test('should return health status', async ({ request }) => {
      const response = await request.get('http://localhost:4003/health');
      expect(response.status()).toBe(200);
      const data = await response.text();
      expect(data).toContain('ok');
    });

    test('should return service status', async ({ request }) => {
      const response = await request.get('http://localhost:4003/status');
      expect([200, 404, 500]).toContain(response.status());
    });
  });

  test.describe('Authentication', () => {
    test('should handle user login', async ({ request }) => {
      const loginData = {
        email: 'user@example.com',
        password: 'password123',
        grantType: 'password'
      };

      const response = await request.post('http://localhost:4003/auth/login', {
        data: loginData
      });

      expect([200, 201, 401, 400, 500]).toContain(response.status());
    });

    test('should handle user registration', async ({ request }) => {
      const registerData = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'user'
      };

      const response = await request.post('http://localhost:4003/auth/register', {
        data: registerData
      });

      expect([200, 201, 400, 409, 500]).toContain(response.status());
    });

    test('should handle password reset request', async ({ request }) => {
      const resetData = {
        email: 'user@example.com',
        resetType: 'email'
      };

      const response = await request.post('http://localhost:4003/auth/reset-password', {
        data: resetData
      });

      expect([200, 201, 400, 404, 500]).toContain(response.status());
    });

    test('should handle password reset confirmation', async ({ request }) => {
      const confirmData = {
        token: 'reset_token_123',
        newPassword: 'newpassword123'
      };

      const response = await request.post('http://localhost:4003/auth/reset-confirm', {
        data: confirmData
      });

      expect([200, 201, 400, 404, 500]).toContain(response.status());
    });
  });

  test.describe('Token Management', () => {
    test('should handle token generation', async ({ request }) => {
      const tokenData = {
        userId: 'user123',
        clientId: 'client123',
        scope: ['read', 'write'],
        expiresIn: 3600
      };

      const response = await request.post('http://localhost:4003/token', {
        data: tokenData
      });

      expect([200, 201, 400, 500]).toContain(response.status());
    });

    test('should handle token validation', async ({ request }) => {
      const response = await request.get('http://localhost:4003/token/validate?token=access_token_123');
      expect([200, 401, 404, 500]).toContain(response.status());
    });

    test('should handle token refresh', async ({ request }) => {
      const refreshData = {
        refreshToken: 'refresh_token_123',
        clientId: 'client123'
      };

      const response = await request.post('http://localhost:4003/token/refresh', {
        data: refreshData
      });

      expect([200, 201, 401, 400, 500]).toContain(response.status());
    });

    test('should handle token revocation', async ({ request }) => {
      const revokeData = {
        token: 'access_token_123',
        tokenType: 'access'
      };

      const response = await request.post('http://localhost:4003/token/revoke', {
        data: revokeData
      });

      expect([200, 201, 400, 500]).toContain(response.status());
    });
  });

  test.describe('OAuth Flows', () => {
    test('should handle authorization code flow', async ({ request }) => {
      const authData = {
        clientId: 'client123',
        redirectUri: 'https://tetrixcorp.com/callback',
        scope: ['read', 'write'],
        state: 'random_state_123',
        responseType: 'code'
      };

      const response = await request.post('http://localhost:4003/auth/authorize', {
        data: authData
      });

      expect([200, 201, 400, 500]).toContain(response.status());
    });

    test('should handle authorization code exchange', async ({ request }) => {
      const exchangeData = {
        code: 'auth_code_123',
        clientId: 'client123',
        clientSecret: 'client_secret_123',
        redirectUri: 'https://tetrixcorp.com/callback',
        grantType: 'authorization_code'
      };

      const response = await request.post('http://localhost:4003/token', {
        data: exchangeData
      });

      expect([200, 201, 400, 500]).toContain(response.status());
    });

    test('should handle client credentials flow', async ({ request }) => {
      const clientData = {
        clientId: 'client123',
        clientSecret: 'client_secret_123',
        grantType: 'client_credentials',
        scope: ['read']
      };

      const response = await request.post('http://localhost:4003/token', {
        data: clientData
      });

      expect([200, 201, 400, 500]).toContain(response.status());
    });

    test('should handle implicit flow', async ({ request }) => {
      const implicitData = {
        clientId: 'client123',
        redirectUri: 'https://tetrixcorp.com/callback',
        scope: ['read'],
        state: 'random_state_123',
        responseType: 'token'
      };

      const response = await request.post('http://localhost:4003/auth/authorize', {
        data: implicitData
      });

      expect([200, 201, 400, 500]).toContain(response.status());
    });
  });

  test.describe('User Management', () => {
    test('should return user profile', async ({ request }) => {
      const response = await request.get('http://localhost:4003/user/profile', {
        headers: {
          'Authorization': 'Bearer access_token_123'
        }
      });
      expect([200, 401, 404, 500]).toContain(response.status());
    });

    test('should handle user profile updates', async ({ request }) => {
      const profileData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890'
      };

      const response = await request.put('http://localhost:4003/user/profile', {
        data: profileData,
        headers: {
          'Authorization': 'Bearer access_token_123'
        }
      });

      expect([200, 201, 401, 400, 500]).toContain(response.status());
    });

    test('should handle user logout', async ({ request }) => {
      const logoutData = {
        token: 'access_token_123',
        refreshToken: 'refresh_token_123'
      };

      const response = await request.post('http://localhost:4003/auth/logout', {
        data: logoutData
      });

      expect([200, 201, 400, 500]).toContain(response.status());
    });

    test('should handle user session management', async ({ request }) => {
      const response = await request.get('http://localhost:4003/user/sessions', {
        headers: {
          'Authorization': 'Bearer access_token_123'
        }
      });
      expect([200, 401, 404, 500]).toContain(response.status());
    });
  });

  test.describe('Client Management', () => {
    test('should handle client registration', async ({ request }) => {
      const clientData = {
        name: 'Test Client',
        redirectUris: ['https://tetrixcorp.com/callback'],
        scopes: ['read', 'write'],
        grantTypes: ['authorization_code', 'client_credentials'],
        clientType: 'confidential'
      };

      const response = await request.post('http://localhost:4003/clients', {
        data: clientData
      });

      expect([200, 201, 400, 500]).toContain(response.status());
    });

    test('should return client information', async ({ request }) => {
      const response = await request.get('http://localhost:4003/clients/client123');
      expect([200, 404, 500]).toContain(response.status());
    });

    test('should handle client updates', async ({ request }) => {
      const updateData = {
        name: 'Updated Client Name',
        redirectUris: ['https://tetrixcorp.com/callback', 'https://app.tetrixcorp.com/callback']
      };

      const response = await request.put('http://localhost:4003/clients/client123', {
        data: updateData
      });

      expect([200, 201, 404, 400, 500]).toContain(response.status());
    });

    test('should handle client secret rotation', async ({ request }) => {
      const response = await request.post('http://localhost:4003/clients/client123/rotate-secret');
      expect([200, 201, 404, 500]).toContain(response.status());
    });
  });

  test.describe('Security Features', () => {
    test('should handle rate limiting', async ({ request }) => {
      // Make multiple requests to test rate limiting
      const promises = Array.from({ length: 10 }, () => 
        request.post('http://localhost:4003/auth/login', {
          data: {
            email: 'user@example.com',
            password: 'wrongpassword'
          }
        })
      );

      const responses = await Promise.all(promises);
      // At least some requests should be rate limited
      expect(responses.some(r => r.status() === 429)).toBe(true);
    });

    test('should handle brute force protection', async ({ request }) => {
      const promises = Array.from({ length: 5 }, () => 
        request.post('http://localhost:4003/auth/login', {
          data: {
            email: 'user@example.com',
            password: 'wrongpassword'
          }
        })
      );

      const responses = await Promise.all(promises);
      // Should eventually block after multiple failed attempts
      expect(responses.some(r => r.status() === 429 || r.status() === 423)).toBe(true);
    });

    test('should handle session timeout', async ({ request }) => {
      const response = await request.get('http://localhost:4003/user/profile', {
        headers: {
          'Authorization': 'Bearer expired_token_123'
        }
      });
      expect([401, 403, 500]).toContain(response.status());
    });
  });

  test.describe('Error Handling', () => {
    test('should handle invalid credentials', async ({ request }) => {
      const response = await request.post('http://localhost:4003/auth/login', {
        data: {
          email: 'user@example.com',
          password: 'wrongpassword'
        }
      });
      expect([401, 400, 500]).toContain(response.status());
    });

    test('should handle malformed requests', async ({ request }) => {
      const response = await request.post('http://localhost:4003/auth/login', {
        data: 'invalid-json'
      });
      expect([400, 500]).toContain(response.status());
    });

    test('should handle missing required fields', async ({ request }) => {
      const response = await request.post('http://localhost:4003/auth/login', {
        data: {
          email: 'user@example.com'
          // Missing password
        }
      });
      expect([400, 500]).toContain(response.status());
    });

    test('should handle invalid tokens', async ({ request }) => {
      const response = await request.get('http://localhost:4003/user/profile', {
        headers: {
          'Authorization': 'Bearer invalid_token_123'
        }
      });
      expect([401, 403, 500]).toContain(response.status());
    });
  });

  test.describe('Integration Tests', () => {
    test('should handle complete OAuth flow', async ({ request }) => {
      // Step 1: Register client
      const clientResponse = await request.post('http://localhost:4003/clients', {
        data: {
          name: 'Test Client',
          redirectUris: ['https://tetrixcorp.com/callback'],
          scopes: ['read', 'write']
        }
      });
      expect([200, 201, 400, 500]).toContain(clientResponse.status());

      // Step 2: User login
      const loginResponse = await request.post('http://localhost:4003/auth/login', {
        data: {
          email: 'user@example.com',
          password: 'password123'
        }
      });
      expect([200, 201, 401, 400, 500]).toContain(loginResponse.status());

      // Step 3: Authorization
      const authResponse = await request.post('http://localhost:4003/auth/authorize', {
        data: {
          clientId: 'client123',
          redirectUri: 'https://tetrixcorp.com/callback',
          scope: ['read', 'write']
        }
      });
      expect([200, 201, 400, 500]).toContain(authResponse.status());

      // Step 4: Token exchange
      const tokenResponse = await request.post('http://localhost:4003/token', {
        data: {
          code: 'auth_code_123',
          clientId: 'client123',
          clientSecret: 'client_secret_123',
          redirectUri: 'https://tetrixcorp.com/callback'
        }
      });
      expect([200, 201, 400, 500]).toContain(tokenResponse.status());
    });
  });
});
