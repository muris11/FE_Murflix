import React from 'react';

export const MovieCardSkeleton: React.FC = () => {
  return (
    <div className="flex-shrink-0 w-36 sm:w-44 md:w-52 rounded-xl overflow-hidden bg-gray-900 border border-gray-800 animate-pulse">
      <div className="aspect-[2/3] w-full bg-gray-800" />
      <div className="p-3 space-y-2">
        <div className="h-3.5 bg-gray-700 rounded w-3/4" />
        <div className="h-2.5 bg-gray-800 rounded w-1/2" />
      </div>
    </div>
  );
};

