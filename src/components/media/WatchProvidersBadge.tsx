import React from 'react';
import { Tv } from 'lucide-react';
import { WatchProvidersData, WatchProviderItem } from '@/types/tmdb';
import { getDirectTMDBUrl } from '@/utils/image';

interface WatchProvidersBadgeProps {
  providersData?: WatchProvidersData;
}

export const WatchProvidersBadge: React.FC<WatchProvidersBadgeProps> = ({ providersData }) => {
  if (!providersData?.results) return null;

  // Prefer ID (Indonesia) or US streaming availability
  const regionData = providersData.results['ID'] || providersData.results['US'] || Object.values(providersData.results)[0];
  if (!regionData) return null;

  const streamList: WatchProviderItem[] = regionData.flatrate || regionData.buy || regionData.rent || [];
  if (streamList.length === 0) return null;

  // Deduplicate by provider_id and take top 4
  const uniqueProviders = Array.from(
    new Map(streamList.map((item) => [item.provider_id, item])).values()
  ).slice(0, 5);

  return (
    <div className="flex items-center space-x-2.5 py-1">
      <div className="flex items-center space-x-1 text-xs text-gray-400 font-medium">
        <Tv className="w-3.5 h-3.5 text-red-500" />
        <span>Tersedia Streaming:</span>
      </div>

      <div className="flex items-center space-x-1.5">
        {uniqueProviders.map((prov) => (
          <div
            key={prov.provider_id}
            title={prov.provider_name}
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-md overflow-hidden bg-black/60 border border-white/20 shadow-md transform hover:scale-110 transition-transform"
          >
            <img
              src={getDirectTMDBUrl(prov.logo_path, 'w92')}
              alt={prov.provider_name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
