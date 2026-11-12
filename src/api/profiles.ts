import { apiClient } from './client';
import { UserProfile } from '@/types/profile';

export const profilesApi = {
  getProfiles: async (): Promise<UserProfile[]> => {
    const res = await apiClient.get<{ profiles: UserProfile[] }>('/profiles');
    return res.data.profiles || [];
  },

  createProfile: async (data: {
    name: string;
    avatar_url?: string;
    is_kids?: boolean;
    pin?: string;
  }): Promise<UserProfile> => {
    const res = await apiClient.post<{ message: string; profile: UserProfile }>('/profiles', data);
    return res.data.profile;
  },

  updateProfile: async (
    id: string,
    data: { name?: string; avatar_url?: string; is_kids?: boolean; pin?: string }
  ): Promise<UserProfile> => {
    const res = await apiClient.put<{ message: string; profile: UserProfile }>(`/profiles/${id}`, data);
    return res.data.profile;
  },

  verifyPin: async (id: string, pin: string): Promise<boolean> => {
    const res = await apiClient.post<{ valid: boolean }>(`/profiles/${id}/verify-pin`, { pin });
    return res.data.valid;
  },

  deleteProfile: async (id: string): Promise<void> => {
    await apiClient.delete(`/profiles/${id}`);
  },

  updateAccount: async (data: { full_name?: string; avatar_url?: string }): Promise<any> => {
    const res = await apiClient.put('/auth/profile', data);
    return res.data.user;
  },
};

