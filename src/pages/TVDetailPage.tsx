import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Play, Plus, Check, Star, Calendar, ArrowLeft } from 'lucide-react';
import { moviesApi } from '@/api/movies';
import { TVDetails } from '@/types/tmdb';
import { VideoPlayerModal } from '@/components/media/VideoPlayerModal';
import { watchlistApi } from '@/api/watchlist';
import { getTMDBImageUrl, getDirectTMDBUrl } from '@/utils/image';
import { extractIdFromSlug, getWatchTVUrl } from '@/utils/slug';

export const TVDetailPage: React.FC = () => {
  const { id: rawSlugId } = useParams<{ id: string }>();
  const id = extractIdFromSlug(rawSlugId);
  const navigate = useNavigate();
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
        {/* Poster (Aspect 2:3, self-start so it never vertically stretches) */}
        <div className="flex-shrink-0 w-48 sm:w-64 md:w-72 mx-auto md:mx-0 rounded-2xl overflow-hidden shadow-2xl border border-white/10 self-start aspect-[2/3] bg-zinc-900 ring-1 ring-white/10">
          <img
            src={posterUrl}
            alt={tv.name}
            onError={() => setPosterError(true)}
            className="w-full h-full object-cover"
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

          {/* Action Buttons (1:1 Netflix Style) */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={() => navigate(getWatchTVUrl(tv.id, tv.name, selectedSeason, selectedEpisode))}
              className="flex items-center space-x-2 px-8 py-3.5 rounded-full bg-white hover:bg-zinc-200 text-black font-extrabold text-sm sm:text-base shadow-2xl transition-transform hover:scale-105 active:scale-95"
            >
              <Play className="w-5 h-5 fill-black" />
              <span>Putar S{selectedSeason} E{selectedEpisode}</span>
            </button>

            <button
              onClick={toggleWatchlist}
              className="flex items-center space-x-2 px-6 py-3.5 rounded-full bg-zinc-700/60 hover:bg-zinc-700/80 backdrop-blur-md text-white font-semibold text-sm border border-white/10 transition-colors"
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

          {/* Netflix 1:1 Episode Section */}
          <div className="pt-8 space-y-5 border-t border-zinc-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">Episode</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Musim {selectedSeason}: {seasonData?.episodes?.length || 0} Episode Tersedia
                </p>
              </div>

              {(tv.seasons?.length ?? 0) > 1 && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-zinc-400 font-semibold hidden sm:inline">Pilih Musim:</span>
                  <select
                    value={selectedSeason}
                    onChange={(e) => {
                      setSelectedSeason(Number(e.target.value));
                      setSelectedEpisode(1);
                    }}
                    className="bg-[#1e1e24] border border-zinc-700 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-red-500 shadow-md cursor-pointer hover:border-zinc-500 transition-colors"
                  >
                    {(tv.seasons || [])
                      .filter((s: any) => s.season_number > 0)
                      .map((s: any) => (
                        <option key={s.id} value={s.season_number}>
                          {s.name} ({s.episode_count} Episode)
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>

            {/* Netflix Horizontal Episode Rows */}
            {seasonData?.episodes?.length > 0 ? (
              <div className="divide-y divide-zinc-800/80 rounded-2xl bg-[#141416] border border-white/5 overflow-hidden shadow-xl">
                {seasonData.episodes.map((ep: any) => {
                  const isSelected = selectedEpisode === ep.episode_number;
                  return (
                    <div
                      key={ep.id}
                      onClick={() => navigate(getWatchTVUrl(tv.id, tv.name, selectedSeason, ep.episode_number))}
                      className={`p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all cursor-pointer group ${
                        isSelected
                          ? 'bg-red-950/20 border-l-4 border-l-[#e50914]'
                          : 'hover:bg-zinc-800/40 border-l-4 border-l-transparent'
                      }`}
                    >
                      {/* Big Episode Number */}
                      <span className={`text-xl sm:text-2xl font-black w-8 text-center flex-shrink-0 transition-colors ${
                        isSelected ? 'text-[#e50914]' : 'text-zinc-500 group-hover:text-white'
                      }`}>
                        {ep.episode_number}
                      </span>

                      {/* Episode 16:9 Thumbnail */}
                      <div className="relative aspect-video w-full sm:w-44 md:w-52 flex-shrink-0 rounded-xl overflow-hidden bg-zinc-900 border border-white/10 shadow-md">
                        {ep.still_path ? (
                          <img
                            src={getTMDBImageUrl(ep.still_path, 'w300')}
                            alt={ep.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = getDirectTMDBUrl(ep.still_path, 'w300');
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 font-bold bg-zinc-900">
                            <span className="text-xs uppercase tracking-wider">Episode</span>
                            <span className="text-xl text-zinc-400">{ep.episode_number}</span>
                          </div>
                        )}

                        {/* Hover / Playing Play Overlay */}
                        <div className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${
                          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}>
                          <div className="w-10 h-10 rounded-full bg-[#e50914] text-white flex items-center justify-center shadow-xl shadow-red-600/50 transform group-hover:scale-110 transition-transform">
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                          </div>
                        </div>

                        {/* Duration Badge */}
                        {ep.runtime && (
                          <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/85 text-[10px] font-mono font-medium text-gray-300 border border-white/10">
                            {ep.runtime} mnt
                          </span>
                        )}
                      </div>

                      {/* Episode Details */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className={`text-sm sm:text-base font-bold transition-colors ${
                            isSelected ? 'text-[#e50914]' : 'text-white group-hover:text-red-400'
                          }`}>
                            {ep.episode_number}. {ep.name}
                          </h4>
                          {isSelected && (
                            <span className="px-2 py-0.5 rounded bg-red-600/20 text-[#e50914] border border-red-500/30 text-[10px] font-bold uppercase tracking-wider">
                              Diputar Sekarang
                            </span>
                          )}
                        </div>

                        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed line-clamp-2 sm:line-clamp-3">
                          {ep.overview || 'Tidak ada deskripsi rinci untuk episode ini.'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-zinc-500 rounded-xl bg-zinc-900/40 border border-zinc-800">
                Memuat daftar episode...
              </div>
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
        seasonsList={tv.seasons}
        onEpisodeChange={(s, e) => {
          setSelectedSeason(s);
          setSelectedEpisode(e);
        }}
        title={tv.name}
        subTitle={`Season ${selectedSeason} • Episode ${selectedEpisode}`}
      />
    </div>
  );
};
