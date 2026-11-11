import { useState, useEffect, useCallback } from 'react';
import { NotificationItem } from '@/types/notification';
import { apiClient } from '@/api/client';

const READ_STORAGE_KEY = 'murflix_notifications_read_ids';
const DISMISSED_STORAGE_KEY = 'murflix_notifications_dismissed_ids';

const DEFAULT_SYSTEM_NOTICES: NotificationItem[] = [
  {
    id: 'sys-servers-adfree',
    title: '8 Server Ad-Free Tersedia',
    message: 'Server EmbedWave, VidCore 4K, Stellar, dan YapGrid kini siap digunakan tanpa jeda iklan.',
    category: 'system',
    timestamp: 'Baru saja',
    read: false,
    action_url: '/browse/movies',
    badge: 'Fitur Baru',
  },
  {
    id: 'sys-account-active',
    title: 'Akses Akun Aktif',
    message: 'Langganan Murflix Anda aktif. Anda dapat menonton seluruh katalog film dan serial TV tanpa batas.',
    category: 'account',
    timestamp: '1 jam lalu',
    read: false,
    action_url: '/settings',
    badge: 'Akun',
  },
  {
    id: 'sys-welcome',
    title: 'Selamat Datang di Murflix',
    message: 'Gunakan fitur Daftar Saya untuk menyimpan film favorit dan nikmati pemutaran instan berkecepatan tinggi.',
    category: 'system',
    timestamp: 'Hari ini',
    read: false,
    action_url: '/my-list',
    badge: 'Tips',
  },
];

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load read and dismissed IDs from localStorage
  const getReadIds = useCallback((): Set<string> => {
    try {
      const data = localStorage.getItem(READ_STORAGE_KEY);
      return data ? new Set(JSON.parse(data)) : new Set();
    } catch {
      return new Set();
    }
  }, []);

  const getDismissedIds = useCallback((): Set<string> => {
    try {
      const data = localStorage.getItem(DISMISSED_STORAGE_KEY);
      return data ? new Set(JSON.parse(data)) : new Set();
    } catch {
      return new Set();
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    const readIds = getReadIds();
    const dismissedIds = getDismissedIds();

    let movieNotices: NotificationItem[] = [];

    try {
      // Fetch trending movies and series to create real content notifications
      const res = await apiClient.get<{ results: any[] }>('/public/trending');
      if (res.data?.results && Array.isArray(res.data.results)) {
        movieNotices = res.data.results.slice(0, 5).map((item) => {
          const isTv = item.media_type === 'tv' || !!item.first_air_date;
          const title = item.title || item.name || 'Tayangan Populer';
          const mediaType = isTv ? 'tv' : 'movie';
          const posterUrl = item.poster_path
            ? `https://image.tmdb.org/t/p/w200${item.poster_path}`
            : undefined;

          return {
            id: `trending-${mediaType}-${item.id}`,
            title: isTv ? `Serial Baru: ${title}` : `Film Trending: ${title}`,
            message: item.overview
              ? item.overview.length > 90
                ? item.overview.substring(0, 90) + '...'
                : item.overview
              : 'Tersedia sekarang di Murflix dengan kualitas Full HD & 4K.',
            category: isTv ? ('tv' as const) : ('movie' as const),
            timestamp: 'Trending',
            read: false,
            action_url: `/${mediaType}/${item.id}`,
            poster_url: posterUrl,
            badge: isTv ? 'Serial TV' : 'Film',
          };
        });
      }
    } catch {
      // Fallback cleanly if network is unreachable
    }

    const allCombined = [...movieNotices, ...DEFAULT_SYSTEM_NOTICES];

    // Filter out dismissed items and apply read state
    const processed = allCombined
      .filter((item) => !dismissedIds.has(item.id))
      .map((item) => ({
        ...item,
        read: readIds.has(item.id),
      }));

    setNotifications(processed);
    setIsLoading(false);
  }, [getReadIds, getDismissedIds]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markAsRead = useCallback((id: string) => {
    try {
      const readIds = getReadIds();
      readIds.add(id);
      localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(Array.from(readIds)));
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, read: true } : item))
      );
    } catch {}
  }, [getReadIds]);

  const markAllAsRead = useCallback(() => {
    try {
      const allIds = notifications.map((n) => n.id);
      const readIds = getReadIds();
      allIds.forEach((id) => readIds.add(id));
      localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(Array.from(readIds)));
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    } catch {}
  }, [notifications, getReadIds]);

  const deleteNotification = useCallback((id: string) => {
    try {
      const dismissedIds = getDismissedIds();
      dismissedIds.add(id);
      localStorage.setItem(DISMISSED_STORAGE_KEY, JSON.stringify(Array.from(dismissedIds)));
      setNotifications((prev) => prev.filter((item) => item.id !== id));
    } catch {}
  }, [getDismissedIds]);

  const clearAll = useCallback(() => {
    try {
      const dismissedIds = getDismissedIds();
      notifications.forEach((item) => dismissedIds.add(item.id));
      localStorage.setItem(DISMISSED_STORAGE_KEY, JSON.stringify(Array.from(dismissedIds)));
      setNotifications([]);
    } catch {}
  }, [notifications, getDismissedIds]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refresh: loadNotifications,
  };
}
