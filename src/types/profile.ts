export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  avatar_url: string;
  is_kids: boolean;
  has_pin?: boolean;
  created_at: string;
  updated_at: string;
}

export const NETFLIX_AVATAR_PRESETS = [
  { id: 'red', name: 'Netflix Merah', url: '/avatars/avatar-red.svg?v=2' },
  { id: 'blue', name: 'Ocean Biru', url: '/avatars/avatar-blue.svg?v=2' },
  { id: 'yellow', name: 'Sunny Kuning', url: '/avatars/avatar-yellow.svg?v=2' },
  { id: 'purple', name: 'Cyber Ungu', url: '/avatars/avatar-purple.svg?v=2' },
  { id: 'emerald', name: 'Matrix Hijau', url: '/avatars/avatar-emerald.svg?v=2' },
  { id: 'rose', name: 'Rose Pink', url: '/avatars/avatar-rose.svg?v=2' },
  { id: 'amber', name: 'Golden Amber', url: '/avatars/avatar-amber.svg?v=2' },
  { id: 'cyan', name: 'Electric Cyan', url: '/avatars/avatar-cyan.svg?v=2' },
  { id: 'orange', name: 'Sunset Oranye', url: '/avatars/avatar-orange.svg?v=2' },
  { id: 'indigo', name: 'Midnight Indigo', url: '/avatars/avatar-indigo.svg?v=2' },
  { id: 'dark', name: 'Shadow Hitam', url: '/avatars/avatar-dark.svg?v=2' },
  { id: 'crimson', name: 'Crimson Gelap', url: '/avatars/avatar-crimson.svg?v=2' },
];

