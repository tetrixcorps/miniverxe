// Middleware Integration for Astro API Routes
// Provides request parsing and other middleware functionality

import type { APIContext } from 'astro';
import { requestParserMiddleware } from './requestParser';

/**
 * Main middleware function that applies all middleware
 */
export async function applyMiddleware(context: APIContext): Promise<APIContext> {
  try {
    // Apply request body parsing middleware
    const enhancedContext = await requestParserMiddleware(context);
    
    return enhancedContext;
  } catch (error) {
    console.error('Middleware application failed:', error);
    return context; // Return original context if middleware fails
  }
}

// Export individual middleware functions
export * from './requestParser';
