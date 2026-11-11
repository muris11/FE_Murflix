import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Server,
  AlertCircle,
  Play,
  RotateCcw,
  Maximize2,
  Moon,
  Sun,
  Star,
  Calendar,
  Film,
  Tv,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Share2,
  Info,
} from 'lucide-react';
import { moviesApi } from '@/api/movies';
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

interface WatchPageProps {
  mediaType: 'movie' | 'tv';
}

const DEFAULT_SERVERS: StreamingServer[] = [
  {
    id: 'vidlink',
    name: 'VidLink',
    description: 'Multi-Sub, HD',
    type: 'iframe',
    movieUrl: 'https://vidlink.pro/movie/{id}',
    tvUrl: 'https://vidlink.pro/tv/{id}/{s}/{e}',
  },
  {
    id: 'vidsrccc',
    name: 'VidSrc CC',
    description: 'Multi-Sub, 1080p',
    type: 'iframe',
    movieUrl: 'https://vidsrc.cc/v2/embed/movie/{id}',
    tvUrl: 'https://vidsrc.cc/v2/embed/tv/{id}/{s}/{e}',
  },
  {
    id: 'embedsu',
    name: 'Embed.su',
    description: 'Fast, HD',
    type: 'iframe',
    movieUrl: 'https://embed.su/embed/movie/{id}',
    tvUrl: 'https://embed.su/embed/tv/{id}/{s}/{e}',
  },
  {
    id: '2embed',
    name: '2Embed',
    description: 'Multi-Sub, Anime',
    type: 'iframe',
    movieUrl: 'https://www.2embed.cc/embed/{id}',
    tvUrl: 'https://www.2embed.cc/embedtv/{id}&s={s}&e={e}',
  },
  {
    id: 'moviesapi',
    name: 'MoviesAPI',
    description: 'Multi-Sub, 1080p',
    type: 'iframe',
    movieUrl: 'https://moviesapi.club/movie/{id}',
    tvUrl: 'https://moviesapi.club/tv/{id}/{s}/{e}',
  },
  {
    id: 'vidsrcto',
    name: 'VidSrc.to',
    description: 'HD, Fast',
    type: 'iframe',
    movieUrl: 'https://vidsrc.to/embed/movie/{id}',
    tvUrl: 'https://vidsrc.to/embed/tv/{id}/{s}/{e}',
  },
];

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

  const [servers, setServers] = useState<StreamingServer[]>(DEFAULT_SERVERS);
  const [activeServer, setActiveServer] = useState<string>('vidlink');
  const [playerKey, setPlayerKey] = useState<number>(0);
  const [isLightsOff, setIsLightsOff] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

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

  // Fetch media details
  useEffect(() => {
    if (!id) return;
    setIsLoading(true);

    if (mediaType === 'movie') {
      moviesApi
        .getMovieDetails(id)
        .then((data) => {
          setMovie(data);
          if (data?.recommendations?.results) {
            setRelatedItems(data.recommendations.results.slice(0, 10));
          }
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
    if (!id) return '';
    const urlTemplate = mediaType === 'movie' ? currentServer.movieUrl : currentServer.tvUrl;
    return urlTemplate
      .replace('{id}', id)
      .replace('{s}', String(currentSeason))
      .replace('{e}', String(currentEpisode));
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0e0e10] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Menyiapkan Pemutar Cinema Murflix...</p>
        </div>
      </div>
    );
  }

  const detailPath = id ? (mediaType === 'movie' ? getMovieUrl(id, title) : getTVUrl(id, title)) : '/';

  return (
    <div
      className={`min-h-screen transition-colors duration-500 pb-20 ${
        isLightsOff ? 'bg-black text-white' : 'bg-[#0f0f12] text-white'
      }`}
    >
      {/* Dedicated Cinema Header (Clean 1:1, Zero Navbar Collision) */}
      <div className="bg-[#141418] border-b border-white/10 px-3 sm:px-6 lg:px-8 py-3 sticky top-0 z-40 shadow-md">
        <div className="w-full flex items-center justify-between gap-3">
          
          {/* Left: Brand + Back Button + Media Title */}
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
            <Link
              to="/"
              className="flex-shrink-0 transition-transform hover:scale-105 active:scale-95"
              title="Kembali ke Beranda Murflix"
            >
              <MurflixLogo size="sm" />
            </Link>

            <Link
              to={detailPath}
              className="flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-gray-200 transition-colors flex-shrink-0 border border-zinc-700"
              title="Kembali ke halaman informasi"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kembali</span>
            </Link>

            <div className="min-w-0 truncate">
              <h1 className="text-xs sm:text-base font-bold text-white truncate flex items-center gap-2">
                <span className="truncate">{title || 'Sedang Memutar'}</span>
                {releaseYear && <span className="text-zinc-500 text-xs font-normal hidden md:inline">({releaseYear})</span>}
                {mediaType === 'tv' && (
                  <span className="px-2 py-0.5 rounded text-[#e50914] text-[11px] sm:text-xs font-bold font-mono border border-red-500/40 flex-shrink-0">
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
            {/* Lights off toggle */}
            <button
              onClick={() => setIsLightsOff(!isLightsOff)}
              className={`p-2 rounded-xl text-xs font-medium transition-colors flex items-center space-x-1.5 border border-zinc-700 ${
                isLightsOff ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-zinc-800 text-gray-300 hover:text-white'
              }`}
              title={isLightsOff ? 'Nyalakan Lampu' : 'Matikan Lampu (Cinema Mode)'}
            >
              {isLightsOff ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span className="hidden md:inline">{isLightsOff ? 'Lampu Terang' : 'Mode Bioskop'}</span>
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-gray-300 hover:text-white transition-colors text-xs flex items-center space-x-1 border border-zinc-700"
              title="Salin Tautan"
            >
              {copySuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{copySuccess ? 'Tersalin!' : 'Bagikan'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Cinema Layout (Layarkaca21 / Netflix Style) */}
      <div className="w-full px-2 sm:px-4 md:px-8 lg:px-12 pt-4 sm:pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Player & Controls & Metadata (8 or 9 cols on desktop) */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-4">
            
            {/* Cinema Video Player Container */}
            <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black ring-1 ring-white/5">
              {embedUrl ? (
                <iframe
                  key={`${embedUrl}-${playerKey}`}
                  src={embedUrl}
                  title={title || 'Player'}
                  className="w-full h-full border-0"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-gray-400 space-y-2">
                  <AlertCircle className="w-12 h-12 text-red-500" />
                  <p className="text-sm">Video tidak dapat dimuat. Silakan ganti server di bawah.</p>
                </div>
              )}
            </div>

            {/* Sub-Player Bar: Server Switcher (Adaptive Dropdown on Mobile, Pills on Desktop) */}
            <div className="p-3 sm:p-4 rounded-2xl bg-[#151518] border border-white/10 space-y-3 shadow-lg">
              
              {/* MOBILE VIEW (md:hidden): Clean Dropdown (Sesuai Permintaan User) */}
              <div className="md:hidden flex items-center justify-between gap-2.5">
                <div className="relative flex-1 min-w-0">
                  <label htmlFor="mobile-server-select" className="sr-only">Pilih Server Pemutar</label>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-red-500">
                    <Server className="w-4 h-4" />
                  </div>
                  <select
                    id="mobile-server-select"
                    value={activeServer}
                    onChange={(e) => setActiveServer(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs font-bold focus:outline-none focus:border-red-500 appearance-none shadow-sm cursor-pointer"
                  >
                    {servers.map((s) => (
                      <option key={s.id} value={s.id}>
                        Server {s.name} ({s.description})
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-zinc-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>

                {/* Mobile Refresh Button */}
                <button
                  type="button"
                  onClick={() => setPlayerKey((k) => k + 1)}
                  className="px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-gray-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-zinc-700 flex-shrink-0"
                  title="Muat Ulang Video"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="text-xs">Refresh</span>
                </button>
              </div>

              {/* DESKTOP VIEW (hidden md:flex): Sleek Pills Row */}
              <div className="hidden md:flex items-center justify-between gap-2.5">
                <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                  <span className="text-xs font-black uppercase tracking-wider text-red-500 flex items-center gap-1.5 mr-1">
                    <Server className="w-3.5 h-3.5" />
                    Ganti Server:
                  </span>
                  {servers.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setActiveServer(s.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                        activeServer === s.id
                          ? 'bg-[#e50914] text-white shadow-red-600/40 ring-2 ring-red-500/50 scale-105'
                          : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700 hover:text-white border border-white/5'
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>

                {/* Desktop Reload Player Button */}
                <button
                  onClick={() => setPlayerKey((k) => k + 1)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-gray-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-white/5 flex-shrink-0"
                  title="Muat Ulang Video"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Refresh Player</span>
                </button>
              </div>

              {/* TV Quick Prev / Next Buttons */}
              {mediaType === 'tv' && (
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs">
                  <button
                    onClick={handlePrevEpisode}
                    disabled={currentSeason === 1 && currentEpisode === 1}
                    className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-gray-200 disabled:opacity-30 disabled:hover:bg-zinc-800 transition-colors font-semibold flex items-center space-x-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Episode Sebelumnya</span>
                    <span className="sm:hidden">Prev Ep</span>
                  </button>

                  <span className="font-mono text-zinc-400 text-[11px] sm:text-xs">
                    S{currentSeason} : Episode {currentEpisode} dari {episodesList.length}
                  </span>

                  <button
                    onClick={handleNextEpisode}
                    className="px-3 py-1.5 rounded-xl bg-[#e50914] hover:bg-red-700 text-white font-semibold transition-colors shadow-md shadow-red-600/30 flex items-center space-x-1"
                  >
                    <span className="hidden sm:inline">Episode Berikutnya</span>
                    <span className="sm:hidden">Next Ep</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Movie / TV Information Card */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#151518] border border-white/10 space-y-4 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-2xl font-black text-white">{title}</h2>
                  {(movie?.tagline || tv?.tagline) && (
                    <p className="text-xs italic text-gray-400">"{movie?.tagline || tv?.tagline}"</p>
                  )}
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  {(movie?.vote_average || tv?.vote_average) && (
                    <div className="flex items-center space-x-1 text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{(movie?.vote_average || tv?.vote_average)?.toFixed(1)}</span>
                    </div>
                  )}
                  {releaseYear && (
                    <span className="flex items-center space-x-1 text-gray-300">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>{releaseYear}</span>
                    </span>
                  )}
                  <span className="text-[#e50914] font-bold uppercase text-xs">
                    {mediaType === 'tv' ? 'Serial TV' : 'Film'}
                  </span>
                </div>
              </div>

              {/* Synopsis */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sinopsis</h4>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {mediaType === 'tv'
                    ? currentEpisodeData?.overview || tv?.overview
                    : movie?.overview || 'Tidak ada deskripsi rinci.'}
                </p>
              </div>

              {/* Notice */}
              <p className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>Petunjuk: Jika video lambat atau error, ganti pilihan server pemutar di atas (VidLink / VidSrc / Embed.su).</span>
              </p>
            </div>
          </div>

          {/* Right Column (Sidebar): TV Episodes OR Movie Related (LK21 Style) */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-4">
            
            {/* IF TV SHOW: EPISODE LIST SIDEBAR */}
            {mediaType === 'tv' ? (
              <div className="rounded-2xl bg-[#151518] border border-white/10 p-4 space-y-3.5 shadow-xl">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <Tv className="w-4 h-4 text-[#e50914]" />
                    <h3 className="text-sm font-black uppercase tracking-wider text-white">Daftar Episode</h3>
                  </div>

                  {/* Season Selector */}
                  {(tv?.seasons?.length ?? 0) > 1 && (
                    <select
                      value={currentSeason}
                      onChange={(e) => handleSelectSeason(Number(e.target.value))}
                      className="bg-zinc-800 border border-zinc-700 text-white rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:border-red-500 cursor-pointer"
                    >
                      {(tv?.seasons || [])
                        .filter((s: SeasonItem) => s.season_number > 0)
                        .map((s: SeasonItem) => (
                          <option key={s.id} value={s.season_number}>
                            {s.name} ({s.episode_count} Ep)
                          </option>
                        ))}
                    </select>
                  )}
                </div>

                {/* Batch Selector for Long Series (e.g. 120 episodes) */}
                {totalBatchPages > 1 && (
                  <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                    <span className="text-[11px] font-semibold text-zinc-400 flex-shrink-0">Batch:</span>
                    <select
                      value={currentBatchPage}
                      onChange={(e) => setCurrentBatchPage(Number(e.target.value))}
                      className="w-full bg-zinc-800 border border-zinc-700 text-white text-xs font-bold rounded-lg px-2 py-1 focus:outline-none focus:border-red-500 cursor-pointer"
                    >
                      {Array.from({ length: totalBatchPages }).map((_, idx) => {
                        const p = idx + 1;
                        const start = (p - 1) * BATCH_SIZE + 1;
                        const end = Math.min(p * BATCH_SIZE, episodesList.length);
                        return (
                          <option key={p} value={p}>
                            Episode {start} - {end}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                {/* Scrollable Episodes in Active Batch */}
                <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
                  {visibleEpisodes.length > 0 ? (
                    visibleEpisodes.map((ep) => {
                      const isPlaying = ep.episode_number === currentEpisode;
                      return (
                        <div
                          key={ep.id}
                          onClick={() => handleSelectEpisode(ep.episode_number)}
                          className={`p-2.5 rounded-xl transition-all cursor-pointer flex gap-3 items-center group border ${
                            isPlaying
                              ? 'bg-red-950/40 border-red-600/70 shadow-lg ring-1 ring-red-600/40'
                              : 'bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-800/80 hover:border-zinc-700'
                          }`}
                        >
                          {/* 16:9 Still Thumbnail or Compact Episode Number Box */}
                          {ep.still_path ? (
                            <div className="relative aspect-video w-24 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-800">
                              <img
                                src={getTMDBImageUrl(ep.still_path, 'w300')}
                                alt={ep.name}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = getDirectTMDBUrl(ep.still_path, 'w300');
                                }}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                loading="lazy"
                              />
                              {isPlaying && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                  <Play className="w-4 h-4 fill-[#e50914] text-[#e50914]" />
                                </div>
                              )}
                            </div>
                          ) : (
                            <div
                              className={`w-14 h-11 flex-shrink-0 rounded-lg flex items-center justify-center font-bold text-xs border ${
                                isPlaying
                                  ? 'bg-red-600/20 text-[#e50914] border-red-500/50'
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
                            <div className="flex items-center space-x-2 text-[10px] text-zinc-400 mt-0.5">
                              {ep.runtime && <span>{ep.runtime} mnt</span>}
                              {isPlaying && (
                                <span className="font-bold text-[#e50914] uppercase tracking-wider">
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
            ) : (
              /* IF MOVIE: RELATED MOVIES SIDEBAR (LK21 Style) */
              <div className="rounded-2xl bg-[#151518] border border-white/10 p-4 space-y-4 shadow-xl">
                <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3">
                  <Film className="w-4 h-4 text-[#e50914]" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">Movie Terkait</h3>
                </div>

                <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
                  {relatedItems.length > 0 ? (
                    relatedItems.map((item) => (
                      <Link
                        key={item.id}
                        to={getWatchMovieUrl(item.id, item.title)}
                        className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:bg-zinc-800/80 hover:border-zinc-700 transition-all flex gap-3 items-center group shadow-sm"
                      >
                        {/* Poster Thumbnail */}
                        <div className="relative aspect-[2/3] w-14 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-800 shadow">
                          <img
                            src={getTMDBImageUrl(item.poster_path, 'w185')}
                            alt={item.title || ''}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = getDirectTMDBUrl(item.poster_path, 'w185');
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            loading="lazy"
                          />
                        </div>

                        {/* Title & Meta */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-white group-hover:text-[#e50914] transition-colors truncate">
                            {item.title}
                          </h4>
                          <div className="flex items-center space-x-2 text-[10px] text-zinc-400 mt-1">
                            {item.vote_average && (
                              <span className="flex items-center text-amber-400 font-bold">
                                <Star className="w-3 h-3 fill-current mr-0.5" />
                                {item.vote_average.toFixed(1)}
                              </span>
                            )}
                            <span>{(item.release_date || '').split('-')[0]}</span>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="p-6 text-center text-xs text-zinc-500">Tidak ada film terkait.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
