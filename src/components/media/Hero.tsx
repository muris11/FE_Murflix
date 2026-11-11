import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Info, Star } from 'lucide-react';
import { MediaItem } from '@/types/tmdb';
import { VideoPlayerModal } from './VideoPlayerModal';

interface HeroProps {
  item?: MediaItem;
}

export const Hero: React.FC<HeroProps> = ({ item }) => {
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  if (!item) return null;

  const title = item.title || item.name || 'Featured';
  const mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
  const releaseYear = (item.release_date || item.first_air_date || '').split('-')[0];
  const backdropUrl = item.backdrop_path
    ? `https://image.tmdb.org/t/p/original${item.backdrop_path}`
    : item.poster_path
    ? `https://image.tmdb.org/t/p/original${item.poster_path}`
    : '';

  const detailPath = mediaType === 'tv' ? `/tv/${item.id}` : `/movie/${item.id}`;

  return (
    <>
      <div className="relative w-full h-[65vh] sm:h-[75vh] md:h-[85vh] overflow-hidden bg-black">
        {/* Backdrop Image */}
        {backdropUrl && (
          <img
            src={backdropUrl}
            alt={title}
            className="w-full h-full object-cover object-center transform scale-105 animate-subtleZoom"
          />
        )}

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/90 via-[#141414]/40 to-transparent w-full md:w-2/3" />

        {/* Content Box */}
        <div className="absolute bottom-12 sm:bottom-16 md:bottom-20 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          
          {/* Rating & Tag */}
          <div className="flex items-center space-x-3 text-xs sm:text-sm font-semibold">
            {item.vote_average && (
              <div className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{item.vote_average.toFixed(1)}</span>
              </div>
            )}
            {releaseYear && <span className="text-gray-300">{releaseYear}</span>}
            <span className="text-red-500 uppercase tracking-widest font-bold">
              {mediaType === 'tv' ? 'Serial TV' : 'Film'}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight drop-shadow-md max-w-2xl leading-tight">
            {title}
          </h1>

          {/* Overview */}
          <p className="text-sm sm:text-base text-gray-300 max-w-xl line-clamp-3 leading-relaxed drop-shadow">
            {item.overview || 'Tonton film dan serial TV terbaik dengan kualitas HD dan berbagai pilihan subtitle sekarang di Murflix.'}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4 pt-2">
            <button
              onClick={() => setIsPlayerOpen(true)}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-[#e50914] hover:bg-red-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-red-600/30 transition-transform hover:scale-105 active:scale-95"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Tonton Sekarang</span>
            </button>

            <Link
              to={detailPath}
              className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-semibold text-sm sm:text-base transition-colors"
            >
              <Info className="w-5 h-5" />
              <span>Detail Info</span>
            </Link>
          </div>
        </div>
      </div>

      <VideoPlayerModal
        isOpen={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}
        tmdbId={item.id}
        mediaType={mediaType === 'tv' ? 'tv' : 'movie'}
        title={title}
      />
    </>
  );
};

