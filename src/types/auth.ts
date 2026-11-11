export type UserRole = 'admin' | 'user';

export type SubscriptionDurationUnit = 'hours' | 'days' | 'months' | 'years' | 'forever';

export interface SubscriptionPlan {
  id: number;
  name: string;
  duration_unit: SubscriptionDurationUnit;
  duration_value: number;
  price: number;
  currency: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  subscription_expires_at?: string | null;
  subscription_status?: 'active' | 'expired' | 'forever' | 'none';
  plan_name?: string | null;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSubscriptionValid: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

