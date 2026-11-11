export interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  media_type?: 'movie' | 'tv' | 'person';
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
  official?: boolean;
  published_at?: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path?: string | null;
  order?: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path?: string | null;
}

export interface CreditsResponse {
  cast: CastMember[];
  crew: CrewMember[];
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

export interface SeasonItem {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  poster_path?: string | null;
  air_date?: string;
  overview?: string;
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

export interface WatchProviderItem {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority: number;
}

export interface WatchProviderResult {
  link?: string;
  flatrate?: WatchProviderItem[];
  rent?: WatchProviderItem[];
  buy?: WatchProviderItem[];
  free?: WatchProviderItem[];
  ads?: WatchProviderItem[];
}

export interface WatchProvidersData {
  results?: {
    [countryCode: string]: WatchProviderResult;
  };
}

export interface ReviewItem {
  id: string;
  author: string;
  author_details?: {
    name?: string;
    username?: string;
    avatar_path?: string | null;
    rating?: number | null;
  };
  content: string;
  created_at: string;
  url: string;
}

export interface CollectionSummary {
  id: number;
  name: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
}

export interface CollectionDetails {
  id: number;
  name: string;
  overview: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  parts: MediaItem[];
}

export interface ExternalIDs {
  imdb_id?: string | null;
  tvdb_id?: number | null;
  wikidata_id?: string | null;
  facebook_id?: string | null;
  instagram_id?: string | null;
  twitter_id?: string | null;
}

export interface KeywordItem {
  id: number;
  name: string;
}

export interface MovieDetails extends MediaItem {
  runtime?: number;
  tagline?: string;
  genres?: { id: number; name: string }[];
  belongs_to_collection?: CollectionSummary | null;
  credits?: CreditsResponse;
  videos?: { results: VideoItem[] };
  recommendations?: { results: MediaItem[] };
  similar?: { results: MediaItem[] };
  reviews?: { results: ReviewItem[] };
  external_ids?: ExternalIDs;
  'watch/providers'?: WatchProvidersData;
  keywords?: { keywords: KeywordItem[] };
}

export interface TVDetails extends MediaItem {
  number_of_seasons?: number;
  number_of_episodes?: number;
  tagline?: string;
  genres?: { id: number; name: string }[];
  seasons?: SeasonItem[];
  credits?: CreditsResponse;
  videos?: { results: VideoItem[] };
  recommendations?: { results: MediaItem[] };
  similar?: { results: MediaItem[] };
  reviews?: { results: ReviewItem[] };
  content_ratings?: { results: { iso_3166_1: string; rating: string }[] };
  external_ids?: ExternalIDs;
  'watch/providers'?: WatchProvidersData;
  keywords?: { results: KeywordItem[] };
}

export interface PersonCreditItem extends MediaItem {
  character?: string;
  job?: string;
  department?: string;
}

export interface PersonDetails {
  id: number;
  name: string;
  biography?: string;
  birthday?: string | null;
  deathday?: string | null;
  place_of_birth?: string | null;
  profile_path?: string | null;
  known_for_department?: string;
  popularity?: number;
  external_ids?: ExternalIDs;
  images?: { profiles: { file_path: string }[] };
  combined_credits?: {
    cast: PersonCreditItem[];
    crew: PersonCreditItem[];
  };
}

export interface GenreItem {
  id: number;
  name: string;
}

export interface StreamingServer {
  id: string;
  name: string;
  description: string;
  type: string;
  movieUrl: string;
  tvUrl: string;
}
