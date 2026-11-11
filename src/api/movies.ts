import { apiClient } from './client';
import {
  MediaItem,
  TMDBResponse,
  StreamingServer,
  MovieDetails,
  TVDetails,
  PersonDetails,
  CollectionDetails,
  CreditsResponse,
  VideoItem,
  ReviewItem,
  WatchProvidersData,
  SeasonDetails,
  EpisodeItem,
} from '@/types/tmdb';

// Lightweight In-Memory Cache (TTL: 5 Menit) agar navigasi super ringan & instan
const apiCache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL = 5 * 60 * 1000;

async function cachedFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const item = apiCache.get(key);
  if (item && item.expiry > Date.now()) {
    return item.data as T;
  }
  const data = await fetcher();
  apiCache.set(key, { data, expiry: Date.now() + CACHE_TTL });
  return data;
}

export const moviesApi = {
  // ---------------------------------------------------------------------------
  // Trending
  // ---------------------------------------------------------------------------
  getTrending: async (mediaType = 'all', timeWindow = 'week') => {
    const key = `trending_${mediaType}_${timeWindow}`;
    return cachedFetch(key, async () => {
      const res = await apiClient.get<TMDBResponse<MediaItem>>('/movies/trending', {
        params: { media_type: mediaType, time_window: timeWindow },
      });
      return res.data;
    });
  },

  // ---------------------------------------------------------------------------
  // Movies Lists
  // ---------------------------------------------------------------------------
  getPopularMovies: async (page = 1) => {
    const key = `popular_movies_${page}`;
    return cachedFetch(key, async () => {
      const res = await apiClient.get<TMDBResponse<MediaItem>>('/movies/popular', { params: { page } });
      return res.data;
    });
  },

  getTopRatedMovies: async (page = 1) => {
    const key = `top_rated_movies_${page}`;
    return cachedFetch(key, async () => {
      const res = await apiClient.get<TMDBResponse<MediaItem>>('/movies/top-rated', { params: { page } });
      return res.data;
    });
  },

  getNowPlayingMovies: async (page = 1) => {
    const key = `now_playing_movies_${page}`;
    return cachedFetch(key, async () => {
      const res = await apiClient.get<TMDBResponse<MediaItem>>('/movies/now-playing', { params: { page } });
      return res.data;
    });
  },

  getUpcomingMovies: async (page = 1) => {
    const key = `upcoming_movies_${page}`;
    return cachedFetch(key, async () => {
      const res = await apiClient.get<TMDBResponse<MediaItem>>('/movies/upcoming', { params: { page } });
      return res.data;
    });
  },

  // ---------------------------------------------------------------------------
  // Movie Details & Sub-resources
  // ---------------------------------------------------------------------------
  getMovieDetails: async (id: number | string) => {
    const key = `movie_detail_${id}`;
    return cachedFetch(key, async () => {
      const res = await apiClient.get<MovieDetails>(`/movies/${id}`);
      return res.data;
    });
  },

  getMovieCredits: async (id: number | string) => {
    const key = `movie_credits_${id}`;
    return cachedFetch(key, async () => {
      const res = await apiClient.get<CreditsResponse>(`/movies/${id}/credits`);
      return res.data;
    });
  },

  getMovieVideos: async (id: number | string) => {
    const key = `movie_videos_${id}`;
    return cachedFetch(key, async () => {
      const res = await apiClient.get<{ id: number; results: VideoItem[] }>(`/movies/${id}/videos`);
      return res.data;
    });
  },

  getMovieSimilar: async (id: number | string, page = 1) => {
    const key = `movie_similar_${id}_${page}`;
    return cachedFetch(key, async () => {
      const res = await apiClient.get<TMDBResponse<MediaItem>>(`/movies/${id}/similar`, { params: { page } });
      return res.data;
    });
  },

  getMovieRecommendations: async (id: number | string, page = 1) => {
    const key = `movie_recommendations_${id}_${page}`;
    return cachedFetch(key, async () => {
      const res = await apiClient.get<TMDBResponse<MediaItem>>(`/movies/${id}/recommendations`, { params: { page } });
      return res.data;
    });
  },

  getMovieReviews: async (id: number | string, page = 1) => {
    const key = `movie_reviews_${id}_${page}`;
    return cachedFetch(key, async () => {
      const res = await apiClient.get<TMDBResponse<ReviewItem>>(`/movies/${id}/reviews`, { params: { page } });
      return res.data;
    });
  },

  getMovieWatchProviders: async (id: number | string) => {
    const key = `movie_watch_providers_${id}`;
    return cachedFetch(key, async () => {
      const res = await apiClient.get<WatchProvidersData>(`/movies/${id}/watch-providers`);
      return res.data;
    });
  },

  // ---------------------------------------------------------------------------
  // TV Shows Lists
  // ---------------------------------------------------------------------------
  getPopularTV: async (page = 1) => {
    const key = `popular_tv_${page}`;
    return cachedFetch(key, async () => {
      const res = await apiClient.get<TMDBResponse<MediaItem>>('/tv/popular', { params: { page } });
      return res.data;
    });
  },

  getTopRatedTV: async (page = 1) => {
    const key = `top_rated_tv_${page}`;
    return cachedFetch(key, async () => {
      const res = await apiClient.get<TMDBResponse<MediaItem>>('/tv/top-rated', { params: { page } });
      return res.data;
    });
  },

  getAiringTodayTV: async (page = 1) => {
    const key = `airing_today_tv_${page}`;
    return cachedFetch(key, async () => {
      const res = await apiClient.get<TMDBResponse<MediaItem>>('/tv/airing-today', { params: { page } });
      return res.data;
    });
  },

  getOnTheAirTV: async (page = 1) => {
    const key = `on_the_air_tv_${page}`;
    return cachedFetch(key, async () => {
      const res = await apiClient.get<TMDBResponse<MediaItem>>('/tv/on-the-air', { params: { page } });
      return res.data;
    });
  },

  // ---------------------------------------------------------------------------
  // TV Details & Sub-resources
  // ---------------------------------------------------------------------------
  getTVDetails: async (id: number | string) => {
    const key = `tv_detail_${id}`;
    return cachedFetch(key, async () => {
      const res = await apiClient.get<TVDetails>(`/tv/${id}`);
      return res.data;
    });
  },

  getTVCredits: async (id: number | string) => {
    const key = `tv_credits_${id}`;
    return cachedFetch(key, async () => {
      const res = await apiClient.get<CreditsResponse>(`/tv/${id}/credits`);
      return res.data;
    });
  },

  getTVVideos: async (id: number | string) => {
    const key = `tv_videos_${id}`;
    return cachedFetch(key, async () => {
      const res = await apiClient.get<{ id: number; results: VideoItem[] }>(`/tv/${id}/videos`);
      return res.data;
    });
  },

  getTVSimilar: async (id: number | string, page = 1) => {
    const key = `tv_similar_${id}_${page}`;
    return cachedFetch(key, async () => {
      const res = await apiClient.get<TMDBResponse<MediaItem>>(`/tv/${id}/similar`, { params: { page } });
      return res.data;
    });
  },

  getTVRecommendations: async (id: number | string, page = 1) => {
    const key = `tv_recommendations_${id}_${page}`;
    return cachedFetch(key, async () => {
      const res = await apiClient.get<TMDBResponse<MediaItem>>(`/tv/${id}/recommendations`, { params: { page } });
      return res.data;
    });
  },

  getTVReviews: async (id: number | string, page = 1) => {
    const key = `tv_reviews_${id}_${page}`;
    return cachedFetch(key, async () => {
      const res = await apiClient.get<TMDBResponse<ReviewItem>>(`/tv/${id}/reviews`, { params: { page } });
      return res.data;
    });
  },

  getTVWatchProviders: async (id: number | string) => {
    const key = `tv_watch_providers_${id}`;
    return cachedFetch(key, async () => {
      const res = await apiClient.get<WatchProvidersData>(`/tv/${id}/watch-providers`);
      return res.data;
    });
  },

  getTVSeason: async (id: number | string, seasonNumber: number | string) => {
    const key = `tv_season_${id}_${seasonNumber}`;
    return cachedFetch(key, async () => {
      const res = await apiClient.get<SeasonDetails>(`/tv/${id}/season/${seasonNumber}`);
      return res.data;
    });
  },

  getTVEpisode: async (id: number | string, seasonNumber: number | string, episodeNumber: number | string) => {
    const key = `tv_episode_${id}_${seasonNumber}_${episodeNumber}`;
    return cachedFetch(key, async () => {
      const res = await apiClient.get<EpisodeItem>(`/tv/${id}/season/${seasonNumber}/episode/${episodeNumber}`);
      return res.data;
    });
  },

  // ---------------------------------------------------------------------------
  // People (Cast & Crew)
  // ---------------------------------------------------------------------------
  getPersonDetails: async (id: number | string) => {
    const key = `person_detail_${id}`;
    return cachedFetch(key, async () => {
      const res = await apiClient.get<PersonDetails>(`/people/${id}`);
      return res.data;
    });
  },

  getPersonCredits: async (id: number | string) => {
    const key = `person_credits_${id}`;
    return cachedFetch(key, async () => {
      const res = await apiClient.get<any>(`/people/${id}/credits`);
      return res.data;
    });
  },

  getPopularPeople: async (page = 1) => {
    const key = `popular_people_${page}`;
    return cachedFetch(key, async () => {
      const res = await apiClient.get<TMDBResponse<PersonDetails>>('/people/popular', { params: { page } });
      return res.data;
    });
  },

  // ---------------------------------------------------------------------------
  // Collections (Franchises)
  // ---------------------------------------------------------------------------
  getCollectionDetails: async (id: number | string) => {
    const key = `collection_${id}`;
    return cachedFetch(key, async () => {
      const res = await apiClient.get<CollectionDetails>(`/collections/${id}`);
      return res.data;
    });
  },

  // ---------------------------------------------------------------------------
  // Search, Discover & Genres
  // ---------------------------------------------------------------------------
  search: async (query: string, type = 'multi', page = 1) => {
    const res = await apiClient.get<TMDBResponse<MediaItem>>('/search', {
      params: { query, type, page },
    });
    return res.data;
  },

  discover: async (mediaType = 'movie', params: Record<string, string | number> = {}) => {
    const key = `discover_${mediaType}_${JSON.stringify(params)}`;
    return cachedFetch(key, async () => {
      const res = await apiClient.get<TMDBResponse<MediaItem>>('/discover', {
        params: { media_type: mediaType, ...params },
      });
      return res.data;
    });
  },

  getGenres: async (type = 'movie') => {
    const key = `genres_${type}`;
    return cachedFetch(key, async () => {
      const res = await apiClient.get<{ genres: { id: number; name: string }[] }>('/genres', {
        params: { type },
      });
      return res.data;
    });
  },

  // ---------------------------------------------------------------------------
  // Watch Providers & Configuration
  // ---------------------------------------------------------------------------
  getWatchProvidersList: async (mediaType = 'movie') => {
    const key = `watch_providers_list_${mediaType}`;
    return cachedFetch(key, async () => {
      const res = await apiClient.get<any>(`/watch-providers/${mediaType}`);
      return res.data;
    });
  },

  getWatchProviderRegions: async () => {
    const key = `watch_provider_regions`;
    return cachedFetch(key, async () => {
      const res = await apiClient.get<any>('/watch-providers/regions');
      return res.data;
    });
  },

  getCertifications: async (mediaType = 'movie') => {
    const key = `certifications_${mediaType}`;
    return cachedFetch(key, async () => {
      const res = await apiClient.get<any>(`/certifications/${mediaType}`);
      return res.data;
    });
  },

  findByExternalId: async (externalId: string, source = 'imdb_id') => {
    const key = `find_${externalId}_${source}`;
    return cachedFetch(key, async () => {
      const res = await apiClient.get<any>(`/find/${externalId}`, { params: { source } });
      return res.data;
    });
  },

  getKeywordMovies: async (keywordId: number | string, page = 1) => {
    const key = `keyword_movies_${keywordId}_${page}`;
    return cachedFetch(key, async () => {
      const res = await apiClient.get<TMDBResponse<MediaItem>>(`/keywords/${keywordId}/movies`, { params: { page } });
      return res.data;
    });
  },

  getConfiguration: async () => {
    const key = `tmdb_configuration`;
    return cachedFetch(key, async () => {
      const res = await apiClient.get<any>('/configuration');
      return res.data;
    });
  },

  // ---------------------------------------------------------------------------
  // Streaming Servers (Player embed config)
  // ---------------------------------------------------------------------------
  getStreamingServers: async () => {
    const key = `streaming_servers`;
    return cachedFetch(key, async () => {
      const res = await apiClient.get<{ servers: StreamingServer[] }>('/config/streaming-servers');
      return res.data.servers;
    });
  },
};
