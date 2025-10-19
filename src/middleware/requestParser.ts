// Request Body Parsing Middleware for Astro API Routes
// Fixes the critical Astro request body parsing issue

import type { APIContext } from 'astro';

export interface ParsedBody {
  [key: string]: any;
}

export interface RequestParserResult {
  body: ParsedBody;
  isValid: boolean;
  error?: string;
}

/**
 * Enhanced request body parser for Astro API routes
 * Handles multiple content types and parsing methods
 */
export async function parseRequestBody(request: Request): Promise<RequestParserResult> {
  try {
    const contentType = request.headers.get('content-type') || '';
    const contentLength = request.headers.get('content-length');
    
    // Check if request has body
    if (!contentLength || contentLength === '0') {
      return { body: {}, isValid: true };
    }

    // Method 1: Try request.json() for JSON content
    if (contentType.includes('application/json')) {
      try {
        const body = await request.json();
        console.log('✅ Successfully parsed JSON body:', body);
        return { body, isValid: true };
      } catch (jsonError) {
        console.warn('⚠️ JSON parsing failed, trying alternative methods:', jsonError);
      }
    }

    // Method 2: Try request.text() and parse manually
    try {
      const rawBody = await request.text();
      console.log('📝 Raw request body:', rawBody);
      
      if (!rawBody || rawBody.trim() === '') {
        return { body: {}, isValid: true };
      }

      // Try to parse as JSON
      try {
        const body = JSON.parse(rawBody);
        console.log('✅ Successfully parsed text body as JSON:', body);
        return { body, isValid: true };
      } catch (parseError) {
        // If not JSON, return as raw text
        console.log('📄 Returning raw text body');
        return { body: { raw: rawBody }, isValid: true };
      }
    } catch (textError) {
      console.error('❌ Text parsing failed:', textError);
    }

    // Method 3: Try request.formData() for form data
    if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
      try {
        const formData = await request.formData();
        const body: ParsedBody = {};
        
        for (const [key, value] of formData.entries()) {
          body[key] = value;
        }
        
        console.log('✅ Successfully parsed form data:', body);
        return { body, isValid: true };
      } catch (formError) {
        console.error('❌ Form data parsing failed:', formError);
      }
    }

    // Method 4: Try request.arrayBuffer() as last resort
    try {
      const buffer = await request.arrayBuffer();
      if (buffer.byteLength > 0) {
        const text = new TextDecoder().decode(buffer);
        try {
          const body = JSON.parse(text);
          console.log('✅ Successfully parsed array buffer as JSON:', body);
          return { body, isValid: true };
        } catch {
          console.log('📄 Returning array buffer as text');
          return { body: { raw: text }, isValid: true };
        }
      }
    } catch (bufferError) {
      console.error('❌ Array buffer parsing failed:', bufferError);
    }

    // All methods failed
    return {
      body: {},
      isValid: false,
      error: 'All request parsing methods failed'
    };

  } catch (error) {
    console.error('❌ Request parsing error:', error);
    return {
      body: {},
      isValid: false,
      error: `Request parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Middleware function to add parsed body to context
 */
export async function requestParserMiddleware(context: APIContext) {
  const { request } = context;
  
  // Only parse body for POST, PUT, PATCH requests
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    const parseResult = await parseRequestBody(request);
    
    // Add parsed body to context locals
    (context.locals as any).bodyParsed = true;
    (context.locals as any).parsedBody = parseResult.body;
    (context.locals as any).parseError = parseResult.error;
    
    console.log('🔧 Middleware parsed body:', {
      method: request.method,
      contentType: request.headers.get('content-type'),
      bodyKeys: Object.keys(parseResult.body),
      isValid: parseResult.isValid
    });
  }
  
  return context;
}

/**
 * Utility function to get parsed body from context
 */
export function getParsedBody(context: APIContext): ParsedBody {
  return (context.locals as any).parsedBody || {};
}

/**
 * Utility function to check if body was parsed successfully
 */
export function isBodyParsed(context: APIContext): boolean {
  return (context.locals as any).bodyParsed === true;
}

/**
 * Utility function to get parsing error
 */
export function getParseError(context: APIContext): string | undefined {
  return (context.locals as any).parseError;
}
