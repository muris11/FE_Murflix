import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Play, Plus, Check, Star, Clock, Calendar, ArrowLeft } from 'lucide-react';
import { moviesApi } from '@/api/movies';
import { MovieDetails } from '@/types/tmdb';
import { MovieRow } from '@/components/media/MovieRow';
import { PersonModal } from '@/components/media/PersonModal';
import { WatchProvidersBadge } from '@/components/media/WatchProvidersBadge';
import { CollectionSection } from '@/components/media/CollectionSection';
import { watchlistApi } from '@/api/watchlist';
import { getTMDBImageUrl, getDirectTMDBUrl } from '@/utils/image';
import { extractIdFromSlug, getWatchMovieUrl, resolveMediaId, getCachedIdFromSlug } from '@/utils/slug';

export const MovieDetailPage: React.FC = () => {
  const { id: rawSlugId } = useParams<{ id: string }>();
  const [resolvedId, setResolvedId] = useState<string | null>(() => {
    const extracted = extractIdFromSlug(rawSlugId);
    return /^\d+$/.test(extracted) ? extracted : getCachedIdFromSlug('movie', rawSlugId || '');
  });
  const navigate = useNavigate();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInList, setIsInList] = useState(false);
  const [backdropError, setBackdropError] = useState(false);
  const [posterError, setPosterError] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);

  useEffect(() => {
    if (!rawSlugId) return;
    let isMounted = true;
    resolveMediaId(rawSlugId, 'movie').then((id) => {
      if (isMounted && id) setResolvedId(id);
    });
    return () => {
      isMounted = false;
    };
  }, [rawSlugId]);

  useEffect(() => {
    if (!resolvedId) return;
    setIsLoading(true);
    setBackdropError(false);
    setPosterError(false);
    moviesApi
      .getMovieDetails(resolvedId)
      .then((data) => {
        setMovie(data);
        const year = data.release_date ? ` (${data.release_date.slice(0, 4)})` : '';
        document.title = `${data.title || 'Film'}${year} - Nonton Streaming di Murflix`;
        watchlistApi.check('movie', Number(resolvedId)).then(setIsInList).catch(() => {});
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [resolvedId]);

  const toggleWatchlist = async () => {
    if (!movie) return;
    try {
      if (isInList) {
        await watchlistApi.remove('movie', movie.id);
        setIsInList(false);
      } else {
        await watchlistApi.add({
          media_type: 'movie',
          tmdb_id: movie.id,
          title: movie.title || 'Untitled',
          poster_path: movie.poster_path,
          backdrop_path: movie.backdrop_path,
          vote_average: movie.vote_average,
        });
        setIsInList(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#141414] pb-24">
        {/* 1:1 Hero Backdrop Skeleton */}
        <div className="relative w-full h-[50vh] sm:h-[65vh] bg-zinc-900 animate-pulse overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/90 via-[#141414]/40 to-transparent w-full md:w-3/4" />
          <div className="absolute top-20 left-4 sm:left-8 z-30 w-28 h-9 rounded-full bg-zinc-800/90 border border-white/5" />
        </div>

        {/* 1:1 Main Info Skeleton */}
        <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 relative z-20 -mt-28 sm:-mt-44 flex flex-col md:flex-row gap-8 animate-pulse">
          {/* 1:1 Poster Skeleton */}
          <div className="flex-shrink-0 w-44 sm:w-60 md:w-68 mx-auto md:mx-0 self-start">
            <div className="aspect-[2/3] w-full rounded-2xl bg-zinc-800 border border-white/10 shadow-2xl" />
          </div>

          {/* 1:1 Details Content Skeleton */}
          <div className="flex-1 space-y-4 text-white">
            {/* Metadata Badges */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-14 h-5 rounded bg-amber-500/20 border border-amber-500/30" />
              <div className="w-14 h-5 rounded bg-zinc-800" />
              <div className="w-16 h-5 rounded bg-zinc-800" />
              <div className="w-12 h-5 rounded bg-red-900/40 border border-red-500/30" />
            </div>

            {/* Title */}
            <div className="h-9 sm:h-12 bg-zinc-800 rounded-xl w-3/4 max-w-lg" />
            <div className="h-4 bg-zinc-800/60 rounded w-1/2 max-w-sm" />

            {/* Genres */}
            <div className="flex flex-wrap gap-2 pt-1">
              <div className="w-20 h-7 rounded-full bg-zinc-800" />
              <div className="w-24 h-7 rounded-full bg-zinc-800" />
              <div className="w-16 h-7 rounded-full bg-zinc-800" />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <div className="w-44 h-12 rounded-full bg-[#e50914]/80 shadow-lg" />
              <div className="w-40 h-12 rounded-full bg-zinc-800 border border-white/10" />
            </div>

            {/* Synopsis */}
            <div className="pt-4 space-y-2.5 max-w-3xl">
              <div className="h-5 bg-zinc-800 rounded w-24" />
              <div className="h-4 bg-zinc-800/80 rounded w-full" />
              <div className="h-4 bg-zinc-800/80 rounded w-5/6" />
              <div className="h-4 bg-zinc-800/70 rounded w-4/6" />
            </div>

            {/* Cast Avatars */}
            <div className="pt-6 space-y-3">
              <div className="h-5 bg-zinc-800 rounded w-32" />
              <div className="flex space-x-4 overflow-x-auto no-scrollbar py-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-24 text-center space-y-2">
                    <div className="w-20 h-20 mx-auto rounded-full bg-zinc-800 border border-white/5" />
                    <div className="h-3 bg-zinc-800 rounded w-16 mx-auto" />
                    <div className="h-2.5 bg-zinc-800/60 rounded w-12 mx-auto" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center text-white space-y-4">
        <h2 className="text-xl font-bold">Film tidak ditemukan</h2>
        <Link to="/" className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition-colors">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const backdropUrl = movie.backdrop_path
    ? backdropError
      ? getDirectTMDBUrl(movie.backdrop_path, 'w1280')
      : getTMDBImageUrl(movie.backdrop_path, 'w1280')
    : '';

  const posterUrl = movie.poster_path
    ? posterError
      ? getDirectTMDBUrl(movie.poster_path, 'w342')
      : getTMDBImageUrl(movie.poster_path, 'w342')
    : '/placeholder.svg';

  const releaseYear = (movie.release_date || '').split('-')[0];
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}j ${movie.runtime % 60}m` : null;

  return (
    <div className="min-h-screen bg-[#141414] pb-24">
      {/* Hero Backdrop */}
      <div className="relative w-full h-[50vh] sm:h-[65vh] bg-black overflow-hidden">
        {backdropUrl && (
          <img
            src={backdropUrl}
            alt={movie.title}
            onError={() => setBackdropError(true)}
            className="w-full h-full object-cover object-center scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/90 via-[#141414]/40 to-transparent w-full md:w-3/4" />

        <div className="absolute top-20 left-4 sm:left-8 z-30">
          <Link to="/" className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white bg-black/60 px-4 py-2 rounded-full backdrop-blur-md border border-gray-700 shadow-lg transition-transform hover:scale-105">
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </Link>
        </div>
      </div>

      {/* Main Info */}
      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 relative z-20 -mt-28 sm:-mt-44 flex flex-col md:flex-row gap-8">
        
        {/* Snug Poster Container (Zero gap, 2:3 ratio) */}
        <div className="flex-shrink-0 w-44 sm:w-60 md:w-68 mx-auto md:mx-0 self-start">
          <div className="aspect-[2/3] w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-zinc-900 ring-1 ring-white/10">
            <img
              src={posterUrl}
              alt={movie.title}
              onError={() => setPosterError(true)}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Details Content */}
        <div className="flex-1 space-y-4 text-white">
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-300">
            {movie.vote_average && (
              <div className="flex items-center space-x-1 text-amber-400 font-bold">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{movie.vote_average.toFixed(1)}</span>
              </div>
            )}
            {releaseYear && (
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>{releaseYear}</span>
              </span>
            )}
            {runtime && (
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span>{runtime}</span>
              </span>
            )}
            <span className="text-red-400 uppercase text-xs font-bold">
              Film
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">{movie.title}</h1>
          {movie.tagline && <p className="text-sm italic text-gray-400">"{movie.tagline}"</p>}

          {/* Genres & Watch Providers */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="flex flex-wrap gap-2">
              {movie.genres?.map((g: any) => (
                <span key={g.id} className="px-3 py-1 rounded-full bg-gray-800 text-xs text-gray-300 border border-gray-700">
                  {g.name}
                </span>
              ))}
            </div>

            <WatchProvidersBadge providersData={movie['watch/providers']} />
          </div>

          {/* Action Buttons (1:1 Netflix Style - Direct Cinema Watch) */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 sm:gap-4 pt-4 w-full">
            <button
              onClick={() => navigate(getWatchMovieUrl(movie.id, movie.title))}
              className="w-full sm:w-auto flex items-center justify-center space-x-1.5 sm:space-x-2 px-3 sm:px-8 py-3 rounded-full bg-[#e50914] hover:bg-red-700 text-white font-extrabold text-xs sm:text-base shadow-lg shadow-red-950/60 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white ml-0.5 flex-shrink-0" />
              <span className="truncate">Nonton Sekarang</span>
            </button>

            <button
              onClick={toggleWatchlist}
              className="w-full sm:w-auto flex items-center justify-center space-x-1.5 sm:space-x-2 px-3 sm:px-6 py-3 rounded-full bg-zinc-800/90 hover:bg-zinc-700 text-white font-semibold text-xs sm:text-sm border border-white/10 transition-colors cursor-pointer"
            >
              {isInList ? <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <Plus className="w-4 h-4 flex-shrink-0" />}
              <span className="truncate">{isInList ? 'Di Daftar' : 'Daftar Saya'}</span>
            </button>
          </div>

          {/* Overview */}
          <div className="pt-4 space-y-2">
            <h3 className="text-lg font-bold text-gray-200">Sinopsis</h3>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">{movie.overview}</p>
          </div>

          {/* Cast Avatars (Clickable to open PersonModal) */}
          {(movie.credits?.cast?.length ?? 0) > 0 && (
            <div className="pt-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-200">Pemeran Utama</h3>
                <span className="text-xs text-gray-500">Klik aktor untuk melihat profil & karya</span>
              </div>
              <div className="flex space-x-4 overflow-x-auto no-scrollbar py-2">
                {(movie.credits?.cast || []).slice(0, 12).map((cast: any) => (
                  <button
                    key={cast.id}
                    onClick={() => setSelectedPersonId(cast.id)}
                    className="flex-shrink-0 w-24 text-center space-y-1.5 group focus:outline-none"
                  >
                    <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-gray-800 border-2 border-transparent group-hover:border-red-500 shadow-md group-hover:scale-105 transition-all">
                      {cast.profile_path ? (
                        <img
                          src={getTMDBImageUrl(cast.profile_path, 'w185')}
                          alt={cast.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = getDirectTMDBUrl(cast.profile_path, 'w185');
                          }}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm text-gray-400 font-bold bg-zinc-800">
                          {cast.name?.[0] || '?'}
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-white line-clamp-1 group-hover:text-red-400 transition-colors">
                      {cast.name}
                    </p>
                    <p className="text-[10px] text-gray-400 line-clamp-1">{cast.character}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Franchise / Collection Section (Full Width, Aligned with Page) */}
      {movie.belongs_to_collection && (
        <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 mt-12">
          <CollectionSection
            collectionId={movie.belongs_to_collection.id}
            currentMovieId={movie.id}
          />
        </div>
      )}

      {/* Similar & Recommendations */}
      {((movie.recommendations?.results?.length ?? 0) > 0 || (movie.similar?.results?.length ?? 0) > 0) && (
        <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 mt-12 space-y-10">
          {(movie.recommendations?.results?.length ?? 0) > 0 && (
            <MovieRow title="Rekomendasi Serupa" items={movie.recommendations?.results || []} />
          )}
          {(movie.similar?.results?.length ?? 0) > 0 && (
            <MovieRow title="Film Terkait Lainnya" items={movie.similar?.results || []} />
          )}
        </div>
      )}

      {/* Person Detail Modal */}
      <PersonModal
        personId={selectedPersonId}
        onClose={() => setSelectedPersonId(null)}
      />
    </div>
  );
};
