import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Plus, Check, Star, Clock, Calendar, ArrowLeft } from 'lucide-react';
import { moviesApi } from '@/api/movies';
import { MovieDetails } from '@/types/tmdb';
import { MovieRow } from '@/components/media/MovieRow';
import { VideoPlayerModal } from '@/components/media/VideoPlayerModal';
import { watchlistApi } from '@/api/watchlist';
import { getTMDBImageUrl, getDirectTMDBUrl } from '@/utils/image';

export const MovieDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInList, setIsInList] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [backdropError, setBackdropError] = useState(false);
  const [posterError, setPosterError] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setBackdropError(false);
    setPosterError(false);
    moviesApi
      .getMovieDetails(id)
      .then((data) => {
        setMovie(data);
        watchlistApi.check('movie', Number(id)).then(setIsInList).catch(() => {});
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [id]);

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
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
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
      ? getDirectTMDBUrl(movie.backdrop_path, 'original')
      : getTMDBImageUrl(movie.backdrop_path, 'original')
    : '';

  const posterUrl = movie.poster_path
    ? posterError
      ? getDirectTMDBUrl(movie.poster_path, 'w500')
      : getTMDBImageUrl(movie.poster_path, 'w500')
    : '/placeholder.svg';

  const releaseYear = (movie.release_date || '').split('-')[0];
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}j ${movie.runtime % 60}m` : null;

  return (
    <div className="min-h-screen bg-[#141414] pb-20">
      {/* Hero Backdrop */}
      <div className="relative w-full h-[55vh] sm:h-[70vh] bg-black overflow-hidden">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 -mt-32 sm:-mt-48 flex flex-col md:flex-row gap-8">
        {/* Poster */}
        <div className="flex-shrink-0 w-48 sm:w-64 md:w-72 mx-auto md:mx-0 rounded-2xl overflow-hidden shadow-2xl border border-gray-800 bg-[#18181b]">
          <img
            src={posterUrl}
            alt={movie.title}
            onError={() => setPosterError(true)}
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Details */}
        <div className="flex-1 space-y-4 text-white">
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-300">
            {movie.vote_average && (
              <div className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">
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
            <span className="px-2 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-500/30 uppercase text-[10px] font-bold">
              Film
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">{movie.title}</h1>
          {movie.tagline && <p className="text-sm italic text-gray-400">"{movie.tagline}"</p>}

          {/* Genres */}
          <div className="flex flex-wrap gap-2 pt-1">
            {movie.genres?.map((g: any) => (
              <span key={g.id} className="px-3 py-1 rounded-full bg-gray-800 text-xs text-gray-300 border border-gray-700">
                {g.name}
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={() => setIsPlayerOpen(true)}
              className="flex items-center space-x-2 px-8 py-3.5 rounded-xl bg-[#e50914] hover:bg-red-700 text-white font-bold text-base shadow-xl shadow-red-600/30 transition-transform hover:scale-105 active:scale-95"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Nonton Sekarang</span>
            </button>

            <button
              onClick={toggleWatchlist}
              className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-gray-800/90 hover:bg-gray-700 text-white font-semibold text-sm border border-gray-700 transition-colors"
            >
              {isInList ? <Check className="w-4 h-4 text-emerald-400" /> : <Plus className="w-4 h-4" />}
              <span>{isInList ? 'Di Daftar Saya' : 'Tambah ke Daftar'}</span>
            </button>
          </div>

          {/* Overview */}
          <div className="pt-4 space-y-2">
            <h3 className="text-lg font-bold text-gray-200">Sinopsis</h3>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">{movie.overview}</p>
          </div>

          {/* Cast */}
          {(movie.credits?.cast?.length ?? 0) > 0 && (
            <div className="pt-6 space-y-3">
              <h3 className="text-lg font-bold text-gray-200">Pemeran Utama</h3>
              <div className="flex space-x-4 overflow-x-auto no-scrollbar py-2">
                {(movie.credits?.cast || []).slice(0, 10).map((cast: any) => (
                  <div key={cast.id} className="flex-shrink-0 w-24 text-center space-y-1">
                    <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-gray-800 border border-gray-700 shadow-md">
                      {cast.profile_path ? (
                        <img
                          src={getTMDBImageUrl(cast.profile_path, 'w185')}
                          alt={cast.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = getDirectTMDBUrl(cast.profile_path, 'w185');
                          }}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm text-gray-400 font-bold bg-zinc-800">
                          {cast.name?.[0] || '?'}
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-white line-clamp-1">{cast.name}</p>
                    <p className="text-[10px] text-gray-400 line-clamp-1">{cast.character}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      {(movie.recommendations?.results?.length ?? 0) > 0 && (
        <div className="max-w-7xl mx-auto mt-16">
          <MovieRow title="Rekomendasi Serupa" items={movie.recommendations?.results || []} />
        </div>
      )}

      {/* Video Player Modal */}
      <VideoPlayerModal
        isOpen={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}
        tmdbId={movie.id}
        mediaType="movie"
        title={movie.title}
        subTitle={releaseYear ? `Tahun ${releaseYear}` : undefined}
      />
    </div>
  );
};
