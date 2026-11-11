import { apiClient } from './client';
import { MediaItem, TMDBResponse, StreamingServer } from '@/types/tmdb';

export const moviesApi = {
  getTrending: async (mediaType = 'all', timeWindow = 'week') => {
    const res = await apiClient.get<TMDBResponse<MediaItem>>('/movies/trending', {
      params: { media_type: mediaType, time_window: timeWindow },
    });
    return res.data;
  },

  getPopularMovies: async (page = 1) => {
    const res = await apiClient.get<TMDBResponse<MediaItem>>('/movies/popular', { params: { page } });
    return res.data;
  },

  getTopRatedMovies: async (page = 1) => {
    const res = await apiClient.get<TMDBResponse<MediaItem>>('/movies/top-rated', { params: { page } });
    return res.data;
  },

  getNowPlayingMovies: async (page = 1) => {
    const res = await apiClient.get<TMDBResponse<MediaItem>>('/movies/now-playing', { params: { page } });
    return res.data;
  },

  getUpcomingMovies: async (page = 1) => {
    const res = await apiClient.get<TMDBResponse<MediaItem>>('/movies/upcoming', { params: { page } });
    return res.data;
  },

  getMovieDetails: async (id: number | string) => {
    const res = await apiClient.get<any>(`/movies/${id}`);
    return res.data;
  },

  getPopularTV: async (page = 1) => {
    const res = await apiClient.get<TMDBResponse<MediaItem>>('/tv/popular', { params: { page } });
    return res.data;
  },

  getTopRatedTV: async (page = 1) => {
    const res = await apiClient.get<TMDBResponse<MediaItem>>('/tv/top-rated', { params: { page } });
    return res.data;
  },

  getAiringTodayTV: async (page = 1) => {
    const res = await apiClient.get<TMDBResponse<MediaItem>>('/tv/airing-today', { params: { page } });
    return res.data;
  },

  getOnTheAirTV: async (page = 1) => {
    const res = await apiClient.get<TMDBResponse<MediaItem>>('/tv/on-the-air', { params: { page } });
    return res.data;
  },

  getTVDetails: async (id: number | string) => {
    const res = await apiClient.get<any>(`/tv/${id}`);
    return res.data;
  },

  getTVSeason: async (id: number | string, seasonNumber: number | string) => {
    const res = await apiClient.get<any>(`/tv/${id}/season/${seasonNumber}`);
    return res.data;
  },

  getTVEpisode: async (id: number | string, seasonNumber: number | string, episodeNumber: number | string) => {
    const res = await apiClient.get<any>(`/tv/${id}/season/${seasonNumber}/episode/${episodeNumber}`);
    return res.data;
  },

  search: async (query: string, type = 'multi', page = 1) => {
    const res = await apiClient.get<TMDBResponse<MediaItem>>('/search', {
      params: { query, type, page },
    });
    return res.data;
  },

  discover: async (mediaType = 'movie', params: Record<string, string | number> = {}) => {
    const res = await apiClient.get<TMDBResponse<MediaItem>>('/discover', {
      params: { media_type: mediaType, ...params },
    });
    return res.data;
  },

  getGenres: async (type = 'movie') => {
    const res = await apiClient.get<{ genres: { id: number; name: string }[] }>('/genres', {
      params: { type },
    });
    return res.data;
  },

  getStreamingServers: async () => {
    const res = await apiClient.get<{ servers: StreamingServer[] }>('/config/streaming-servers');
    return res.data.servers;
  },
};

