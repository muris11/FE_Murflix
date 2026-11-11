import React, { useState, useEffect } from 'react';
import { X, Server, Maximize2, AlertCircle } from 'lucide-react';
import { moviesApi } from '@/api/movies';
import { StreamingServer } from '@/types/tmdb';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subTitle?: string;
  tmdbId?: number;
  mediaType?: 'movie' | 'tv';
  season?: number;
  episode?: number;
  directVideoUrl?: string | null;
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
  directVideoUrl,
}) => {
  const [servers, setServers] = useState<StreamingServer[]>(DEFAULT_SERVERS);
  const [activeServer, setActiveServer] = useState<string>('vidlink');
  const [showServerPicker, setShowServerPicker] = useState(false);

  useEffect(() => {
    moviesApi
      .getStreamingServers()
      .then((data) => {
        if (data && data.length > 0) {
          setServers(data);
          setActiveServer(data[0].id);
        }
      })
      .catch(() => {
        // Fallback to default
      });
  }, []);

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

    let urlTemplate = mediaType === 'movie' ? currentServer.movieUrl : currentServer.tvUrl;
    return urlTemplate
      .replace('{id}', String(tmdbId))
      .replace('{s}', String(season))
      .replace('{e}', String(episode));
  };

  const embedUrl = getEmbedUrl();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 md:p-6 animate-fadeIn">
      <div className="relative w-full max-w-6xl bg-[#181818] rounded-2xl overflow-hidden border border-gray-800 shadow-2xl flex flex-col max-h-[95vh]">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gray-800 bg-[#121212]">
          <div className="min-w-0 pr-4">
            <h3 className="text-base sm:text-lg font-bold text-white truncate">{title || 'Memutar Video'}</h3>
            {subTitle && <p className="text-xs text-gray-400 truncate">{subTitle}</p>}
          </div>

          <div className="flex items-center space-x-2">
            {!directVideoUrl && (
              <div className="relative">
                <button
                  onClick={() => setShowServerPicker(!showServerPicker)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs sm:text-sm font-medium text-gray-200 transition-colors border border-gray-700"
                >
                  <Server className="w-3.5 h-3.5 text-red-500" />
                  <span>Server: {currentServer?.name}</span>
                </button>

                {showServerPicker && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#222] border border-gray-700 rounded-xl shadow-2xl p-2 z-50 space-y-1">
                    <p className="text-[11px] font-semibold text-gray-400 px-2 py-1 uppercase tracking-wider">
                      Pilih Server Cadangan
                    </p>
                    {servers.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setActiveServer(s.id);
                          setShowServerPicker(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                          activeServer === s.id
                            ? 'bg-[#e50914] text-white'
                            : 'text-gray-300 hover:bg-gray-800'
                        }`}
                      >
                        <div>
                          <p className="font-semibold">{s.name}</p>
                          <p className="text-[10px] text-gray-300 opacity-80">{s.description}</p>
                        </div>
                        {activeServer === s.id && <span className="text-[10px] uppercase font-bold">Aktif</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-gray-800 hover:bg-red-600 hover:text-white text-gray-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Frame */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center">
          {embedUrl ? (
            <iframe
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
        </div>

        {/* Bottom Helper Bar */}
        <div className="px-4 py-2 bg-[#101010] border-t border-gray-800 flex items-center justify-between text-[11px] text-gray-400">
          <span>💡 Jika video tidak bisa diputar atau lambat, ganti server melalui tombol "Server" di kanan atas.</span>
          <span className="hidden sm:inline">Tekan ESC untuk keluar</span>
        </div>
      </div>
    </div>
  );
};

