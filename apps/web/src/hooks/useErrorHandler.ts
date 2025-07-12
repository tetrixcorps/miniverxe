import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

interface UseErrorHandlerOptions {
  showToast?: boolean;
  showDetails?: boolean;
  defaultMessage?: string;
}

interface ErrorState {
  error: Error | string | null;
  hasError: boolean;
}

export const useErrorHandler = (options: UseErrorHandlerOptions = {}) => {
  const {
    showToast = true,
    showDetails = false,
    defaultMessage = 'An unexpected error occurred'
  } = options;

  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    hasError: false
  });

  const handleError = useCallback((error: Error | string | unknown, context?: string) => {
    let errorMessage: string;
    let errorObject: Error | string;

    if (error instanceof Error) {
      errorMessage = error.message;
      errorObject = error;
    } else if (typeof error === 'string') {
      errorMessage = error;
      errorObject = error;
    } else {
      errorMessage = defaultMessage;
      errorObject = new Error(defaultMessage);
    }

    // Add context if provided
    if (context) {
      errorMessage = `${context}: ${errorMessage}`;
    }

    setErrorState({
      error: errorObject,
      hasError: true
    });

    if (showToast) {
      toast.error(errorMessage);
    }

    // Log error for debugging (in development)
    if (process.env.NODE_ENV === 'development') {
      console.error('Error handled:', { error, context, errorMessage });
    }
  }, [showToast, defaultMessage]);

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      hasError: false
    });
  }, []);

  const retry = useCallback((retryFn: () => void | Promise<void>) => {
    clearError();
    try {
      const result = retryFn();
      if (result instanceof Promise) {
        return result.catch(handleError);
      }
    } catch (error) {
      handleError(error);
    }
  }, [clearError, handleError]);

  return {
    error: errorState.error,
    hasError: errorState.hasError,
    handleError,
    clearError,
    retry
  };
}; 