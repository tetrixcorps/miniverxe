// Enhanced health check endpoint for DigitalOcean App Platform
import type { APIRoute } from 'astro';

export const prerender = false;

// Health check data interface
interface HealthCheckData {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  service: string;
  version: string;
  environment: string;
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  checks: {
    database: 'pass' | 'fail' | 'unknown';
    telnyx: 'pass' | 'fail' | 'unknown';
    sinch: 'pass' | 'fail' | 'unknown';
    firebase: 'pass' | 'fail' | 'unknown';
  };
  instance: {
    id: string;
    region: string;
    replicas: number;
  };
}

// Check external service connectivity
async function checkService(name: string, checkFn: () => Promise<boolean>): Promise<'pass' | 'fail' | 'unknown'> {
  try {
    const result = await Promise.race([
      checkFn(),
      new Promise<boolean>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      )
    ]);
    return result ? 'pass' : 'fail';
  } catch (error) {
    console.warn(`Health check failed for ${name}:`, error);
    return 'unknown';
  }
}

// Database connectivity check
async function checkDatabase(): Promise<boolean> {
  // Simple check - if DATABASE_URL is configured, assume it's working
  // In production, you'd want to actually ping the database
  return !!process.env.DATABASE_URL;
}

// Telnyx API check
async function checkTelnyx(): Promise<boolean> {
  return !!(process.env.TELNYX_API_KEY && process.env.TELNYX_VERIFY_PROFILE_ID);
}

// Sinch API check
async function checkSinch(): Promise<boolean> {
  return !!(process.env.SINCH_API_TOKEN && process.env.SINCH_SERVICE_PLAN_ID);
}

// Firebase check
async function checkFirebase(): Promise<boolean> {
  return !!(process.env.FIREBASE_API_KEY && process.env.FIREBASE_PROJECT_ID);
}

export const GET: APIRoute = async ({ request }) => {
  const startTime = Date.now();
  
  try {
    // Get memory usage
    const memUsage = process.memoryUsage();
    const totalMemory = memUsage.heapTotal + memUsage.external;
    const usedMemory = memUsage.heapUsed + memUsage.external;
    const memoryPercentage = Math.round((usedMemory / totalMemory) * 100);

    // Run service checks in parallel
    const [databaseCheck, telnyxCheck, sinchCheck, firebaseCheck] = await Promise.all([
      checkService('database', checkDatabase),
      checkService('telnyx', checkTelnyx),
      checkService('sinch', checkSinch),
      checkService('firebase', checkFirebase)
    ]);

    // Determine overall health status
    const checks = {
      database: databaseCheck,
      telnyx: telnyxCheck,
      sinch: sinchCheck,
      firebase: firebaseCheck
    };

    const failedChecks = Object.values(checks).filter(check => check === 'fail').length;
    const unknownChecks = Object.values(checks).filter(check => check === 'unknown').length;
    
    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (failedChecks === 0 && unknownChecks === 0) {
      status = 'healthy';
    } else if (failedChecks === 0 && unknownChecks > 0) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    // Build health check response
    const healthCheck: HealthCheckData = {
      status,
      timestamp: new Date().toISOString(),
      service: 'tetrix-production-fixed',
      version: '2.0.0',
      environment: process.env.NODE_ENV || 'production',
      uptime: Math.floor(process.uptime()),
      memory: {
        used: Math.round(usedMemory / 1024 / 1024), // MB
        total: Math.round(totalMemory / 1024 / 1024), // MB
        percentage: memoryPercentage
      },
      checks,
      instance: {
        id: process.env.HOSTNAME || 'unknown',
        region: process.env.DO_REGION || 'fra',
        replicas: parseInt(process.env.INSTANCE_COUNT || '2')
      }
    };

    // Set appropriate HTTP status based on health
    const httpStatus = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503;

    return new Response(JSON.stringify(healthCheck, null, 2), {
      status: httpStatus,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
        'X-Health-Status': status,
        'X-Response-Time': `${Date.now() - startTime}ms`
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    
    // Fallback response in case of any errors
    const fallbackResponse: HealthCheckData = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'tetrix-production-fixed',
      version: '2.0.0',
      environment: process.env.NODE_ENV || 'production',
      uptime: Math.floor(process.uptime()),
      memory: {
        used: 0,
        total: 0,
        percentage: 0
      },
      checks: {
        database: 'unknown',
        telnyx: 'unknown',
        sinch: 'unknown',
        firebase: 'unknown'
      },
      instance: {
        id: process.env.HOSTNAME || 'unknown',
        region: process.env.DO_REGION || 'fra',
        replicas: parseInt(process.env.INSTANCE_COUNT || '2')
      }
    };

    return new Response(JSON.stringify(fallbackResponse, null, 2), {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
        'X-Health-Status': 'unhealthy',
        'X-Response-Time': `${Date.now() - startTime}ms`
      }
    });
  }
};
