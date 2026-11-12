import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Film,
  Tv,
  Shield,
  Server,
  X,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationItem } from '@/types/notification';

export const NotificationDropdown: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const displayedNotifications = notifications.filter((item) => {
    if (filter === 'unread') return !item.read;
    return true;
  });

  const handleItemClick = (item: NotificationItem) => {
    if (!item.read) {
      markAsRead(item.id);
    }
    setIsOpen(false);
    if (item.action_url) {
      navigate(item.action_url);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'movie':
        return <Film className="w-4 h-4 text-red-500" />;
      case 'tv':
        return <Tv className="w-4 h-4 text-blue-400" />;
      case 'account':
        return <Shield className="w-4 h-4 text-purple-400" />;
      case 'system':
      default:
        return <Server className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative cursor-pointer p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-all focus:outline-none"
        aria-label="Pemberitahuan & Update Konten"
      >
        <Bell className="w-5 h-5 transition-transform hover:scale-110" />

        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-[#e50914] text-white text-[10px] font-black flex items-center justify-center shadow-md">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-40 sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dropdown Popover (Centered on Mobile, Anchored on Desktop) */}
      {isOpen && (
        <div className="fixed sm:absolute left-3 right-3 sm:left-auto sm:right-0 top-16 sm:top-full mt-2 sm:mt-2.5 max-w-sm sm:max-w-none sm:w-96 mx-auto sm:mx-0 rounded-2xl bg-[#141417] border border-zinc-800 shadow-2xl z-50 overflow-hidden animate-fadeIn">
          
          {/* Header */}
          <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/60">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white text-sm">Pemberitahuan</span>
              {unreadCount > 0 && (
                <span className="text-red-500 text-xs font-semibold">
                  ({unreadCount} baru)
                </span>
              )}
            </div>

            <div className="flex items-center space-x-1.5 text-xs text-gray-400">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="px-2 py-1 rounded-lg hover:bg-zinc-800 text-gray-300 hover:text-white transition-colors flex items-center space-x-1"
                  title="Tandai semua sudah dibaca"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-[11px] font-medium hidden sm:inline">Baca Semua</span>
                </button>
              )}

              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="p-1 rounded-lg hover:bg-zinc-800 text-gray-400 hover:text-red-400 transition-colors"
                  title="Bersihkan semua notifikasi"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Close Button for Mobile */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-zinc-800 text-gray-400 hover:text-white transition-colors sm:hidden"
                title="Tutup pemberitahuan"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-zinc-800/80 px-3 pt-2 bg-zinc-900/30 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`pb-2 px-3 border-b-2 transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'border-red-600 text-white font-bold'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              Semua ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`pb-2 px-3 border-b-2 transition-colors cursor-pointer ${
                filter === 'unread'
                  ? 'border-red-600 text-white font-bold'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              Belum Dibaca ({unreadCount})
            </button>
          </div>

          {/* List of Notifications */}
          <div className="max-h-[50vh] sm:max-h-[380px] overflow-y-auto divide-y divide-zinc-800/40">
            {displayedNotifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-gray-500">
                  <Info className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-gray-300">
                  {filter === 'unread'
                    ? 'Tidak ada pemberitahuan baru yang belum dibaca'
                    : 'Tidak ada pemberitahuan'}
                </p>
                <p className="text-[11px] text-gray-500">
                  Anda sudah membaca seluruh informasi rilis dan pembaruan sistem.
                </p>
              </div>
            ) : (
              displayedNotifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`p-3.5 sm:p-4 flex items-start space-x-3.5 transition-colors cursor-pointer group relative ${
                    item.read
                      ? 'hover:bg-zinc-800/40 bg-transparent opacity-80 hover:opacity-100'
                      : 'bg-zinc-800/25 hover:bg-zinc-800/60'
                  }`}
                >
                  {/* Unread Indicator Bar */}
                  {!item.read && (
                    <span className="absolute left-0 top-3 bottom-3 w-1 bg-red-600 rounded-r-full" />
                  )}

                  {/* Thumbnail / Category Icon */}
                  {item.poster_url ? (
                    <div className="w-11 h-16 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-700/60 flex-shrink-0 shadow-md">
                      <img
                        src={item.poster_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0 shadow">
                      {getCategoryIcon(item.category)}
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-1.5 min-w-0">
                        {item.badge && (
                          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider flex-shrink-0">
                            [{item.badge}]
                          </span>
                        )}
                        <h4
                          className={`text-xs font-bold truncate ${
                            item.read ? 'text-gray-300' : 'text-white'
                          }`}
                        >
                          {item.title}
                        </h4>
                      </div>
                      <span className="text-[10px] text-gray-500 flex-shrink-0 whitespace-nowrap">
                        {item.timestamp}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                  </div>

                  {/* Item Actions */}
                  <div className="flex flex-col items-center space-y-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    {!item.read && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(item.id);
                        }}
                        className="p-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-gray-300 hover:text-emerald-400 transition-colors"
                        title="Tandai dibaca"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(item.id);
                      }}
                      className="p-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-gray-400 hover:text-red-400 transition-colors"
                      title="Hapus pemberitahuan"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-zinc-800/80 bg-zinc-900/50 text-center">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate('/browse/movies');
              }}
              className="inline-flex items-center space-x-1.5 text-xs text-red-500 hover:text-red-400 font-bold transition-colors cursor-pointer"
            >
              <span>Jelajahi Semua Film &amp; Serial Trending</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

