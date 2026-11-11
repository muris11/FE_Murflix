const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export type TMDBImageSize = 'w92' | 'w154' | 'w185' | 'w300' | 'w342' | 'w500' | 'w780' | 'original';

export function getTMDBImageUrl(
  path: string | null | undefined,
  size: TMDBImageSize = 'w500'
): string {
  if (!path) return '/placeholder.svg';

  // Use the backend image proxy first to avoid Indonesian ISP blocking & benefit from Cloudflare caching
  return `${API_BASE_URL}/movies/image?path=${encodeURIComponent(path)}&size=${size}`;
}

export function getDirectTMDBUrl(
  path: string | null | undefined,
  size: TMDBImageSize = 'w500'
): string {
  if (!path) return '/placeholder.svg';
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

