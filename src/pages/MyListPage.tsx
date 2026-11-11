import React, { useEffect, useState } from 'react';
import { watchlistApi, WatchlistRecord } from '@/api/watchlist';
import { MovieCard } from '@/components/media/MovieCard';
import { Heart } from 'lucide-react';

export const MyListPage: React.FC = () => {
  const [items, setItems] = useState<WatchlistRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    watchlistApi
      .getWatchlist()
      .then((data) => setItems(data || []))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#141414] pt-24 pb-20 px-4 sm:px-8 md:px-12 lg:px-16 w-full space-y-8">
      <div className="flex items-center space-x-3 border-b border-gray-800 pb-4">
        <Heart className="w-8 h-8 text-pink-500 fill-current" />
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">Daftar Tontonan Saya</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Film dan serial yang Anda simpan untuk ditonton nanti
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 rounded-full border-4 border-pink-500 border-t-transparent animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-gray-400 space-y-2">
          <p className="text-lg font-semibold">Daftar tontonan Anda masih kosong.</p>
          <p className="text-xs text-gray-500">Klik ikon '+' pada film atau serial favorit Anda untuk menambahkannya ke sini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-4">
          {items.map((item) => (
            <MovieCard
              key={item.id}
              item={{
                id: item.tmdb_id,
                title: item.title,
                poster_path: item.poster_path,
                backdrop_path: item.backdrop_path,
                media_type: item.media_type as any,
                vote_average: item.vote_average,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

