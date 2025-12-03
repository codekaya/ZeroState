"use client";

import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  variant?: 'full' | 'icon' | 'text';
  animated?: boolean;
}

export function ZeroStateLogo({ 
  className = '', 
  size = 48,
  variant = 'full',
  animated = true 
}: LogoProps) {
  const iconSize = size;
  const textSize = size * 0.6;

  const Icon = () => (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={animated ? "animate-pulse-slow" : ""}
    >
      <defs>
        {/* Gradient definitions */}
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="1" />
          <stop offset="50%" stopColor="#8b5cf6" stopOpacity="1" />
          <stop offset="100%" stopColor="#ec4899" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="1" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        
        {/* Glow filter */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Outer shield ring - represents protection */}
      <circle
        cx="60"
        cy="60"
        r="55"
        fill="none"
        stroke="url(#gradient1)"
        strokeWidth="2"
        opacity="0.3"
        className={animated ? "animate-spin-slow" : ""}
        style={{ transformOrigin: '60px 60px' }}
      />

      {/* Main shield shape - privacy protection */}
      <path
        d="M60 20 L85 30 L85 50 Q85 70 75 80 Q65 90 60 95 Q55 90 45 80 Q35 70 35 50 L35 30 Z"
        fill="url(#gradient1)"
        opacity="0.9"
        filter="url(#glow)"
      />

      {/* Inner zero symbol - zero-knowledge concept */}
      <circle
        cx="60"
        cy="60"
        r="18"
        fill="none"
        stroke="url(#gradient2)"
        strokeWidth="3"
        opacity="0.8"
      />
      
      {/* Zero with privacy dots */}
      <circle
        cx="60"
        cy="60"
        r="15"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeDasharray="2 2"
        opacity="0.6"
      />

      {/* Network nodes - representing network state */}
      <circle cx="45" cy="45" r="3" fill="white" opacity="0.8" />
      <circle cx="75" cy="45" r="3" fill="white" opacity="0.8" />
      <circle cx="45" cy="75" r="3" fill="white" opacity="0.8" />
      <circle cx="75" cy="75" r="3" fill="white" opacity="0.8" />
      
      {/* Connection lines - network connections */}
      <line x1="45" y1="45" x2="60" y2="60" stroke="white" strokeWidth="1" opacity="0.4" />
      <line x1="75" y1="45" x2="60" y2="60" stroke="white" strokeWidth="1" opacity="0.4" />
      <line x1="45" y1="75" x2="60" y2="60" stroke="white" strokeWidth="1" opacity="0.4" />
      <line x1="75" y1="75" x2="60" y2="60" stroke="white" strokeWidth="1" opacity="0.4" />

      {/* Center dot - identity core */}
      <circle cx="60" cy="60" r="4" fill="white" opacity="0.9" />
      
      {/* Glow effect */}
      <circle
        cx="60"
        cy="60"
        r="25"
        fill="url(#glow)"
        opacity="0.5"
      />
    </svg>
  );

  const Text = () => (
    <div className="flex flex-col">
      <span 
        className="font-bold tracking-tight"
        style={{ 
          fontSize: `${textSize}px`,
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.02em',
        }}
      >
        ZeroState
      </span>
      <span 
        className="text-xs font-medium tracking-wider opacity-70"
        style={{ fontSize: `${textSize * 0.25}px` }}
      >
        ANONYMOUS FEEDBACK FORUM
      </span>
    </div>
  );

  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <Icon />
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <Text />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <Icon />
      <Text />
    </div>
  );
}

