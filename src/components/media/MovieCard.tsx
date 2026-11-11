import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Star, Plus, Check } from 'lucide-react';
import { MediaItem } from '@/types/tmdb';
import { VideoPlayerModal } from './VideoPlayerModal';
import { watchlistApi } from '@/api/watchlist';

interface MovieCardProps {
  item: MediaItem;
  priority?: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({ item }) => {
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isInList, setIsInList] = useState(false);
  const [imageError, setImageError] = useState(false);

  const title = item.title || item.name || 'Untitled';
  const mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
  const releaseYear = (item.release_date || item.first_air_date || '').split('-')[0];
  const rating = item.vote_average ? item.vote_average.toFixed(1) : null;

  const posterUrl = item.poster_path && !imageError
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : '/placeholder.svg';

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
      <div className="group relative flex-shrink-0 w-36 sm:w-44 md:w-52 rounded-xl overflow-hidden bg-gray-900 border border-gray-800/80 transition-all duration-300 hover:scale-105 hover:z-30 hover:shadow-2xl hover:shadow-black/80 hover:border-gray-700">
        
        {/* Poster Image */}
        <Link to={detailPath} className="block relative aspect-[2/3] w-full overflow-hidden bg-gray-900">
          <img
            src={posterUrl}
            alt={title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Rating Badge */}
          {rating && (
            <div className="absolute top-2 left-2 flex items-center space-x-1 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[11px] font-bold text-amber-400 border border-amber-500/30">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>{rating}</span>
            </div>
          )}

          {/* Hover Overlay with Quick Action Buttons */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
            <div className="flex items-center space-x-2 mb-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsPlayerOpen(true);
                }}
                className="w-9 h-9 rounded-full bg-[#e50914] hover:bg-red-700 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110"
                title="Tonton Sekarang"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </button>

              <button
                onClick={toggleWatchlist}
                className="w-9 h-9 rounded-full bg-gray-800/80 hover:bg-gray-700 border border-gray-600 text-white flex items-center justify-center shadow transition-colors"
                title={isInList ? 'Hapus dari Daftar' : 'Tambah ke Daftar'}
              >
                {isInList ? <Check className="w-4 h-4 text-emerald-400" /> : <Plus className="w-4 h-4" />}
              </button>
            </div>

            <p className="text-xs font-semibold text-white line-clamp-1">{title}</p>
            <div className="flex items-center space-x-2 text-[10px] text-gray-400 mt-0.5">
              {releaseYear && <span>{releaseYear}</span>}
              <span className="capitalize">{mediaType === 'tv' ? 'Serial' : 'Film'}</span>
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

