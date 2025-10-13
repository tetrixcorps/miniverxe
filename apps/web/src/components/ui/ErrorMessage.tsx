import React from 'react';

interface ErrorMessageProps {
  error: string | Error | null | undefined;
  fallback?: string;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, fallback = 'An error occurred.', className }) => {
  if (!error) return null;
  const message = typeof error === 'string' ? error : error?.message || fallback;
  return (
    <div className={`text-red-500 ${className || ''}`} role="alert" aria-live="assertive">
      {message}
    </div>
  );
};

export default ErrorMessage; 