import React, { useEffect, useState } from 'react';
import { sansekaiApi } from '@/api/sansekai';
import { DramaCard } from '@/components/media/DramaCard';
import { PlaySquare } from 'lucide-react';

export const DramaBoxPage: React.FC = () => {
  const [trending, setTrending] = useState<any[]>([]);
  const [latest, setLatest] = useState<any[]>([]);
  const [forYou, setForYou] = useState<any[]>([]);
  const [vip, setVip] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendRes, latRes, forYouRes, vipRes] = await Promise.all([
          sansekaiApi.getDramaBoxTrending().catch(() => ({ data: [] })),
          sansekaiApi.getDramaBoxLatest().catch(() => ({ data: [] })),
          sansekaiApi.getDramaBoxForYou().catch(() => ({ data: [] })),
          sansekaiApi.getDramaBoxVIP().catch(() => ({ data: [] })),
        ]);

        setTrending(trendRes.data || []);
        setLatest(latRes.data || []);
        setForYou(forYouRes.data || []);
        setVip(vipRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#141414] pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      <div className="flex items-center space-x-3 border-b border-gray-800 pb-4">
        <PlaySquare className="w-8 h-8 text-red-500" />
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">DramaBox VIP</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">Nonton drama pendek vertikal terpopuler dengan subtitle Indonesia</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="space-y-10">
          {trending.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Sedang Trending</h2>
              <div className="flex space-x-4 overflow-x-auto no-scrollbar py-2">
                {trending.map((item, idx) => (
                  <DramaCard key={idx} item={item} provider="dramabox" />
                ))}
              </div>
            </div>
          )}

          {latest.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Rilis Terbaru</h2>
              <div className="flex space-x-4 overflow-x-auto no-scrollbar py-2">
                {latest.map((item, idx) => (
                  <DramaCard key={idx} item={item} provider="dramabox" />
                ))}
              </div>
            </div>
          )}

          {forYou.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Rekomendasi Untukmu</h2>
              <div className="flex space-x-4 overflow-x-auto no-scrollbar py-2">
                {forYou.map((item, idx) => (
                  <DramaCard key={idx} item={item} provider="dramabox" />
                ))}
              </div>
            </div>
          )}

          {vip.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Koleksi VIP</h2>
              <div className="flex space-x-4 overflow-x-auto no-scrollbar py-2">
                {vip.map((item, idx) => (
                  <DramaCard key={idx} item={item} provider="dramabox" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

