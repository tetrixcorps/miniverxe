// Health Check API Endpoint
// Monitors the health of all external services and integrations

import type { APIRoute } from 'astro';

interface HealthStatus {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime?: number;
  lastChecked: string;
  error?: string;
  details?: any;
}

interface HealthCheckResult {
  overall: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  services: HealthStatus[];
  uptime: number;
  version: string;
}

const startTime = Date.now();

// Service health check functions
const checkDatabase = async (): Promise<HealthStatus> => {
  const start = Date.now();
  try {
    // Simulate database check - replace with actual database ping
    await new Promise(resolve => setTimeout(resolve, 10));
    return {
      service: 'database',
      status: 'healthy',
      responseTime: Date.now() - start,
      lastChecked: new Date().toISOString()
    };
  } catch (error) {
    return {
      service: 'database',
      status: 'unhealthy',
      responseTime: Date.now() - start,
      lastChecked: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

const checkStripe = async (): Promise<HealthStatus> => {
  const start = Date.now();
  try {
    // Check Stripe API health
    const response = await fetch('https://api.stripe.com/v1/charges?limit=1', {
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY || 'sk_test_...'}`,
        'Stripe-Version': '2025-02-24.acacia'
      }
    });
    
    return {
      service: 'stripe',
      status: response.ok ? 'healthy' : 'degraded',
      responseTime: Date.now() - start,
      lastChecked: new Date().toISOString(),
      details: { statusCode: response.status }
    };
  } catch (error) {
    return {
      service: 'stripe',
      status: 'unhealthy',
      responseTime: Date.now() - start,
      lastChecked: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

const checkTelnyx = async (): Promise<HealthStatus> => {
  const start = Date.now();
  try {
    // Check Telnyx API health
    const response = await fetch('https://api.telnyx.com/v2/phone_numbers', {
      headers: {
        'Authorization': `Bearer ${process.env.TELNYX_API_KEY || 'KEY...'}`,
        'Content-Type': 'application/json'
      }
    });
    
    return {
      service: 'telnyx',
      status: response.ok ? 'healthy' : 'degraded',
      responseTime: Date.now() - start,
      lastChecked: new Date().toISOString(),
      details: { statusCode: response.status }
    };
  } catch (error) {
    return {
      service: 'telnyx',
      status: 'unhealthy',
      responseTime: Date.now() - start,
      lastChecked: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

const checkSinch = async (): Promise<HealthStatus> => {
  const start = Date.now();
  try {
    // Check Sinch API health
    const response = await fetch('https://us.sms.api.sinch.com/xms/v1/projects', {
      headers: {
        'Authorization': `Bearer ${process.env.SINCH_API_TOKEN || 'token...'}`,
        'Content-Type': 'application/json'
      }
    });
    
    return {
      service: 'sinch',
      status: response.ok ? 'healthy' : 'degraded',
      responseTime: Date.now() - start,
      lastChecked: new Date().toISOString(),
      details: { statusCode: response.status }
    };
  } catch (error) {
    return {
      service: 'sinch',
      status: 'unhealthy',
      responseTime: Date.now() - start,
      lastChecked: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

const checkMailgun = async (): Promise<HealthStatus> => {
  const start = Date.now();
  try {
    // Check Mailgun API health
    const response = await fetch(`https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN || 'domain'}/stats/total`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`api:${process.env.MAILGUN_API_KEY || 'key'}`).toString('base64')}`
      },
      method: 'GET'
    });
    
    return {
      service: 'mailgun',
      status: response.ok ? 'healthy' : 'degraded',
      responseTime: Date.now() - start,
      lastChecked: new Date().toISOString(),
      details: { statusCode: response.status }
    };
  } catch (error) {
    return {
      service: 'mailgun',
      status: 'unhealthy',
      responseTime: Date.now() - start,
      lastChecked: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

const checkOpenAI = async (): Promise<HealthStatus> => {
  const start = Date.now();
  try {
    // Check OpenAI API health
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY || 'sk-...'}`,
        'Content-Type': 'application/json'
      }
    });
    
    return {
      service: 'openai',
      status: response.ok ? 'healthy' : 'degraded',
      responseTime: Date.now() - start,
      lastChecked: new Date().toISOString(),
      details: { statusCode: response.status }
    };
  } catch (error) {
    return {
      service: 'openai',
      status: 'unhealthy',
      responseTime: Date.now() - start,
      lastChecked: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const service = url.searchParams.get('service');
    
    // If specific service requested, check only that service
    if (service) {
      let healthCheck: Promise<HealthStatus>;
      
      switch (service) {
        case 'database':
          healthCheck = checkDatabase();
          break;
        case 'stripe':
          healthCheck = checkStripe();
          break;
        case 'telnyx':
          healthCheck = checkTelnyx();
          break;
        case 'sinch':
          healthCheck = checkSinch();
          break;
        case 'mailgun':
          healthCheck = checkMailgun();
          break;
        case 'openai':
          healthCheck = checkOpenAI();
          break;
        default:
          return new Response(JSON.stringify({
            error: 'Unknown service',
            availableServices: ['database', 'stripe', 'telnyx', 'sinch', 'mailgun', 'openai']
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
      }
      
      const result = await healthCheck;
      return new Response(JSON.stringify(result), {
        status: result.status === 'healthy' ? 200 : 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check all services
    const healthChecks = await Promise.allSettled([
      checkDatabase(),
      checkStripe(),
      checkTelnyx(),
      checkSinch(),
      checkMailgun(),
      checkOpenAI()
    ]);
    
    const services: HealthStatus[] = healthChecks.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        const serviceNames = ['database', 'stripe', 'telnyx', 'sinch', 'mailgun', 'openai'];
        return {
          service: serviceNames[index],
          status: 'unhealthy',
          lastChecked: new Date().toISOString(),
          error: result.reason instanceof Error ? result.reason.message : 'Unknown error'
        };
      }
    });
    
    // Determine overall health
    const unhealthyCount = services.filter(s => s.status === 'unhealthy').length;
    const degradedCount = services.filter(s => s.status === 'degraded').length;
    
    let overall: 'healthy' | 'unhealthy' | 'degraded';
    if (unhealthyCount > 0) {
      overall = 'unhealthy';
    } else if (degradedCount > 0) {
      overall = 'degraded';
    } else {
      overall = 'healthy';
    }
    
    const result: HealthCheckResult = {
      overall,
      timestamp: new Date().toISOString(),
      services,
      uptime: Date.now() - startTime,
      version: process.env.npm_package_version || '1.0.0'
    };
    
    return new Response(JSON.stringify(result), {
      status: overall === 'healthy' ? 200 : 503,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Health check failed:', error);
    return new Response(JSON.stringify({
      overall: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      services: []
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
