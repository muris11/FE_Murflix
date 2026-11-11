export type NotificationCategory = 'trending' | 'movie' | 'tv' | 'system' | 'account';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  timestamp: string;
  read: boolean;
  action_url?: string;
  poster_url?: string;
  badge?: string;
}

