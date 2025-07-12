import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface AnimatedLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function AnimatedLogo({ className = '', size = 'md', showText = true }: AnimatedLogoProps) {
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <Link 
      to="/" 
      className={`flex items-center gap-2 group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated SVG Logo */}
      <div className={`${sizeClasses[size]} relative`}>
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="TETRIX Logo"
          role="img"
          className={`transition-all duration-300 ease-in-out ${
            isHovered ? 'scale-110 drop-shadow-lg' : 'scale-100'
          }`}
        >
          <title>TETRIX Logo</title>
          <defs>
            <linearGradient id="tetrix-gradient" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FF3B30" />
              <stop offset="0.5" stopColor="#FF9500" />
              <stop offset="1" stopColor="#FFB300" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Dynamic T blocks with animations */}
          <rect 
            x="8" 
            y="8" 
            width="16" 
            height="16" 
            rx="4" 
            fill="url(#tetrix-gradient)"
            className={`transition-all duration-500 ${
              isHovered ? 'animate-bounce' : ''
            }`}
          >
            <animate 
              attributeName="y" 
              values="8;12;8" 
              dur="2s" 
              repeatCount="indefinite" 
            />
          </rect>
          
          <rect 
            x="24" 
            y="8" 
            width="32" 
            height="16" 
            rx="4" 
            fill="url(#tetrix-gradient)"
            className={`transition-all duration-500 delay-100 ${
              isHovered ? 'animate-pulse' : ''
            }`}
          >
            <animate 
              attributeName="x" 
              values="24;28;24" 
              dur="2s" 
              repeatCount="indefinite" 
            />
          </rect>
          
          <rect 
            x="24" 
            y="24" 
            width="16" 
            height="32" 
            rx="4" 
            fill="url(#tetrix-gradient)"
            className={`transition-all duration-500 delay-200 ${
              isHovered ? 'animate-ping' : ''
            }`}
          >
            <animate 
              attributeName="height" 
              values="32;28;32" 
              dur="2s" 
              repeatCount="indefinite" 
            />
          </rect>
          
          <rect 
            x="40" 
            y="40" 
            width="16" 
            height="16" 
            rx="4" 
            fill="url(#tetrix-gradient)"
            className={`transition-all duration-500 delay-300 ${
              isHovered ? 'animate-bounce' : ''
            }`}
          >
            <animate 
              attributeName="y" 
              values="40;44;40" 
              dur="2s" 
              repeatCount="indefinite" 
            />
          </rect>

          {/* Glow effect on hover */}
          {isHovered && (
            <rect 
              x="8" 
              y="8" 
              width="48" 
              height="48" 
              rx="4" 
              fill="url(#tetrix-gradient)" 
              opacity="0.3"
              filter="url(#glow)"
              className="animate-pulse"
            />
          )}
        </svg>
      </div>

      {/* Text Logo */}
      {showText && (
        <span className={`font-bold ${textSizes[size]} bg-gradient-to-r from-brand-red via-brand-orange to-brand-yellow bg-clip-text text-transparent transition-all duration-300 ${
          isHovered ? 'scale-105' : 'scale-100'
        }`}>
          TETRIX
        </span>
      )}
    </Link>
  );
} 