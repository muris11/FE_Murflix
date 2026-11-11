import { apiClient } from './client';

export const sansekaiApi = {
  getDramaBoxVIP: async () => {
    const res = await apiClient.get<any>('/sansekai/dramabox/vip');
    return res.data;
  },

  getDramaBoxTrending: async () => {
    const res = await apiClient.get<any>('/sansekai/dramabox/trending');
    return res.data;
  },

  getDramaBoxLatest: async () => {
    const res = await apiClient.get<any>('/sansekai/dramabox/latest');
    return res.data;
  },

  getDramaBoxForYou: async () => {
    const res = await apiClient.get<any>('/sansekai/dramabox/foryou');
    return res.data;
  },

  getDramaBoxDetail: async (id: string) => {
    const res = await apiClient.get<any>(`/sansekai/dramabox/detail/${id}`);
    return res.data;
  },

  getDramaBoxEpisodes: async (id: string) => {
    const res = await apiClient.get<any>(`/sansekai/dramabox/episodes/${id}`);
    return res.data;
  },

  getReelShortHome: async () => {
    const res = await apiClient.get<any>('/sansekai/reelshort/home');
    return res.data;
  },

  getReelShortDetail: async (id: string) => {
    const res = await apiClient.get<any>(`/sansekai/reelshort/detail/${id}`);
    return res.data;
  },

  getAnimeLatest: async (page = 1) => {
    const res = await apiClient.get<any>('/sansekai/anime/latest', { params: { page } });
    return res.data;
  },

  getAnimeDetail: async (slug: string) => {
    const res = await apiClient.get<any>(`/sansekai/anime/detail/${slug}`);
    return res.data;
  },
};

