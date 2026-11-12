import axios from 'axios';
import { MediaItem, TMDBResponse } from '@/types/tmdb';
import { SubscriptionPlan } from '@/types/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const publicClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const publicApi = {
  getTrending: async () => {
    const res = await publicClient.get<TMDBResponse<MediaItem>>('/public/trending', {
      params: { media_type: 'all', time_window: 'week' },
    });
    return res.data;
  },

  getPopularMovies: async () => {
    const res = await publicClient.get<TMDBResponse<MediaItem>>('/public/movies');
    return res.data;
  },

  getPopularTV: async () => {
    const res = await publicClient.get<TMDBResponse<MediaItem>>('/public/tv');
    return res.data;
  },

  getPlans: async () => {
    const res = await publicClient.get<{ plans: SubscriptionPlan[] }>('/plans');
    return res.data.plans;
  },

  getWhatsAppConfig: async () => {
    const res = await publicClient.get<{
      enabled: boolean;
      number: string;
      message_template: string;
    }>('/config/whatsapp');
    return res.data;
  },
};

