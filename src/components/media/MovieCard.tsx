import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Star, Plus, Check, Film, Tv } from 'lucide-react';
import { MediaItem } from '@/types/tmdb';
import { watchlistApi } from '@/api/watchlist';
import { getTMDBImageUrl, getDirectTMDBUrl, getProxyTMDBUrl } from '@/utils/image';
import { getMovieUrl, getTVUrl, getWatchMovieUrl, getWatchTVUrl } from '@/utils/slug';

interface MovieCardProps {
  item: MediaItem;
  priority?: boolean;
  className?: string;
}

export const MovieCard: React.FC<MovieCardProps> = ({ item, className = '' }) => {
  const [isInList, setIsInList] = useState(false);
  const [retryStage, setRetryStage] = useState<0 | 1 | 2>(0);

  const title = item.title || item.name || 'Untitled';
  const mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
  const releaseYear = (item.release_date || item.first_air_date || '').split('-')[0];
  const rating = item.vote_average ? item.vote_average.toFixed(1) : null;

  // Multi-tier fast image loading: Direct TMDB CDN (w342) -> Backend Proxy -> Placeholder
  const getPosterSrc = () => {
    if (!item.poster_path) return '/placeholder.svg';
    if (retryStage === 0) return getTMDBImageUrl(item.poster_path, 'w342');
    if (retryStage === 1) return getProxyTMDBUrl(item.poster_path, 'w342');
    return '/placeholder.svg';
  };

  const handleImageError = () => {
    if (retryStage < 2) {
      setRetryStage((prev) => (prev + 1) as 1 | 2);
    }
  };

  const detailPath = mediaType === 'tv' ? getTVUrl(item.id, title) : getMovieUrl(item.id, title);
  const watchPath = mediaType === 'tv' ? getWatchTVUrl(item.id, title) : getWatchMovieUrl(item.id, title);

  const toggleWatchlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (isInList) {
        await watchlistApi.remove(mediaType, item.id);
        setIsInList(false);
      } else {
        await watchlistApi.add({
          media_type: mediaType,
          tmdb_id: item.id,
          title,
          poster_path: item.poster_path,
          backdrop_path: item.backdrop_path,
          vote_average: item.vote_average,
        });
        setIsInList(true);
      }
    } catch (err) {
      console.error('Watchlist toggle error:', err);
    }
  };

  return (
    <div className={`group/card relative rounded-xl overflow-hidden bg-[#18181b] border border-white/10 hover:border-red-500/80 hover:ring-1 hover:ring-red-500/40 transition-[transform,border-color] duration-200 hover:scale-[1.02] hover:z-20 transform-gpu will-change-transform ${className || 'w-full'}`}>
      {/* Poster Media Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-gradient-to-b from-zinc-900 to-black">
        {/* Main Card Click Target -> Detail Page */}
        <Link to={detailPath} className="absolute inset-0 z-0" aria-label={title}>
          <img
            src={getPosterSrc()}
            alt=""
            aria-hidden="true"
            onError={handleImageError}
            decoding="async"
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover/card:scale-105 transform-gpu"
          />
        </Link>

        {/* Top-Left: Rating Badge */}
        {rating && (
          <div className="absolute top-2.5 left-2.5 z-10 flex items-center space-x-1 px-2 py-0.5 rounded-md bg-black/90 text-[11px] font-bold text-amber-400 border border-amber-500/30 shadow-sm pointer-events-none">
            <Star className="w-3 h-3 fill-amber-400" />
            <span>{rating}</span>
          </div>
        )}

        {/* Top-Right: Type Badge */}
        <div className="absolute top-2.5 right-2.5 z-10 flex items-center space-x-1 px-1.5 py-0.5 rounded-md bg-black/90 text-[10px] font-bold uppercase tracking-wider text-gray-300 border border-white/10 shadow-sm pointer-events-none">
          {mediaType === 'tv' ? (
            <>
              <Tv className="w-3 h-3 text-blue-400" />
              <span className="text-blue-400">TV</span>
            </>
          ) : (
            <>
              <Film className="w-3 h-3 text-red-400" />
              <span className="text-red-400">FILM</span>
            </>
          )}
        </div>

        {/* Bottom Gradient Overlay (ALWAYS present for readable contrast) */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/75 to-transparent pointer-events-none z-10" />

        {/* Card Info & Actions at Bottom */}
        <div className="absolute inset-x-0 bottom-0 p-3 sm:p-3.5 z-20 flex flex-col justify-end pointer-events-none">
          
          {/* Quick Actions (Reveal on Hover of THIS card only) */}
          <div className="flex items-center space-x-2 mb-2 opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 pointer-events-auto">
            <Link
              to={watchPath}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#e50914] hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-600/40 transition-transform hover:scale-110 active:scale-95"
              title="Tonton Sekarang (Cinema Mode)"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </Link>

            <button
              type="button"
              onClick={toggleWatchlist}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/80 hover:bg-zinc-800 border border-white/20 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer"
              title={isInList ? 'Hapus dari Daftar' : 'Tambah ke Daftar'}
            >
              {isInList ? <Check className="w-4 h-4 text-emerald-400" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>

          {/* Title (Always visible, links to Detail) */}
          <Link
            to={detailPath}
            className="text-xs sm:text-sm font-bold text-white line-clamp-1 drop-shadow-md group-hover/card:text-red-400 transition-colors pointer-events-auto"
          >
            {title}
          </Link>

          {/* Subtitle / Year */}
          <div className="flex items-center space-x-2 text-[10px] sm:text-[11px] text-gray-300 mt-0.5">
            {releaseYear && <span>{releaseYear}</span>}
            <span className="capitalize">{mediaType === 'tv' ? 'Serial TV' : 'Film'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
