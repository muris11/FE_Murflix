import React from 'react';

interface MurflixLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const MurflixLogo: React.FC<MurflixLogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-6 sm:h-7',
    md: 'h-8 sm:h-9',
    lg: 'h-10 sm:h-12',
    xl: 'h-12 sm:h-16',
  };

  return (
    <div className={`inline-flex items-center select-none ${sizeClasses[size]} ${className}`}>
      <svg
        viewBox="0 0 240 54"
        className="h-full w-auto overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Murflix"
      >
        <defs>
          {/* Authentic Netflix Arched Baseline (Subtle cinema curve) */}
          <path id="murflix-cinema-arc" d="M 12,42 Q 120,22 228,42" fill="none" />

          {/* Iconic Netflix Vivid Red Gradient */}
          <linearGradient id="murflix-red-linear" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E50914" />
            <stop offset="50%" stopColor="#FF1822" />
            <stop offset="100%" stopColor="#B80710" />
          </linearGradient>

          {/* Deep Cinema Ambient Shadow */}
          <filter id="murflix-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2.5" stdDeviation="3.5" floodColor="#000000" floodOpacity="0.8" />
            <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#E50914" floodOpacity="0.45" />
          </filter>
        </defs>

        <text
          fill="url(#murflix-red-linear)"
          filter="url(#murflix-shadow)"
          fontFamily="'Bebas Neue', 'Impact', 'Arial Black', sans-serif"
          fontSize="40"
          fontWeight="900"
          letterSpacing="4.5"
          textAnchor="middle"
          dominantBaseline="central"
        >
          <textPath href="#murflix-cinema-arc" startOffset="50%">
            MURFLIX
          </textPath>
        </text>
      </svg>
    </div>
  );
};
