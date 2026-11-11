export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  avatar_url: string;
  is_kids: boolean;
  created_at: string;
  updated_at: string;
}

export const NETFLIX_AVATAR_PRESETS = [
  { id: 'red', name: 'Netflix Merah', url: '/avatars/avatar-red.svg' },
  { id: 'blue', name: 'Ocean Biru', url: '/avatars/avatar-blue.svg' },
  { id: 'yellow', name: 'Sunny Kuning', url: '/avatars/avatar-yellow.svg' },
  { id: 'purple', name: 'Cyber Ungu', url: '/avatars/avatar-purple.svg' },
  { id: 'emerald', name: 'Matrix Hijau', url: '/avatars/avatar-emerald.svg' },
  { id: 'rose', name: 'Rose Pink', url: '/avatars/avatar-rose.svg' },
  { id: 'amber', name: 'Golden Amber', url: '/avatars/avatar-amber.svg' },
  { id: 'cyan', name: 'Electric Cyan', url: '/avatars/avatar-cyan.svg' },
  { id: 'orange', name: 'Sunset Oranye', url: '/avatars/avatar-orange.svg' },
  { id: 'indigo', name: 'Midnight Indigo', url: '/avatars/avatar-indigo.svg' },
  { id: 'dark', name: 'Shadow Hitam', url: '/avatars/avatar-dark.svg' },
  { id: 'crimson', name: 'Crimson Gelap', url: '/avatars/avatar-crimson.svg' },
];

