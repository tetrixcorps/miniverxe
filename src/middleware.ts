import type { MiddlewareHandler } from 'astro';

// Cache configuration for different asset types
const CACHE_CONFIG = {
  // Static assets (JS, CSS, images) - long cache
  static: {
    maxAge: 31536000, // 1 year
    sMaxAge: 31536000, // 1 year
    immutable: true
  },
  // API responses - no cache
  api: {
    maxAge: 0,
    noCache: true,
    noStore: true,
    mustRevalidate: true
  },
  // HTML pages - short cache
  html: {
    maxAge: 300, // 5 minutes
    sMaxAge: 3600, // 1 hour
    mustRevalidate: true
  },
  // Health checks - no cache
  health: {
    maxAge: 0,
    noCache: true,
    noStore: true,
    mustRevalidate: true
  }
};

// Generate cache control header
function generateCacheControl(config: typeof CACHE_CONFIG.static): string {
  const directives: string[] = [];
  
  if (config.maxAge !== undefined) {
    directives.push(`max-age=${config.maxAge}`);
  }
  
  if (config.sMaxAge !== undefined) {
    directives.push(`s-maxage=${config.sMaxAge}`);
  }
  
  if (config.immutable) {
    directives.push('immutable');
  }
  
  if (config.noCache) {
    directives.push('no-cache');
  }
  
  if (config.noStore) {
    directives.push('no-store');
  }
  
  if (config.mustRevalidate) {
    directives.push('must-revalidate');
  }
  
  return directives.join(', ');
}

// Determine cache strategy based on path
function getCacheStrategy(pathname: string): typeof CACHE_CONFIG.static {
  // API routes - no cache
  if (pathname.startsWith('/api/')) {
    return CACHE_CONFIG.api;
  }
  
  // Health check - no cache
  if (pathname === '/api/health') {
    return CACHE_CONFIG.health;
  }
  
  // Static assets - long cache
  if (pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
    return CACHE_CONFIG.static;
  }
  
  // Astro assets - long cache
  if (pathname.startsWith('/_astro/')) {
    return CACHE_CONFIG.static;
  }
  
  // HTML pages - short cache
  return CACHE_CONFIG.html;
}

export const onRequest: MiddlewareHandler = async (context, next) => {
  const { request, url } = context;
  const pathname = url.pathname;
  
  // Get cache strategy for this path
  const cacheStrategy = getCacheStrategy(pathname);
  
  // Process the request
  const response = await next();
  
  // Add cache headers
  const cacheControl = generateCacheControl(cacheStrategy);
  response.headers.set('Cache-Control', cacheControl);
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Add CORS headers for API routes
  if (pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  
  // Add performance headers
  if (pathname.startsWith('/_astro/') || pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
    response.headers.set('X-Cache-Status', 'HIT');
  }
  
  return response;
};
