import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Info, Star } from 'lucide-react';
import { MediaItem } from '@/types/tmdb';
import { getTMDBImageUrl, getDirectTMDBUrl } from '@/utils/image';
import { getMovieUrl, getTVUrl, getWatchMovieUrl, getWatchTVUrl } from '@/utils/slug';

interface HeroProps {
  item?: MediaItem;
}

export const Hero: React.FC<HeroProps> = ({ item }) => {
  const [imageError, setImageError] = useState(false);

  if (!item) {
    return (
      <div className="relative w-full h-[68vh] sm:h-[80vh] md:h-[88vh] overflow-hidden bg-[#141414] animate-pulse">
        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-zinc-900/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/95 via-[#141414]/60 to-transparent w-full md:w-3/5" />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/80 to-transparent" />

        {/* 1:1 Content Box Skeleton */}
        <div className="absolute bottom-12 sm:bottom-16 md:bottom-20 left-0 right-0 px-4 sm:px-8 md:px-12 lg:px-16 space-y-4 z-20">
          {/* Title Skeleton */}
          <div className="h-9 sm:h-14 md:h-16 lg:h-20 bg-zinc-800/90 rounded-2xl w-3/4 max-w-2xl" />

          {/* Metadata Badges Skeleton */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="w-14 h-5 rounded bg-zinc-800/90" />
            <div className="w-12 h-5 rounded bg-zinc-800/90" />
            <div className="w-14 h-5 rounded bg-amber-500/20 border border-amber-500/30" />
            <div className="w-10 h-5 rounded bg-zinc-800/90" />
            <div className="w-16 h-5 rounded bg-zinc-800/90" />
          </div>

          {/* Overview Lines Skeleton */}
          <div className="space-y-2 max-w-2xl pt-1">
            <div className="h-4 bg-zinc-800/70 rounded w-full" />
            <div className="h-4 bg-zinc-800/70 rounded w-5/6" />
            <div className="h-4 bg-zinc-800/60 rounded w-2/3" />
          </div>

          {/* Action Buttons Skeleton */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="w-32 sm:w-36 h-12 rounded-full bg-zinc-200/90 shadow-xl" />
            <div className="w-48 sm:w-56 h-12 rounded-full bg-zinc-800/80 border border-white/5" />
          </div>
        </div>

        {/* Bottom-Right Badges Skeleton */}
        <div className="absolute bottom-12 sm:bottom-16 right-4 sm:right-8 md:right-12 lg:right-16 z-20 hidden md:flex items-center space-x-2.5">
          <div className="w-32 h-8 rounded-full bg-zinc-800/80 border border-white/5" />
          <div className="w-20 h-8 rounded-md bg-red-900/60 border border-red-500/30" />
        </div>
      </div>
    );
  }

  const title = item.title || item.name || 'Featured';
  const mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
  const releaseYear = (item.release_date || item.first_air_date || '').split('-')[0];
  const targetPath = item.backdrop_path || item.poster_path;

  const backdropUrl = targetPath
    ? imageError
      ? getDirectTMDBUrl(targetPath, 'w1280')
      : getTMDBImageUrl(targetPath, 'w1280')
    : '';

  const detailPath = mediaType === 'tv' ? getTVUrl(item.id, title) : getMovieUrl(item.id, title);
  const watchPath = mediaType === 'tv' ? getWatchTVUrl(item.id, title) : getWatchMovieUrl(item.id, title);

  const rating = item.vote_average ? item.vote_average.toFixed(1) : null;

  return (
    <div className="relative w-full h-[68vh] sm:h-[80vh] md:h-[88vh] overflow-hidden bg-[#141414]">
      {/* Full Bleed Backdrop Image (Optimized w1280 + async decode) */}
      {backdropUrl && (
        <img
          src={backdropUrl}
          alt={title}
          onError={() => setImageError(true)}
          decoding="async"
          className="w-full h-full object-cover object-center transform scale-105 animate-subtleZoom"
        />
      )}

      {/* Cinematic Gradient Overlays (Bleeds into rows seamlessly) */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/95 via-[#141414]/50 to-transparent w-full md:w-3/5" />
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/80 to-transparent" />

      {/* Content Box */}
      <div className="absolute bottom-12 sm:bottom-16 md:bottom-20 left-0 right-0 px-4 sm:px-8 md:px-12 lg:px-16 space-y-4 z-20">
        {/* Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight drop-shadow-xl max-w-3xl leading-none">
          {title}
        </h1>

        {/* Netflix Metadata Line (Zero dots) */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm font-semibold text-gray-200 drop-shadow">
          <span className="text-white font-bold">{mediaType === 'tv' ? 'Serial' : 'Film'}</span>
          {releaseYear && <span>{releaseYear}</span>}
          {rating && (
            <span className="flex items-center text-amber-400 font-bold">
              <Star className="w-3.5 h-3.5 fill-current mr-1" />
              {rating}
            </span>
          )}
          <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[11px] font-bold text-gray-300 border border-white/10">
            16+
          </span>
          <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[11px] font-bold text-gray-300 border border-white/10">
            Full HD
          </span>
        </div>

        {/* Overview */}
        <p className="text-xs sm:text-sm md:text-base text-gray-300 max-w-2xl line-clamp-3 leading-relaxed drop-shadow-md">
          {item.overview || 'Tonton film dan serial TV terbaik dengan kualitas HD dan berbagai pilihan subtitle sekarang di Murflix.'}
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 sm:gap-3 pt-2 w-full max-w-sm sm:max-w-none">
          <Link
            to={watchPath}
            className="w-full sm:w-auto flex items-center justify-center space-x-1.5 sm:space-x-2 px-3 sm:px-7 py-2.5 sm:py-3 rounded-full bg-white hover:bg-zinc-200 text-black font-extrabold text-xs sm:text-base shadow-2xl transition-transform hover:scale-105 active:scale-95"
          >
            <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-black flex-shrink-0" />
            <span>Putar</span>
          </Link>

          <Link
            to={detailPath}
            className="w-full sm:w-auto flex items-center justify-center space-x-1.5 sm:space-x-2 px-3 sm:px-6 py-2.5 sm:py-3 rounded-full bg-zinc-700/80 hover:bg-zinc-700 text-white font-bold text-xs sm:text-base border border-white/10 transition-colors"
          >
            <Info className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="truncate">Selengkapnya</span>
          </Link>
        </div>
      </div>

      {/* Bottom-Right Badges */}
      <div className="absolute bottom-12 sm:bottom-16 right-4 sm:right-8 md:right-12 lg:right-16 z-20 hidden md:flex items-center space-x-2.5">
        <div className="flex items-center px-3 py-1.5 rounded-full bg-black/90 border border-red-500/30 text-white text-xs font-bold shadow-lg">
          <span>Baru Ditambahkan</span>
        </div>
        <div className="flex items-center px-2.5 py-1 rounded-md bg-[#e50914] text-white text-xs font-black tracking-wider uppercase shadow-lg">
          <span>TOP 10</span>
        </div>
      </div>
    </div>
  );
};
