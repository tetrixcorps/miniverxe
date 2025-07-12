import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Lottie from 'lottie-react';
import tetrixAnimation from '../assets/tetrix-logo-animation.json';

interface LottieLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  autoplay?: boolean;
  loop?: boolean;
}

export function LottieLogo({ 
  className = '', 
  size = 'md', 
  showText = true, 
  autoplay = true,
  loop = true 
}: LottieLogoProps) {
  const [isHovered, setIsHovered] = useState(false);
  const lottieRef = useRef<any>(null);

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

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (lottieRef.current) {
      lottieRef.current.play();
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (lottieRef.current) {
      lottieRef.current.pause();
    }
  };

  return (
    <Link 
      to="/" 
      className={`flex items-center gap-2 group ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Lottie Animated Logo */}
      <div className={`${sizeClasses[size]} relative`}>
        <Lottie
          lottieRef={lottieRef}
          animationData={tetrixAnimation}
          autoplay={autoplay}
          loop={loop}
          className={`transition-all duration-300 ease-in-out ${
            isHovered ? 'scale-110 drop-shadow-lg' : 'scale-100'
          }`}
        />
        
        {/* Glow effect overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-gradient-to-r from-brand-red/20 via-brand-orange/20 to-brand-yellow/20 rounded-full blur-sm animate-pulse" />
        )}
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

// Alternative component with more advanced Lottie controls
export function AdvancedLottieLogo({ 
  className = '', 
  size = 'md', 
  showText = true 
}: LottieLogoProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const lottieRef = useRef<any>(null);

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

  const handleMouseEnter = () => {
    setIsHovered(true);
    setIsPlaying(true);
    if (lottieRef.current) {
      lottieRef.current.setSpeed(1.5); // Speed up animation on hover
      lottieRef.current.play();
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPlaying(false);
    if (lottieRef.current) {
      lottieRef.current.setSpeed(1); // Normal speed
      lottieRef.current.pause();
    }
  };

  const handleClick = () => {
    if (lottieRef.current) {
      lottieRef.current.goToAndPlay(0); // Restart animation
    }
  };

  return (
    <Link 
      to="/" 
      className={`flex items-center gap-2 group cursor-pointer ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* Lottie Animated Logo with advanced controls */}
      <div className={`${sizeClasses[size]} relative`}>
        <Lottie
          lottieRef={lottieRef}
          animationData={tetrixAnimation}
          autoplay={false}
          loop={false}
          className={`transition-all duration-500 ease-in-out ${
            isHovered ? 'scale-110 drop-shadow-xl' : 'scale-100'
          }`}
        />
        
        {/* Interactive glow effect */}
        <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
          isHovered 
            ? 'bg-gradient-to-r from-brand-red/30 via-brand-orange/30 to-brand-yellow/30 blur-md animate-pulse' 
            : 'bg-transparent'
        }`} />
        
        {/* Play indicator */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-brand-red rounded-full animate-ping" />
          </div>
        )}
      </div>

      {/* Text Logo with enhanced effects */}
      {showText && (
        <span className={`font-bold ${textSizes[size]} bg-gradient-to-r from-brand-red via-brand-orange to-brand-yellow bg-clip-text text-transparent transition-all duration-500 ${
          isHovered ? 'scale-105 drop-shadow-lg' : 'scale-100'
        }`}>
          TETRIX
        </span>
      )}
    </Link>
  );
} 