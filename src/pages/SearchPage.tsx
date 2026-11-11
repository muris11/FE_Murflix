import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { moviesApi } from '@/api/movies';
import { MovieCard } from '@/components/media/MovieCard';
import { MovieCardSkeleton } from '@/components/media/MovieCardSkeleton';
import { Search } from 'lucide-react';
import { MediaItem } from '@/types/tmdb';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [inputVal, setInputVal] = useState(query);
  const [results, setResults] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    moviesApi
      .search(query)
      .then((res) => {
        setResults(res.results?.filter((r) => r.poster_path || r.backdrop_path) || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      setSearchParams({ q: inputVal.trim() });
    }
  };

  return (
    <div className="min-h-screen bg-[#141414] pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Cari judul film, serial, aktor..."
          className="w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-500 rounded-2xl px-5 py-4 pl-12 text-base focus:outline-none focus:border-[#e50914] shadow-xl"
        />
        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
      </form>

      {query && (
        <h2 className="text-xl font-bold text-white border-b border-gray-800 pb-3">
          Hasil pencarian untuk: <span className="text-[#e50914]">"{query}"</span>
        </h2>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      ) : results.length === 0 && query ? (
        <div className="text-center py-20 text-gray-400 space-y-2">
          <p className="text-lg font-semibold">Tidak ada hasil yang ditemukan untuk "{query}".</p>
          <p className="text-xs text-gray-500">Coba gunakan kata kunci lain seperti judul bahasa Inggris atau aktor.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {results.map((item) => (
            <MovieCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

