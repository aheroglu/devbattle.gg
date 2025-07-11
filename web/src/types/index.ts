export interface Profile {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  xp: number;
  level: number;
  battles_won: number;
  battles_lost: number;
  rank: number;
  title: string;
  badge: string;
  win_rate: number;
  last_active: string;
  bio: string | null;
  location: string | null;
  preferred_languages: string[];
  twitter_url: string | null;
  github_url: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}
