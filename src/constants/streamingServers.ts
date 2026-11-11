import { StreamingServer } from '@/types/tmdb';

export const DEFAULT_STREAMING_SERVERS: StreamingServer[] = [
  {
    id: 'embedwave',
    name: 'EmbedWave',
    description: 'Zero Ads, HD',
    type: 'iframe',
    movieUrl: 'https://embedwave.cc/embed/movie/{id}',
    tvUrl: 'https://embedwave.cc/embed/tv/{id}/{s}/{e}',
  },
  {
    id: 'vidcore',
    name: 'VidCore',
    description: '4K Ad-Free',
    type: 'iframe',
    movieUrl: 'https://vidcore.org/embed/movie/{id}',
    tvUrl: 'https://vidcore.org/embed/tv/{id}/{s}/{e}',
  },
  {
    id: 'stellar',
    name: 'Stellar',
    description: 'Ad-Free, Multi-Language',
    type: 'iframe',
    movieUrl: 'https://stellar.rip/en/watch/embed/movie/{id}',
    tvUrl: 'https://stellar.rip/en/watch/embed/tv/{id}-{s}-{e}',
  },
  {
    id: 'yapgrid',
    name: 'YapGrid',
    description: 'Zero Ads + Subs',
    type: 'iframe',
    movieUrl: 'https://yapgrid.com/embed/movie/{id}',
    tvUrl: 'https://yapgrid.com/embed/tv/{id}/{s}/{e}',
  },
  {
    id: 'mapple',
    name: 'Mapple',
    description: 'True 4K HDR No Ads',
    type: 'iframe',
    movieUrl: 'https://mapple.fun/watch/movie/{id}',
    tvUrl: 'https://mapple.fun/watch/tv/{id}/{s}/{e}',
  },
  {
    id: 'vidphantom',
    name: 'VidPhantom',
    description: '115K+ Titles Ad-Free',
    type: 'iframe',
    movieUrl: 'https://vidphantom.com/movie/{id}',
    tvUrl: 'https://vidphantom.com/tv/{id}/{s}/{e}',
  },
  {
    id: 'vidspark',
    name: 'VidSpark',
    description: 'Auto-Resume, No Ads',
    type: 'iframe',
    movieUrl: 'https://vidspark.to/movie/{id}',
    tvUrl: 'https://vidspark.to/tv/{id}/{s}/{e}',
  },
  {
    id: 'vidly',
    name: 'VidLy',
    description: 'Clean Player, No Ads',
    type: 'iframe',
    movieUrl: 'https://vidly.pro/movie/{id}',
    tvUrl: 'https://vidly.pro/tv/{id}/{s}/{e}',
  },
  {
    id: 'vidlink',
    name: 'VidLink',
    description: 'Multi-Sub, HD',
    type: 'iframe',
    movieUrl: 'https://vidlink.pro/movie/{id}',
    tvUrl: 'https://vidlink.pro/tv/{id}/{s}/{e}',
  },
  {
    id: 'vidsrccc',
    name: 'VidSrc CC',
    description: 'Multi-Sub, 1080p',
    type: 'iframe',
    movieUrl: 'https://vidsrc.cc/v2/embed/movie/{id}',
    tvUrl: 'https://vidsrc.cc/v2/embed/tv/{id}/{s}/{e}',
  },
  {
    id: 'embedsu',
    name: 'Embed.su',
    description: 'Fast, HD',
    type: 'iframe',
    movieUrl: 'https://embed.su/embed/movie/{id}',
    tvUrl: 'https://embed.su/embed/tv/{id}/{s}/{e}',
  },
];

/**
 * Replaces all supported ID and season/episode placeholders in the embed URL template.
 * Supported tokens:
 * - Movie/TV TMDB ID: {id}, {tmdb_id}
 * - TV Season:        {s}, {season}
 * - TV Episode:       {e}, {episode}
 * Handles both slash (/tv/{id}/{s}/{e}) and hyphen (/tv/{id}-{s}-{e}) separators.
 */
export function formatEmbedUrl(
  template: string,
  tmdbId: string | number,
  season = 1,
  episode = 1
): string {
  if (!template) return '';
  const idStr = String(tmdbId);
  return template
    .replace(/{id}/g, idStr)
    .replace(/{tmdb_id}/g, idStr)
    .replace(/{s}/g, String(season))
    .replace(/{season}/g, String(season))
    .replace(/{e}/g, String(episode))
    .replace(/{episode}/g, String(episode));
}
