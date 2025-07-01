import React from 'react';
import { Spinner } from './spinner';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading...', className }) => (
  <div className={`flex justify-center items-center h-32 ${className || ''}`} aria-busy="true" role="status">
    <Spinner />
    <span className="sr-only">{message}</span>
  </div>
);

export default LoadingState; 