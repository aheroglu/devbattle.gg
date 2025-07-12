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

export interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  test_cases: TestCase[];
  starter_code: Record<string, string>; // { "javascript": "...", "python": "..." }
  solution_code?: Record<string, string>;
  tags: string[];
  time_limit: number; // seconds
  memory_limit: number; // MB
  created_by: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TestCase {
  input: Record<string, any>;
  output: any;
  explanation?: string;
}

export interface Battle {
  id: string;
  problem_id: string;
  player1_id: string;
  player2_id: string | null;
  player1_code: string | null;
  player2_code: string | null;
  player1_language: string | null;
  player2_language: string | null;
  player1_submitted_at: string | null;
  player2_submitted_at: string | null;
  player1_test_results: TestResult[] | null;
  player2_test_results: TestResult[] | null;
  winner_id: string | null;
  status: "waiting" | "active" | "completed" | "cancelled" | "expired";
  battle_mode: "classic" | "speed" | "debug";
  max_duration: number; // seconds
  started_at: string | null;
  ended_at: string | null;
  created_at: string;

  // Populated fields
  problem?: Problem;
  player1?: Profile;
  player2?: Profile;
  winner?: Profile;
}

export interface TestResult {
  test_case_index: number;
  passed: boolean;
  expected: any;
  actual: any;
  execution_time: number; // milliseconds
  memory_used: number; // bytes
  error?: string;
}

export interface Tournament {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  max_participants: number;
  current_participants: number;
  entry_fee: number;
  prize_pool: number;
  tournament_type: "single_elimination" | "double_elimination" | "round_robin";
  status:
    | "upcoming"
    | "registration_open"
    | "in_progress"
    | "completed"
    | "cancelled";
  bracket_data: any; // Tournament bracket structure
  rules: any; // Tournament specific rules
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TournamentParticipant {
  id: string;
  tournament_id: string;
  participant_id: string;
  registration_date: string;
  seed: number | null;
  current_round: number;
  is_eliminated: boolean;
  final_ranking: number | null;

  // Populated fields
  participant?: Profile;
}

export interface BattleMessage {
  id: string;
  battle_id: string;
  sender_id: string;
  message: string;
  message_type: "chat" | "system" | "code_share";
  created_at: string;

  // Populated fields
  sender?: Profile;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_type: string;
  achievement_data: any;
  unlocked_at: string;
}

export interface BattleSpectator {
  id: string;
  battle_id: string;
  spectator_id: string;
  joined_at: string;

  // Populated fields
  spectator?: Profile;
}

// Utility types
export type ProgrammingLanguage =
  | "javascript"
  | "python"
  | "java"
  | "cpp"
  | "go"
  | "rust";

export interface CodeExecution {
  language: ProgrammingLanguage;
  code: string;
  test_cases: TestCase[];
}

export interface CodeExecutionResult {
  success: boolean;
  test_results: TestResult[];
  total_tests: number;
  passed_tests: number;
  execution_time: number;
  memory_used: number;
  compile_error?: string;
  runtime_error?: string;
}
