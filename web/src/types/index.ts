export type UserRole = "admin" | "developer";
export type DifficultyLevel = "EASY" | "MEDIUM" | "HARD";
export type SessionType = "SOLO" | "DUO";
export type BattleResult = "PENDING" | "SUCCESS" | "FAILURE";
export type ParticipantRole = "SOLVER" | "SPECTATOR";
export type SubmissionStatus = "AC" | "WA" | "TLE" | "MLE" | "RE" | "CE"; // Accepted, Wrong Answer, Time Limit Exceeded, Memory Limit Exceeded, Runtime Error, Compilation Error
export type ValidationType = "exact_match" | "numerical" | "array" | "custom";

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

export interface TestCase {
  id: string;
  input: any; // JSON format
  expected_output: any; // JSON format
  description?: string;
  is_sample: boolean; // true for visible test cases, false for hidden
}

export interface ProblemDefinition {
  id: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  sample_test_cases: TestCase[];
  hidden_test_cases: TestCase[];
  starter_code: Record<string, string>; // {"javascript": "function solution() {...}", "python": "def solution():..."}
  time_limit: number; // milliseconds
  memory_limit: number; // MB
  validation_type: ValidationType;
  created_by: string;
  created_at: Date;
  updated_at: Date;
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
  problem_id: string; // Reference to ProblemDefinition
  problem?: ProblemDefinition; // Optional populated problem data
}

export interface BattleParticipant {
  id: string;
  battle_id: string;
  user_id: string;
  submitted_at: Date | null;
  result: BattleResult;
  xp_earned: number;
  created_at: Date;
  role: ParticipantRole;
}

export interface TestResult {
  test_case_id: string;
  passed: boolean;
  input: any;
  expected: any;
  actual: any;
  execution_time: number; // milliseconds
  memory_used: number; // bytes
  error?: string;
}

export interface SubmissionResult {
  id: string;
  battle_id: string;
  participant_id: string;
  code: string;
  language: string;
  status: SubmissionStatus;
  score: number; // 0-100
  test_results: TestResult[];
  execution_time: number; // total execution time in milliseconds
  memory_used: number; // peak memory usage in bytes
  compilation_error?: string;
  runtime_error?: string;
  submitted_at: Date;
}

export interface BattleSubmission {
  id: string;
  participant_id: string;
  code: string;
  language: string;
  is_final: boolean;
  created_at: Date;
  result?: SubmissionResult; // Optional populated result data
}
