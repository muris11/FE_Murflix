import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Hero } from '@/components/media/Hero';
import { MovieRow } from '@/components/media/MovieRow';
import { MovieCard } from '@/components/media/MovieCard';
import { MovieCardSkeleton } from '@/components/media/MovieCardSkeleton';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { moviesApi } from '@/api/movies';
import { MediaItem } from '@/types/tmdb';
import {
  COUNTRY_OPTIONS,
  YEAR_OPTIONS,
  SORT_OPTIONS,
  buildDiscoverParams,
} from '@/constants/catalogFilters';
import { Filter, RotateCcw, ArrowRight, Film, Tv, Globe, Calendar, ArrowUpDown } from 'lucide-react';

export const HomePage: React.FC = () => {
  const [featured, setFeatured] = useState<MediaItem | undefined>();
  const [trending, setTrending] = useState<MediaItem[]>([]);
  const [popularMovies, setPopularMovies] = useState<MediaItem[]>([]);
  const [popularTV, setPopularTV] = useState<MediaItem[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<MediaItem[]>([]);
  const [topRatedTV, setTopRatedTV] = useState<MediaItem[]>([]);
  const [upcoming, setUpcoming] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'tv'>('movie');
  const [filterCountry, setFilterCountry] = useState<string>('');
  const [filterGenre, setFilterGenre] = useState<string>('');
  const [filterYear, setFilterYear] = useState<string>('');
  const [filterSort, setFilterSort] = useState<string>('popularity.desc');

  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);
  const [filteredResults, setFilteredResults] = useState<MediaItem[]>([]);
  const [isFilterLoading, setIsFilterLoading] = useState(false);

  // Fetch initial home rows
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          trendingRes,
          popMoviesRes,
          popTVRes,
          topMoviesRes,
          topTVRes,
          upcomingRes,
        ] = await Promise.all([
          moviesApi.getTrending('all', 'week').catch(() => ({ results: [] })),
          moviesApi.getPopularMovies().catch(() => ({ results: [] })),
          moviesApi.getPopularTV().catch(() => ({ results: [] })),
          moviesApi.getTopRatedMovies().catch(() => ({ results: [] })),
          moviesApi.getTopRatedTV().catch(() => ({ results: [] })),
          moviesApi.getUpcomingMovies().catch(() => ({ results: [] })),
        ]);

        const trendingList = trendingRes.results || [];
        const popMoviesList = popMoviesRes.results || [];
        setTrending(trendingList);
        if (trendingList.length > 0) {
          setFeatured(trendingList[0]);
        } else if (popMoviesList.length > 0) {
          setFeatured(popMoviesList[0]);
        }
        setPopularMovies(popMoviesList);
        setPopularTV(popTVRes.results || []);
        setTopRatedMovies(topMoviesRes.results || []);
        setTopRatedTV(topTVRes.results || []);
        setUpcoming(upcomingRes.results || []);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch genres for active filterType
  useEffect(() => {
    const targetType = filterType === 'tv' ? 'tv' : 'movie';
    moviesApi
      .getGenres(targetType)
      .then((res) => setGenres(res.genres || []))
      .catch(() => {});
  }, [filterType]);

  const isFilterActive = Boolean(
    filterCountry || filterGenre || filterYear || (filterSort && filterSort !== 'popularity.desc')
  );

  // Fetch live discover results when any filter is active
  useEffect(() => {
    if (!isFilterActive) {
      setFilteredResults([]);
      return;
    }

    setIsFilterLoading(true);
    const targetType = filterType === 'tv' ? 'tv' : 'movie';
    const params = buildDiscoverParams(targetType, {
      genre: filterGenre,
      country: filterCountry,
      year: filterYear,
      sort: filterSort,
    });

    moviesApi
      .discover(targetType, { ...params, page: 1 })
      .then((res) => {
        setFilteredResults(res?.results?.slice(0, 18) || []);
      })
      .catch((err) => {
        console.error('Failed to fetch filtered results:', err);
        setFilteredResults([]);
      })
      .finally(() => {
        setIsFilterLoading(false);
      });
  }, [isFilterActive, filterType, filterCountry, filterGenre, filterYear, filterSort]);

  const handleResetFilters = () => {
    setFilterCountry('');
    setFilterGenre('');
    setFilterYear('');
    setFilterSort('popularity.desc');
  };

  // Build target URL for "Buka di Katalog Lengkap"
  const getCatalogLink = () => {
    const basePath = filterType === 'tv' ? '/browse/tv' : '/browse/movies';
    const params: Record<string, string> = {};
    if (filterCountry) params.country = filterCountry;
    if (filterGenre) params.genre = filterGenre;
    if (filterYear) params.year = filterYear;
    if (filterSort && filterSort !== 'popularity.desc') params.sort = filterSort;
    const query = new URLSearchParams(params).toString();
    return `${basePath}${query ? `?${query}` : ''}`;
  };

  return (
    <div className="pb-8 overflow-x-hidden w-full min-h-screen bg-[#0f0f12]">
      {/* Full Bleed Hero Banner */}
      <Hero item={featured} />

      {/* Main Content Area */}
      <div className="relative z-20 -mt-10 sm:-mt-16 md:-mt-20 space-y-8 sm:space-y-10 w-full max-w-[2400px] mx-auto px-3 sm:px-6 md:px-10 lg:px-14 2xl:px-20">
        
        {/* Interactive Filter & Eksplorasi Cepat Bar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#141418]/95 backdrop-blur-xl border border-zinc-800/90 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-red-950/40 border border-red-500/40 flex items-center justify-center text-[#e50914] flex-shrink-0">
                <Filter className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white tracking-wide flex items-center gap-2">
                  <span>Filter & Eksplorasi Cepat</span>
                  {isFilterActive && (
                    <span className="px-2 py-0.5 rounded-full bg-[#e50914] text-white text-[10px] font-bold">
                      Aktif
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Temukan film & serial berdasarkan negara, genre, dan tahun rilis
                </p>
              </div>
            </div>

            {/* Media Type Switcher & Reset */}
            <div className="flex items-center space-x-2">
              <div className="inline-flex items-center p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
                <button
                  type="button"
                  onClick={() => setFilterType('movie')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    filterType === 'movie'
                      ? 'bg-[#e50914] text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Film
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('tv')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    filterType === 'tv'
                      ? 'bg-[#e50914] text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Serial TV
                </button>
              </div>

              {isFilterActive && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold flex items-center space-x-1 border border-zinc-700 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* 4 Interactive Dropdown Filters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
            {/* Country */}
            <div>
              <span className="block text-[10px] font-semibold text-zinc-400 mb-1">Negara / Asal:</span>
              <CustomDropdown
                value={filterCountry}
                onChange={(val) => setFilterCountry(val)}
                options={COUNTRY_OPTIONS}
                className="w-full"
              />
            </div>

            {/* Genre */}
            <div>
              <span className="block text-[10px] font-semibold text-zinc-400 mb-1">Genre:</span>
              <CustomDropdown
                value={filterGenre}
                onChange={(val) => setFilterGenre(val)}
                options={[
                  { value: '', label: 'Semua Genre' },
                  ...genres.map((g) => ({ value: String(g.id), label: g.name })),
                ]}
                className="w-full"
              />
            </div>

            {/* Year */}
            <div>
              <span className="block text-[10px] font-semibold text-zinc-400 mb-1">Tahun Rilis:</span>
              <CustomDropdown
                value={filterYear}
                onChange={(val) => setFilterYear(val)}
                options={YEAR_OPTIONS}
                className="w-full"
              />
            </div>

            {/* Sort */}
            <div>
              <span className="block text-[10px] font-semibold text-zinc-400 mb-1">Urutan:</span>
              <CustomDropdown
                value={filterSort}
                onChange={(val) => setFilterSort(val)}
                options={SORT_OPTIONS}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Live Filtered Results Section (Shown when filters are active) */}
        {isFilterActive && (
          <div className="space-y-4 p-4 sm:p-6 rounded-2xl bg-[#141418] border border-zinc-800 shadow-xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-5 bg-[#e50914] rounded-full" />
                <h3 className="text-base sm:text-lg font-black text-white tracking-wide">
                  Hasil Filter Eksplorasi ({filteredResults.length} judul)
                </h3>
              </div>

              <Link
                to={getCatalogLink()}
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#e50914] hover:text-red-400 transition-colors"
              >
                <span>Buka di Katalog Lengkap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {isFilterLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <MovieCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="py-12 text-center text-zinc-400 space-y-2">
                <p className="text-sm font-semibold">Tidak ada judul yang sesuai dengan filter ini.</p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-[#e50914] hover:underline"
                >
                  Reset Filter
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {filteredResults.map((item) => (
                  <MovieCard
                    key={item.id}
                    item={{ ...item, media_type: filterType === 'tv' ? 'tv' : 'movie' }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Standard Netflix Categories Rows */}
        <div className="space-y-8 sm:space-y-12">
          <MovieRow title="Sedang Trending Minggu Ini" items={trending} isLoading={isLoading} />
          <MovieRow title="Film Terpopuler" items={popularMovies} isLoading={isLoading} />
          <MovieRow title="Serial TV Paling Banyak Ditonton" items={popularTV} isLoading={isLoading} />
          <MovieRow title="Film Rating Tertinggi" items={topRatedMovies} isLoading={isLoading} />
          <MovieRow title="Serial TV Rating Tertinggi" items={topRatedTV} isLoading={isLoading} />
          <MovieRow title="Akan Segera Tayang" items={upcoming} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};
