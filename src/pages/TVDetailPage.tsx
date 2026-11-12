import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Play, Plus, Check, Star, Calendar, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { moviesApi } from '@/api/movies';
import { TVDetails, MediaItem } from '@/types/tmdb';
import { MovieRow } from '@/components/media/MovieRow';
import { PersonModal } from '@/components/media/PersonModal';
import { WatchProvidersBadge } from '@/components/media/WatchProvidersBadge';
import { watchlistApi } from '@/api/watchlist';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { getTMDBImageUrl, getDirectTMDBUrl } from '@/utils/image';
import { extractIdFromSlug, getWatchTVUrl, resolveMediaId, getCachedIdFromSlug } from '@/utils/slug';

const EPISODES_PER_PAGE = 20;

export const TVDetailPage: React.FC = () => {
  const { id: rawSlugId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fast ID resolution (handles /tv/who-is-who, /tv/78292-who-is-who, or /tv/78292)
  const [resolvedId, setResolvedId] = useState<string | null>(() => {
    const extracted = extractIdFromSlug(rawSlugId);
    return /^\d+$/.test(extracted) ? extracted : getCachedIdFromSlug('tv', rawSlugId || '');
  });

  const [tv, setTv] = useState<TVDetails | null>(null);
  const [fallbackTV, setFallbackTV] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInList, setIsInList] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [currentEpisodePage, setCurrentEpisodePage] = useState(1);
  const [seasonData, setSeasonData] = useState<any>(null);
  const [backdropError, setBackdropError] = useState(false);
  const [posterError, setPosterError] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);

  // Resolve pure slug to numeric ID if not numeric
  useEffect(() => {
    if (!rawSlugId) return;
    let isMounted = true;
    resolveMediaId(rawSlugId, 'tv').then((id) => {
      if (isMounted && id) {
        setResolvedId(id);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [rawSlugId]);

  // Fetch TV Details once ID is resolved
  useEffect(() => {
    if (!resolvedId) return;
    setIsLoading(true);
    setBackdropError(false);
    setPosterError(false);
    moviesApi
      .getTVDetails(resolvedId)
      .then((data) => {
        setTv(data);
        const year = data.first_air_date ? ` (${data.first_air_date.slice(0, 4)})` : '';
        document.title = `${data.name || 'Serial TV'}${year} - Nonton Streaming di Murflix`;
        watchlistApi.check('tv', Number(resolvedId)).then(setIsInList).catch(() => {});
      })
      .catch((err) => console.error('Failed to load TV details:', err))
      .finally(() => setIsLoading(false));
  }, [resolvedId]);

  // Fetch Season episodes
  useEffect(() => {
    if (!resolvedId || !tv) return;
    moviesApi
      .getTVSeason(resolvedId, selectedSeason)
      .then((data) => {
        setSeasonData(data);
        setCurrentEpisodePage(1); // Reset episode pagination on season change
      })
      .catch((err) => console.error('Failed to load TV season:', err));
  }, [resolvedId, tv, selectedSeason]);

  // Fetch fallback recommendations if show has none
  useEffect(() => {
    if (tv) {
      const recs = tv.recommendations?.results || [];
      const sim = tv.similar?.results || [];
      if (recs.length === 0 && sim.length === 0) {
        moviesApi
          .getPopularTV()
          .then((res) => {
            setFallbackTV((res.results || []).map((item) => ({ ...item, media_type: 'tv' })));
          })
          .catch(() => {});
      }
    }
  }, [tv]);

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
              <div className="w-20 h-5 rounded bg-zinc-800" />
              <div className="w-16 h-5 rounded bg-blue-900/40 border border-blue-500/30" />
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

            {/* Season Selector Skeleton */}
            <div className="pt-8 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-32 h-6 bg-zinc-800 rounded" />
                <div className="w-28 h-8 bg-zinc-800 rounded-lg" />
              </div>

              {/* Episodes Grid Skeleton */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-xl overflow-hidden bg-zinc-900 border border-white/5 space-y-2 pb-3">
                    <div className="aspect-video w-full bg-zinc-800" />
                    <div className="px-3 space-y-1.5">
                      <div className="h-4 bg-zinc-800 rounded w-3/4" />
                      <div className="h-3 bg-zinc-800/60 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
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
      ? getDirectTMDBUrl(tv.backdrop_path, 'w1280')
      : getTMDBImageUrl(tv.backdrop_path, 'w1280')
    : '';

  const posterUrl = tv.poster_path
    ? posterError
      ? getDirectTMDBUrl(tv.poster_path, 'w342')
      : getTMDBImageUrl(tv.poster_path, 'w342')
    : '/placeholder.svg';

  const releaseYear = (tv.first_air_date || '').split('-')[0];

  // Episode Pagination calculations
  const allEpisodes: any[] = seasonData?.episodes || [];
  const totalEpisodes = allEpisodes.length;
  const totalEpisodePages = Math.ceil(totalEpisodes / EPISODES_PER_PAGE);
  const paginatedEpisodes = allEpisodes.slice(
    (currentEpisodePage - 1) * EPISODES_PER_PAGE,
    currentEpisodePage * EPISODES_PER_PAGE
  );

  // Recommendations mapping (ensure media_type = 'tv')
  const recommendations: MediaItem[] = (tv.recommendations?.results || []).map((item) => ({
    ...item,
    media_type: 'tv',
  }));
  const similarShows: MediaItem[] = (tv.similar?.results || []).map((item) => ({
    ...item,
    media_type: 'tv',
  }));

  return (
    <div className="min-h-screen bg-[#141414] pb-24">
      {/* Hero Backdrop */}
      <div className="relative w-full h-[50vh] sm:h-[65vh] bg-black overflow-hidden">
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
      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 relative z-20 -mt-28 sm:-mt-44 flex flex-col md:flex-row gap-8">
        
        {/* Snug Poster Container */}
        <div className="flex-shrink-0 w-44 sm:w-60 md:w-68 mx-auto md:mx-0 self-start">
          <div className="aspect-[2/3] w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-zinc-900 ring-1 ring-white/10">
            <img
              src={posterUrl}
              alt={tv.name}
              onError={() => setPosterError(true)}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 space-y-4 text-white">
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-300">
            {tv.vote_average && (
              <div className="flex items-center space-x-1 text-amber-400 font-bold">
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
            <span className="text-zinc-400 text-xs font-semibold">
              {tv.number_of_seasons} Musim / {tv.number_of_episodes} Episode
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">{tv.name}</h1>
          {tv.tagline && <p className="text-sm italic text-gray-400">"{tv.tagline}"</p>}

          {/* Genres & Providers */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="flex flex-wrap gap-2">
              {tv.genres?.map((g) => (
                <span key={g.id} className="px-3 py-1 rounded-full bg-gray-800 text-xs text-gray-300 border border-gray-700">
                  {g.name}
                </span>
              ))}
            </div>

            <WatchProvidersBadge providersData={tv['watch/providers']} />
          </div>

          {/* Action Buttons (1:1 Netflix Direct Cinema Watch) */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 sm:gap-4 pt-4 w-full">
            <button
              onClick={() => navigate(getWatchTVUrl(tv.id, tv.name, selectedSeason, selectedEpisode))}
              className="w-full sm:w-auto flex items-center justify-center space-x-1.5 sm:space-x-2 px-3 sm:px-8 py-3 rounded-full bg-[#e50914] hover:bg-red-700 text-white font-extrabold text-xs sm:text-base shadow-lg shadow-red-950/60 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white ml-0.5 flex-shrink-0" />
              <span className="truncate">Nonton S{selectedSeason}:E{selectedEpisode}</span>
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
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">{tv.overview}</p>
          </div>

          {/* Cast Avatars (Clickable to open PersonModal) */}
          {(tv.credits?.cast?.length ?? 0) > 0 && (
            <div className="pt-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-200">Pemeran Utama</h3>
                <span className="text-xs text-gray-500">Klik aktor untuk melihat profil & karya</span>
              </div>
              <div className="flex space-x-4 overflow-x-auto no-scrollbar py-2">
                {(tv.credits?.cast || []).slice(0, 12).map((cast) => (
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
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
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

          {/* Netflix 1:1 Episode Section with Batch Range & Pagination */}
          <div className="pt-8 space-y-5 border-t border-zinc-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">Episode</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Musim {selectedSeason}: {totalEpisodes} Episode Tersedia
                </p>
              </div>

              {(tv.seasons?.length ?? 0) > 1 && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-zinc-400 font-semibold hidden sm:inline">Pilih Musim:</span>
                  <CustomDropdown
                    value={String(selectedSeason)}
                    onChange={(val) => {
                      const s = Number(val);
                      setSelectedSeason(s);
                      setSelectedEpisode(1);
                      setCurrentEpisodePage(1);
                    }}
                    options={(tv.seasons || [])
                      .filter((s) => s.season_number > 0)
                      .map((season) => ({
                        value: String(season.season_number),
                        label: season.name || `Season ${season.season_number}`,
                        badge: `${season.episode_count} Ep`,
                      }))}
                    className="w-48"
                  />
                </div>
              )}
            </div>

            {/* Episode Range Batch Selector (Like Netflix Episode Range Pills) */}
            {totalEpisodePages > 1 && (
              <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
                <span className="text-xs font-semibold text-zinc-400 flex-shrink-0 mr-1">Batch Episode:</span>
                {Array.from({ length: totalEpisodePages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  const startEp = (pageNum - 1) * EPISODES_PER_PAGE + 1;
                  const endEp = Math.min(pageNum * EPISODES_PER_PAGE, totalEpisodes);
                  const isActive = currentEpisodePage === pageNum;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentEpisodePage(pageNum)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                        isActive
                          ? 'bg-[#e50914] text-white shadow-md shadow-red-600/30 ring-1 ring-red-500/50'
                          : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-white/5'
                      }`}
                    >
                      {startEp} - {endEp}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Paginated Episode List */}
            {allEpisodes.length > 0 ? (
              <div className="space-y-4">
                <div className="divide-y divide-zinc-800/80 rounded-2xl bg-[#141416] border border-white/5 overflow-hidden shadow-xl">
                  {paginatedEpisodes.map((ep: any) => {
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

                          {/* Hover Play Overlay */}
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
                              <span className="text-[#e50914] text-xs font-bold uppercase tracking-wider">
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

                {/* Numbered Pagination Bar at Bottom */}
                {totalEpisodePages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 px-1">
                    <span className="text-xs text-zinc-400">
                      Menampilkan episode {(currentEpisodePage - 1) * EPISODES_PER_PAGE + 1} -{' '}
                      {Math.min(currentEpisodePage * EPISODES_PER_PAGE, totalEpisodes)} dari {totalEpisodes} episode
                    </span>

                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => setCurrentEpisodePage((p) => Math.max(p - 1, 1))}
                        disabled={currentEpisodePage === 1}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-zinc-800 transition-colors flex items-center space-x-1"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Sebelumnya</span>
                      </button>

                      {Array.from({ length: totalEpisodePages }).map((_, idx) => {
                        const pageNum = idx + 1;
                        if (
                          totalEpisodePages > 7 &&
                          pageNum !== 1 &&
                          pageNum !== totalEpisodePages &&
                          Math.abs(pageNum - currentEpisodePage) > 1
                        ) {
                          if (pageNum === 2 || pageNum === totalEpisodePages - 1) {
                            return <span key={pageNum} className="text-zinc-600 px-1 text-xs">...</span>;
                          }
                          return null;
                        }
                        const isActive = currentEpisodePage === pageNum;
                        return (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => setCurrentEpisodePage(pageNum)}
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                              isActive
                                ? 'bg-[#e50914] text-white shadow-md'
                                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() => setCurrentEpisodePage((p) => Math.min(p + 1, totalEpisodePages))}
                        disabled={currentEpisodePage === totalEpisodePages}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-zinc-800 transition-colors flex items-center space-x-1"
                      >
                        <span>Berikutnya</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-zinc-500 rounded-xl bg-zinc-900/40 border border-zinc-800">
                Memuat daftar episode...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Similar & Recommendations Rows */}
      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 mt-16 space-y-10">
        {recommendations.length > 0 ? (
          <MovieRow title="Rekomendasi Serial TV Serupa" items={recommendations} />
        ) : fallbackTV.length > 0 ? (
          <MovieRow title="Rekomendasi Serial TV Terpopuler" items={fallbackTV} />
        ) : null}

        {similarShows.length > 0 && (
          <MovieRow title="Serial Terkait Lainnya" items={similarShows} />
        )}
      </div>

      {/* Person Detail Modal */}
      <PersonModal
        personId={selectedPersonId}
        onClose={() => setSelectedPersonId(null)}
      />
    </div>
  );
};
