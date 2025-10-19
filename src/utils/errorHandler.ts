// Standardized Error Handling Utility
// Provides consistent error response format across all components

export interface StandardErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
  timestamp?: string;
}

export interface StandardSuccessResponse<T = any> {
  success: true;
  data?: T;
  message?: string;
  timestamp?: string;
}

export class ErrorHandler {
  /**
   * Create a standardized error response
   */
  static createErrorResponse(
    message: string, 
    code?: string, 
    details?: any
  ): StandardErrorResponse {
    return {
      success: false,
      error: message,
      code,
      details,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Create a standardized success response
   */
  static createSuccessResponse<T>(
    data?: T, 
    message?: string
  ): StandardSuccessResponse<T> {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Handle API errors consistently
   */
  static handleApiError(error: any): StandardErrorResponse {
    if (error instanceof Error) {
      return this.createErrorResponse(
        error.message,
        'API_ERROR',
        { stack: error.stack }
      );
    }

    if (typeof error === 'string') {
      return this.createErrorResponse(error, 'UNKNOWN_ERROR');
    }

    if (error && typeof error === 'object') {
      return this.createErrorResponse(
        error.message || error.error || 'An unknown error occurred',
        error.code || 'OBJECT_ERROR',
        error
      );
    }

    return this.createErrorResponse(
      'An unexpected error occurred',
      'UNEXPECTED_ERROR'
    );
  }

  /**
   * Handle validation errors
   */
  static handleValidationError(field: string, message: string): StandardErrorResponse {
    return this.createErrorResponse(
      `Validation error for ${field}: ${message}`,
      'VALIDATION_ERROR',
      { field, message }
    );
  }

  /**
   * Handle network errors
   */
  static handleNetworkError(): StandardErrorResponse {
    return this.createErrorResponse(
      'Network error. Please check your connection and try again.',
      'NETWORK_ERROR'
    );
  }

  /**
   * Handle authentication errors
   */
  static handleAuthError(message: string = 'Authentication failed'): StandardErrorResponse {
    return this.createErrorResponse(
      message,
      'AUTH_ERROR'
    );
  }

  /**
   * Handle phone number validation errors
   */
  static handlePhoneValidationError(phoneNumber: string): StandardErrorResponse {
    return this.createErrorResponse(
      `Invalid phone number format: ${phoneNumber}. Please use E.164 format (e.g., +1234567890)`,
      'PHONE_VALIDATION_ERROR',
      { phoneNumber }
    );
  }

  /**
   * Handle 2FA verification errors
   */
  static handle2FAError(message: string, code?: string): StandardErrorResponse {
    return this.createErrorResponse(
      message,
      code || '2FA_ERROR'
    );
  }
}

/**
 * Client-side error handling for UI components
 */
export class ClientErrorHandler {
  /**
   * Display error message in UI
   */
  static showError(message: string, elementId?: string) {
    const errorElement = elementId 
      ? document.getElementById(elementId)
      : document.getElementById('2fa-error') || document.getElementById('error-message');
    
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.remove('hidden');
    } else {
      // Fallback to alert
      alert(`Error: ${message}`);
    }
  }

  /**
   * Hide error message in UI
   */
  static hideError(elementId?: string) {
    const errorElement = elementId 
      ? document.getElementById(elementId)
      : document.getElementById('2fa-error');
    
    if (errorElement) {
      errorElement.classList.add('hidden');
    }
  }

  /**
   * Handle API response errors
   */
  static handleApiResponse(response: any, elementId?: string) {
    if (response.success === false) {
      this.showError(response.error || 'An error occurred', elementId);
      return false;
    }
    return true;
  }

  /**
   * Handle fetch errors
   */
  static handleFetchError(error: any, elementId?: string) {
    console.error('Fetch error:', error);
    this.showError('Network error. Please check your connection and try again.', elementId);
  }
}

/**
 * Phone number validation utility
 */
export class PhoneValidator {
  /**
   * Validate phone number format
   */
  static validate(phoneNumber: string): { isValid: boolean; error?: string; formatted?: string } {
    if (!phoneNumber) {
      return { isValid: false, error: 'Phone number is required' };
    }

    // Remove all non-digit characters except +
    let cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
    
    // Remove double plus signs
    if (cleanPhone.startsWith('++')) {
      cleanPhone = cleanPhone.substring(1);
    }
    
    // Ensure it starts with +
    if (!cleanPhone.startsWith('+')) {
      cleanPhone = '+' + cleanPhone;
    }
    
    // Extract digits after the +
    const digits = cleanPhone.slice(1).replace(/\D/g, '');
    
    // Validate length (international numbers can be 7-15 digits)
    if (digits.length < 7 || digits.length > 15) {
      return { 
        isValid: false, 
        error: 'Phone number must be 7-15 digits. Examples: +1 (555) 123-4567, +44 20 7946 0958' 
      };
    }

    return { isValid: true, formatted: cleanPhone };
  }

  /**
   * Format phone number for display
   */
  static formatForDisplay(phoneNumber: string): string {
    const validation = this.validate(phoneNumber);
    if (!validation.isValid) {
      return phoneNumber;
    }

    const digits = validation.formatted!.slice(1);
    
    // Handle US numbers
    if (digits.length === 11 && digits.startsWith('1')) {
      return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    } else if (digits.length === 10) {
      return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    
    // Handle other international numbers
    if (digits.length <= 3) {
      return `+${digits}`;
    } else if (digits.length <= 6) {
      return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4)}`;
    } else if (digits.length <= 10) {
      return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    } else if (digits.length <= 12) {
      return `+${digits.slice(0, 2)} (${digits.slice(2, 5)}) ${digits.slice(5, 8)}-${digits.slice(8)}`;
    } else {
      return `+${digits.slice(0, 2)} (${digits.slice(2, 5)}) ${digits.slice(5, 8)}-${digits.slice(8, 12)}`;
    }
  }
}

