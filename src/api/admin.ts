import { apiClient } from './client';
import { DashboardStats, SystemSetting } from '@/types/admin';
import { User, SubscriptionPlan } from '@/types/auth';

export const adminApi = {
  getStats: async () => {
    const res = await apiClient.get<DashboardStats>('/admin/stats');
    return res.data;
  },

  listUsers: async (search = '', status = '') => {
    const res = await apiClient.get<{ users: User[] }>('/admin/users', {
      params: { search, status },
    });
    return res.data.users;
  },

  createUser: async (data: any) => {
    const res = await apiClient.post<{ message: string; user: User }>('/admin/users', data);
    return res.data;
  },

  getUser: async (id: string) => {
    const res = await apiClient.get<{ user: User }>(`/admin/users/${id}`);
    return res.data.user;
  },

  updateUser: async (id: string, data: any) => {
    const res = await apiClient.put<{ message: string; user: User }>(`/admin/users/${id}`, data);
    return res.data;
  },

  deleteUser: async (id: string) => {
    const res = await apiClient.delete<{ message: string }>(`/admin/users/${id}`);
    return res.data;
  },

  // Pricing Plans
  getPlans: async () => {
    const res = await apiClient.get<{ plans: SubscriptionPlan[] }>('/admin/plans');
    return res.data.plans;
  },

  createPlan: async (plan: Partial<SubscriptionPlan>) => {
    const res = await apiClient.post<{ message: string; plan: SubscriptionPlan }>('/admin/plans', plan);
    return res.data;
  },

  updatePlan: async (id: number, plan: Partial<SubscriptionPlan>) => {
    const res = await apiClient.put<{ message: string; plan: SubscriptionPlan }>(`/admin/plans/${id}`, plan);
    return res.data;
  },

  deletePlan: async (id: number) => {
    const res = await apiClient.delete<{ message: string }>(`/admin/plans/${id}`);
    return res.data;
  },

  // Settings
  getSettings: async () => {
    const res = await apiClient.get<{ settings: SystemSetting[] }>('/admin/settings');
    return res.data.settings;
  },

  updateSetting: async (data: { key: string; value: string; description?: string; is_secret: boolean }) => {
    const res = await apiClient.put<{ message: string }>('/admin/settings', data);
    return res.data;
  },
};

