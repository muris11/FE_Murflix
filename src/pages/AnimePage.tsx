import React, { useEffect, useState } from 'react';
import { sansekaiApi } from '@/api/sansekai';
import { AnimeCard } from '@/components/media/AnimeCard';
import { Tv } from 'lucide-react';

export const AnimePage: React.FC = () => {
  const [animeList, setAnimeList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    sansekaiApi
      .getAnimeLatest()
      .then((res) => {
        setAnimeList(res.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#141414] pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center space-x-3 border-b border-gray-800 pb-4">
        <Tv className="w-8 h-8 text-blue-500" />
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">Anime Terbaru</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">Nonton serial anime ongoing & tamat dengan subtitle bahasa Indonesia</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {animeList.map((item, idx) => (
            <AnimeCard key={idx} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

