export interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  locale: 'en' | 'id';
  role: 'user' | 'designer' | 'admin';
  phone: string | null;
  address: string | null;
  nickname: string | null;
  headline: string | null;
  bio: string | null;
  contact_email: string | null;
  socials: Array<{ platform: string; url: string }>;
  skills: Array<{ name: string; proficiency?: number }>;
  created_at: string;
  updated_at: string;
}
