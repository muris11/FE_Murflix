import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Plus, Check, Star, Calendar, ArrowLeft } from 'lucide-react';
import { moviesApi } from '@/api/movies';
import { TVDetails } from '@/types/tmdb';
import { VideoPlayerModal } from '@/components/media/VideoPlayerModal';
import { watchlistApi } from '@/api/watchlist';
import { getTMDBImageUrl, getDirectTMDBUrl } from '@/utils/image';

export const TVDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tv, setTv] = useState<TVDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInList, setIsInList] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [seasonData, setSeasonData] = useState<any>(null);
  const [backdropError, setBackdropError] = useState(false);
  const [posterError, setPosterError] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setBackdropError(false);
    setPosterError(false);
    moviesApi
      .getTVDetails(id)
      .then((data) => {
        setTv(data);
        watchlistApi.check('tv', Number(id)).then(setIsInList).catch(() => {});
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id || !tv) return;
    moviesApi
      .getTVSeason(id, selectedSeason)
      .then((data) => setSeasonData(data))
      .catch((err) => console.error(err));
  }, [id, tv, selectedSeason]);

  const toggleWatchlist = async () => {
    if (!tv) return;
    try {
      if (isInList) {
        await watchlistApi.remove('tv', tv.id);
        setIsInList(false);
      } else {
        await watchlistApi.add({
          media_type: 'tv',
          tmdb_id: tv.id,
          title: tv.name || 'Untitled',
          poster_path: tv.poster_path,
          backdrop_path: tv.backdrop_path,
          vote_average: tv.vote_average,
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

  if (!tv) {
    return (
      <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center text-white space-y-4">
        <h2 className="text-xl font-bold">Serial TV tidak ditemukan</h2>
        <Link to="/" className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition-colors">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const backdropUrl = tv.backdrop_path
    ? backdropError
      ? getDirectTMDBUrl(tv.backdrop_path, 'original')
      : getTMDBImageUrl(tv.backdrop_path, 'original')
    : '';

  const posterUrl = tv.poster_path
    ? posterError
      ? getDirectTMDBUrl(tv.poster_path, 'w500')
      : getTMDBImageUrl(tv.poster_path, 'w500')
    : '/placeholder.svg';

  const releaseYear = (tv.first_air_date || '').split('-')[0];

  return (
    <div className="min-h-screen bg-[#141414] pb-20">
      {/* Hero Backdrop */}
      <div className="relative w-full h-[55vh] sm:h-[70vh] bg-black overflow-hidden">
        {backdropUrl && (
          <img
            src={backdropUrl}
            alt={tv.name}
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
            alt={tv.name}
            onError={() => setPosterError(true)}
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Details */}
        <div className="flex-1 space-y-4 text-white">
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-300">
            {tv.vote_average && (
              <div className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{tv.vote_average.toFixed(1)}</span>
              </div>
            )}
            {releaseYear && (
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>{releaseYear}</span>
              </span>
            )}
            <span className="px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30 uppercase text-[10px] font-bold">
              {tv.number_of_seasons} Season • {tv.number_of_episodes} Episode
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">{tv.name}</h1>
          {tv.tagline && <p className="text-sm italic text-gray-400">"{tv.tagline}"</p>}

          {/* Genres */}
          <div className="flex flex-wrap gap-2 pt-1">
            {tv.genres?.map((g: any) => (
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
              <span>Putar S{selectedSeason} E{selectedEpisode}</span>
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
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">{tv.overview}</p>
          </div>

          {/* Episodes Selection */}
          <div className="pt-6 space-y-4 border-t border-gray-800">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-200">Daftar Episode</h3>
              {(tv.seasons?.length ?? 0) > 1 && (
                <select
                  value={selectedSeason}
                  onChange={(e) => {
                    setSelectedSeason(Number(e.target.value));
                    setSelectedEpisode(1);
                  }}
                  className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                >
                  {(tv.seasons || [])
                    .filter((s: any) => s.season_number > 0)
                    .map((s: any) => (
                      <option key={s.id} value={s.season_number}>
                        {s.name} ({s.episode_count} Episode)
                      </option>
                    ))}
                </select>
              )}
            </div>

            {seasonData?.episodes?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {seasonData.episodes.map((ep: any) => (
                  <button
                    key={ep.id}
                    onClick={() => {
                      setSelectedEpisode(ep.episode_number);
                      setIsPlayerOpen(true);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all flex space-x-3 items-center ${
                      selectedEpisode === ep.episode_number
                        ? 'bg-red-950/40 border-red-600/80 shadow-lg'
                        : 'bg-gray-900/60 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-black/60 flex items-center justify-center font-bold text-sm text-red-500 flex-shrink-0">
                      {ep.episode_number}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate">{ep.name}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{ep.overview || 'Episode ' + ep.episode_number}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">Memuat episode...</p>
            )}
          </div>
        </div>
      </div>

      {/* Video Player Modal */}
      <VideoPlayerModal
        isOpen={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}
        tmdbId={tv.id}
        mediaType="tv"
        season={selectedSeason}
        episode={selectedEpisode}
        title={tv.name}
        subTitle={`Season ${selectedSeason} • Episode ${selectedEpisode}`}
      />
    </div>
  );
};
