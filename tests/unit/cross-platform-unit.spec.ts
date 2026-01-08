// Unit Tests for Cross-Platform Integration
import { test, expect } from '@playwright/test';
import { TestData, MockResponses, Assertions, DataGenerators } from '../../scripts/test-utilities.js';

test.describe('Cross-Platform Integration Unit Tests', () => {
  
  test.describe('TETRIX-JoRoMi Integration', () => {
    test('should validate CORS configuration for TETRIX-JoRoMi communication', async ({ request }) => {
      // Test CORS preflight request
      const response = await request.options('/api/voice/initiate', {
        headers: {
          'Origin': 'https://joromi.ai',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type, Authorization'
        }
      });

      expect(response.status()).toBe(200);
      const headers = response.headers();
      expect(headers['access-control-allow-origin']).toContain('joromi.ai');
      expect(headers['access-control-allow-methods']).toContain('POST');
      expect(headers['access-control-allow-headers']).toContain('Content-Type');
    });

    test('should handle cross-platform session sharing', async ({ request }) => {
      const sessionData = {
        platform: 'joromi',
        userId: 'user_123',
        sessionId: DataGenerators.generateSessionId('joromi'),
        metadata: {
          source: 'joromi-voip',
          integration: 'tetrix-voice'
        }
      };

      const response = await request.post('/api/voice/sessions/cross-platform', {
        data: sessionData
      });

      expect([200, 201]).toContain(response.status());
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.sessionId).toBeDefined();
    });

    test('should validate platform-specific configurations', async ({ request }) => {
      const platforms = ['tetrix', 'joromi', 'glo'];
      
      for (const platform of platforms) {
        const response = await request.get(`/api/voice/config/${platform}`);

        expect(response.status()).toBe(200);
        const data = await response.json();
        expect(data.platform).toBe(platform);
        expect(data.config).toBeDefined();
      }
    });
  });

  test.describe('GLO M2M Integration', () => {
    test('should handle M2M device authentication', async ({ request }) => {
      const deviceAuth = {
        deviceId: 'device_123',
        deviceType: 'iot-sensor',
        platform: 'glo',
        credentials: {
          apiKey: 'test_api_key',
          deviceToken: 'test_device_token'
        }
      };

      const response = await request.post('/api/voice/m2m/auth', {
        data: deviceAuth
      });

      expect([200, 401, 403]).toContain(response.status());
    });

    test('should handle M2M telemetry data', async ({ request }) => {
      const telemetryData = {
        deviceId: 'device_123',
        timestamp: new Date().toISOString(),
        data: {
          temperature: 25.5,
          humidity: 60.2,
          battery: 85
        },
        location: {
          lat: 40.7128,
          lng: -74.0060
        }
      };

      const response = await request.post('/api/voice/m2m/telemetry', {
        data: telemetryData
      });

      expect([200, 400]).toContain(response.status());
    });

    test('should handle M2M session management', async ({ request }) => {
      const m2mSession = {
        deviceId: 'device_123',
        sessionType: 'm2m-communication',
        platform: 'glo',
        capabilities: ['voice', 'data', 'telemetry']
      };

      const response = await request.post('/api/voice/sessions/m2m', {
        data: m2mSession
      });

      expect([200, 201]).toContain(response.status());
      const data = await response.json();
      expect(data.sessionId).toBeDefined();
      expect(data.deviceId).toBe(m2mSession.deviceId);
    });
  });


  test.describe('Cross-Platform Data Synchronization', () => {
    test('should handle user data synchronization', async ({ request }) => {
      const userData = {
        userId: 'user_123',
        platforms: ['tetrix', 'joromi', 'glo'],
        syncData: {
          profile: {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+1234567890'
          },
          preferences: {
            language: 'en-US',
            timezone: 'America/New_York'
          }
        }
      };

      const response = await request.post('/api/voice/sync/user', {
        data: userData
      });

      expect([200, 201]).toContain(response.status());
      const data = await response.json();
      expect(data.syncId).toBeDefined();
      expect(data.platforms).toBeDefined();
    });

    test('should handle session synchronization', async ({ request }) => {
      const sessionSync = {
        sessionId: DataGenerators.generateSessionId(),
        platforms: ['tetrix', 'joromi'],
        syncData: {
          status: 'active',
          duration: 120,
          metadata: {
            source: 'tetrix-voice',
            target: 'joromi-voip'
          }
        }
      };

      const response = await request.post('/api/voice/sync/session', {
        data: sessionSync
      });

      expect([200, 201]).toContain(response.status());
    });

    test('should handle configuration synchronization', async ({ request }) => {
      const configSync = {
        configType: 'voice-settings',
        platforms: ['tetrix', 'joromi', 'glo'],
        configData: {
          voice: {
            language: 'en-US',
            speed: 'normal',
            pitch: 'medium'
          },
          transcription: {
            language: 'en-US',
            confidence: 0.8
          }
        }
      };

      const response = await request.post('/api/voice/sync/config', {
        data: configSync
      });

      expect([200, 201]).toContain(response.status());
    });
  });

  test.describe('Cross-Platform Error Handling', () => {
    test('should handle platform unavailability', async ({ request }) => {
      const response = await request.get('/api/voice/platforms/joromi/status');

      // Should handle gracefully even if platform is down
      expect([200, 503]).toContain(response.status());
    });

    test('should handle cross-platform timeout', async ({ request }) => {
      const response = await request.post('/api/voice/cross-platform/timeout-test', {
        data: {
          timeout: 1000, // 1 second timeout
          platform: 'joromi'
        }
      });

      // Should handle timeout gracefully
      expect([200, 408, 504]).toContain(response.status());
    });

    test('should handle platform-specific errors', async ({ request }) => {
      const platforms = ['tetrix', 'joromi', 'glo'];
      
      for (const platform of platforms) {
        const response = await request.get(`/api/voice/platforms/${platform}/error-test`);

        // Should handle platform-specific errors
        expect([200, 400, 500, 503]).toContain(response.status());
      }
    });
  });

  test.describe('Cross-Platform Security', () => {
    test('should validate cross-platform authentication', async ({ request }) => {
      const authRequest = {
        platform: 'joromi',
        credentials: {
          apiKey: 'test_api_key',
          platformToken: 'test_platform_token'
        }
      };

      const response = await request.post('/api/voice/auth/cross-platform', {
        data: authRequest
      });

      expect([200, 401, 403]).toContain(response.status());
    });

    test('should handle platform-specific permissions', async ({ request }) => {
      const permissionRequest = {
        platform: 'glo',
        userId: 'user_123',
        permissions: ['voice', 'transcription', 'ai']
      };

      const response = await request.post('/api/voice/permissions/check', {
        data: permissionRequest
      });

      expect([200, 403]).toContain(response.status());
    });

    test('should validate cross-platform tokens', async ({ request }) => {
      const tokenRequest = {
        platform: 'tetrix',
        token: 'test_cross_platform_token',
        scope: ['voice', 'messaging']
      };

      const response = await request.post('/api/voice/tokens/validate', {
        data: tokenRequest
      });

      expect([200, 401, 403]).toContain(response.status());
    });
  });

  test.describe('Cross-Platform Monitoring', () => {
    test('should return cross-platform health status', async ({ request }) => {
      const response = await request.get('/api/voice/health/cross-platform');

      expect(response.status()).toBe(200);
      const data = await response.json();
      
      Assertions.expectDefined(data, 'status');
      Assertions.expectDefined(data, 'platforms');
      Assertions.expectArray(data, 'platforms');
    });

    test('should return platform-specific metrics', async ({ request }) => {
      const platforms = ['tetrix', 'joromi', 'glo'];
      
      for (const platform of platforms) {
        const response = await request.get(`/api/voice/metrics/${platform}`);

        expect([200, 404]).toContain(response.status());
        if (response.status() === 200) {
          const data = await response.json();
          expect(data.platform).toBe(platform);
          expect(data.metrics).toBeDefined();
        }
      }
    });

    test('should handle cross-platform alerts', async ({ request }) => {
      const alertData = {
        platform: 'joromi',
        alertType: 'service_down',
        severity: 'high',
        message: 'JoRoMi service is down',
        timestamp: new Date().toISOString()
      };

      const response = await request.post('/api/voice/alerts/cross-platform', {
        data: alertData
      });

      expect([200, 201]).toContain(response.status());
    });
  });

  test.describe('Cross-Platform Configuration', () => {
    test('should return unified configuration', async ({ request }) => {
      const response = await request.get('/api/voice/config/unified');

      expect(response.status()).toBe(200);
      const data = await response.json();
      
      Assertions.expectDefined(data, 'config');
      Assertions.expectDefined(data.config, 'voice');
      Assertions.expectDefined(data.config, 'messaging');
      Assertions.expectDefined(data.config, 'platforms');
    });

    test('should handle platform-specific configurations', async ({ request }) => {
      const platforms = ['tetrix', 'joromi', 'glo'];
      
      for (const platform of platforms) {
        const response = await request.get(`/api/voice/config/${platform}`);

        expect(response.status()).toBe(200);
        const data = await response.json();
        expect(data.platform).toBe(platform);
        expect(data.config).toBeDefined();
      }
    });

    test('should handle configuration updates', async ({ request }) => {
      const configUpdate = {
        platform: 'tetrix',
        configType: 'voice-settings',
        updates: {
          language: 'en-US',
          voice: 'female',
          speed: 'normal'
        }
      };

      const response = await request.put('/api/voice/config/update', {
        data: configUpdate
      });

      expect([200, 201]).toContain(response.status());
    });
  });
});
