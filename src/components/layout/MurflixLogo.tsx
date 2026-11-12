import React, { useId } from 'react';

interface MurflixLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const MurflixLogo: React.FC<MurflixLogoProps> = ({ className = '', size = 'md' }) => {
  const rawId = useId().replace(/:/g, '');
  const arcId = `murflix-arc-${rawId}`;
  const gradientId = `murflix-grad-${rawId}`;

  const sizeClasses = {
    sm: 'h-6 sm:h-7 w-24 sm:w-28',
    md: 'h-8 sm:h-9 w-32 sm:w-36',
    lg: 'h-10 sm:h-12 w-40 sm:w-48',
    xl: 'h-12 sm:h-16 w-48 sm:w-60',
  };

  return (
    <div className={`inline-flex items-center flex-shrink-0 select-none ${sizeClasses[size]} ${className}`}>
      <svg
        viewBox="0 0 240 54"
        className="w-full h-full overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Murflix"
      >
        <defs>
          <path id={arcId} d="M 12,42 Q 120,24 228,42" fill="none" />
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E50914" />
            <stop offset="50%" stopColor="#FF1822" />
            <stop offset="100%" stopColor="#B80710" />
          </linearGradient>
        </defs>

        <text
          fill={`url(#${gradientId})`}
          fontFamily="'Bebas Neue', 'Impact', 'Arial Black', sans-serif"
          fontSize="40"
          fontWeight="900"
          letterSpacing="3.5"
          textAnchor="middle"
          dominantBaseline="central"
        >
          <textPath href={`#${arcId}`} startOffset="50%">
            MURFLIX
          </textPath>
        </text>
      </svg>
    </div>
  );
};

