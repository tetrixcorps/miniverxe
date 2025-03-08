declare module '../ui' {
  import React from 'react';

  export interface CardProps {
    className?: string;
    children: React.ReactNode;
    [key: string]: any;
  }

  export interface ButtonProps {
    children: React.ReactNode;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    variant?: 'primary' | 'secondary' | 'outline' | 'text';
    isLoading?: boolean;
    loadingText?: string;
    className?: string;
    [key: string]: any;
  }

  export interface AlertProps {
    children: React.ReactNode;
    type?: 'info' | 'success' | 'warning' | 'error';
    className?: string;
    onClose?: () => void;
    [key: string]: any;
  }

  export const Card: React.FC<CardProps>;
  export const Button: React.FC<ButtonProps>;
  export const Alert: React.FC<AlertProps>;
} 