import React from 'react';

interface MovieCardSkeletonProps {
  className?: string;
}

export const MovieCardSkeleton: React.FC<MovieCardSkeletonProps> = ({ className = '' }) => {
  return (
    <div className={`rounded-xl overflow-hidden bg-[#18181b] border border-white/5 animate-pulse ${className || 'w-full'}`}>
      <div className="relative aspect-[2/3] w-full bg-gradient-to-b from-zinc-800 to-zinc-900">
        
        {/* Top Badges Skeleton (1:1 with MovieCard Rating & Type) */}
        <div className="absolute top-2.5 left-2.5 w-12 h-5 rounded-md bg-zinc-800/90 border border-amber-500/20 shadow-md" />
        <div className="absolute top-2.5 right-2.5 w-11 h-5 rounded-md bg-zinc-800/90 border border-white/10 shadow-md" />

        {/* Bottom Info Skeleton (1:1 with MovieCard Gradient & Meta) */}
        <div className="absolute inset-x-0 bottom-0 p-3 sm:p-3.5 space-y-2 bg-gradient-to-t from-black via-black/70 to-transparent">
          <div className="h-4 bg-zinc-700/90 rounded w-4/5" />
          <div className="flex items-center space-x-2">
            <div className="h-3 bg-zinc-800 rounded w-10" />
            <div className="h-3 bg-zinc-800/80 rounded w-12" />
          </div>
        </div>
      </div>
    </div>
  );
};
