import React, { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { moviesApi } from '@/api/movies';
import { MovieCard } from '@/components/media/MovieCard';
import { MovieCardSkeleton } from '@/components/media/MovieCardSkeleton';
import { Film, Tv, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { MediaItem } from '@/types/tmdb';

export const BrowsePage: React.FC = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const isTV = location.pathname.includes('/tv');
  const mediaType = isTV ? 'tv' : 'movie';

  const currentPage = Number(searchParams.get('page')) || 1;
  const currentGenre = searchParams.get('genre') || '';
  const currentSort = searchParams.get('sort') || 'popularity.desc';

  const [items, setItems] = useState<MediaItem[]>([]);
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch genres
  useEffect(() => {
    moviesApi
      .getGenres(mediaType)
      .then((res) => setGenres(res.genres || []))
      .catch(() => {});
  }, [mediaType]);

  // Fetch paginated discover data
  useEffect(() => {
    setIsLoading(true);
    const params: Record<string, string | number> = {
      page: currentPage,
      sort_by: currentSort,
    };
    if (currentGenre) {
      params.with_genres = currentGenre;
    }

    moviesApi
      .discover(mediaType, params)
      .then((res) => {
        setItems(res.results || []);
        // TMDB max page is 500
        setTotalPages(Math.min(res.total_pages || 1, 500));
        setTotalResults(res.total_results || 0);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        setIsLoading(false);
      });
  }, [mediaType, currentPage, currentGenre, currentSort]);

  const updateFilters = (newPage: number, newGenre?: string, newSort?: string) => {
    const nextParams: Record<string, string> = {};
    if (newPage > 1) nextParams.page = String(newPage);
    const g = newGenre !== undefined ? newGenre : currentGenre;
    if (g) nextParams.genre = g;
    const s = newSort !== undefined ? newSort : currentSort;
    if (s && s !== 'popularity.desc') nextParams.sort = s;

    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate pagination page numbers window
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-[#141414] pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div className="flex items-center space-x-3">
          {isTV ? <Tv className="w-8 h-8 text-[#e50914]" /> : <Film className="w-8 h-8 text-[#e50914]" />}
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {isTV ? 'Katalog Serial TV' : 'Katalog Film'}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              Halaman {currentPage} dari {totalPages.toLocaleString()} • Menampilkan 20 judul per halaman (Super Ringan)
            </p>
          </div>
        </div>

        {/* Filters Bar: Genre & Sorting */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Genre Dropdown */}
          <div className="relative">
            <select
              value={currentGenre}
              onChange={(e) => updateFilters(1, e.target.value)}
              className="bg-[#18181b] border border-zinc-700 text-white text-xs sm:text-sm font-semibold rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500 cursor-pointer shadow-md"
            >
              <option value="">Semua Genre</option>
              {genres.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={currentSort}
              onChange={(e) => updateFilters(1, undefined, e.target.value)}
              className="bg-[#18181b] border border-zinc-700 text-white text-xs sm:text-sm font-semibold rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500 cursor-pointer shadow-md"
            >
              <option value="popularity.desc">Terpopuler</option>
              <option value="vote_average.desc">Rating Tertinggi</option>
              <option value={isTV ? 'first_air_date.desc' : 'primary_release_date.desc'}>
                Rilis Terbaru
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
          {Array.from({ length: 18 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-24 text-zinc-500 space-y-2">
          <p className="text-base font-semibold">Tidak ada judul yang ditemukan untuk filter ini.</p>
          <button
            onClick={() => updateFilters(1, '', 'popularity.desc')}
            className="text-xs text-red-500 hover:underline"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
          {items.map((item) => (
            <MovieCard key={item.id} item={{ ...item, media_type: mediaType }} />
          ))}
        </div>
      )}

      {/* Netflix 1:1 Responsive Pagination Controls */}
      {!isLoading && totalPages > 1 && (
        <div className="pt-8 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-400">
            Halaman <strong className="text-white">{currentPage}</strong> dari{' '}
            <strong className="text-white">{totalPages.toLocaleString()}</strong> ({totalResults.toLocaleString()} total judul)
          </p>

          <div className="flex items-center space-x-1.5 sm:space-x-2">
            
            {/* Prev Button */}
            <button
              onClick={() => updateFilters(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-3 py-2 rounded-xl bg-[#18181b] border border-zinc-800 text-xs font-semibold text-gray-300 hover:text-white hover:border-zinc-600 disabled:opacity-30 disabled:hover:border-zinc-800 transition-all flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Sebelumnya</span>
            </button>

            {/* Numeric Page Buttons */}
            <div className="flex items-center space-x-1">
              {getPageNumbers().map((p, idx) => {
                if (p === '...') {
                  return (
                    <span key={`dots-${idx}`} className="px-2 text-xs text-zinc-500 font-bold">
                      ...
                    </span>
                  );
                }
                const pNum = Number(p);
                const isActive = pNum === currentPage;
                return (
                  <button
                    key={pNum}
                    onClick={() => updateFilters(pNum)}
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#e50914] text-white shadow-lg shadow-red-600/40 ring-1 ring-red-500'
                        : 'bg-[#18181b] border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600'
                    }`}
                  >
                    {pNum}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            <button
              onClick={() => updateFilters(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-3 py-2 rounded-xl bg-[#18181b] border border-zinc-800 text-xs font-semibold text-gray-300 hover:text-white hover:border-zinc-600 disabled:opacity-30 disabled:hover:border-zinc-800 transition-all flex items-center space-x-1"
            >
              <span className="hidden sm:inline">Selanjutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
