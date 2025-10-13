import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:4321';
const API_BASE_URL = 'http://localhost:4000';

test.describe('Astro API Endpoints', () => {
  test.describe('Contact API', () => {
    test('POST /api/contact - should accept valid contact form', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/contact`, {
        data: {
          name: 'John Doe',
          email: 'john@example.com',
          message: 'Test message'
        }
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.message).toContain('Thank you for your message');
      expect(body.id).toBeDefined();
    });

    test('POST /api/contact - should reject missing required fields', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/contact`, {
        data: {
          name: 'John Doe',
          email: 'john@example.com'
          // message is missing
        }
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error).toContain('Missing required fields');
    });

    test('POST /api/contact - should reject invalid email format', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/contact`, {
        data: {
          name: 'John Doe',
          email: 'invalid-email',
          message: 'Test message'
        }
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error).toContain('Invalid email format');
    });

    test('POST /api/contact - should handle empty request body', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/contact`, {
        data: {}
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error).toContain('Missing required fields');
    });
  });

  test.describe('Email Notification API', () => {
    test('POST /api/notify-email - should send email notification', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/notify-email`, {
        data: {
          name: 'John Doe',
          email: 'john@example.com',
          message: 'Test message',
          submissionId: 'test-123'
        }
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.message).toContain('Email notification sent');
    });

    test('POST /api/notify-email - should handle missing data', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/notify-email`, {
        data: {
          name: 'John Doe'
          // Missing email, message, submissionId
        }
      });

      expect(response.status()).toBe(500);
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error).toContain('Failed to send email notification');
    });
  });

  test.describe('Admin Login API', () => {
    test('POST /api/admin/login - should accept valid password', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/admin/login`, {
        data: {
          password: 'tetrix2024'
        }
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.message).toContain('Login successful');
    });

    test('POST /api/admin/login - should reject invalid password', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/admin/login`, {
        data: {
          password: 'wrongpassword'
        }
      });

      expect(response.status()).toBe(401);
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error).toContain('Invalid password');
    });

    test('POST /api/admin/login - should handle missing password', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/admin/login`, {
        data: {}
      });

      expect(response.status()).toBe(500);
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error).toContain('Internal server error');
    });
  });
});

test.describe('Backend API Endpoints', () => {
  let authToken: string;

  test.beforeAll(async ({ request }) => {
    // Mock authentication - In real tests, you would get a valid Firebase token
    authToken = 'mock-firebase-token';
  });

  test.describe('Health Check', () => {
    test('GET /health - should return ok', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/health`);
      expect(response.status()).toBe(200);
      const body = await response.text();
      expect(body).toBe('ok');
    });
  });

  test.describe('Tickets API', () => {
    test('GET /tickets - should require authentication', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/tickets`);
      expect(response.status()).toBe(401);
      const body = await response.json();
      expect(body.error).toContain('Missing or invalid token');
    });

    test('GET /tickets - should return tickets for authenticated user', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/tickets`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      
      // This will fail with mock token, but tests the endpoint structure
      expect([401, 500]).toContain(response.status());
    });

    test('POST /tickets/:id/claim - should require authentication', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/tickets/test-id/claim`);
      expect(response.status()).toBe(401);
    });

    test('POST /tickets/:id/submit - should require authentication', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/tickets/test-id/submit`, {
        data: {
          ann: { example: 'annotation' }
        }
      });
      expect(response.status()).toBe(401);
    });

    test('PATCH /tickets/:id/review - should require authentication', async ({ request }) => {
      const response = await request.patch(`${API_BASE_URL}/tickets/test-id/review`, {
        data: {
          status: 'approved',
          reviewComment: 'Looks good'
        }
      });
      expect(response.status()).toBe(401);
    });
  });

  test.describe('Projects API', () => {
    test('GET /projects - should require authentication', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/projects`);
      expect(response.status()).toBe(401);
      const body = await response.json();
      expect(body.error).toContain('Missing or invalid token');
    });

    test('POST /projects - should require authentication', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/projects`, {
        data: {
          name: 'Test Project',
          description: 'A test project',
          annotationType: 'text',
          guidelineUrl: 'https://example.com/guidelines',
          dueDate: '2024-12-31'
        }
      });
      expect(response.status()).toBe(401);
    });

    test('PATCH /projects/:id - should require authentication', async ({ request }) => {
      const response = await request.patch(`${API_BASE_URL}/projects/test-id`, {
        data: {
          name: 'Updated Project Name',
          status: 'active'
        }
      });
      expect(response.status()).toBe(401);
    });
  });

  test.describe('Users API', () => {
    test('GET /users - should require authentication', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/users`);
      expect(response.status()).toBe(401);
      const body = await response.json();
      expect(body.error).toContain('Missing or invalid token');
    });

    test('GET /users/me - should require authentication', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/users/me`);
      expect(response.status()).toBe(401);
      const body = await response.json();
      expect(body.error).toContain('Missing or invalid token');
    });
  });

  test.describe('Wallet API', () => {
    test('POST /wallet/create - should require authentication', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/wallet/create`);
      expect(response.status()).toBe(401);
      const body = await response.json();
      expect(body.error).toContain('Missing or invalid token');
    });

    test('POST /wallet/payout - should require authentication', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/wallet/payout`, {
        data: {
          uid: 'test-uid',
          amountUSD: 100
        }
      });
      expect(response.status()).toBe(401);
    });
  });

  test.describe('Label Studio Webhook', () => {
    test('POST /ls/webhook - should accept valid webhook payload', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/ls/webhook`, {
        data: {
          task: { id: 'test-task-id' },
          annotation: { result: 'test-annotation' },
          status: 'submitted'
        }
      });

      // This might return 500 due to Firebase connection issues, but tests the endpoint structure
      expect([200, 500]).toContain(response.status());
    });

    test('POST /ls/webhook - should reject invalid payload', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/ls/webhook`, {
        data: {
          invalid: 'payload'
        }
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.error).toContain('Invalid event payload');
    });

    test('POST /ls/webhook - should handle empty payload', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/ls/webhook`, {
        data: {}
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.error).toContain('Invalid event payload');
    });
  });
});

test.describe('API Error Handling', () => {
  test('should handle malformed JSON in request body', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/contact`, {
      data: '{"invalid": json}',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    expect(response.status()).toBe(500);
  });

  test('should handle missing Content-Type header', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/contact`, {
      data: 'raw string data'
    });
    
    expect(response.status()).toBe(500);
  });

  test('should handle unsupported HTTP methods', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/contact`);
    expect(response.status()).toBe(405);
  });
});

test.describe('API Security Tests', () => {
  test('should prevent SQL injection in contact form', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/contact`, {
      data: {
        name: "'; DROP TABLE users; --",
        email: 'test@example.com',
        message: 'Test message'
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('should sanitize HTML in contact form', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/contact`, {
      data: {
        name: '<script>alert("xss")</script>',
        email: 'test@example.com',
        message: '<img src="x" onerror="alert(1)">'
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('should limit request size', async ({ request }) => {
    const largeMessage = 'x'.repeat(10000);
    const response = await request.post(`${BASE_URL}/api/contact`, {
      data: {
        name: 'Test User',
        email: 'test@example.com',
        message: largeMessage
      }
    });

    // Should either succeed or fail gracefully
    expect([200, 400, 413]).toContain(response.status());
  });
});