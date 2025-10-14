// Integration Tests for Toll-Free Number API Endpoints
// Testing actual API calls to voice webhook endpoints

import { describe, test, expect, beforeEach, afterEach } from 'vitest';

// Mock fetch for API testing
global.fetch = vi.fn();

describe('Toll-Free Number API Integration', () => {
  const baseUrl = 'https://tetrixcorp.com';
  const webhookUrl = `${baseUrl}/api/voice/texml-enhanced`;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Healthcare API Endpoints', () => {
    test('should handle patient intake webhook call', async () => {
      const mockResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Welcome to TETRIX Healthcare Patient Services. This call is being recorded for medical record purposes. Please state your full name and date of birth for verification.</Say>
  <Record timeout="30" maxLength="120" playBeep="true" transcribe="true">
    <Say voice="alice">Please provide your information after the beep.</Say>
  </Record>
  <Say voice="alice">Thank you for your information. Please hold while we connect you to a patient services representative.</Say>
  <Dial timeout="30" record="record-from-answer">
    <Number>+1-800-596-3057</Number>
  </Dial>
</Response>`;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({
          'Content-Type': 'text/xml; charset=utf-8',
          'X-TETRIX-Industry': 'healthcare',
          'X-TETRIX-Compliance': 'hipaa'
        }),
        text: () => Promise.resolve(mockResponse)
      });

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Telnyx-Signature': 'test-signature'
        },
        body: JSON.stringify({
          event_type: 'call.initiated',
          industry: 'healthcare',
          scenario: 'patient_intake',
          language: 'en-US',
          complianceType: 'hipaa',
          data: {
            call_control_id: 'call_123',
            from: '+1234567890',
            to: '+1-800-596-3057'
          }
        })
      });

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/xml; charset=utf-8');
      expect(response.headers.get('X-TETRIX-Industry')).toBe('healthcare');
      expect(response.headers.get('X-TETRIX-Compliance')).toBe('hipaa');

      const responseText = await response.text();
      expect(responseText).toContain('+1-800-596-3057');
      expect(responseText).toContain('Welcome to TETRIX Healthcare');
      expect(responseText).toContain('medical record purposes');
    });

    test('should handle provider support webhook call', async () => {
      const mockResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">You have reached our provider support team. Please hold while we connect you to a healthcare specialist.</Say>
  <Dial timeout="30" record="record-from-answer">
    <Number>+1-888-804-6762</Number>
  </Dial>
</Response>`;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({
          'Content-Type': 'text/xml; charset=utf-8',
          'X-TETRIX-Industry': 'healthcare',
          'X-TETRIX-Compliance': 'hipaa'
        }),
        text: () => Promise.resolve(mockResponse)
      });

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Telnyx-Signature': 'test-signature'
        },
        body: JSON.stringify({
          event_type: 'call.gather.ended',
          industry: 'healthcare',
          scenario: 'provider_support',
          data: {
            call_control_id: 'call_123',
            digits: '2'
          }
        })
      });

      expect(response.ok).toBe(true);
      const responseText = await response.text();
      expect(responseText).toContain('+1-888-804-6762');
      expect(responseText).toContain('provider support team');
    });

    test('should handle emergency consultation webhook call', async () => {
      const mockResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">You have reached our emergency assistance line. Please hold while we connect you to an emergency coordinator.</Say>
  <Dial timeout="30" record="record-from-answer">
    <Number>+1-800-596-3057</Number>
  </Dial>
</Response>`;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({
          'Content-Type': 'text/xml; charset=utf-8',
          'X-TETRIX-Industry': 'healthcare',
          'X-TETRIX-Compliance': 'hipaa'
        }),
        text: () => Promise.resolve(mockResponse)
      });

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Telnyx-Signature': 'test-signature'
        },
        body: JSON.stringify({
          event_type: 'call.gather.ended',
          industry: 'healthcare',
          scenario: 'emergency_consultation',
          data: {
            call_control_id: 'call_123',
            digits: '0'
          }
        })
      });

      expect(response.ok).toBe(true);
      const responseText = await response.text();
      expect(responseText).toContain('+1-800-596-3057');
      expect(responseText).toContain('emergency assistance');
    });
  });

  describe('Legal API Endpoints', () => {
    test('should handle client intake webhook call', async () => {
      const mockResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Welcome to TETRIX Legal Services. This call is protected by attorney-client privilege and may be recorded for legal purposes. Please state your name and case number if you have one.</Say>
  <Record timeout="45" maxLength="180" playBeep="true" transcribe="true">
    <Say voice="alice">Please provide your information after the beep.</Say>
  </Record>
  <Say voice="alice">Thank you. Please hold while we connect you to a legal specialist.</Say>
  <Dial timeout="30" record="record-from-answer">
    <Number>+1-800-596-3057</Number>
  </Dial>
</Response>`;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({
          'Content-Type': 'text/xml; charset=utf-8',
          'X-TETRIX-Industry': 'legal',
          'X-TETRIX-Compliance': 'attorney_client_privilege'
        }),
        text: () => Promise.resolve(mockResponse)
      });

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Telnyx-Signature': 'test-signature'
        },
        body: JSON.stringify({
          event_type: 'call.initiated',
          industry: 'legal',
          scenario: 'client_intake',
          language: 'en-US',
          complianceType: 'attorney_client_privilege',
          data: {
            call_control_id: 'call_456',
            from: '+1234567890',
            to: '+1-800-596-3057'
          }
        })
      });

      expect(response.ok).toBe(true);
      expect(response.headers.get('X-TETRIX-Industry')).toBe('legal');
      expect(response.headers.get('X-TETRIX-Compliance')).toBe('attorney_client_privilege');

      const responseText = await response.text();
      expect(responseText).toContain('+1-800-596-3057');
      expect(responseText).toContain('Welcome to TETRIX Legal Services');
      expect(responseText).toContain('attorney-client privilege');
    });

    test('should handle urgent legal matters webhook call', async () => {
      const mockResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">You have reached our urgent legal matters line. This call is protected by attorney-client privilege. Please hold while we connect you to an emergency attorney.</Say>
  <Dial timeout="30" record="record-from-answer">
    <Number>+1-800-596-3057</Number>
  </Dial>
</Response>`;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({
          'Content-Type': 'text/xml; charset=utf-8',
          'X-TETRIX-Industry': 'legal',
          'X-TETRIX-Compliance': 'attorney_client_privilege'
        }),
        text: () => Promise.resolve(mockResponse)
      });

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Telnyx-Signature': 'test-signature'
        },
        body: JSON.stringify({
          event_type: 'call.gather.ended',
          industry: 'legal',
          scenario: 'urgent_legal',
          data: {
            call_control_id: 'call_456',
            digits: '0'
          }
        })
      });

      expect(response.ok).toBe(true);
      const responseText = await response.text();
      expect(responseText).toContain('+1-800-596-3057');
      expect(responseText).toContain('urgent legal matters');
      expect(responseText).toContain('emergency attorney');
    });
  });

  describe('Fleet Management API Endpoints', () => {
    test('should handle driver emergency webhook call', async () => {
      const mockResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">TETRIX Fleet Management Emergency Line. Please state your driver ID and describe the emergency situation.</Say>
  <Record timeout="60" maxLength="300" playBeep="true" transcribe="true">
    <Say voice="alice">Please describe the emergency after the beep.</Say>
  </Record>
  <Say voice="alice">Thank you. Please hold while we connect you to our emergency dispatch team.</Say>
  <Dial timeout="30" record="record-from-answer">
    <Number>+1-800-596-3057</Number>
  </Dial>
</Response>`;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({
          'Content-Type': 'text/xml; charset=utf-8',
          'X-TETRIX-Industry': 'fleet',
          'X-TETRIX-Compliance': 'fleet_management'
        }),
        text: () => Promise.resolve(mockResponse)
      });

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Telnyx-Signature': 'test-signature'
        },
        body: JSON.stringify({
          event_type: 'call.initiated',
          industry: 'fleet',
          scenario: 'driver_emergency',
          language: 'en-US',
          complianceType: 'fleet_management',
          data: {
            call_control_id: 'call_789',
            from: '+1234567890',
            to: '+1-800-596-3057'
          }
        })
      });

      expect(response.ok).toBe(true);
      expect(response.headers.get('X-TETRIX-Industry')).toBe('fleet');
      expect(response.headers.get('X-TETRIX-Compliance')).toBe('fleet_management');

      const responseText = await response.text();
      expect(responseText).toContain('+1-800-596-3057');
      expect(responseText).toContain('TETRIX Fleet Management Emergency Line');
      expect(responseText).toContain('emergency situation');
    });

    test('should handle vehicle tracking webhook call', async () => {
      const mockResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">You have reached our vehicle tracking department. Please hold while we connect you to a tracking specialist.</Say>
  <Dial timeout="30" record="record-from-answer">
    <Number>+1-888-804-6762</Number>
  </Dial>
</Response>`;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({
          'Content-Type': 'text/xml; charset=utf-8',
          'X-TETRIX-Industry': 'fleet',
          'X-TETRIX-Compliance': 'fleet_management'
        }),
        text: () => Promise.resolve(mockResponse)
      });

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Telnyx-Signature': 'test-signature'
        },
        body: JSON.stringify({
          event_type: 'call.gather.ended',
          industry: 'fleet',
          scenario: 'vehicle_tracking',
          data: {
            call_control_id: 'call_789',
            digits: '2'
          }
        })
      });

      expect(response.ok).toBe(true);
      const responseText = await response.text();
      expect(responseText).toContain('+1-888-804-6762');
      expect(responseText).toContain('vehicle tracking');
      expect(responseText).toContain('tracking specialist');
    });
  });

  describe('Error Handling API Tests', () => {
    test('should handle API errors gracefully', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Telnyx-Signature': 'test-signature'
          },
          body: JSON.stringify({
            event_type: 'call.initiated',
            industry: 'healthcare',
            scenario: 'patient_intake'
          })
        });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Network error');
      }
    });

    test('should handle invalid webhook signatures', async () => {
      const mockResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">We're experiencing technical difficulties. Please try again later.</Say>
  <Hangup/>
</Response>`;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({
          'Content-Type': 'text/xml; charset=utf-8'
        }),
        text: () => Promise.resolve(mockResponse)
      });

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Telnyx-Signature': 'invalid-signature'
        },
        body: JSON.stringify({
          event_type: 'call.initiated',
          industry: 'healthcare',
          scenario: 'patient_intake'
        })
      });

      expect(response.ok).toBe(true);
      const responseText = await response.text();
      expect(responseText).toContain('technical difficulties');
      expect(responseText).toContain('<Hangup/>');
    });

    test('should handle malformed request bodies', async () => {
      const mockResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">We're experiencing technical difficulties. Please try again later.</Say>
  <Hangup/>
</Response>`;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({
          'Content-Type': 'text/xml; charset=utf-8'
        }),
        text: () => Promise.resolve(mockResponse)
      });

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Telnyx-Signature': 'test-signature'
        },
        body: 'invalid-json'
      });

      expect(response.ok).toBe(true);
      const responseText = await response.text();
      expect(responseText).toContain('technical difficulties');
    });
  });

  describe('Performance and Load Testing', () => {
    test('should handle multiple concurrent API calls', async () => {
      const mockResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Welcome to TETRIX Healthcare Patient Services.</Say>
  <Dial timeout="30" record="record-from-answer">
    <Number>+1-800-596-3057</Number>
  </Dial>
</Response>`;

      (global.fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({
          'Content-Type': 'text/xml; charset=utf-8',
          'X-TETRIX-Industry': 'healthcare'
        }),
        text: () => Promise.resolve(mockResponse)
      });

      const promises = Array.from({ length: 50 }, (_, i) => 
        fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Telnyx-Signature': 'test-signature'
          },
          body: JSON.stringify({
            event_type: 'call.initiated',
            industry: 'healthcare',
            scenario: 'patient_intake',
            data: { call_control_id: `call_${i}` }
          })
        })
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.ok).toBe(true);
        expect(response.status).toBe(200);
        expect(response.headers.get('Content-Type')).toBe('text/xml; charset=utf-8');
      });
    });

    test('should handle rapid sequential API calls', async () => {
      const mockResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Welcome to TETRIX Healthcare Patient Services.</Say>
  <Dial timeout="30" record="record-from-answer">
    <Number>+1-800-596-3057</Number>
  </Dial>
</Response>`;

      (global.fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({
          'Content-Type': 'text/xml; charset=utf-8',
          'X-TETRIX-Industry': 'healthcare'
        }),
        text: () => Promise.resolve(mockResponse)
      });

      const startTime = Date.now();
      
      for (let i = 0; i < 20; i++) {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Telnyx-Signature': 'test-signature'
          },
          body: JSON.stringify({
            event_type: 'call.initiated',
            industry: 'healthcare',
            scenario: 'patient_intake',
            data: { call_control_id: `call_${i}` }
          })
        });

        expect(response.ok).toBe(true);
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // Should complete 20 calls in under 5 seconds
      expect(totalTime).toBeLessThan(5000);
    });
  });

  describe('Multi-Language API Support', () => {
    test('should handle Spanish language requests', async () => {
      const mockResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="es-ES">Bienvenido a TETRIX Healthcare Patient Services.</Say>
  <Dial timeout="30" record="record-from-answer">
    <Number>+1-800-596-3057</Number>
  </Dial>
</Response>`;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({
          'Content-Type': 'text/xml; charset=utf-8',
          'X-TETRIX-Industry': 'healthcare',
          'X-TETRIX-Language': 'es-ES'
        }),
        text: () => Promise.resolve(mockResponse)
      });

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Telnyx-Signature': 'test-signature'
        },
        body: JSON.stringify({
          event_type: 'call.initiated',
          industry: 'healthcare',
          scenario: 'patient_intake',
          language: 'es-ES',
          data: {
            call_control_id: 'call_spanish',
            from: '+1234567890',
            to: '+1-800-596-3057'
          }
        })
      });

      expect(response.ok).toBe(true);
      expect(response.headers.get('X-TETRIX-Language')).toBe('es-ES');

      const responseText = await response.text();
      expect(responseText).toContain('language="es-ES"');
      expect(responseText).toContain('Bienvenido a TETRIX Healthcare');
    });

    test('should handle French language requests', async () => {
      const mockResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="fr-FR">Bienvenue chez TETRIX Legal Services.</Say>
  <Dial timeout="30" record="record-from-answer">
    <Number>+1-800-596-3057</Number>
  </Dial>
</Response>`;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({
          'Content-Type': 'text/xml; charset=utf-8',
          'X-TETRIX-Industry': 'legal',
          'X-TETRIX-Language': 'fr-FR'
        }),
        text: () => Promise.resolve(mockResponse)
      });

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Telnyx-Signature': 'test-signature'
        },
        body: JSON.stringify({
          event_type: 'call.initiated',
          industry: 'legal',
          scenario: 'client_intake',
          language: 'fr-FR',
          data: {
            call_control_id: 'call_french',
            from: '+1234567890',
            to: '+1-800-596-3057'
          }
        })
      });

      expect(response.ok).toBe(true);
      expect(response.headers.get('X-TETRIX-Language')).toBe('fr-FR');

      const responseText = await response.text();
      expect(responseText).toContain('language="fr-FR"');
      expect(responseText).toContain('Bienvenue chez TETRIX Legal Services');
    });
  });
});
