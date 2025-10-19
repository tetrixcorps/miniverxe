// Component-Specific Error Boundary
// Provides more specific error handling for different component types

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ComponentErrorBoundaryProps {
  children: ReactNode;
  componentName: string;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo, componentName: string) => void;
  className?: string;
}

interface ComponentErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

class ComponentErrorBoundary extends Component<ComponentErrorBoundaryProps, ComponentErrorBoundaryState> {
  private maxRetries = 3;

  constructor(props: ComponentErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ComponentErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Error in ${this.props.componentName}:`, error, errorInfo);
    
    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo, this.props.componentName);
    }

    // Log component-specific error
    this.logComponentError(error, errorInfo);
  }

  private logComponentError = (error: Error, errorInfo: ErrorInfo) => {
    const errorReport = {
      component: this.props.componentName,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      retryCount: this.state.retryCount,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/errors/component', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorReport)
      }).catch(console.error);
    }
  };

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        retryCount: prevState.retryCount + 1
      }));
    } else {
      // Max retries reached, reload the page
      window.location.reload();
    }
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      retryCount: 0
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default component-specific fallback UI
      return (
        <div className={`component-error-boundary ${this.props.className || ''}`}>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-800">
                  {this.props.componentName} Error
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    The {this.props.componentName} component encountered an error and couldn't render properly.
                  </p>
                  {this.state.retryCount > 0 && (
                    <p className="mt-1">
                      Retry attempt: {this.state.retryCount} of {this.maxRetries}
                    </p>
                  )}
                </div>
                <div className="mt-4">
                  <div className="flex space-x-3">
                    {this.state.retryCount < this.maxRetries && (
                      <button
                        onClick={this.handleRetry}
                        className="bg-red-100 text-red-800 text-xs font-medium px-3 py-1 rounded hover:bg-red-200 transition-colors"
                      >
                        Retry
                      </button>
                    )}
                    <button
                      onClick={this.handleReset}
                      className="bg-gray-100 text-gray-800 text-xs font-medium px-3 py-1 rounded hover:bg-gray-200 transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ComponentErrorBoundary;
