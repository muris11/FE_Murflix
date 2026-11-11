import React, { useEffect, useState, useTransition } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, Sparkles, TrendingUp, Flame, Film, Tv, Clapperboard } from 'lucide-react';
import { moviesApi } from '@/api/movies';
import { MovieCard } from '@/components/media/MovieCard';
import { MovieCardSkeleton } from '@/components/media/MovieCardSkeleton';
import { MediaItem } from '@/types/tmdb';

const TRENDING_KEYWORDS = [
  { label: '🔥 Sedang Tren', query: 'Action' },
  { label: '🚀 Fiksi Ilmiah', query: 'Sci-Fi' },
  { label: '👻 Horor', query: 'Horror' },
  { label: '🎭 Drama', query: 'Drama' },
  { label: '😂 Komedi', query: 'Comedy' },
  { label: '💥 Superhero', query: 'Avengers' },
  { label: '🐉 Petualangan', query: 'Adventure' },
  { label: '💖 Romantis', query: 'Romance' },
  { label: '✨ Anime', query: 'Animation' },
  { label: '🕵️ Misteri', query: 'Mystery' },
];

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [inputVal, setInputVal] = useState(queryParam);
  const [activeType, setActiveType] = useState<'multi' | 'movie' | 'tv'>('multi');

  // Search Results State
  const [results, setResults] = useState<MediaItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Recommendations State (for empty query or zero-result fallback)
  const [trendingItems, setTrendingItems] = useState<MediaItem[]>([]);
  const [popularMovies, setPopularMovies] = useState<MediaItem[]>([]);
  const [popularTV, setPopularTV] = useState<MediaItem[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(true);

  const [, startTransition] = useTransition();

  // Load recommendations once on page mount
  useEffect(() => {
    setIsLoadingRecommendations(true);
    Promise.all([
      moviesApi.getTrending('all', 'week').catch(() => ({ results: [] })),
      moviesApi.getPopularMovies(1).catch(() => ({ results: [] })),
      moviesApi.getPopularTV(1).catch(() => ({ results: [] })),
    ])
      .then(([trendingRes, moviesRes, tvRes]) => {
        setTrendingItems((trendingRes.results || []).slice(0, 12));
        setPopularMovies((moviesRes.results || []).slice(0, 12));
        setPopularTV((tvRes.results || []).slice(0, 12));
      })
      .finally(() => setIsLoadingRecommendations(false));
  }, []);

  // Sync input with URL param when URL changes
  useEffect(() => {
    setInputVal(queryParam);
  }, [queryParam]);

  // Execute Search whenever query or type changes
  useEffect(() => {
    if (!queryParam.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    moviesApi
      .search(queryParam.trim(), activeType, 1)
      .then((res) => {
        const filtered = (res.results || []).filter(
          (item) => item.poster_path && (item.title || item.name)
        );
        setResults(filtered);
      })
      .catch((err) => {
        console.error('Search error:', err);
        setResults([]);
      })
      .finally(() => setIsSearching(false));
  }, [queryParam, activeType]);

  // Debounced live typing update
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputVal.trim() !== queryParam.trim()) {
        startTransition(() => {
          if (inputVal.trim()) {
            setSearchParams({ q: inputVal.trim() });
          } else {
            setSearchParams({});
          }
        });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [inputVal, queryParam, setSearchParams]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      setSearchParams({ q: inputVal.trim() });
    } else {
      setSearchParams({});
    }
  };

  const clearSearch = () => {
    setInputVal('');
    setSearchParams({});
  };

  const selectKeyword = (kw: string) => {
    setInputVal(kw);
    setSearchParams({ q: kw });
  };

  return (
    <div className="min-h-screen bg-[#141414] pt-24 pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      
      {/* Search Input Hero Bar */}
      <div className="max-w-3xl mx-auto space-y-4">
        <form onSubmit={handleFormSubmit} className="relative group">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Cari film, serial TV, aktor, atau genre favorit..."
            className="w-full bg-zinc-900/90 border border-white/10 text-white placeholder-zinc-500 rounded-2xl px-5 py-4 pl-12 pr-12 text-base sm:text-lg focus:outline-none focus:border-[#e50914] focus:ring-2 focus:ring-red-600/30 transition-all shadow-2xl backdrop-blur-xl"
            autoFocus
          />
          <Search className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#e50914] transition-colors" />
          
          {inputVal && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
              title="Hapus pencarian"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* Quick Keyword / Genre Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
          {TRENDING_KEYWORDS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => selectKeyword(item.query)}
              className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 border border-white/5 hover:border-red-500/40 text-zinc-300 hover:text-white transition-all transform hover:scale-105 active:scale-95"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* =====================================================================
          STATE 1: HAS ACTIVE SEARCH QUERY
          ===================================================================== */}
      {queryParam.trim() ? (
        <div className="space-y-6">
          {/* Header & Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Hasil Pencarian: <span className="text-[#e50914]">"{queryParam}"</span>
              </h2>
              {!isSearching && (
                <p className="text-xs text-zinc-400 mt-0.5">
                  Ditemukan {results.length} judul yang cocok
                </p>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-zinc-900 border border-white/5 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveType('multi')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  activeType === 'multi' ? 'bg-[#e50914] text-white shadow-md' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setActiveType('movie')}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  activeType === 'movie' ? 'bg-[#e50914] text-white shadow-md' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Film className="w-3 h-3" />
                <span>Film</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveType('tv')}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  activeType === 'tv' ? 'bg-[#e50914] text-white shadow-md' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Tv className="w-3 h-3" />
                <span>Serial TV</span>
              </button>
            </div>
          </div>

          {/* Results Grid / Loading / Empty */}
          {isSearching ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <MovieCardSkeleton key={i} />
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {results.map((item) => (
                <MovieCard key={`${item.media_type || 'item'}-${item.id}`} item={item} />
              ))}
            </div>
          ) : (
            /* Zero Search Result Fallback -> Show Recommendations Immediately */
            <div className="space-y-12 py-6">
              <div className="text-center py-10 bg-zinc-900/40 rounded-2xl border border-zinc-800/60 p-8 space-y-2">
                <Clapperboard className="w-12 h-12 text-zinc-600 mx-auto" />
                <h3 className="text-lg font-bold text-white">Tidak ada judul untuk "{queryParam}"</h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Coba periksa ejaan, gunakan kata kunci dalam bahasa Inggris, atau jelajahi koleksi terpopuler berikut:
                </p>
              </div>

              {/* Instant Recommendations */}
              {trendingItems.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Flame className="w-5 h-5 text-[#e50914]" />
                    <h3 className="text-lg sm:text-xl font-black text-white">Rekomendasi Terpopuler Hari Ini</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {trendingItems.map((item) => (
                      <MovieCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* =====================================================================
           STATE 2: EMPTY QUERY (NEVER BLANK! FULL RECOMMENDATIONS)
           ===================================================================== */
        <div className="space-y-12">
          
          {/* Section 1: Paling Banyak Dicari Hari Ini */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3">
              <Flame className="w-5 h-5 text-[#e50914]" />
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Paling Banyak Dicari Hari Ini
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 font-bold ml-2">
                Trending
              </span>
            </div>

            {isLoadingRecommendations ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <MovieCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {trendingItems.map((item) => (
                  <MovieCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Film Terpopuler */}
          {popularMovies.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3">
                <Film className="w-5 h-5 text-red-500" />
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Film Pilihan Terbaik
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {popularMovies.map((item) => (
                  <MovieCard key={`movie-${item.id}`} item={{ ...item, media_type: 'movie' }} />
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Serial TV Hangat */}
          {popularTV.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3">
                <Tv className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Serial TV Paling Seru
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {popularTV.map((item) => (
                  <MovieCard key={`tv-${item.id}`} item={{ ...item, media_type: 'tv' }} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
