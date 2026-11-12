import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Server,
  AlertCircle,
  Play,
  RotateCcw,
  Moon,
  Sun,
  Star,
  Calendar,
  Film,
  Tv,
  Check,
  Plus,
  ChevronLeft,
  ChevronRight,
  Share2,
  Info,
  Clock,
} from 'lucide-react';
import { moviesApi } from '@/api/movies';
import { watchlistApi } from '@/api/watchlist';
import { StreamingServer, MovieDetails, TVDetails, EpisodeItem, SeasonItem, MediaItem } from '@/types/tmdb';
import { getTMDBImageUrl, getDirectTMDBUrl } from '@/utils/image';
import {
  extractIdFromSlug,
  getMovieUrl,
  getTVUrl,
  getWatchMovieUrl,
  getWatchTVUrl,
  resolveMediaId,
  getCachedIdFromSlug,
} from '@/utils/slug';
import { MurflixLogo } from '@/components/layout/MurflixLogo';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { DEFAULT_STREAMING_SERVERS, formatEmbedUrl } from '@/constants/streamingServers';

interface WatchPageProps {
  mediaType: 'movie' | 'tv';
}

export const WatchPage: React.FC<WatchPageProps> = ({ mediaType }) => {
  const { id: rawSlugId } = useParams<{ id: string }>();
  const [resolvedId, setResolvedId] = useState<string | null>(() => {
    const extracted = extractIdFromSlug(rawSlugId);
    return /^\d+$/.test(extracted) ? extracted : getCachedIdFromSlug(mediaType, rawSlugId || '');
  });
  const id = resolvedId;
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentSeason = Number(searchParams.get('s')) || 1;
  const currentEpisode = Number(searchParams.get('e')) || 1;

  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [tv, setTv] = useState<TVDetails | null>(null);
  const [seasonData, setSeasonData] = useState<any>(null);
  const [relatedItems, setRelatedItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [servers, setServers] = useState<StreamingServer[]>(DEFAULT_STREAMING_SERVERS);
  const [activeServer, setActiveServer] = useState<string>(DEFAULT_STREAMING_SERVERS[0]?.id || 'embedwave');
  const [playerKey, setPlayerKey] = useState<number>(0);
  const [isLightsOff, setIsLightsOff] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isInList, setIsInList] = useState(false);

  // Episode Sidebar Batch state for TV shows with many episodes (e.g. 120 episodes)
  const [currentBatchPage, setCurrentBatchPage] = useState<number>(() => Math.ceil(currentEpisode / 20) || 1);

  useEffect(() => {
    setCurrentBatchPage(Math.ceil(currentEpisode / 20) || 1);
  }, [currentEpisode]);

  useEffect(() => {
    if (!rawSlugId) return;
    let isMounted = true;
    resolveMediaId(rawSlugId, mediaType).then((resId) => {
      if (isMounted && resId) setResolvedId(resId);
    });
    return () => {
      isMounted = false;
    };
  }, [rawSlugId, mediaType]);

  // Fetch servers list
  useEffect(() => {
    moviesApi
      .getStreamingServers()
      .then((data) => {
        if (data && data.length > 0) {
          setServers(data);
          setActiveServer(data[0].id);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch media details & watchlist status
  useEffect(() => {
    if (!id) return;
    setIsLoading(true);

    const numId = Number(id);
    if (!isNaN(numId)) {
      watchlistApi.check(mediaType, numId).then(setIsInList).catch(() => {});
    }

    if (mediaType === 'movie') {
      moviesApi
        .getMovieDetails(id)
        .then((data) => {
          setMovie(data);
          const recs = data?.recommendations?.results?.length
            ? data.recommendations.results
            : (data as any)?.similar?.results || [];
          setRelatedItems(recs.slice(0, 12));
        })
        .catch((err) => console.error(err))
        .finally(() => setIsLoading(false));
    } else {
      moviesApi
        .getTVDetails(id)
        .then((data) => {
          setTv(data);
        })
        .catch((err) => console.error(err))
        .finally(() => setIsLoading(false));
    }
  }, [id, mediaType]);

  // Fetch TV season data
  useEffect(() => {
    if (mediaType === 'tv' && id) {
      moviesApi
        .getTVSeason(id, currentSeason)
        .then((data) => {
          setSeasonData(data);
        })
        .catch((err) => console.error(err));
    }
  }, [id, mediaType, currentSeason]);

  const currentServer = servers.find((s) => s.id === activeServer) || servers[0];

  const getEmbedUrl = () => {
    if (!id || !currentServer) return '';
    const urlTemplate = mediaType === 'movie' ? currentServer.movieUrl : currentServer.tvUrl;
    return formatEmbedUrl(urlTemplate, id, currentSeason, currentEpisode);
  };

  const embedUrl = getEmbedUrl();
  const title = mediaType === 'movie' ? movie?.title : tv?.name;
  const releaseYear = (
    mediaType === 'movie' ? movie?.release_date || '' : tv?.first_air_date || ''
  ).split('-')[0];

  const currentEpisodeData = seasonData?.episodes?.find(
    (ep: EpisodeItem) => ep.episode_number === currentEpisode
  );

  const episodesList: EpisodeItem[] = seasonData?.episodes || [];
  const BATCH_SIZE = 20;
  const totalBatchPages = Math.ceil(episodesList.length / BATCH_SIZE);
  const visibleEpisodes = episodesList.slice(
    (currentBatchPage - 1) * BATCH_SIZE,
    currentBatchPage * BATCH_SIZE
  );

  const formatRuntime = (mins?: number) => {
    if (!mins || mins <= 0) return null;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}j`;
    return `${h}j ${m}m`;
  };

  const handleSelectEpisode = (epNum: number) => {
    setSearchParams({ s: String(currentSeason), e: String(epNum) });
    setPlayerKey((prev) => prev + 1);
  };

  const handleSelectSeason = (sNum: number) => {
    setSearchParams({ s: String(sNum), e: '1' });
    setPlayerKey((prev) => prev + 1);
  };

  const handleNextEpisode = () => {
    if (currentEpisode < episodesList.length) {
      handleSelectEpisode(currentEpisode + 1);
    } else {
      const nextSeason = tv?.seasons?.find((s) => s.season_number === currentSeason + 1);
      if (nextSeason) {
        handleSelectSeason(nextSeason.season_number);
      }
    }
  };

  const handlePrevEpisode = () => {
    if (currentEpisode > 1) {
      handleSelectEpisode(currentEpisode - 1);
    } else if (currentSeason > 1) {
      const prevSeason = tv?.seasons?.find((s) => s.season_number === currentSeason - 1);
      if (prevSeason) {
        setSearchParams({
          s: String(prevSeason.season_number),
          e: String(prevSeason.episode_count || 1),
        });
        setPlayerKey((prev) => prev + 1);
      }
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const toggleWatchlist = async () => {
    if (!id) return;
    const numId = Number(id);
    if (isNaN(numId)) return;
    try {
      if (isInList) {
        await watchlistApi.remove(mediaType, numId);
        setIsInList(false);
      } else {
        await watchlistApi.add({
          media_type: mediaType,
          tmdb_id: numId,
          title: title || 'Untitled',
          poster_path: mediaType === 'movie' ? movie?.poster_path : tv?.poster_path,
          backdrop_path: mediaType === 'movie' ? movie?.backdrop_path : tv?.backdrop_path,
          vote_average: mediaType === 'movie' ? movie?.vote_average : tv?.vote_average,
        });
        setIsInList(true);
      }
    } catch (err) {
      console.error('Failed to toggle watchlist:', err);
    }
  };

  const primaryServers = servers.slice(0, 5);
  const backupServers = servers.slice(5);
  const isBackupActive = backupServers.some((s) => s.id === activeServer);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f12] text-white pb-20 animate-pulse">
        {/* Cinema Header Skeleton */}
        <div className="bg-[#141418] border-b border-white/10 px-3 sm:px-6 lg:px-8 py-3 sticky top-0 z-40 shadow-md">
          <div className="w-full flex items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
              <div className="w-24 h-6 bg-red-600/30 rounded flex-shrink-0" />
              <div className="w-20 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex-shrink-0" />
              <div className="h-5 bg-zinc-800 rounded w-48 sm:w-64" />
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <div className="w-24 sm:w-28 h-8 rounded-xl bg-zinc-800 border border-zinc-700" />
              <div className="w-10 sm:w-20 h-8 rounded-xl bg-zinc-800 border border-zinc-700" />
            </div>
          </div>
        </div>

        {/* Dynamic 1:1 Layout Skeleton */}
        {mediaType === 'movie' ? (
          <div className="w-full max-w-6xl 2xl:max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-6">
            <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
            </div>
            <div className="p-4 rounded-2xl bg-[#151518] border border-white/10 h-16" />
            <div className="p-6 rounded-2xl bg-[#151518] border border-white/10 space-y-4">
              <div className="h-7 bg-zinc-800 rounded w-1/3" />
              <div className="h-4 bg-zinc-800 rounded w-full" />
              <div className="h-4 bg-zinc-800 rounded w-4/5" />
            </div>
          </div>
        ) : (
          <div className="w-full max-w-[2400px] mx-auto px-2 sm:px-4 md:px-8 lg:px-12 2xl:px-20 pt-4 sm:pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 xl:col-span-9 space-y-4">
                <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
                </div>
                <div className="p-4 rounded-2xl bg-[#151518] border border-white/10 h-16" />
                <div className="p-6 rounded-2xl bg-[#151518] border border-white/10 space-y-4">
                  <div className="h-7 bg-zinc-800 rounded w-1/3" />
                  <div className="h-4 bg-zinc-800 rounded w-full" />
                </div>
              </div>
              <div className="lg:col-span-4 xl:col-span-3 space-y-4">
                <div className="rounded-2xl bg-[#151518] border border-white/10 p-4 h-96" />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const detailPath = id ? (mediaType === 'movie' ? getMovieUrl(id, title) : getTVUrl(id, title)) : '/';

  // Render Episode List Component for TV Shows
  const renderEpisodeList = (isMobileView = false) => (
    <div className={`rounded-2xl bg-[#151518] border border-white/10 p-3.5 sm:p-4 space-y-3.5 shadow-xl ${isMobileView ? 'mt-4' : ''}`}>
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center space-x-2">
          <Tv className="w-4 h-4 text-[#e50914]" />
          <h3 className="text-sm font-black uppercase tracking-wider text-white">Daftar Episode</h3>
        </div>

        {/* Season Selector */}
        {(tv?.seasons?.length ?? 0) > 1 && (
          <CustomDropdown
            size="sm"
            align="right"
            value={currentSeason}
            onChange={(val) => handleSelectSeason(Number(val))}
            options={(tv?.seasons || [])
              .filter((s: SeasonItem) => s.season_number > 0)
              .map((s: SeasonItem) => ({
                value: s.season_number,
                label: s.name,
                badge: `${s.episode_count} Ep`,
              }))}
            className="w-36"
          />
        )}
      </div>

      {/* Batch Selector if > 20 episodes */}
      {totalBatchPages > 1 && (
        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-zinc-900 border border-zinc-800">
          <span className="text-[11px] font-semibold text-zinc-400 flex-shrink-0">Batch:</span>
          <CustomDropdown
            size="sm"
            value={currentBatchPage}
            onChange={(val) => setCurrentBatchPage(Number(val))}
            options={Array.from({ length: totalBatchPages }).map((_, idx) => {
              const p = idx + 1;
              const start = (p - 1) * BATCH_SIZE + 1;
              const end = Math.min(p * BATCH_SIZE, episodesList.length);
              return {
                value: p,
                label: `Episode ${start} - ${end}`,
              };
            })}
            className="w-full"
          />
        </div>
      )}

      {/* Scrollable Episodes */}
      <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
        {visibleEpisodes.length > 0 ? (
          visibleEpisodes.map((ep) => {
            const isPlaying = ep.episode_number === currentEpisode;
            return (
              <div
                key={ep.id}
                onClick={() => handleSelectEpisode(ep.episode_number)}
                className={`p-2.5 rounded-xl transition-all cursor-pointer flex gap-3 items-center group border ${
                  isPlaying
                    ? 'bg-zinc-800/95 border-l-4 border-l-[#e50914] border-zinc-700 shadow-md ring-1 ring-red-500/20'
                    : 'bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                {/* 16:9 Still Thumbnail */}
                {ep.still_path ? (
                  <div className="relative aspect-video w-24 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-800">
                    <img
                      src={getTMDBImageUrl(ep.still_path, 'w300')}
                      alt={ep.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getDirectTMDBUrl(ep.still_path, 'w300');
                      }}
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                    {isPlaying && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Play className="w-4 h-4 fill-[#e50914] text-[#e50914]" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className={`w-14 h-11 flex-shrink-0 rounded-lg flex items-center justify-center font-bold text-xs border ${
                      isPlaying
                        ? 'bg-zinc-800 text-[#e50914] border-[#e50914]'
                        : 'bg-zinc-800/80 text-zinc-300 border-zinc-700 group-hover:border-zinc-500'
                    }`}
                  >
                    {isPlaying ? (
                      <Play className="w-4 h-4 fill-current" />
                    ) : (
                      <span>E{ep.episode_number}</span>
                    )}
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4
                    className={`text-xs font-bold truncate ${
                      isPlaying ? 'text-[#e50914]' : 'text-white group-hover:text-red-400'
                    }`}
                  >
                    {ep.episode_number}. {ep.name}
                  </h4>
                  <div className="flex items-center space-x-2 text-[10px] text-zinc-400 mt-1">
                    {ep.runtime && <span>{ep.runtime} mnt</span>}
                    {isPlaying && (
                      <span className="font-bold text-[#e50914] uppercase tracking-wider text-[9px]">
                        Sedang Diputar
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-6 text-center text-xs text-zinc-500">Memuat episode...</div>
        )}
      </div>
    </div>
  );

  // Sub-Player Toolbar Component
  const renderPlayerToolbar = () => (
    <div className="p-3 sm:p-4 rounded-2xl bg-[#151518] border border-white/10 space-y-3 shadow-lg">
      {/* MOBILE VIEW (md:hidden): Custom Dropdown + Refresh */}
      <div className="md:hidden flex items-center justify-between gap-2.5">
        <CustomDropdown
          value={activeServer}
          onChange={(val) => setActiveServer(val)}
          icon={<Server className="w-4 h-4" />}
          options={servers.map((s) => ({
            value: s.id,
            label: `Server ${s.name}`,
            description: s.description,
          }))}
          className="flex-1 min-w-0"
        />

        <button
          type="button"
          onClick={() => setPlayerKey((k) => k + 1)}
          className="px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-zinc-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-zinc-700 flex-shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="text-xs">Refresh</span>
        </button>
      </div>

      {/* DESKTOP VIEW (hidden md:flex): Sleek Server Selector Bar */}
      <div className="hidden md:flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 mr-1 font-mono">
            <Server className="w-3.5 h-3.5 text-[#e50914]" />
            Server:
          </span>
          {primaryServers.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveServer(s.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeServer === s.id
                  ? 'bg-[#e50914] text-white shadow-md shadow-red-600/30'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700/60'
              }`}
            >
              {s.name}
            </button>
          ))}

          {backupServers.length > 0 && (
            <CustomDropdown
              size="sm"
              value={isBackupActive ? activeServer : ''}
              placeholder={isBackupActive ? `Server: ${currentServer?.name}` : `Server Lainnya (${backupServers.length})`}
              onChange={(val) => setActiveServer(String(val))}
              options={backupServers.map((s) => ({
                value: s.id,
                label: s.name,
                description: s.description,
              }))}
              className="w-44"
            />
          )}
        </div>

        <button
          type="button"
          onClick={() => setPlayerKey((k) => k + 1)}
          className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-zinc-700 flex-shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Refresh Player</span>
        </button>
      </div>

      {/* TV Symmetrical Prev / Next Controls */}
      {mediaType === 'tv' && (
        <div className="flex items-center justify-between pt-2.5 border-t border-zinc-800 text-xs">
          <button
            type="button"
            onClick={handlePrevEpisode}
            disabled={currentSeason === 1 && currentEpisode === 1}
            className="px-3 sm:px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-zinc-200 disabled:opacity-30 disabled:hover:bg-zinc-800 transition-colors font-semibold flex items-center space-x-1.5 border border-zinc-700/80 shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Episode Sebelumnya</span>
            <span className="sm:hidden">Prev Ep</span>
          </button>

          <div className="text-center font-mono text-zinc-300 text-xs font-semibold px-2">
            <span>S{currentSeason} : Episode {currentEpisode}</span>
            <span className="text-zinc-500 font-normal"> / {episodesList.length}</span>
          </div>

          <button
            type="button"
            onClick={handleNextEpisode}
            className="px-3 sm:px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-zinc-200 hover:text-white transition-colors font-semibold flex items-center space-x-1.5 border border-zinc-700/80 shadow-sm"
          >
            <span className="hidden sm:inline">Episode Berikutnya</span>
            <span className="sm:hidden">Next Ep</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );

  // Metadata Card Component
  const renderMetadataCard = () => {
    const voteAverage = mediaType === 'movie' ? movie?.vote_average : tv?.vote_average;
    const runtime = mediaType === 'movie' ? formatRuntime(movie?.runtime) : null;
    const tagline = mediaType === 'movie' ? movie?.tagline : tv?.tagline;
    const genres = mediaType === 'movie' ? movie?.genres : tv?.genres;
    const overview = mediaType === 'tv'
      ? currentEpisodeData?.overview || tv?.overview
      : movie?.overview;

    return (
      <div className="p-4 sm:p-6 rounded-2xl bg-[#151518] border border-white/10 space-y-4 shadow-lg">
        {/* Title & Top Meta */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
          <div className="space-y-1 min-w-0">
            <h2 className="text-lg sm:text-2xl font-black text-white truncate">
              {title}
              {mediaType === 'tv' && currentEpisodeData?.name && (
                <span className="text-zinc-400 font-semibold text-sm sm:text-lg ml-2">
                  - {currentEpisodeData.name}
                </span>
              )}
            </h2>
            {tagline && <p className="text-xs italic text-zinc-400">"{tagline}"</p>}
          </div>

          <div className="flex items-center space-x-2.5 text-xs flex-wrap gap-y-1">
            {voteAverage && voteAverage > 0 && (
              <div className="flex items-center space-x-1 text-amber-400 font-bold">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{voteAverage.toFixed(1)}</span>
              </div>
            )}
            {releaseYear && (
              <span className="flex items-center space-x-1 text-zinc-300">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                <span>{releaseYear}</span>
              </span>
            )}
            {runtime && (
              <span className="flex items-center space-x-1 text-zinc-300">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span>{runtime}</span>
              </span>
            )}
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-800 border border-zinc-700 text-zinc-300">
              Full HD 1080p
            </span>
            <span className="text-[#e50914] font-bold uppercase text-xs">
              {mediaType === 'tv' ? 'Serial TV' : 'Film'}
            </span>
          </div>
        </div>

        {/* Action Row & Genres */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap gap-1.5">
            {genres?.map((g) => (
              <span
                key={g.id}
                className="px-2.5 py-1 rounded-full bg-zinc-800 text-[11px] font-medium text-zinc-300 border border-zinc-700/60"
              >
                {g.name}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={toggleWatchlist}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-white font-semibold text-xs border border-zinc-700 transition-colors shadow-sm cursor-pointer"
          >
            {isInList ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
            <span>{isInList ? 'Di Daftar Saya' : 'Tambah ke Daftar'}</span>
          </button>
        </div>

        {/* Synopsis */}
        <div className="space-y-1.5 pt-1">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Sinopsis</h4>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            {overview || 'Tidak ada sinopsis rinci.'}
          </p>
        </div>

        {/* Notice */}
        <p className="text-[11px] text-zinc-500 flex items-center gap-1.5 pt-1">
          <Info className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span>Petunjuk: Jika pemutaran video lambat atau error, ganti pilihan server pemutar di atas.</span>
        </p>
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 pb-20 ${
        isLightsOff ? 'bg-black text-white' : 'bg-[#0f0f12] text-white'
      }`}
    >
      {/* Dedicated Cinema Header (Clean 1:1, Zero Tooltip Collision) */}
      <div className="bg-[#121216] border-b border-zinc-800/80 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 sticky top-0 z-40 shadow-lg">
        <div className="w-full flex items-center justify-between gap-3">
          {/* Left: Brand + Back Button + Media Title */}
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
            <Link to="/" className="flex-shrink-0 transition-transform hover:scale-105 active:scale-95">
              <MurflixLogo size="sm" />
            </Link>

            <Link
              to={detailPath}
              className="flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors flex-shrink-0 border border-zinc-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kembali</span>
            </Link>

            <div className="min-w-0 truncate">
              <h1 className="text-xs sm:text-base font-bold text-white truncate flex items-center gap-2">
                <span className="truncate">{title || 'Sedang Memutar'}</span>
                {releaseYear && <span className="text-zinc-500 text-xs font-normal hidden md:inline">({releaseYear})</span>}
                {mediaType === 'tv' && (
                  <span className="px-1.5 py-0.5 rounded text-[#e50914] text-[10px] sm:text-xs font-bold font-mono border border-red-500/40 flex-shrink-0 bg-red-950/20">
                    S{currentSeason}:E{currentEpisode}
                  </span>
                )}
              </h1>
              {mediaType === 'tv' && currentEpisodeData?.name && (
                <p className="text-[11px] text-zinc-400 truncate hidden md:block">
                  Episode {currentEpisode}: "{currentEpisodeData.name}"
                </p>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => setIsLightsOff(!isLightsOff)}
              className={`p-2 rounded-xl text-xs font-medium transition-colors flex items-center space-x-1.5 border border-zinc-700 ${
                isLightsOff ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-zinc-800 text-zinc-300 hover:text-white'
              }`}
            >
              {isLightsOff ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span className="hidden md:inline">{isLightsOff ? 'Lampu Terang' : 'Mode Bioskop'}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors text-xs flex items-center space-x-1 border border-zinc-700"
            >
              {copySuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{copySuccess ? 'Tersalin!' : 'Bagikan'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Adaptive Cinema View */}
      {mediaType === 'movie' ? (
        /* MOVIE VIEW: Centered Theater Width (No Squishing, Full Immersive Cinema) */
        <div className="w-full max-w-6xl 2xl:max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6 space-y-5">
          {/* Video Player */}
          <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black ring-1 ring-white/5">
            {embedUrl ? (
              <iframe
                key={`${embedUrl}-${playerKey}`}
                src={embedUrl}
                title="Player"
                className="w-full h-full border-0"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-zinc-400 space-y-2">
                <AlertCircle className="w-12 h-12 text-[#e50914]" />
                <p className="text-sm">Video tidak dapat dimuat. Silakan ganti server di bawah.</p>
              </div>
            )}
          </div>

          {/* Player Toolbar */}
          {renderPlayerToolbar()}

          {/* Movie Metadata */}
          {renderMetadataCard()}

          {/* Related Movies Grid (Netflix Style Below Movie Info) */}
          {relatedItems.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-zinc-800">
              <div className="flex items-center space-x-2">
                <Film className="w-4 h-4 text-[#e50914]" />
                <h3 className="text-base sm:text-lg font-bold text-white">Film Terkait Lainnya</h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {relatedItems.map((item) => (
                  <Link
                    key={item.id}
                    to={getWatchMovieUrl(item.id, item.title)}
                    className="group block rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 transition-all hover:scale-[1.02] shadow-md"
                  >
                    <div className="aspect-[2/3] w-full bg-zinc-800 overflow-hidden relative">
                      <img
                        src={getTMDBImageUrl(item.poster_path, 'w342')}
                        alt={item.title || ''}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = getDirectTMDBUrl(item.poster_path, 'w342');
                        }}
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {item.vote_average && (
                        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[10px] font-bold text-amber-400 flex items-center space-x-0.5">
                          <Star className="w-3 h-3 fill-current" />
                          <span>{item.vote_average.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-2 sm:p-2.5 space-y-1">
                      <h4 className="text-xs font-bold text-white group-hover:text-[#e50914] truncate transition-colors">
                        {item.title}
                      </h4>
                      <div className="flex items-center justify-between text-[10px] text-zinc-400 font-medium">
                        <span>{(item.release_date || '').split('-')[0]}</span>
                        <span className="text-zinc-500 font-bold uppercase text-[9px]">Film</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* TV SHOW VIEW: 2-Column Cinema Grid on Desktop, Natural Flow on Mobile */
        <div className="w-full max-w-[2400px] mx-auto px-2 sm:px-4 md:px-8 lg:px-12 2xl:px-20 pt-3 sm:pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Player, Controls, Info, and Mobile Episode Drawer */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-4">
              {/* Video Player */}
              <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black ring-1 ring-white/5">
                {embedUrl ? (
                  <iframe
                    key={`${embedUrl}-${playerKey}`}
                    src={embedUrl}
                    title="Player"
                    className="w-full h-full border-0"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-zinc-400 space-y-2">
                    <AlertCircle className="w-12 h-12 text-[#e50914]" />
                    <p className="text-sm">Video tidak dapat dimuat. Silakan ganti server di bawah.</p>
                  </div>
                )}
              </div>

              {/* Player Toolbar with Symmetrical Prev / Next */}
              {renderPlayerToolbar()}

              {/* TV Metadata */}
              {renderMetadataCard()}

              {/* Mobile Only: Episode Section directly below info */}
              <div className="lg:hidden">
                {renderEpisodeList(true)}
              </div>
            </div>

            {/* Right Column: Desktop Dedicated Episode Sidebar */}
            <div className="hidden lg:block lg:col-span-4 xl:col-span-3 space-y-4">
              {renderEpisodeList(false)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
