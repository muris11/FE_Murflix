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
  getWatchlist: async () => {
    const res = await apiClient.get<{ items: WatchlistRecord[] }>('/watchlist');
    return res.data.items;
  },

  add: async (item: {
    media_type: string;
    tmdb_id: number;
    title: string;
    poster_path?: string | null;
    backdrop_path?: string | null;
    vote_average?: number;
  }) => {
    const res = await apiClient.post<{ message: string; item: WatchlistRecord }>('/watchlist', item);
    return res.data.item;
  },

  remove: async (mediaType: string, tmdbId: number) => {
    const res = await apiClient.delete<{ message: string }>(`/watchlist/${mediaType}/${tmdbId}`);
    return res.data;
  },

  check: async (mediaType: string, tmdbId: number) => {
    const res = await apiClient.get<{ in_watchlist: boolean }>(`/watchlist/check/${mediaType}/${tmdbId}`);
    return res.data.in_watchlist;
  },
};

