import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { moviesApi } from '@/api/movies';
import { MovieCard } from '@/components/media/MovieCard';
import { MovieCardSkeleton } from '@/components/media/MovieCardSkeleton';
import { Film, Tv } from 'lucide-react';
import { MediaItem } from '@/types/tmdb';

export const BrowsePage: React.FC = () => {
  const location = useLocation();
  const { id: genreId } = useParams<{ id?: string }>();
  
  const isTV = location.pathname.includes('/tv');
  const mediaType = isTV ? 'tv' : 'movie';

  const [items, setItems] = useState<MediaItem[]>([]);
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>(genreId || '');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    moviesApi.getGenres(mediaType).then((res) => setGenres(res.genres || [])).catch(() => {});
  }, [mediaType]);

  useEffect(() => {
    setIsLoading(true);
    const params: Record<string, string | number> = {};
    if (selectedGenre) {
      params.with_genres = selectedGenre;
    }

    moviesApi
      .discover(mediaType, params)
      .then((res) => {
        setItems(res.results || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [mediaType, selectedGenre]);

  return (
    <div className="min-h-screen bg-[#141414] pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div className="flex items-center space-x-3">
          {isTV ? <Tv className="w-8 h-8 text-blue-500" /> : <Film className="w-8 h-8 text-red-500" />}
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
              {isTV ? 'Jelajahi Serial TV' : 'Jelajahi Film'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Temukan ribuan judul tontonan menarik berdasarkan genre favorit Anda
            </p>
          </div>
        </div>

        {/* Genre Filter */}
        <select
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-white text-xs sm:text-sm font-semibold rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500 cursor-pointer self-start sm:self-auto"
        >
          <option value="">Semua Genre</option>
          {genres.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">Tidak ada konten yang ditemukan untuk filter ini.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((item) => (
            <MovieCard key={item.id} item={{ ...item, media_type: mediaType }} />
          ))}
        </div>
      )}
    </div>
  );
};

