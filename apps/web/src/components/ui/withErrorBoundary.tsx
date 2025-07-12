import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import ErrorDisplay from './ErrorDisplay';

interface WithErrorBoundaryOptions {
  fallback?: React.ComponentType<{ error: Error }>;
  showDetails?: boolean;
  title?: string;
}

export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  options: WithErrorBoundaryOptions = {}
) => {
  const { fallback, showDetails = false, title = 'Something went wrong' } = options;

  const WrappedComponent: React.FC<P> = (props) => {
    const defaultFallback = ({ error }: { error: Error }) => (
      <ErrorDisplay
        error={error}
        title={title}
        showDetails={showDetails}
        onRetry={() => window.location.reload()}
      />
    );

    const FallbackComponent = fallback || defaultFallback;

    return (
      <ErrorBoundary fallback={<FallbackComponent error={new Error('Unknown error')} />}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}; 