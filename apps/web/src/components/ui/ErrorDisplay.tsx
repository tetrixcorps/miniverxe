import React from 'react';
import { Alert, AlertDescription, AlertTitle } from './alert';
import { Button } from './button';
import { RefreshCw } from 'lucide-react';

interface ErrorDisplayProps {
  error: Error | string | null | undefined;
  title?: string;
  description?: string;
  onRetry?: () => void;
  showDetails?: boolean;
  className?: string;
  variant?: 'default' | 'destructive' | 'warning';
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  title = 'Something went wrong',
  description,
  onRetry,
  showDetails = false,
  className = '',
  variant = 'destructive',
}) => {
  if (!error) return null;

  const errorMessage = typeof error === 'string' ? error : error?.message || 'An unexpected error occurred';
  const displayDescription = description || errorMessage;

  const getAlertClassName = () => {
    const baseClasses = 'border-l-4 p-4';
    switch (variant) {
      case 'destructive':
        return `${baseClasses} border-red-400 bg-red-50 ${className}`;
      case 'warning':
        return `${baseClasses} border-yellow-400 bg-yellow-50 ${className}`;
      default:
        return `${baseClasses} border-blue-400 bg-blue-50 ${className}`;
    }
  };

  return (
    <div className={getAlertClassName()}>
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        {displayDescription}
        {showDetails && typeof error === 'object' && error?.stack && (
          <details className="mt-2 text-xs">
            <summary className="cursor-pointer text-gray-600">Technical details</summary>
            <pre className="mt-1 text-gray-500 whitespace-pre-wrap">{error.stack}</pre>
          </details>
        )}
      </AlertDescription>
      {onRetry && (
        <div className="mt-3">
          <Button
            variant="outline"
            onClick={onRetry}
            className="flex items-center gap-2 text-sm px-3 py-1"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};

export default ErrorDisplay; 