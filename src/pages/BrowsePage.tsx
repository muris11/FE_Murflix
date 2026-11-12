import React, { useEffect, useState } from 'react';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { moviesApi } from '@/api/movies';
import { MovieCard } from '@/components/media/MovieCard';
import { MovieCardSkeleton } from '@/components/media/MovieCardSkeleton';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import {
  Film,
  Tv,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  RotateCcw,
  Globe,
  Calendar,
  Sparkles,
  ArrowUpDown,
} from 'lucide-react';
import { MediaItem } from '@/types/tmdb';
import {
  COUNTRY_OPTIONS,
  YEAR_OPTIONS,
  SORT_OPTIONS,
  buildDiscoverParams,
} from '@/constants/catalogFilters';

export const BrowsePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const isTV = location.pathname.includes('/tv');
  const mediaType: 'movie' | 'tv' = isTV ? 'tv' : 'movie';

  const currentPage = Number(searchParams.get('page')) || 1;
  const currentGenre = searchParams.get('genre') || '';
  const currentCountry = searchParams.get('country') || '';
  const currentYear = searchParams.get('year') || '';
  const currentSort = searchParams.get('sort') || 'popularity.desc';

  const [items, setItems] = useState<MediaItem[]>([]);
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch genres for current mediaType
  useEffect(() => {
    moviesApi
      .getGenres(mediaType)
      .then((res) => setGenres(res.genres || []))
      .catch(() => {});
  }, [mediaType]);

  const PAGE_SIZE = 24;

  // Fetch paginated discover data
  useEffect(() => {
    setIsLoading(true);

    const baseParams = buildDiscoverParams(mediaType, {
      genre: currentGenre,
      country: currentCountry,
      year: currentYear,
      sort: currentSort,
    });

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
      .catch((err) => console.error('Failed to load discover items:', err))
      .finally(() => {
        setIsLoading(false);
      });
  }, [mediaType, currentPage, currentGenre, currentCountry, currentYear, currentSort]);

  const updateFilters = (updates: {
    page?: number;
    genre?: string;
    country?: string;
    year?: string;
    sort?: string;
  }) => {
    const nextParams: Record<string, string> = {};

    const nextP = updates.page !== undefined ? updates.page : 1;
    if (nextP > 1) nextParams.page = String(nextP);

    const nextG = updates.genre !== undefined ? updates.genre : currentGenre;
    if (nextG) nextParams.genre = nextG;

    const nextC = updates.country !== undefined ? updates.country : currentCountry;
    if (nextC) nextParams.country = nextC;

    const nextY = updates.year !== undefined ? updates.year : currentYear;
    if (nextY) nextParams.year = nextY;

    const nextS = updates.sort !== undefined ? updates.sort : currentSort;
    if (nextS && nextS !== 'popularity.desc') nextParams.sort = nextS;

    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setSearchParams({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSwitchType = (type: 'movie' | 'tv') => {
    const targetPath = type === 'tv' ? '/browse/tv' : '/browse/movies';
    const params: Record<string, string> = {};
    if (currentCountry) params.country = currentCountry;
    if (currentYear) params.year = currentYear;
    if (currentSort && currentSort !== 'popularity.desc') params.sort = currentSort;
    const query = new URLSearchParams(params).toString();
    navigate(`${targetPath}${query ? `?${query}` : ''}`);
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

  // Active filter labels
  const selectedGenreLabel = genres.find((g) => String(g.id) === currentGenre)?.name;
  const selectedCountryLabel = COUNTRY_OPTIONS.find((c) => c.value === currentCountry)?.label;
  const selectedYearLabel = YEAR_OPTIONS.find((y) => y.value === currentYear)?.label;
  const selectedSortLabel = SORT_OPTIONS.find((s) => s.value === currentSort)?.label;

  const hasActiveFilters = Boolean(
    currentGenre || currentCountry || currentYear || (currentSort && currentSort !== 'popularity.desc')
  );

  return (
    <div className="min-h-screen bg-[#0f0f12] text-white pt-20 sm:pt-24 pb-20 px-3 sm:px-6 md:px-10 lg:px-12 xl:px-16 2xl:px-20 max-w-[2400px] mx-auto w-full space-y-6">
      
      {/* Top Header & Type Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#e50914] shadow-lg flex-shrink-0">
            {isTV ? <Tv className="w-6 h-6" /> : <Film className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                {isTV ? 'Katalog Serial TV' : 'Katalog Film'}
              </h1>
              {hasActiveFilters && (
                <span className="px-2 py-0.5 rounded-full bg-red-950/40 border border-red-500/40 text-[10px] font-bold text-[#e50914] uppercase">
                  Terfilter
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              Halaman {currentPage} dari {totalPages.toLocaleString()} • Menampilkan 24 judul per halaman
            </p>
          </div>
        </div>

        {/* Media Type Tabs (Film vs Serial TV) */}
        <div className="inline-flex items-center p-1 rounded-2xl bg-zinc-900/90 border border-zinc-800 self-start lg:self-auto shadow-md">
          <button
            type="button"
            onClick={() => handleSwitchType('movie')}
            className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all cursor-pointer ${
              !isTV
                ? 'bg-[#e50914] text-white shadow-md shadow-red-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Katalog Film</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchType('tv')}
            className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all cursor-pointer ${
              isTV
                ? 'bg-[#e50914] text-white shadow-md shadow-red-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>Katalog Serial TV</span>
          </button>
        </div>
      </div>

      {/* Advanced Filter Toolbar (Responsive Grid on Mobile, Flex on Desktop) */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-[#141418] border border-zinc-800/90 space-y-3.5 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono">
            <Filter className="w-3.5 h-3.5 text-[#e50914]" />
            <span>Filter Eksplorasi:</span>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-zinc-400 hover:text-[#e50914] flex items-center space-x-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        {/* 4 Primary Filter Dropdowns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
          {/* 1. Country Filter */}
          <div>
            <span className="block text-[10px] font-semibold text-zinc-400 mb-1">Negara / Asal:</span>
            <CustomDropdown
              value={currentCountry}
              onChange={(val) => updateFilters({ page: 1, country: val })}
              options={COUNTRY_OPTIONS}
              className="w-full"
            />
          </div>

          {/* 2. Genre Filter */}
          <div>
            <span className="block text-[10px] font-semibold text-zinc-400 mb-1">Genre:</span>
            <CustomDropdown
              value={currentGenre}
              onChange={(val) => updateFilters({ page: 1, genre: val })}
              options={[
                { value: '', label: 'Semua Genre' },
                ...genres.map((g) => ({ value: String(g.id), label: g.name })),
              ]}
              className="w-full"
            />
          </div>

          {/* 3. Year Filter */}
          <div>
            <span className="block text-[10px] font-semibold text-zinc-400 mb-1">Tahun Rilis:</span>
            <CustomDropdown
              value={currentYear}
              onChange={(val) => updateFilters({ page: 1, year: val })}
              options={YEAR_OPTIONS}
              className="w-full"
            />
          </div>

          {/* 4. Sort Filter */}
          <div>
            <span className="block text-[10px] font-semibold text-zinc-400 mb-1">Urutan:</span>
            <CustomDropdown
              value={currentSort}
              onChange={(val) => updateFilters({ page: 1, sort: val })}
              options={SORT_OPTIONS}
              className="w-full"
            />
          </div>
        </div>

        {/* Active Filter Chips Bar */}
        {hasActiveFilters && (
          <div className="pt-2 border-t border-zinc-800/70 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-zinc-500 font-semibold text-[11px]">Filter Aktif:</span>

            {selectedCountryLabel && currentCountry && (
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-200 border border-zinc-700 text-[11px] font-medium">
                <Globe className="w-3 h-3 text-[#e50914]" />
                <span>{selectedCountryLabel}</span>
                <button
                  type="button"
                  onClick={() => updateFilters({ page: 1, country: '' })}
                  className="hover:text-red-400 cursor-pointer ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedGenreLabel && (
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-200 border border-zinc-700 text-[11px] font-medium">
                <Film className="w-3 h-3 text-[#e50914]" />
                <span>{selectedGenreLabel}</span>
                <button
                  type="button"
                  onClick={() => updateFilters({ page: 1, genre: '' })}
                  className="hover:text-red-400 cursor-pointer ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedYearLabel && currentYear && (
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-200 border border-zinc-700 text-[11px] font-medium">
                <Calendar className="w-3 h-3 text-[#e50914]" />
                <span>{selectedYearLabel}</span>
                <button
                  type="button"
                  onClick={() => updateFilters({ page: 1, year: '' })}
                  className="hover:text-red-400 cursor-pointer ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedSortLabel && currentSort !== 'popularity.desc' && (
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-200 border border-zinc-700 text-[11px] font-medium">
                <ArrowUpDown className="w-3 h-3 text-[#e50914]" />
                <span>{selectedSortLabel}</span>
                <button
                  type="button"
                  onClick={() => updateFilters({ page: 1, sort: 'popularity.desc' })}
                  className="hover:text-red-400 cursor-pointer ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Grid Content */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3 sm:gap-4 [content-visibility:auto] [contain-intrinsic-size:0_850px] transform-gpu">
          {Array.from({ length: 24 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 p-6 rounded-2xl bg-[#141418] border border-zinc-800 space-y-3">
          <Filter className="w-10 h-10 text-zinc-500 mx-auto" />
          <h3 className="text-base sm:text-lg font-bold text-white">
            Tidak ada judul yang ditemukan
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
            Coba ubah kombinasi negara, genre, atau tahun rilis untuk menemukan judul lainnya.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#e50914] hover:bg-red-700 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Semua Filter</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3 sm:gap-4 [content-visibility:auto] [contain-intrinsic-size:0_850px] transform-gpu">
          {items.map((item) => (
            <MovieCard key={item.id} item={{ ...item, media_type: mediaType }} />
          ))}
        </div>
      )}

      {/* Netflix 1:1 Responsive Pagination Controls */}
      {!isLoading && totalPages > 1 && (
        <div className="pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-400">
            Halaman <strong className="text-white">{currentPage}</strong> dari{' '}
            <strong className="text-white">{totalPages.toLocaleString()}</strong> ({totalResults.toLocaleString()} total judul)
          </p>

          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {/* Prev Button */}
            <button
              type="button"
              onClick={() => updateFilters({ page: currentPage - 1 })}
              disabled={currentPage <= 1}
              className="px-3 sm:px-4 py-2 rounded-xl bg-[#18181b] border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-600 disabled:opacity-30 disabled:hover:border-zinc-800 transition-all flex items-center space-x-1 cursor-pointer"
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
                    type="button"
                    onClick={() => updateFilters({ page: pNum })}
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
              type="button"
              onClick={() => updateFilters({ page: currentPage + 1 })}
              disabled={currentPage >= totalPages}
              className="px-3 sm:px-4 py-2 rounded-xl bg-[#18181b] border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-600 disabled:opacity-30 disabled:hover:border-zinc-800 transition-all flex items-center space-x-1 cursor-pointer"
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
