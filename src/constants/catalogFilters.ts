export interface FilterOption {
  value: string;
  label: string;
}

export const COUNTRY_OPTIONS: FilterOption[] = [
  { value: '', label: 'Semua Negara' },
  { value: 'ID', label: 'Indonesia' },
  { value: 'KR', label: 'Korea Selatan' },
  { value: 'JP', label: 'Jepang' },
  { value: 'US', label: 'Amerika Serikat' },
  { value: 'TH', label: 'Thailand' },
  { value: 'CN', label: 'China / Taiwan' },
  { value: 'GB', label: 'Inggris (UK)' },
  { value: 'IN', label: 'India' },
  { value: 'FR', label: 'Prancis' },
  { value: 'ES', label: 'Spanyol' },
  { value: 'DE', label: 'Jerman' },
  { value: 'IT', label: 'Italia' },
];

export const YEAR_OPTIONS: FilterOption[] = [
  { value: '', label: 'Semua Tahun' },
  { value: '2026', label: '2026' },
  { value: '2025', label: '2025' },
  { value: '2024', label: '2024' },
  { value: '2023', label: '2023' },
  { value: '2022', label: '2022' },
  { value: '2021', label: '2021' },
  { value: '2020', label: '2020' },
  { value: '2019', label: '2019' },
  { value: '2018', label: '2018' },
  { value: '2015-2019', label: '2015 - 2019' },
  { value: '2010s', label: 'Era 2010-an' },
  { value: '2000s', label: 'Era 2000-an' },
  { value: '1990s', label: 'Era 1990-an' },
  { value: 'classic', label: 'Klasik (< 1990)' },
];

export const SORT_OPTIONS: FilterOption[] = [
  { value: 'popularity.desc', label: 'Terpopuler' },
  { value: 'vote_average.desc', label: 'Rating Tertinggi' },
  { value: 'release.desc', label: 'Rilis Terbaru' },
  { value: 'vote_count.desc', label: 'Paling Banyak Diulas' },
];

export function buildDiscoverParams(
  mediaType: 'movie' | 'tv',
  filters: {
    genre?: string;
    country?: string;
    year?: string;
    sort?: string;
  }
): Record<string, string | number> {
  const params: Record<string, string | number> = {};
  const isTV = mediaType === 'tv';

  // 1. Genre filter
  if (filters.genre) {
    params.with_genres = filters.genre;
  }

  // 2. Country filter
  if (filters.country) {
    params.with_origin_country = filters.country;
  }

  // 3. Year filter
  if (filters.year) {
    const yearVal = filters.year;
    const dateField = isTV ? 'first_air_date' : 'primary_release_date';
    const yearField = isTV ? 'first_air_date_year' : 'primary_release_year';

    if (/^\d{4}$/.test(yearVal)) {
      params[yearField] = yearVal;
    } else if (yearVal === '2015-2019') {
      params[`${dateField}.gte`] = '2015-01-01';
      params[`${dateField}.lte`] = '2019-12-31';
    } else if (yearVal === '2010s') {
      params[`${dateField}.gte`] = '2010-01-01';
      params[`${dateField}.lte`] = '2019-12-31';
    } else if (yearVal === '2000s') {
      params[`${dateField}.gte`] = '2000-01-01';
      params[`${dateField}.lte`] = '2009-12-31';
    } else if (yearVal === '1990s') {
      params[`${dateField}.gte`] = '1990-01-01';
      params[`${dateField}.lte`] = '1999-12-31';
    } else if (yearVal === 'classic') {
      params[`${dateField}.lte`] = '1989-12-31';
    }
  }

  // 4. Sort filter
  const sortVal = filters.sort || 'popularity.desc';
  if (sortVal === 'vote_average.desc') {
    params.sort_by = 'vote_average.desc';
    params['vote_count.gte'] = 50;
  } else if (sortVal === 'release.desc') {
    params.sort_by = isTV ? 'first_air_date.desc' : 'primary_release_date.desc';
  } else if (sortVal === 'vote_count.desc') {
    params.sort_by = 'vote_count.desc';
  } else {
    params.sort_by = 'popularity.desc';
  }

  return params;
}
