import React from 'react';

interface MovieCardSkeletonProps {
  className?: string;
}

export const MovieCardSkeleton: React.FC<MovieCardSkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`rounded-xl overflow-hidden bg-[#161619] border border-white/5 animate-shimmer relative ${className || 'w-full'}`}
    >
      <div className="relative aspect-[2/3] w-full bg-[#18181c]">
        {/* Top subtle badge placeholders */}
        <div className="absolute top-2.5 left-2.5 w-10 h-4 rounded-md bg-zinc-800/80" />
        <div className="absolute top-2.5 right-2.5 w-9 h-4 rounded-md bg-zinc-800/80" />

        {/* Bottom Info Gradient & Placeholders */}
        <div className="absolute inset-x-0 bottom-0 p-3 sm:p-3.5 space-y-2 bg-gradient-to-t from-black via-black/80 to-transparent">
          <div className="h-3.5 bg-zinc-700/80 rounded w-4/5" />
          <div className="flex items-center justify-between pt-0.5">
            <div className="h-2.5 bg-zinc-800 rounded w-10" />
            <div className="h-2.5 bg-zinc-800/70 rounded w-14" />
          </div>
        </div>
      </div>
    </div>
  );
};
