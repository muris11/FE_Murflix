import { apiClient } from './client';

export interface WatchlistRecord {
  id: string;
  user_id: string;
  profile_id?: string | null;
  media_type: 'movie' | 'tv' | 'drama' | 'anime';
  tmdb_id: number;
  title: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  created_at: string;
}

function getActiveProfileId(): string | undefined {
  try {
    const raw = localStorage.getItem('murflix_active_profile');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.id) return parsed.id;
    }
  } catch {}
  return undefined;
}

export const watchlistApi = {
  getWatchlist: async (profileId?: string) => {
    const pid = profileId || getActiveProfileId();
    const headers = pid ? { 'X-Profile-ID': pid } : undefined;
    const res = await apiClient.get<{ items: WatchlistRecord[] }>('/watchlist', {
      params: pid ? { profile_id: pid } : undefined,
      headers,
    });
    return res.data.items;
  },

  add: async (item: {
    media_type: string;
    tmdb_id: number;
    title: string;
    poster_path?: string | null;
    backdrop_path?: string | null;
    vote_average?: number;
    profile_id?: string;
  }) => {
    const pid = item.profile_id || getActiveProfileId();
    const headers = pid ? { 'X-Profile-ID': pid } : undefined;
    const res = await apiClient.post<{ message: string; item: WatchlistRecord }>(
      '/watchlist',
      {
        ...item,
        profile_id: pid,
      },
      { headers }
    );
    return res.data.item;
  },

  remove: async (mediaType: string, tmdbId: number, profileId?: string) => {
    const pid = profileId || getActiveProfileId();
    const headers = pid ? { 'X-Profile-ID': pid } : undefined;
    const res = await apiClient.delete<{ message: string }>(`/watchlist/${mediaType}/${tmdbId}`, {
      params: pid ? { profile_id: pid } : undefined,
      headers,
    });
    return res.data;
  },

  check: async (mediaType: string, tmdbId: number, profileId?: string) => {
    const pid = profileId || getActiveProfileId();
    const headers = pid ? { 'X-Profile-ID': pid } : undefined;
    const res = await apiClient.get<{ in_watchlist: boolean }>(`/watchlist/check/${mediaType}/${tmdbId}`, {
      params: pid ? { profile_id: pid } : undefined,
      headers,
    });
    return res.data.in_watchlist;
  },
};

