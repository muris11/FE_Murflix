import { apiClient } from './client';
import { User } from '@/types/auth';

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await apiClient.post<{ token: string; user: User }>('/auth/login', {
      email,
      password,
    });
    return res.data;
  },

  demoLogin: async () => {
    const res = await apiClient.post<{ token: string; user: User }>('/auth/demo-login');
    return res.data;
  },

  logout: async () => {
    const res = await apiClient.post('/auth/logout');
    return res.data;
  },

  me: async () => {
    const res = await apiClient.get<{ user: User }>('/auth/me');
    return res.data.user;
  },

  updateProfile: async (data: { full_name?: string; avatar_url?: string }) => {
    const res = await apiClient.put<{ user: User; message: string }>('/auth/profile', data);
    return res.data;
  },
};
