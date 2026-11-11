import { moviesApi } from '@/api/movies';

export function toSlug(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// In-memory + localStorage cache for fast slug -> ID resolution
const SLUG_ID_CACHE = new Map<string, string>();

export function cacheSlugId(type: 'movie' | 'tv', slug: string, id: number | string) {
  if (!slug || !id) return;
  const key = `${type}:${slug}`;
  const idStr = String(id);
  SLUG_ID_CACHE.set(key, idStr);
  try {
    localStorage.setItem(`slug_${key}`, idStr);
  } catch {}
}

export function getCachedIdFromSlug(type: 'movie' | 'tv', slug: string): string | null {
  if (!slug) return null;
  const key = `${type}:${slug}`;
  if (SLUG_ID_CACHE.has(key)) {
    return SLUG_ID_CACHE.get(key)!;
  }
  try {
    const val = localStorage.getItem(`slug_${key}`);
    if (val) {
      SLUG_ID_CACHE.set(key, val);
      return val;
    }
  } catch {}
  return null;
}

/**
 * Generates SEO-friendly URLs with unique TMDB ID prefix:
 * /movie/11174-my-sassy-girl
 * Falls back to /movie/11174 if title is missing
 */
export function getMovieUrl(id: number | string, title?: string): string {
  if (!id) return '/';
  if (title) {
    const slug = toSlug(title);
    if (slug) {
      const combined = `${id}-${slug}`;
      cacheSlugId('movie', combined, id);
      cacheSlugId('movie', slug, id);
      return `/movie/${combined}`;
    }
  }
  return `/movie/${id}`;
}

/**
 * Generates SEO-friendly URLs with unique TMDB ID prefix:
 * /tv/78292-title
 * Falls back to /tv/78292 if name is missing
 */
export function getTVUrl(id: number | string, name?: string): string {
  if (!id) return '/';
  if (name) {
    const slug = toSlug(name);
    if (slug) {
      const combined = `${id}-${slug}`;
      cacheSlugId('tv', combined, id);
      cacheSlugId('tv', slug, id);
      return `/tv/${combined}`;
    }
  }
  return `/tv/${id}`;
}

export function getWatchMovieUrl(id: number | string, title?: string): string {
  if (!id) return '/';
  if (title) {
    const slug = toSlug(title);
    if (slug) {
      const combined = `${id}-${slug}`;
      cacheSlugId('movie', combined, id);
      cacheSlugId('movie', slug, id);
      return `/watch/movie/${combined}`;
    }
  }
  return `/watch/movie/${id}`;
}

export function getWatchTVUrl(id: number | string, name?: string, season = 1, episode = 1): string {
  const query = `?s=${season}&e=${episode}`;
  if (!id) return '/';
  if (name) {
    const slug = toSlug(name);
    if (slug) {
      const combined = `${id}-${slug}`;
      cacheSlugId('tv', combined, id);
      cacheSlugId('tv', slug, id);
      return `/watch/tv/${combined}${query}`;
    }
  }
  return `/watch/tv/${id}${query}`;
}

/**
 * Extract leading ID if present (e.g. "78292-who-is-who" -> "78292" or "78292" -> "78292")
 */
export function extractIdFromSlug(param: string | undefined): string {
  if (!param) return '';
  // 1. Matches leading digits before hyphen (e.g. "78292-who-is-who" -> "78292")
  const leadingMatch = param.match(/^(\d+)-/);
  if (leadingMatch) return leadingMatch[1];
  // 2. Pure digits (e.g. "78292")
  if (/^\d+$/.test(param)) return param;
  return param;
}

/**
 * Resolves any raw URL parameter (pure slug like "who-is-who", or "78292-who-is-who", or "78292")
 * into a valid numeric TMDB ID with caching and search fallback.
 */
export async function resolveMediaId(rawParam: string | undefined, type: 'movie' | 'tv'): Promise<string | null> {
  if (!rawParam) return null;

  // 1. If param has numeric ID (either "78292" or "78292-who-is-who")
  const extracted = extractIdFromSlug(rawParam);
  if (/^\d+$/.test(extracted)) {
    return extracted;
  }

  // 2. Check memory / localStorage cache
  const cached = getCachedIdFromSlug(type, rawParam);
  if (cached && /^\d+$/.test(cached)) {
    return cached;
  }

  // 3. Fallback: Search TMDB by clean title
  try {
    const query = rawParam.replace(/-/g, ' ');
    const res = await moviesApi.search(query, type);
    const results = res.results || [];
    const match = results.find((item: any) => toSlug(item.title || item.name) === rawParam) || results[0];
    if (match?.id) {
      const matchId = String(match.id);
      cacheSlugId(type, rawParam, matchId);
      return matchId;
    }
  } catch (err) {
    console.error(`Failed to resolve ${type} slug "${rawParam}":`, err);
  }

  return null;
}
