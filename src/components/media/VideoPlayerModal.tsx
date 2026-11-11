import React, { useState, useEffect } from 'react';
import { X, Server, AlertCircle, Play, List, SkipForward, SkipBack, ChevronRight, Check } from 'lucide-react';
import { moviesApi } from '@/api/movies';
import { StreamingServer, SeasonItem, EpisodeItem } from '@/types/tmdb';
import { getTMDBImageUrl, getDirectTMDBUrl } from '@/utils/image';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subTitle?: string;
  tmdbId?: number;
  mediaType?: 'movie' | 'tv';
  season?: number;
  episode?: number;
  seasonsList?: SeasonItem[];
  directVideoUrl?: string | null;
  onEpisodeChange?: (season: number, episode: number) => void;
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

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  isOpen,
  onClose,
  title,
  subTitle,
  tmdbId,
  mediaType = 'movie',
  season = 1,
  episode = 1,
  seasonsList,
  directVideoUrl,
  onEpisodeChange,
}) => {
  const [servers, setServers] = useState<StreamingServer[]>(DEFAULT_SERVERS);
  const [activeServer, setActiveServer] = useState<string>('vidlink');

  // TV Episode & Season State
  const [currentSeason, setCurrentSeason] = useState<number>(season);
  const [currentEpisode, setCurrentEpisode] = useState<number>(episode);
  const [availableSeasons, setAvailableSeasons] = useState<SeasonItem[]>(seasonsList || []);
  const [episodes, setEpisodes] = useState<EpisodeItem[]>([]);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);
  const [isEpisodeDrawerOpen, setIsEpisodeDrawerOpen] = useState(false);

  // Sync props when modal opens or props change
  useEffect(() => {
    if (isOpen) {
      setCurrentSeason(season);
      setCurrentEpisode(episode);
    }
  }, [isOpen, season, episode]);

  // Load server list
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

  // Fetch season list if not provided and it's a TV show
  useEffect(() => {
    if (isOpen && mediaType === 'tv' && tmdbId && (!availableSeasons || availableSeasons.length === 0)) {
      moviesApi
        .getTVDetails(tmdbId)
        .then((data) => {
          if (data?.seasons) {
            setAvailableSeasons(data.seasons.filter((s: SeasonItem) => s.season_number > 0));
          }
        })
        .catch(() => {});
    }
  }, [isOpen, mediaType, tmdbId, availableSeasons]);

  // Fetch episodes when currentSeason or tmdbId changes
  useEffect(() => {
    if (isOpen && mediaType === 'tv' && tmdbId) {
      setIsLoadingEpisodes(true);
      moviesApi
        .getTVSeason(tmdbId, currentSeason)
        .then((data) => {
          setEpisodes(data?.episodes || []);
        })
        .catch((err) => console.error('Gagal mengambil daftar episode:', err))
        .finally(() => setIsLoadingEpisodes(false));
    }
  }, [isOpen, mediaType, tmdbId, currentSeason]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentServer = servers.find((s) => s.id === activeServer) || servers[0];

  const getEmbedUrl = () => {
    if (directVideoUrl) return directVideoUrl;
    if (!tmdbId) return '';

    const urlTemplate = mediaType === 'movie' ? currentServer.movieUrl : currentServer.tvUrl;
    return urlTemplate
      .replace('{id}', String(tmdbId))
      .replace('{s}', String(currentSeason))
      .replace('{e}', String(currentEpisode));
  };

  const embedUrl = getEmbedUrl();

  const currentEpisodeData = episodes.find((ep) => ep.episode_number === currentEpisode);

  // Switch episode handler
  const handleSelectEpisode = (sNum: number, epNum: number) => {
    setCurrentSeason(sNum);
    setCurrentEpisode(epNum);
    if (onEpisodeChange) {
      onEpisodeChange(sNum, epNum);
    }
  };

  // Next / Prev Episode Handlers
  const hasNextEpisode = () => {
    if (episodes.length > 0 && currentEpisode < episodes.length) return true;
    const nextSeasonExists = availableSeasons.some((s) => s.season_number === currentSeason + 1);
    return nextSeasonExists;
  };

  const handleNextEpisode = () => {
    if (currentEpisode < episodes.length) {
      handleSelectEpisode(currentSeason, currentEpisode + 1);
    } else {
      const nextSeason = availableSeasons.find((s) => s.season_number === currentSeason + 1);
      if (nextSeason) {
        handleSelectEpisode(nextSeason.season_number, 1);
      }
    }
  };

  const handlePrevEpisode = () => {
    if (currentEpisode > 1) {
      handleSelectEpisode(currentSeason, currentEpisode - 1);
    } else if (currentSeason > 1) {
      const prevSeason = availableSeasons.find((s) => s.season_number === currentSeason - 1);
      if (prevSeason) {
        handleSelectEpisode(prevSeason.season_number, prevSeason.episode_count || 1);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-1 sm:p-4 md:p-6 animate-fadeIn">
      <div className="relative w-full max-w-6xl bg-[#121214] rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black flex flex-col max-h-[96vh]">
        
        {/* Top Header Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 bg-[#16161a] gap-2">
          
          {/* Title & Episode Meta */}
          <div className="min-w-0 pr-2">
            <h3 className="text-base sm:text-lg font-bold text-white truncate flex items-center gap-2">
              <span>{title || 'Memutar Video'}</span>
              {mediaType === 'tv' && (
                <span className="px-2 py-0.5 rounded bg-red-600/20 text-[#e50914] text-xs font-mono font-bold border border-red-500/30">
                  S{currentSeason}:E{currentEpisode}
                </span>
              )}
            </h3>
            <p className="text-xs text-gray-400 truncate">
              {mediaType === 'tv'
                ? currentEpisodeData?.name
                  ? `Episode ${currentEpisode}: "${currentEpisodeData.name}"`
                  : `Musim ${currentSeason} • Episode ${currentEpisode}`
                : subTitle || 'Kualitas HD • Multi Subtitle'}
            </p>
          </div>

          {/* Action Buttons: Episodes, Next, Servers, Close */}
          <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2">
            
            {/* TV Controls: Prev / Next / Episode Drawer Toggle */}
            {mediaType === 'tv' && (
              <div className="flex items-center space-x-1.5 bg-zinc-900/90 p-1 rounded-xl border border-white/5">
                <button
                  onClick={handlePrevEpisode}
                  disabled={currentSeason === 1 && currentEpisode === 1}
                  className="px-2 py-1 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-all flex items-center gap-1"
                  title="Episode Sebelumnya"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Prev</span>
                </button>

                <button
                  onClick={handleNextEpisode}
                  disabled={!hasNextEpisode()}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#e50914] hover:bg-red-700 text-white disabled:opacity-30 disabled:hover:bg-[#e50914] transition-all flex items-center gap-1 shadow-md shadow-red-600/30"
                  title="Episode Berikutnya"
                >
                  <span>Next Ep</span>
                  <SkipForward className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setIsEpisodeDrawerOpen(!isEpisodeDrawerOpen)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isEpisodeDrawerOpen
                      ? 'bg-white text-black font-bold shadow-md'
                      : 'bg-zinc-800 text-gray-200 hover:bg-zinc-700 hover:text-white'
                  }`}
                  title="Buka Daftar Episode"
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Episode ({episodes.length})</span>
                </button>
              </div>
            )}

            {/* Quick Server Switcher Pills */}
            {!directVideoUrl && (
              <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-0.5">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider hidden xl:inline mr-0.5">
                  Server:
                </span>
                {servers.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveServer(s.id)}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center space-x-1 ${
                      activeServer === s.id
                        ? 'bg-zinc-700 text-white border border-white/20 shadow-sm'
                        : 'bg-zinc-900/80 text-gray-400 hover:bg-zinc-800 hover:text-gray-200 border border-white/5'
                    }`}
                  >
                    <Server className="w-2.5 h-2.5" />
                    <span>{s.name}</span>
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-[#e50914] hover:text-white text-gray-300 transition-colors ml-1"
              title="Tutup (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Frame with Slide-Over Episode Drawer */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
          {embedUrl ? (
            <iframe
              key={embedUrl}
              src={embedUrl}
              title={title || 'Player'}
              className="w-full h-full border-0"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400 space-y-2 p-6">
              <AlertCircle className="w-10 h-10 text-red-500" />
              <p className="text-sm">Sumber video tidak tersedia atau URL tidak valid.</p>
            </div>
          )}

          {/* Netflix 1:1 Slide-Over Episode Drawer */}
          {mediaType === 'tv' && isEpisodeDrawerOpen && (
            <div className="absolute inset-y-0 right-0 w-full sm:w-96 md:w-[420px] bg-[#121214]/96 backdrop-blur-2xl border-l border-white/10 z-40 flex flex-col shadow-2xl animate-fadeIn">
              
              {/* Drawer Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
                <div className="flex items-center space-x-2">
                  <List className="w-4 h-4 text-[#e50914]" />
                  <h4 className="text-sm font-bold text-white">Daftar Episode</h4>
                </div>

                {/* Season Dropdown */}
                {availableSeasons.length > 1 && (
                  <select
                    value={currentSeason}
                    onChange={(e) => {
                      const sVal = Number(e.target.value);
                      setCurrentSeason(sVal);
                      setCurrentEpisode(1);
                      if (onEpisodeChange) onEpisodeChange(sVal, 1);
                    }}
                    className="bg-zinc-800 border border-zinc-700 text-white rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:border-red-500"
                  >
                    {availableSeasons.map((s) => (
                      <option key={s.id} value={s.season_number}>
                        {s.name} ({s.episode_count} Ep)
                      </option>
                    ))}
                  </select>
                )}

                <button
                  onClick={() => setIsEpisodeDrawerOpen(false)}
                  className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Episode List */}
              <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/60 p-2 space-y-1">
                {isLoadingEpisodes ? (
                  <div className="flex flex-col items-center justify-center py-16 space-y-3">
                    <div className="w-8 h-8 rounded-full border-2 border-red-600 border-t-transparent animate-spin" />
                    <p className="text-xs text-zinc-400">Memuat episode Musim {currentSeason}...</p>
                  </div>
                ) : episodes.length > 0 ? (
                  episodes.map((ep) => {
                    const isPlaying = ep.episode_number === currentEpisode;
                    return (
                      <div
                        key={ep.id}
                        onClick={() => {
                          handleSelectEpisode(currentSeason, ep.episode_number);
                        }}
                        className={`p-2.5 rounded-xl transition-all cursor-pointer flex gap-3 items-start group ${
                          isPlaying
                            ? 'bg-red-950/40 border border-red-600/70 shadow-lg'
                            : 'hover:bg-zinc-800/60 border border-transparent'
                        }`}
                      >
                        {/* Episode Thumbnail */}
                        <div className="relative aspect-video w-28 sm:w-32 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-900 border border-white/5">
                          {ep.still_path ? (
                            <img
                              src={getTMDBImageUrl(ep.still_path, 'w300')}
                              alt={ep.name}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = getDirectTMDBUrl(ep.still_path, 'w300');
                              }}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500 font-bold bg-zinc-900">
                              E{ep.episode_number}
                            </div>
                          )}

                          {/* Hover / Playing Play Overlay */}
                          <div className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${
                            isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          }`}>
                            <div className="w-7 h-7 rounded-full bg-[#e50914] text-white flex items-center justify-center shadow-lg">
                              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                            </div>
                          </div>

                          {/* Duration Badge */}
                          {ep.runtime && (
                            <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/80 text-[9px] font-mono font-medium text-gray-300">
                              {ep.runtime}m
                            </span>
                          )}
                        </div>

                        {/* Title & Overview */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h5 className={`text-xs font-bold truncate ${
                              isPlaying ? 'text-[#e50914]' : 'text-white group-hover:text-red-400'
                            }`}>
                              {ep.episode_number}. {ep.name}
                            </h5>
                            {isPlaying && (
                              <span className="flex-shrink-0 text-[10px] font-bold text-[#e50914] flex items-center gap-0.5">
                                <Check className="w-3 h-3" />
                                Diputar
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                            {ep.overview || 'Tidak ada sinopsis untuk episode ini.'}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-xs text-zinc-500">
                    Tidak ada episode yang tersedia untuk musim ini.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Helper Bar */}
        <div className="px-4 py-2 bg-[#0e0e10] border-t border-white/5 flex flex-wrap items-center justify-between text-[11px] text-gray-400 gap-2">
          <div className="flex items-center gap-2">
            <span>💡 Jika video loading lambat atau tidak muncul, klik nama server lain di atas (VidLink / VidSrc / Embed.su).</span>
          </div>
          <div className="flex items-center gap-3 text-gray-500">
            {mediaType === 'tv' && (
              <span className="text-zinc-400 hidden sm:inline">
                Klik tombol <strong>Episode</strong> di atas untuk ganti episode kapan saja
              </span>
            )}
            <span className="hidden sm:inline">Tekan ESC untuk keluar</span>
          </div>
        </div>
      </div>
    </div>
  );
};
