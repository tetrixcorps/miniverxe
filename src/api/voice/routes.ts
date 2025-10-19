// Voice API Routes
// Centralized routing for all voice-related endpoints

import type { APIRoute } from 'astro';

// Note: This file has been simplified for Astro compatibility
// Individual route handlers should be implemented as separate API files
// in the pages/api directory structure

// Health check endpoint
export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({
    success: true,
    message: 'Voice API is running',
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};