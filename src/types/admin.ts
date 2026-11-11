export interface DashboardStats {
  total_users: number;
  active_users: number;
  expired_users: number;
  admin_users: number;
  total_plans: number;
}

export interface SystemSetting {
  key: string;
  value: string;
  description?: string;
  is_secret: boolean;
  updated_at: string;
}

