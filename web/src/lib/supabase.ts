import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Profile type moved to types/index.ts for consistency

export type Problem = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  test_cases: any;
  created_at: string;
  updated_at: string;
};

export type Battle = {
  id: string;
  problem_id: string;
  player1_id: string;
  player2_id: string;
  player1_code: string;
  player2_code: string;
  player1_completed: boolean;
  player2_completed: boolean;
  winner_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};
