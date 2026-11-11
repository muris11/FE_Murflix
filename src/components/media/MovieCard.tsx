import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Star, Plus, Check, Film, Tv } from 'lucide-react';
import { MediaItem } from '@/types/tmdb';
import { VideoPlayerModal } from './VideoPlayerModal';
import { watchlistApi } from '@/api/watchlist';
import { getTMDBImageUrl, getDirectTMDBUrl } from '@/utils/image';

interface MovieCardProps {
  item: MediaItem;
  priority?: boolean;
  className?: string;
}

export const MovieCard: React.FC<MovieCardProps> = ({ item, className = '' }) => {
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isInList, setIsInList] = useState(false);
  const [retryStage, setRetryStage] = useState<0 | 1 | 2>(0);

  const title = item.title || item.name || 'Untitled';
  const mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
  const releaseYear = (item.release_date || item.first_air_date || '').split('-')[0];
  const rating = item.vote_average ? item.vote_average.toFixed(1) : null;

  // Multi-tier image fallback: Backend Proxy -> Direct TMDB -> Placeholder SVG
  const getPosterSrc = () => {
    if (!item.poster_path) return '/placeholder.svg';
    if (retryStage === 0) return getTMDBImageUrl(item.poster_path, 'w500');
    if (retryStage === 1) return getDirectTMDBUrl(item.poster_path, 'w500');
    return '/placeholder.svg';
  };

  const handleImageError = () => {
    if (retryStage < 2) {
      setRetryStage((prev) => (prev + 1) as 1 | 2);
    }
  };

  const detailPath = mediaType === 'tv' ? `/tv/${item.id}` : `/movie/${item.id}`;

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
    <>
      <div className={`group relative rounded-xl overflow-hidden bg-[#18181b] border border-white/5 transition-all duration-300 hover:scale-[1.04] hover:z-30 hover:shadow-2xl hover:shadow-red-950/40 hover:border-red-600/50 ${className || 'w-full'}`}>
        
        {/* Poster Container */}
        <Link to={detailPath} className="block relative aspect-[2/3] w-full overflow-hidden bg-gradient-to-b from-zinc-900 to-black">
          
          <img
            src={getPosterSrc()}
            alt=""
            aria-hidden="true"
            onError={handleImageError}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Top-Left: Rating Badge */}
          {rating && (
            <div className="absolute top-2.5 left-2.5 z-20 flex items-center space-x-1 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[11px] font-bold text-amber-400 border border-amber-500/30 shadow-md">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>{rating}</span>
            </div>
          )}

          {/* Top-Right: Type Badge */}
          <div className="absolute top-2.5 right-2.5 z-20 flex items-center space-x-1 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-gray-300 border border-white/10 shadow-md">
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
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/70 to-transparent pointer-events-none" />

          {/* Card Info & Actions at Bottom */}
          <div className="absolute inset-x-0 bottom-0 p-3 sm:p-3.5 z-20 flex flex-col justify-end">
            
            {/* Quick Actions (Reveal on Hover / Always accessible) */}
            <div className="flex items-center space-x-2 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsPlayerOpen(true);
                }}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#e50914] hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-600/40 transition-transform hover:scale-110 active:scale-95"
                title="Tonton Sekarang"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </button>

              <button
                onClick={toggleWatchlist}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/70 hover:bg-gray-800 border border-white/20 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
                title={isInList ? 'Hapus dari Daftar' : 'Tambah ke Daftar'}
              >
                {isInList ? <Check className="w-4 h-4 text-emerald-400" /> : <Plus className="w-4 h-4" />}
              </button>
            </div>

            {/* Title (Always visible, guaranteed no overlap) */}
            <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-1 drop-shadow-md group-hover:text-red-400 transition-colors">
              {title}
            </h3>

            {/* Subtitle / Year */}
            <div className="flex items-center space-x-2 text-[10px] sm:text-[11px] text-gray-300 mt-0.5">
              {releaseYear && <span>{releaseYear}</span>}
              <span className="text-gray-500">•</span>
              <span className="capitalize">{mediaType === 'tv' ? 'Serial TV' : 'Film'}</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Video Player Modal */}
      <VideoPlayerModal
        isOpen={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}
        tmdbId={item.id}
        mediaType={mediaType === 'tv' ? 'tv' : 'movie'}
        title={title}
        subTitle={releaseYear ? `Tahun ${releaseYear}` : undefined}
      />
    </>
  );
};
