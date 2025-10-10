// Astro middleware to handle request body parsing
// This is a workaround for Astro's request body parsing issues

import type { MiddlewareHandler } from 'astro';

export const onRequest: MiddlewareHandler = async (context, next) => {
  const { request } = context;
  
  // Only process POST requests to API routes
  if (request.method === 'POST' && request.url.includes('/api/')) {
    console.log('Middleware: Processing POST request to API route');
    console.log('Middleware: Request URL:', request.url);
    console.log('Middleware: Content-Type:', request.headers.get('content-type'));
    
    try {
      // Try to parse the request body
      const contentType = request.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        // Clone the request to avoid consuming the body
        const clonedRequest = request.clone();
        
        try {
          const body = await clonedRequest.json();
          console.log('Middleware: Successfully parsed JSON body:', body);
          
          // Store the parsed body in the context for API routes to use
          context.locals.parsedBody = body;
          context.locals.bodyParsed = true;
        } catch (jsonError) {
          console.log('Middleware: JSON parsing failed:', jsonError);
          
          // Try text parsing as fallback
          try {
            const textBody = await clonedRequest.text();
            console.log('Middleware: Raw text body:', textBody);
            
            if (textBody && textBody.trim()) {
              const parsedBody = JSON.parse(textBody);
              console.log('Middleware: Successfully parsed text body:', parsedBody);
              context.locals.parsedBody = parsedBody;
              context.locals.bodyParsed = true;
            } else {
              console.log('Middleware: Empty text body');
              context.locals.parsedBody = {};
              context.locals.bodyParsed = false;
            }
          } catch (textError) {
            console.log('Middleware: Text parsing also failed:', textError);
            context.locals.parsedBody = {};
            context.locals.bodyParsed = false;
          }
        }
      } else {
        console.log('Middleware: Non-JSON content type, skipping body parsing');
        context.locals.parsedBody = {};
        context.locals.bodyParsed = false;
      }
    } catch (error) {
      console.error('Middleware: Error processing request body:', error);
      context.locals.parsedBody = {};
      context.locals.bodyParsed = false;
    }
  }
  
  // Continue to the next handler
  return next();
};
