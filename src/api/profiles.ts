import { apiClient } from './client';
import { UserProfile } from '@/types/profile';

export const profilesApi = {
  getProfiles: async (): Promise<UserProfile[]> => {
    const res = await apiClient.get<{ profiles: UserProfile[] }>('/profiles');
    return res.data.profiles || [];
  },

  createProfile: async (data: { name: string; avatar_url?: string; is_kids?: boolean }): Promise<UserProfile> => {
    const res = await apiClient.post<{ message: string; profile: UserProfile }>('/profiles', data);
    return res.data.profile;
  },

  updateProfile: async (
    id: string,
    data: { name?: string; avatar_url?: string; is_kids?: boolean }
  ): Promise<UserProfile> => {
    const res = await apiClient.put<{ message: string; profile: UserProfile }>(`/profiles/${id}`, data);
    return res.data.profile;
  },

  deleteProfile: async (id: string): Promise<void> => {
    await apiClient.delete(`/profiles/${id}`);
  },

  updateAccount: async (data: { full_name?: string; avatar_url?: string }): Promise<any> => {
    const res = await apiClient.put('/auth/profile', data);
    return res.data.user;
  },
};
