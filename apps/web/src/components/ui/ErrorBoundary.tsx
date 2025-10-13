import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Optionally log error to an error reporting service
    // console.error(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-[40vh] p-8" role="alert" aria-live="assertive">
          <div className="bg-white rounded shadow p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-brand-orange mb-4">Something went wrong</h2>
            <p className="mb-4 text-gray-700">An unexpected error occurred. Please try again or contact support if the problem persists.</p>
            {this.state.error && (
              <details className="mb-4 text-xs text-gray-500 whitespace-pre-wrap">
                {this.state.error.message}
              </details>
            )}
            <button
              onClick={this.handleRetry}
              className="px-6 py-2 rounded bg-brand-orange text-white font-semibold hover:bg-brand-red focus:outline-none focus:ring-2 focus:ring-brand-orange"
              autoFocus
            >
              Retry
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary; 