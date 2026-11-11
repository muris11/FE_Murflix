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
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-4">
        <div className="relative w-full h-[55vh] sm:h-[65vh] md:h-[75vh] rounded-2xl sm:rounded-3xl overflow-hidden bg-zinc-900 animate-pulse border border-white/5">
          <div className="absolute bottom-8 sm:bottom-12 md:bottom-16 left-0 right-0 px-6 sm:px-10 lg:px-12 space-y-4">
            <div className="h-10 sm:h-14 bg-zinc-800 rounded-xl w-3/4 max-w-lg" />
            <div className="h-4 bg-zinc-800/80 rounded w-1/2 max-w-sm" />
            <div className="h-12 bg-zinc-800/60 rounded-full w-40" />
          </div>
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
      ? getDirectTMDBUrl(targetPath, 'original')
      : getTMDBImageUrl(targetPath, 'original')
    : '';

  const detailPath = mediaType === 'tv' ? getTVUrl(item.id, title) : getMovieUrl(item.id, title);
  const watchPath = mediaType === 'tv' ? getWatchTVUrl(item.id, title) : getWatchMovieUrl(item.id, title);

  const rating = item.vote_average ? item.vote_average.toFixed(1) : null;

  return (
    <>
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-4">
        {/* Netflix 1:1 Rounded Hero Banner Container */}
        <div className="relative w-full h-[58vh] sm:h-[68vh] md:h-[76vh] rounded-2xl sm:rounded-3xl overflow-hidden bg-black border border-white/10 shadow-2xl shadow-black/80">
          
          {/* Backdrop Image */}
          {backdropUrl && (
            <img
              src={backdropUrl}
              alt={title}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover object-center transform scale-105 animate-subtleZoom"
            />
          )}

          {/* Cinematic Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#101012] via-[#101012]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#101012]/95 via-[#101012]/50 to-transparent w-full md:w-3/5" />

          {/* Content Box */}
          <div className="absolute bottom-8 sm:bottom-12 md:bottom-16 left-0 right-0 px-6 sm:px-10 lg:px-12 space-y-3.5 z-20">
            
            {/* Title */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight drop-shadow-xl max-w-2xl leading-none">
              {title}
            </h1>

            {/* Netflix Bullet Metadata Line: Film/Serial • Tahun • Rating • Badge */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs sm:text-sm font-semibold text-gray-200 drop-shadow">
              <span className="text-white font-bold">{mediaType === 'tv' ? 'Serial' : 'Film'}</span>
              <span className="text-zinc-500">•</span>
              {releaseYear && (
                <>
                  <span>{releaseYear}</span>
                  <span className="text-zinc-500">•</span>
                </>
              )}
              {rating && (
                <>
                  <span className="flex items-center text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-current mr-1" />
                    {rating}
                  </span>
                  <span className="text-zinc-500">•</span>
                </>
              )}
              <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[11px] font-bold text-gray-300 border border-white/10">
                16+
              </span>
              <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[11px] font-bold text-gray-300 border border-white/10">
                Full HD
              </span>
            </div>

            {/* Overview */}
            <p className="text-xs sm:text-sm md:text-base text-gray-300 max-w-xl line-clamp-3 leading-relaxed drop-shadow-md">
              {item.overview || 'Tonton film dan serial TV terbaik dengan kualitas HD dan berbagai pilihan subtitle sekarang di Murflix.'}
            </p>

            {/* Action Buttons (1:1 Netflix Style) */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to={watchPath}
                className="flex items-center space-x-2 px-7 py-3 rounded-full bg-white hover:bg-zinc-200 text-black font-extrabold text-sm sm:text-base shadow-2xl transition-transform hover:scale-105 active:scale-95"
              >
                <Play className="w-5 h-5 fill-black" />
                <span>Putar</span>
              </Link>

              <Link
                to={detailPath}
                className="flex items-center space-x-2 px-6 py-3 rounded-full bg-zinc-700/60 hover:bg-zinc-700/80 backdrop-blur-md text-white font-bold text-sm sm:text-base border border-white/10 transition-colors"
              >
                <Info className="w-5 h-5" />
                <span>Informasi Selengkapnya</span>
              </Link>
            </div>
          </div>

          {/* Bottom-Right Netflix Badges (Sesuai Screenshot User) */}
          <div className="absolute bottom-8 right-6 sm:right-10 z-20 hidden md:flex items-center space-x-2.5">
            <div className="flex items-center px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-red-500/30 text-white text-xs font-bold shadow-lg">
              <span>Baru Ditambahkan</span>
            </div>
            <div className="flex items-center px-2.5 py-1 rounded-md bg-[#e50914] text-white text-xs font-black tracking-wider uppercase shadow-lg">
              <span>TOP 10</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
