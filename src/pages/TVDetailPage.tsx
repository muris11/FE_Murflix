import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Star, Plus, Check, ArrowLeft, Calendar } from 'lucide-react';
import { moviesApi } from '@/api/movies';
import { watchlistApi } from '@/api/watchlist';
import { VideoPlayerModal } from '@/components/media/VideoPlayerModal';
import { MovieRow } from '@/components/media/MovieRow';

export const TVDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tv, setTv] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState<{ season: number; episode: number; title?: string }>({
    season: 1,
    episode: 1,
  });
  const [isInList, setIsInList] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    moviesApi
      .getTVDetails(id)
      .then((data) => {
        setTv(data);
        const firstSeason = data.seasons?.find((s: any) => s.season_number > 0)?.season_number || 1;
        setSelectedSeason(firstSeason);
        watchlistApi.check('tv', Number(id)).then(setIsInList).catch(() => {});
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id || !selectedSeason) return;
    setIsLoadingEpisodes(true);
    moviesApi
      .getTVSeason(id, selectedSeason)
      .then((data) => {
        setEpisodes(data.episodes || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoadingEpisodes(false));
  }, [id, selectedSeason]);

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
          title: tv.name,
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

  const playEpisode = (seasonNum: number, episodeNum: number, epTitle?: string) => {
    setCurrentEpisode({ season: seasonNum, episode: episodeNum, title: epTitle });
    setIsPlayerOpen(true);
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
      <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center text-white">
        <h2 className="text-xl font-bold">Serial TV tidak ditemukan</h2>
        <Link to="/" className="mt-4 text-red-500 hover:underline">Kembali ke Beranda</Link>
      </div>
    );
  }

  const backdropUrl = tv.backdrop_path ? `https://image.tmdb.org/t/p/original${tv.backdrop_path}` : '';
  const posterUrl = tv.poster_path ? `https://image.tmdb.org/t/p/w500${tv.poster_path}` : '/placeholder.svg';
  const releaseYear = (tv.first_air_date || '').split('-')[0];

  return (
    <div className="min-h-screen bg-[#141414] pb-20">
      {/* Hero Backdrop */}
      <div className="relative w-full h-[55vh] sm:h-[70vh] bg-black overflow-hidden">
        {backdropUrl && (
          <img src={backdropUrl} alt={tv.name} className="w-full h-full object-cover object-center scale-105" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/90 via-[#141414]/40 to-transparent w-full md:w-3/4" />

        <div className="absolute top-20 left-4 sm:left-8 z-30">
          <Link to="/" className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-md border border-gray-700">
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </Link>
        </div>
      </div>

      {/* Main Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 -mt-32 sm:-mt-48 flex flex-col md:flex-row gap-8">
        {/* Poster */}
        <div className="flex-shrink-0 w-48 sm:w-64 md:w-72 mx-auto md:mx-0 rounded-2xl overflow-hidden shadow-2xl border border-gray-800 bg-gray-900">
          <img src={posterUrl} alt={tv.name} className="w-full h-auto object-cover" />
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
              onClick={() => playEpisode(selectedSeason, 1, 'Episode 1')}
              className="flex items-center space-x-2 px-8 py-3.5 rounded-xl bg-[#e50914] hover:bg-red-700 text-white font-bold text-base shadow-xl shadow-red-600/30 transition-transform hover:scale-105 active:scale-95"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Mulai Episode 1</span>
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
        </div>
      </div>

      {/* Season & Episode Selector */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <h2 className="text-2xl font-bold text-white">Daftar Episode</h2>
          
          {/* Season Selector */}
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(Number(e.target.value))}
            className="bg-gray-900 border border-gray-700 text-white text-sm font-semibold rounded-xl px-4 py-2 focus:outline-none focus:border-red-500 cursor-pointer"
          >
            {tv.seasons
              ?.filter((s: any) => s.season_number > 0)
              .map((s: any) => (
                <option key={s.id} value={s.season_number}>
                  {s.name} ({s.episode_count} Episode)
                </option>
              ))}
          </select>
        </div>

        {/* Episode Grid */}
        {isLoadingEpisodes ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-900 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {episodes.map((ep) => {
              const stillUrl = ep.still_path
                ? `https://image.tmdb.org/t/p/w500${ep.still_path}`
                : '/placeholder.svg';
              return (
                <div
                  key={ep.id}
                  onClick={() => playEpisode(selectedSeason, ep.episode_number, ep.name)}
                  className="group relative bg-[#181818] border border-gray-800/80 hover:border-red-500/80 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-black"
                >
                  <div className="relative aspect-video w-full bg-gray-800 overflow-hidden">
                    <img src={stillUrl} alt={ep.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-[#e50914] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform scale-90 group-hover:scale-100">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-bold text-white">
                      Eps {ep.episode_number}
                    </div>
                  </div>

                  <div className="p-3">
                    <p className="text-sm font-semibold text-white line-clamp-1 group-hover:text-red-400 transition-colors">
                      {ep.episode_number}. {ep.name || `Episode ${ep.episode_number}`}
                    </p>
                    <p className="text-xs text-gray-400 line-clamp-2 mt-1">{ep.overview || 'Tidak ada deskripsi episode.'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      <VideoPlayerModal
        isOpen={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}
        tmdbId={tv.id}
        mediaType="tv"
        season={currentEpisode.season}
        episode={currentEpisode.episode}
        title={tv.name}
        subTitle={`Season ${currentEpisode.season} Episode ${currentEpisode.episode}: ${currentEpisode.title || ''}`}
      />
    </div>
  );
};

