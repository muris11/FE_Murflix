export function toSlug(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getMovieUrl(id: number | string, title?: string): string {
  const slug = title ? `-${toSlug(title)}` : '';
  return `/movie/${id}${slug}`;
}

export function getTVUrl(id: number | string, name?: string): string {
  const slug = name ? `-${toSlug(name)}` : '';
  return `/tv/${id}${slug}`;
}

export function getWatchMovieUrl(id: number | string, title?: string): string {
  const slug = title ? `-${toSlug(title)}` : '';
  return `/watch/movie/${id}${slug}`;
}

export function getWatchTVUrl(id: number | string, name?: string, season = 1, episode = 1): string {
  const slug = name ? `-${toSlug(name)}` : '';
  return `/watch/tv/${id}${slug}?s=${season}&e=${episode}`;
}

export function extractIdFromSlug(param: string | undefined): string {
  if (!param) return '';
  // Extract leading digits before hyphen if present (e.g. "687163-project-hail-mary" -> "687163")
  const match = param.match(/^(\d+)/);
  return match ? match[1] : param;
}
