// Custom hook for error handling
// Provides a consistent way to handle errors in functional components

import { useCallback, useState } from 'react';

interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorId: string;
}

interface UseErrorHandlerReturn {
  errorState: ErrorState;
  handleError: (error: Error, context?: string) => void;
  clearError: () => void;
  resetErrorBoundary: () => void;
}

export const useErrorHandler = (componentName?: string): UseErrorHandlerReturn => {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    errorId: ''
  });

  const handleError = useCallback((error: Error, context?: string) => {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.error(`Error in ${componentName || 'component'}:`, error);
    
    setErrorState({
      hasError: true,
      error,
      errorId
    });

    // Log error to external service
    const errorReport = {
      component: componentName || 'unknown',
      context: context || 'unknown',
      message: error.message,
      stack: error.stack,
      errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    if (process.env.NODE_ENV === 'production') {
      fetch('/api/errors/hook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorReport)
      }).catch(console.error);
    }
  }, [componentName]);

  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      errorId: ''
    });
  }, []);

  const resetErrorBoundary = useCallback(() => {
    clearError();
  }, [clearError]);

  return {
    errorState,
    handleError,
    clearError,
    resetErrorBoundary
  };
};

// Hook for async error handling
export const useAsyncErrorHandler = (componentName?: string) => {
  const { errorState, handleError, clearError } = useErrorHandler(componentName);

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error instanceof Error ? error : new Error(String(error)), context);
      return null;
    }
  }, [handleError]);

  return {
    errorState,
    handleAsyncError,
    clearError
  };
};

// Hook for API error handling
export const useAPIErrorHandler = (componentName?: string) => {
  const { errorState, handleError, clearError } = useErrorHandler(componentName);

  const handleAPIError = useCallback(async <T>(
    apiCall: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    try {
      const response = await apiCall();
      return response;
    } catch (error) {
      let errorMessage = 'An unexpected error occurred';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // Handle API response errors
        const apiError = error as any;
        if (apiError.response?.data?.message) {
          errorMessage = apiError.response.data.message;
        } else if (apiError.message) {
          errorMessage = apiError.message;
        }
      }
      
      const enhancedError = new Error(errorMessage);
      if (error instanceof Error && error.stack) {
        enhancedError.stack = error.stack;
      }
      
      handleError(enhancedError, context);
      return null;
    }
  }, [handleError]);

  return {
    errorState,
    handleAPIError,
    clearError
  };
};
