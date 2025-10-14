import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';

// Mock Express app for testing
const express = require('express');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock the voice webhook handler
const handleVoiceWebhook = async (req: any, res: any) => {
  try {
    const { event_type, data } = req.body;
    
    console.log('Voice webhook received:', {
      event_type,
      call_control_id: data?.call_control_id,
      timestamp: new Date().toISOString()
    });

    // Set content type for TwiML
    res.set('Content-Type', 'text/xml');
    
    let twiMLResponse = '';
    
    switch (event_type) {
      case 'call.initiated':
        twiMLResponse = generateTwiMLResponse('greeting', { 
          tenantId: data?.tenantId || 'tetrix_enterprise',
          from: data?.from,
          to: data?.to 
        });
        break;
      case 'call.input':
        switch (data?.dtmf) {
          case '1':
            twiMLResponse = generateTwiMLResponse('sales', { 
              tenantId: data?.tenantId || 'tetrix_enterprise',
              callControlId: data?.call_control_id 
            });
            break;
          case '2':
            twiMLResponse = generateTwiMLResponse('support', { 
              tenantId: data?.tenantId || 'tetrix_enterprise',
              callControlId: data?.call_control_id 
            });
            break;
          case '3':
            twiMLResponse = generateTwiMLResponse('billing', { 
              tenantId: data?.tenantId || 'tetrix_enterprise',
              callControlId: data?.call_control_id 
            });
            break;
          case '0':
            twiMLResponse = generateTwiMLResponse('operator', { 
              tenantId: data?.tenantId || 'tetrix_enterprise',
              callControlId: data?.call_control_id 
            });
            break;
          default:
            twiMLResponse = generateTwiMLResponse('invalid', { 
              tenantId: data?.tenantId || 'tetrix_enterprise',
              callControlId: data?.call_control_id 
            });
        }
        break;
      case 'call.hangup':
        twiMLResponse = generateTwiMLResponse('hangup', { 
          tenantId: data?.tenantId || 'tetrix_enterprise',
          callControlId: data?.call_control_id 
        });
        break;
      default:
        twiMLResponse = generateTwiMLResponse('greeting', { 
          tenantId: data?.tenantId || 'tetrix_enterprise',
          from: data?.from,
          to: data?.to 
        });
    }
    
    res.status(200).send(twiMLResponse);
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Mock TeXML response handler
const handleTeXMLResponse = async (req: any, res: any) => {
  try {
    const { CallSid, From, To, CallStatus, Digits, SpeechResult } = req.body;
    
    console.log('TeXML webhook received:', {
      CallSid,
      From,
      To,
      CallStatus,
      Digits,
      SpeechResult
    });

    // Set content type for TwiML
    res.set('Content-Type', 'text/xml');
    
    let texmlResponse = '';
    
    if (CallStatus === 'in-progress') {
      if (Digits || SpeechResult) {
        // User provided input, generate AI response
        const userInput = SpeechResult || Digits;
        texmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="female" language="en-US">
    Thank you for saying "${userInput}". I'm SHANGO, your AI Super Agent. How can I help you today?
  </Say>
  <Gather input="speech,dtmf" numDigits="1" timeout="10" action="/webhooks/voice/texml" method="POST">
    <Say voice="female" language="en-US">
      Please tell me how I can help you today, or press any key to continue.
    </Say>
  </Gather>
</Response>`;
      } else {
        // No input yet, ask for input
        texmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="female" language="en-US">
    Hello! This is SHANGO, your AI Super Agent. Please tell me how I can help you today, or press any key to continue.
  </Say>
  <Gather input="speech,dtmf" numDigits="1" timeout="10" action="/webhooks/voice/texml" method="POST">
    <Say voice="female" language="en-US">
      Please tell me how I can help you today, or press any key to continue.
    </Say>
  </Gather>
</Response>`;
      }
    } else {
      // Call ended or other status
      texmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Hangup/>
</Response>`;
    }
    
    res.status(200).send(texmlResponse);
  } catch (error) {
    console.error('TeXML response error:', error);
    res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><Response><Hangup/></Response>');
  }
};

// TwiML response generator
const generateTwiMLResponse = (action: string, data: any) => {
  switch (action) {
    case 'greeting':
      return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Welcome to TETRIX Enterprise Solutions. Press 1 for sales, 2 for support, 3 for billing, or 0 to speak with an operator.</Say>
  <Gather numDigits="1" action="/webhooks/voice/process" method="POST" timeout="10">
    <Say voice="alice">Please make your selection.</Say>
  </Gather>
  <Say voice="alice">We didn't receive any input. Please call back later. Goodbye.</Say>
  <Hangup/>
</Response>`;

    case 'sales':
      return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Thank you for your interest in our sales department. Please hold while we connect you to a sales representative.</Say>
  <Dial timeout="30" record="record-from-answer">
    <Number>+1-888-804-6762</Number>
  </Dial>
  <Say voice="alice">The call could not be completed. Please try again later.</Say>
  <Hangup/>
</Response>`;

    case 'support':
      return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">You have reached our technical support team. Please hold while we connect you to a support specialist.</Say>
  <Dial timeout="30" record="record-from-answer">
    <Number>+1-800-596-3057</Number>
  </Dial>
  <Say voice="alice">The call could not be completed. Please try again later.</Say>
  <Hangup/>
</Response>`;

    case 'billing':
      return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">You have reached our billing department. Please hold while we connect you to a billing specialist.</Say>
  <Dial timeout="30" record="record-from-answer">
    <Number>+1-888-804-6762</Number>
  </Dial>
  <Say voice="alice">The call could not be completed. Please try again later.</Say>
  <Hangup/>
</Response>`;

    case 'operator':
      return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Please hold while we connect you to an operator.</Say>
  <Dial timeout="30" record="record-from-answer">
    <Number>+1-800-596-3057</Number>
  </Dial>
  <Say voice="alice">The call could not be completed. Please try again later.</Say>
  <Hangup/>
</Response>`;

    case 'hangup':
      return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Hangup/>
</Response>`;

    default:
      return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Invalid selection. Please try again.</Say>
  <Redirect>/webhooks/voice/greeting</Redirect>
</Response>`;
  }
};

// Routes
app.post('/webhooks/voice', handleVoiceWebhook);
app.post('/webhooks/voice/texml', handleTeXMLResponse);

describe('Toll Free Numbers IVR Integration Tests', () => {
  const tollFreeNumbers = [
    '+1-800-596-3057',
    '+1-888-804-6762'
  ];

  beforeEach(() => {
    // Reset any mock state
  });

  afterEach(() => {
    // Clean up after tests
  });

  describe('Inbound Call Webhook Tests', () => {
    tollFreeNumbers.forEach((number) => {
      it(`should respond to inbound call webhook for ${number} with greeting and menu`, async () => {
        const webhookPayload = {
          event_type: 'call.initiated',
          data: {
            call_control_id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            tenantId: 'tetrix_enterprise',
            from: '+1234567890',
            to: number,
            timestamp: new Date().toISOString()
          }
        };

        const response = await request(app)
          .post('/webhooks/voice')
          .send(webhookPayload);

        expect(response.status).toBe(200);
        expect(response.type).toBe('text/xml');
        expect(response.text).toMatch(/<Gather.*>/);
        expect(response.text).toMatch(/Press 1 for sales/);
        expect(response.text).toMatch(/Press 2 for support/);
        expect(response.text).toMatch(/Press 3 for billing/);
        expect(response.text).toMatch(/Press 0 to speak with an operator/);
        expect(response.text).toMatch(/Welcome to TETRIX Enterprise Solutions/);
      });
    });
  });

  describe('DTMF Input Processing Tests', () => {
    const testCases = [
      { input: '1', expectedAction: 'sales', expectedText: 'sales department' },
      { input: '2', expectedAction: 'support', expectedText: 'technical support team' },
      { input: '3', expectedAction: 'billing', expectedText: 'billing department' },
      { input: '0', expectedAction: 'operator', expectedText: 'connect you to an operator' },
      { input: '9', expectedAction: 'invalid', expectedText: 'Invalid selection' }
    ];

    testCases.forEach(({ input, expectedAction, expectedText }) => {
      it(`should route to correct flow for DTMF input ${input}`, async () => {
        const webhookPayload = {
          event_type: 'call.input',
          data: {
            call_control_id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            dtmf: input,
            tenantId: 'tetrix_enterprise',
            timestamp: new Date().toISOString()
          }
        };

        const response = await request(app)
          .post('/webhooks/voice')
          .send(webhookPayload);

        expect(response.status).toBe(200);
        expect(response.type).toBe('text/xml');
        
        if (expectedAction === 'invalid') {
          expect(response.text).toMatch(/Invalid selection/);
          expect(response.text).toMatch(/<Redirect>/);
        } else {
          expect(response.text).toMatch(new RegExp(expectedText, 'i'));
          expect(response.text).toMatch(/<Dial>/);
          expect(response.text).toMatch(/<Number>/);
        }
      });
    });
  });

  describe('TeXML Response Tests', () => {
    it('should handle TeXML webhook with speech input', async () => {
      const texmlPayload = {
        CallSid: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        From: '+1234567890',
        To: '+1-800-596-3057',
        CallStatus: 'in-progress',
        SpeechResult: 'I need help with billing'
      };

      const response = await request(app)
        .post('/webhooks/voice/texml')
        .send(texmlPayload);

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/xml');
      expect(response.text).toMatch(/Thank you for saying/);
      expect(response.text).toMatch(/I'm SHANGO, your AI Super Agent/);
      expect(response.text).toMatch(/<Gather/);
    });

    it('should handle TeXML webhook with DTMF input', async () => {
      const texmlPayload = {
        CallSid: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        From: '+1234567890',
        To: '+1-888-804-6762',
        CallStatus: 'in-progress',
        Digits: '1'
      };

      const response = await request(app)
        .post('/webhooks/voice/texml')
        .send(texmlPayload);

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/xml');
      expect(response.text).toMatch(/Thank you for saying/);
      expect(response.text).toMatch(/I'm SHANGO, your AI Super Agent/);
      expect(response.text).toMatch(/<Gather/);
    });

    it('should handle TeXML webhook with no input', async () => {
      const texmlPayload = {
        CallSid: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        From: '+1234567890',
        To: '+1-800-596-3057',
        CallStatus: 'in-progress'
      };

      const response = await request(app)
        .post('/webhooks/voice/texml')
        .send(texmlPayload);

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/xml');
      expect(response.text).toMatch(/Hello! This is SHANGO/);
      expect(response.text).toMatch(/<Gather/);
    });

    it('should handle call hangup in TeXML', async () => {
      const texmlPayload = {
        CallSid: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        From: '+1234567890',
        To: '+1-888-804-6762',
        CallStatus: 'completed'
      };

      const response = await request(app)
        .post('/webhooks/voice/texml')
        .send(texmlPayload);

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/xml');
      expect(response.text).toMatch(/<Hangup\/>/);
    });
  });

  describe('Multi-Tenant Routing Tests', () => {
    const tenants = [
      { id: 'tetrix_enterprise', name: 'TETRIX Enterprise' },
      { id: 'client_premium', name: 'Premium Client' },
      { id: 'client_standard', name: 'Standard Client' }
    ];

    tenants.forEach((tenant) => {
      it(`should handle custom IVR flow for tenant ${tenant.id}`, async () => {
        const webhookPayload = {
          event_type: 'call.initiated',
          data: {
            call_control_id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            tenantId: tenant.id,
            from: '+1234567890',
            to: '+1-800-596-3057',
            timestamp: new Date().toISOString()
          }
        };

        const response = await request(app)
          .post('/webhooks/voice')
          .send(webhookPayload);

        expect(response.status).toBe(200);
        expect(response.type).toBe('text/xml');
        expect(response.text).toMatch(/<Gather.*>/);
        expect(response.text).toMatch(/Welcome to TETRIX Enterprise Solutions/);
      });
    });
  });

  describe('Call Hangup Handling Tests', () => {
    it('should handle call hangup gracefully', async () => {
      const webhookPayload = {
        event_type: 'call.hangup',
        data: {
          call_control_id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          tenantId: 'tetrix_enterprise',
          reason: 'user_hangup',
          timestamp: new Date().toISOString()
        }
      };

      const response = await request(app)
        .post('/webhooks/voice')
        .send(webhookPayload);

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/xml');
      expect(response.text).toMatch(/<Hangup\/>/);
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle malformed webhook payload', async () => {
      const malformedPayload = {
        // Missing required fields
        event_type: 'call.initiated'
      };

      const response = await request(app)
        .post('/webhooks/voice')
        .send(malformedPayload);

      expect(response.status).toBe(200); // Should still respond with TwiML
      expect(response.type).toBe('text/xml');
    });

    it('should handle unknown event types', async () => {
      const webhookPayload = {
        event_type: 'unknown.event',
        data: {
          call_control_id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          tenantId: 'tetrix_enterprise',
          from: '+1234567890',
          to: '+1-800-596-3057',
          timestamp: new Date().toISOString()
        }
      };

      const response = await request(app)
        .post('/webhooks/voice')
        .send(webhookPayload);

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/xml');
      expect(response.text).toMatch(/<Gather.*>/);
    });
  });

  describe('TwiML Validation Tests', () => {
    it('should generate well-formed TwiML XML', async () => {
      const webhookPayload = {
        event_type: 'call.initiated',
        data: {
          call_control_id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          tenantId: 'tetrix_enterprise',
          from: '+1234567890',
          to: '+1-800-596-3057',
          timestamp: new Date().toISOString()
        }
      };

      const response = await request(app)
        .post('/webhooks/voice')
        .send(webhookPayload);

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/xml');
      
      // Validate XML structure
      expect(response.text).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
      expect(response.text).toMatch(/<Response>/);
      expect(response.text).toMatch(/<\/Response>/);
      expect(response.text).toMatch(/<Say/);
      expect(response.text).toMatch(/<Gather/);
    });

    it('should include proper TwiML tags for IVR flow', async () => {
      const webhookPayload = {
        event_type: 'call.input',
        data: {
          call_control_id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          dtmf: '1',
          tenantId: 'tetrix_enterprise',
          timestamp: new Date().toISOString()
        }
      };

      const response = await request(app)
        .post('/webhooks/voice')
        .send(webhookPayload);

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/xml');
      
      // Validate specific TwiML elements
      expect(response.text).toMatch(/<Say/);
      expect(response.text).toMatch(/<Dial/);
      expect(response.text).toMatch(/<Number>/);
      expect(response.text).toMatch(/<Hangup/);
    });
  });

  describe('Performance and Load Tests', () => {
    it('should handle multiple concurrent webhook requests', async () => {
      const promises = Array.from({ length: 10 }, (_, i) => {
        const webhookPayload = {
          event_type: 'call.initiated',
          data: {
            call_control_id: `call_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
            tenantId: 'tetrix_enterprise',
            from: `+123456789${i}`,
            to: '+1-800-596-3057',
            timestamp: new Date().toISOString()
          }
        };

        return request(app)
          .post('/webhooks/voice')
          .send(webhookPayload);
      });

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.type).toBe('text/xml');
      });
    });
  });

  describe('Toll Free Number Specific Tests', () => {
    it('should correctly route calls to +1-800-596-3057 for support and operator', async () => {
      const supportPayload = {
        event_type: 'call.input',
        data: {
          call_control_id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          dtmf: '2', // Support
          tenantId: 'tetrix_enterprise',
          timestamp: new Date().toISOString()
        }
      };

      const operatorPayload = {
        event_type: 'call.input',
        data: {
          call_control_id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          dtmf: '0', // Operator
          tenantId: 'tetrix_enterprise',
          timestamp: new Date().toISOString()
        }
      };

      const supportResponse = await request(app)
        .post('/webhooks/voice')
        .send(supportPayload);

      const operatorResponse = await request(app)
        .post('/webhooks/voice')
        .send(operatorPayload);

      expect(supportResponse.status).toBe(200);
      expect(operatorResponse.status).toBe(200);
      
      // Both should dial +1-800-596-3057
      expect(supportResponse.text).toMatch(/\+1-800-596-3057/);
      expect(operatorResponse.text).toMatch(/\+1-800-596-3057/);
    });

    it('should correctly route calls to +1-888-804-6762 for sales and billing', async () => {
      const salesPayload = {
        event_type: 'call.input',
        data: {
          call_control_id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          dtmf: '1', // Sales
          tenantId: 'tetrix_enterprise',
          timestamp: new Date().toISOString()
        }
      };

      const billingPayload = {
        event_type: 'call.input',
        data: {
          call_control_id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          dtmf: '3', // Billing
          tenantId: 'tetrix_enterprise',
          timestamp: new Date().toISOString()
        }
      };

      const salesResponse = await request(app)
        .post('/webhooks/voice')
        .send(salesPayload);

      const billingResponse = await request(app)
        .post('/webhooks/voice')
        .send(billingPayload);

      expect(salesResponse.status).toBe(200);
      expect(billingResponse.status).toBe(200);
      
      // Both should dial +1-888-804-6762
      expect(salesResponse.text).toMatch(/\+1-888-804-6762/);
      expect(billingResponse.text).toMatch(/\+1-888-804-6762/);
    });
  });
});
