import React from 'react';

interface MovieCardSkeletonProps {
  className?: string;
}

export const MovieCardSkeleton: React.FC<MovieCardSkeletonProps> = ({ className = '' }) => {
  return (
    <div className={`rounded-xl overflow-hidden bg-[#18181b] border border-white/5 animate-pulse ${className || 'w-full'}`}>
      <div className="relative aspect-[2/3] w-full bg-gradient-to-b from-zinc-800 to-zinc-900">
        
        {/* Top Badges Skeleton */}
        <div className="absolute top-2.5 left-2.5 w-12 h-5 rounded-md bg-zinc-700/60" />
        <div className="absolute top-2.5 right-2.5 w-10 h-5 rounded-md bg-zinc-700/60" />

        {/* Bottom Info Skeleton */}
        <div className="absolute inset-x-0 bottom-0 p-3 sm:p-3.5 space-y-2 bg-gradient-to-t from-black/90 to-transparent">
          <div className="h-4 bg-zinc-700/80 rounded w-4/5" />
          <div className="h-3 bg-zinc-800 rounded w-1/2" />
        </div>
      </div>
    </div>
  );
};
