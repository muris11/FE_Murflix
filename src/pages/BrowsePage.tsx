import React, { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { moviesApi } from '@/api/movies';
import { MovieCard } from '@/components/media/MovieCard';
import { MovieCardSkeleton } from '@/components/media/MovieCardSkeleton';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
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

  const PAGE_SIZE = 24;

  // Fetch paginated discover data (24 items to perfectly fill 8-col grid with 3 full rows)
  useEffect(() => {
    setIsLoading(true);
    const baseParams: Record<string, string | number> = {
      sort_by: currentSort,
    };
    if (currentGenre) {
      baseParams.with_genres = currentGenre;
    }

    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const tmdbPageStart = Math.floor(startIndex / 20) + 1;
    const tmdbPageEnd = Math.floor((currentPage * PAGE_SIZE - 1) / 20) + 1;

    const pagesToFetch =
      tmdbPageStart === tmdbPageEnd
        ? [tmdbPageStart]
        : [tmdbPageStart, tmdbPageEnd];

    Promise.all(
      pagesToFetch.map((p) =>
        moviesApi.discover(mediaType, { ...baseParams, page: p })
      )
    )
      .then((responses) => {
        const combinedResults: MediaItem[] = [];
        responses.forEach((res) => {
          if (res?.results) {
            combinedResults.push(...res.results);
          }
        });

        const offset = startIndex - (tmdbPageStart - 1) * 20;
        const pageItems = combinedResults.slice(offset, offset + PAGE_SIZE);

        setItems(pageItems);

        const totalResultsCount = responses[0]?.total_results || 0;
        setTotalResults(totalResultsCount);
        // TMDB max results is 10,000 (500 TMDB pages) -> 10,000 / 24 = ~416 pages
        const maxPages = Math.min(Math.ceil(totalResultsCount / PAGE_SIZE), 416);
        setTotalPages(Math.max(1, maxPages));
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
    <div className="min-h-screen bg-[#141414] pt-24 pb-20 px-4 sm:px-8 md:px-12 lg:px-16 w-full space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div className="flex items-center space-x-3">
          {isTV ? <Tv className="w-8 h-8 text-[#e50914]" /> : <Film className="w-8 h-8 text-[#e50914]" />}
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {isTV ? 'Katalog Serial TV' : 'Katalog Film'}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              Halaman {currentPage} dari {totalPages.toLocaleString()} - Menampilkan 24 judul per halaman
            </p>
          </div>
        </div>

        {/* Filters Bar: Custom Netflix-Style Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Custom Genre Dropdown */}
          <CustomDropdown
            value={currentGenre}
            onChange={(val) => updateFilters(1, val)}
            options={[
              { value: '', label: 'Semua Genre' },
              ...genres.map((g) => ({ value: String(g.id), label: g.name })),
            ]}
            className="w-44"
          />

          {/* Custom Sort Dropdown */}
          <CustomDropdown
            value={currentSort}
            onChange={(val) => updateFilters(1, undefined, val)}
            options={[
              { value: 'popularity.desc', label: 'Terpopuler' },
              { value: 'vote_average.desc', label: 'Rating Tertinggi' },
              {
                value: isTV ? 'first_air_date.desc' : 'primary_release_date.desc',
                label: 'Rilis Terbaru',
              },
            ]}
            className="w-48"
          />
        </div>
      </div>

      {/* Grid Content */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-4">
          {Array.from({ length: 24 }).map((_, i) => (
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-4">
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
