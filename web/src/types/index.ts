export type UserRole = "admin" | "developer";
export type DifficultyLevel = "EASY" | "MEDIUM" | "HARD";
export type SessionType = "SOLO" | "DUO";
export type BattleResult = "PENDING" | "SUCCESS" | "FAILURE";

export interface User {
  id: string;
  username: string;
  avatar_url: string | null;
  xp: number | null;
  level: number | null;
  battles_won: number | null;
  battles_lost: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  rank: number | null;
  title: string | null;
  badge: string | null;
  win_rate: number | null;
  lastActive: Date | null;
  preferred_languages: string[] | null;
  full_name: string | null;
  website: string | null;
  github_url: string | null;
  twitter_url: string | null;
  bio: string | null;
  location: string | null;
  role: UserRole | null;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_type: string;
  achievement_data: any;
  unlocked_at: Date;
}

export interface BattleSession {
  id: string;
  title: string;
  description: string | null;
  difficulty: DifficultyLevel;
  session_type: SessionType;
  max_duration: number; // seconds
  xp_reward: number;
  created_by: string;
  created_at: Date;
  updated_at: Date;
  technologies: string[]; // example: ['C#', 'Unity']
  language: string;
}

export interface BattleParticipant {
  id: string;
  battle_id: string;
  user_id: string;
  submitted_at: Date | null;
  result: BattleResult;
  xp_earned: number;
  created_at: Date;
}

export interface BattleSubmission {
  id: string;
  participant_id: string;
  code: string;
  language: string;
  is_final: boolean;
  created_at: Date;
}
