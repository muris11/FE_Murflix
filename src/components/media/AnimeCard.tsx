import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { VideoPlayerModal } from './VideoPlayerModal';

interface AnimeCardProps {
  item: {
    slug?: string;
    title?: string;
    poster?: string;
    episode?: string;
    status?: string;
    playUrl?: string;
  };
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ item }) => {
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  const title = item.title || 'Anime';
  const posterUrl = item.poster || '/placeholder.svg';

  return (
    <>
      <div
        onClick={() => setIsPlayerOpen(true)}
        className="group relative flex-shrink-0 w-36 sm:w-44 md:w-48 rounded-xl overflow-hidden bg-gray-900 border border-gray-800/80 cursor-pointer transition-all duration-300 hover:scale-105 hover:z-20 hover:border-blue-500 hover:shadow-2xl hover:shadow-black"
      >
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-800">
          <img
            src={posterUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-bold text-blue-400 uppercase tracking-wider border border-blue-500/30">
            {item.episode || 'Anime'}
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </div>
          </div>
        </div>

        <div className="p-2.5">
          <p className="text-xs font-semibold text-white line-clamp-1 group-hover:text-blue-400 transition-colors">{title}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{item.status || 'Sub Indo'}</p>
        </div>
      </div>

      <VideoPlayerModal
        isOpen={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}
        title={title}
        directVideoUrl={item.playUrl || null}
      />
    </>
  );
};

