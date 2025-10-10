// Request Body Parser Utility for Astro API Routes
// Handles JSON, form data, and other content types properly

export interface ParsedRequest {
  body: any;
  contentType: string | null;
  isValid: boolean;
  error?: string;
}

export async function parseRequestBody(request: Request): Promise<ParsedRequest> {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    // Handle different content types
    if (contentType.includes('application/json')) {
      try {
        const body = await request.json();
        return {
          body,
          contentType,
          isValid: true
        };
      } catch (jsonError) {
        return {
          body: null,
          contentType,
          isValid: false,
          error: `Invalid JSON: ${jsonError instanceof Error ? jsonError.message : 'Unknown error'}`
        };
      }
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      try {
        const formData = await request.formData();
        const body: any = {};
        for (const [key, value] of formData.entries()) {
          body[key] = value;
        }
        return {
          body,
          contentType,
          isValid: true
        };
      } catch (formError) {
        return {
          body: null,
          contentType,
          isValid: false,
          error: `Invalid form data: ${formError instanceof Error ? formError.message : 'Unknown error'}`
        };
      }
    } else if (contentType.includes('multipart/form-data')) {
      try {
        const formData = await request.formData();
        const body: any = {};
        for (const [key, value] of formData.entries()) {
          body[key] = value;
        }
        return {
          body,
          contentType,
          isValid: true
        };
      } catch (formError) {
        return {
          body: null,
          contentType,
          isValid: false,
          error: `Invalid multipart data: ${formError instanceof Error ? formError.message : 'Unknown error'}`
        };
      }
    } else {
      // Try to parse as text
      try {
        const text = await request.text();
        if (text) {
          try {
            const body = JSON.parse(text);
            return {
              body,
              contentType: 'application/json',
              isValid: true
            };
          } catch {
            return {
              body: { raw: text },
              contentType: 'text/plain',
              isValid: true
            };
          }
        } else {
          return {
            body: {},
            contentType,
            isValid: true
          };
        }
      } catch (textError) {
        return {
          body: null,
          contentType,
          isValid: false,
          error: `Invalid request body: ${textError instanceof Error ? textError.message : 'Unknown error'}`
        };
      }
    }
  } catch (error) {
    return {
      body: null,
      contentType: null,
      isValid: false,
      error: `Request parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Validation utilities
export function validatePhoneNumber(phone: string): { isValid: boolean; error?: string } {
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, error: 'Phone number is required' };
  }
  if (!phoneRegex.test(phone)) {
    return { isValid: false, error: 'Invalid phone number format. Use E.164 format (e.g., +1234567890)' };
  }
  return { isValid: true };
}

export function validateRequiredFields(data: any, requiredFields: string[]): { isValid: boolean; error?: string } {
  for (const field of requiredFields) {
    if (!data || data[field] === undefined || data[field] === null || data[field] === '') {
      return { isValid: false, error: `Missing required field: ${field}` };
    }
  }
  return { isValid: true };
}

export function validateUrl(url: string): { isValid: boolean; error?: string } {
  if (!url || typeof url !== 'string') {
    return { isValid: false, error: 'URL is required' };
  }
  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }
}

// Response utilities
export function createErrorResponse(message: string, status: number = 400, details?: any) {
  return new Response(JSON.stringify({
    error: message,
    ...(details && { details })
  }), {
    status,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export function createSuccessResponse(data: any, status: number = 200) {
  return new Response(JSON.stringify({
    success: true,
    ...data
  }), {
    status,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
