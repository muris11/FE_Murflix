import { apiClient } from './client';

export interface WatchlistRecord {
  id: string;
  user_id: string;
  media_type: 'movie' | 'tv' | 'drama' | 'anime';
  tmdb_id: number;
  title: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  created_at: string;
}

export const watchlistApi = {
  getWatchlist: async (profileId?: string) => {
    const res = await apiClient.get<{ items: WatchlistRecord[] }>('/watchlist', {
      params: profileId ? { profile_id: profileId } : undefined,
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
    const res = await apiClient.post<{ message: string; item: WatchlistRecord }>('/watchlist', item);
    return res.data.item;
  },

  remove: async (mediaType: string, tmdbId: number, profileId?: string) => {
    const res = await apiClient.delete<{ message: string }>(`/watchlist/${mediaType}/${tmdbId}`, {
      params: profileId ? { profile_id: profileId } : undefined,
    });
    return res.data;
  },

  check: async (mediaType: string, tmdbId: number, profileId?: string) => {
    const res = await apiClient.get<{ in_watchlist: boolean }>(`/watchlist/check/${mediaType}/${tmdbId}`, {
      params: profileId ? { profile_id: profileId } : undefined,
    });
    return res.data.in_watchlist;
  },
};

