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

export interface MovieDetails extends MediaItem {
  runtime?: number;
  tagline?: string;
  genres?: { id: number; name: string }[];
  credits?: { cast: CastMember[] };
  recommendations?: { results: MediaItem[] };
}

export interface TVDetails extends MediaItem {
  number_of_seasons?: number;
  number_of_episodes?: number;
  tagline?: string;
  genres?: { id: number; name: string }[];
  seasons?: SeasonItem[];
  credits?: { cast: CastMember[] };
}

export interface SeasonItem {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  poster_path?: string | null;
  air_date?: string;
}

export interface EpisodeItem {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  still_path?: string | null;
  runtime?: number | null;
  vote_average?: number;
  air_date?: string;
}

export interface SeasonDetails {
  id: number;
  name: string;
  overview: string;
  season_number: number;
  poster_path?: string | null;
  air_date?: string;
  episodes: EpisodeItem[];
}

export interface StreamingServer {
  id: string;
  name: string;
  description: string;
  type: string;
  movieUrl: string;
  tvUrl: string;
}

