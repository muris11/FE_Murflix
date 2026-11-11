export interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  media_type?: 'movie' | 'tv';
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  vote_count?: number;
  popularity?: number;
  genre_ids?: number[];
}

export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface VideoItem {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path?: string | null;
}

export interface EpisodeItem {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  still_path?: string | null;
  air_date?: string;
  vote_average?: number;
}

export interface SeasonItem {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  poster_path?: string | null;
  air_date?: string;
}

export interface StreamingServer {
  id: string;
  name: string;
  description: string;
  type: string;
  movieUrl: string;
  tvUrl: string;
}

