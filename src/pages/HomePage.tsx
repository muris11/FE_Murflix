import React, { useEffect, useState } from 'react';
import { Hero } from '@/components/media/Hero';
import { MovieRow } from '@/components/media/MovieRow';
import { moviesApi } from '@/api/movies';
import { MediaItem } from '@/types/tmdb';

export const HomePage: React.FC = () => {
  const [featured, setFeatured] = useState<MediaItem | undefined>();
  const [trending, setTrending] = useState<MediaItem[]>([]);
  const [popularMovies, setPopularMovies] = useState<MediaItem[]>([]);
  const [popularTV, setPopularTV] = useState<MediaItem[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<MediaItem[]>([]);
  const [topRatedTV, setTopRatedTV] = useState<MediaItem[]>([]);
  const [upcoming, setUpcoming] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          trendingRes,
          popMoviesRes,
          popTVRes,
          topMoviesRes,
          topTVRes,
          upcomingRes,
        ] = await Promise.all([
          moviesApi.getTrending('all', 'week').catch(() => ({ results: [] })),
          moviesApi.getPopularMovies().catch(() => ({ results: [] })),
          moviesApi.getPopularTV().catch(() => ({ results: [] })),
          moviesApi.getTopRatedMovies().catch(() => ({ results: [] })),
          moviesApi.getTopRatedTV().catch(() => ({ results: [] })),
          moviesApi.getUpcomingMovies().catch(() => ({ results: [] })),
        ]);

        const trendingList = trendingRes.results || [];
        setTrending(trendingList);
        if (trendingList.length > 0) {
          setFeatured(trendingList[0]);
        }
        setPopularMovies(popMoviesRes.results || []);
        setPopularTV(popTVRes.results || []);
        setTopRatedMovies(topMoviesRes.results || []);
        setTopRatedTV(topTVRes.results || []);
        setUpcoming(upcomingRes.results || []);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="pb-16 overflow-x-hidden">
      {/* Big Hero Banner */}
      <Hero item={featured} />

      {/* Row Sections with negative margin over Hero */}
      <div className="relative z-20 -mt-16 sm:-mt-24 md:-mt-32 space-y-4">
        <MovieRow title="Sedang Trending Minggu Ini" items={trending} isLoading={isLoading} />
        <MovieRow title="Film Terpopuler" items={popularMovies} isLoading={isLoading} />
        <MovieRow title="Serial TV Paling Banyak Ditonton" items={popularTV} isLoading={isLoading} />
        <MovieRow title="Film Rating Tertinggi" items={topRatedMovies} isLoading={isLoading} />
        <MovieRow title="Serial TV Rating Tertinggi" items={topRatedTV} isLoading={isLoading} />
        <MovieRow title="Akan Segera Tayang" items={upcoming} isLoading={isLoading} />
      </div>
    </div>
  );
};

