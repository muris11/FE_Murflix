import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Star } from 'lucide-react';
import { moviesApi } from '@/api/movies';
import { CollectionDetails } from '@/types/tmdb';
import { getTMDBImageUrl, getDirectTMDBUrl } from '@/utils/image';
import { getMovieUrl } from '@/utils/slug';

interface CollectionSectionProps {
  collectionId: number;
  currentMovieId: number;
}

export const CollectionSection: React.FC<CollectionSectionProps> = ({ collectionId, currentMovieId }) => {
  const [collection, setCollection] = useState<CollectionDetails | null>(null);

  useEffect(() => {
    if (!collectionId) return;
    moviesApi
      .getCollectionDetails(collectionId)
      .then((data) => setCollection(data))
      .catch((err) => console.error('Failed to load collection:', err));
  }, [collectionId]);

  if (!collection || !collection.parts || collection.parts.length <= 1) return null;

  const backdropUrl = collection.backdrop_path
    ? getDirectTMDBUrl(collection.backdrop_path, 'original')
    : '';

  // Sort movies in chronological release date order
  const parts = [...collection.parts].sort((a, b) => {
    const dateA = a.release_date || '';
    const dateB = b.release_date || '';
    return dateA.localeCompare(dateB);
  });

  return (
    <div className="pt-8 space-y-4">
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-zinc-950 p-6 sm:p-8 shadow-2xl">
        {backdropUrl && (
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <img src={backdropUrl} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
          </div>
        )}

        <div className="relative z-10 space-y-4">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-red-500" />
            <span className="text-xs uppercase font-extrabold tracking-widest text-red-500">
              Koleksi / Waralaba Film
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white">{collection.name}</h3>

          {collection.overview && (
            <p className="text-xs sm:text-sm text-gray-300 max-w-3xl leading-relaxed">
              {collection.overview}
            </p>
          )}

          {/* Franchise Movie Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
            {parts.map((item) => {
              const isCurrent = item.id === currentMovieId;
              const poster = item.poster_path ? getTMDBImageUrl(item.poster_path, 'w342') : '/placeholder.svg';
              const year = (item.release_date || '').split('-')[0];

              return (
                <Link
                  key={item.id}
                  to={getMovieUrl(item.id, item.title || '')}
                  className={`group relative flex flex-col space-y-1.5 transition-transform ${
                    isCurrent ? 'ring-2 ring-red-600 rounded-xl p-1 bg-red-950/20' : 'hover:scale-105'
                  }`}
                >
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-zinc-900 border border-white/10 shadow-md">
                    <img src={poster} alt="" className="w-full h-full object-cover" loading="lazy" />
                    {isCurrent && (
                      <div className="absolute inset-0 bg-red-600/20 flex items-center justify-center">
                        <span className="px-2 py-0.5 rounded bg-red-600 text-[10px] font-bold text-white shadow">
                          Sedang Dibuka
                        </span>
                      </div>
                    )}
                    {item.vote_average && (
                      <div className="absolute top-1.5 left-1.5 px-1 py-0.5 rounded bg-black/80 text-[10px] font-bold text-amber-400 flex items-center space-x-0.5">
                        <Star className="w-2.5 h-2.5 fill-amber-400" />
                        <span>{item.vote_average.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  <span className="text-xs font-semibold text-gray-200 line-clamp-1 group-hover:text-red-400 transition-colors">
                    {item.title}
                  </span>
                  {year && <span className="text-[10px] text-gray-500">{year}</span>}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

