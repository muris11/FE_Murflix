import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaItem } from '@/types/tmdb';
import { MovieCard } from './MovieCard';
import { MovieCardSkeleton } from './MovieCardSkeleton';

interface MovieRowProps {
  title: string;
  items?: MediaItem[];
  isLoading?: boolean;
}

export const MovieRow: React.FC<MovieRowProps> = ({ title, items = [], isLoading = false }) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="space-y-3 py-2 relative group/row [content-visibility:auto] [contain-intrinsic-size:0_320px]">
      {/* Row Header with red accent bar */}
      <div className="flex items-center space-x-2.5">
        <div className="w-1.5 h-5 sm:h-6 bg-[#e50914] rounded-full shadow-[0_0_8px_rgba(229,9,20,0.6)]" />
        <h2 className="text-base sm:text-lg md:text-xl font-extrabold text-white tracking-wide">
          {title}
        </h2>
      </div>

      <div className="relative">
        {/* Left Arrow Button */}
        <button
          onClick={() => scroll('left')}
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full bg-black/80 hover:bg-[#e50914] text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity duration-200 shadow-xl border border-white/10 hover:border-[#e50914] hover:scale-110 active:scale-95 cursor-pointer"
          aria-label="Scroll Kiri"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Scrollable Container */}
        <div
          ref={rowRef}
          className="flex space-x-3 sm:space-x-4 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1 overscroll-x-contain transform-gpu"
        >
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <MovieCardSkeleton key={i} className="flex-shrink-0 w-36 sm:w-44 md:w-52" />
              ))
            : items.map((item) => (
                <MovieCard key={item.id} item={item} className="flex-shrink-0 w-36 sm:w-44 md:w-52" />
              ))}
        </div>

        {/* Right Arrow Button */}
        <button
          onClick={() => scroll('right')}
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full bg-black/80 hover:bg-[#e50914] text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity duration-200 shadow-xl border border-white/10 hover:border-[#e50914] hover:scale-110 active:scale-95 cursor-pointer"
          aria-label="Scroll Kanan"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
