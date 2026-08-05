export interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  locale: 'en' | 'id';
  role: 'user' | 'designer' | 'admin';
  created_at: string;
  updated_at: string;
}
