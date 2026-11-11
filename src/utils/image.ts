const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export type TMDBImageSize =
  | 'w92'
  | 'w154'
  | 'w185'
  | 'w300'
  | 'w342'
  | 'w500'
  | 'w780'
  | 'w1280'
  | 'original';

/**
 * Fast direct Cloudflare-accelerated TMDB CDN (ultra-lightweight & global edge cached).
 * Default size is 'w342' for cards (crisp on Retina, ~35KB vs ~200KB on w500).
 */
export function getTMDBImageUrl(
  path: string | null | undefined,
  size: TMDBImageSize = 'w342'
): string {
  if (!path) return '/placeholder.svg';
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function getDirectTMDBUrl(
  path: string | null | undefined,
  size: TMDBImageSize = 'w342'
): string {
  if (!path) return '/placeholder.svg';
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

/**
 * Fallback proxy through backend if direct TMDB ever encounters connectivity issues.
 */
export function getProxyTMDBUrl(
  path: string | null | undefined,
  size: TMDBImageSize = 'w342'
): string {
  if (!path) return '/placeholder.svg';
  return `${API_BASE_URL}/movies/image?path=${encodeURIComponent(path)}&size=${size}`;
}

