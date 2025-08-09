import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { codeExecutionService } from "./code-execution-service";
import { 
  BattleSession, 
  ProblemDefinition, 
  SubmissionResult, 
  TestCase,
  SubmissionStatus,
  BattleResult
} from "@/types";

export class BattleSubmissionService {
  private supabase = createClientComponentClient();

  /**
   * Submit code solution for a battle
   */
  async submitSolution(
    battleId: string, 
    code: string
  ): Promise<SubmissionResult> {
    try {
      // Get current user
      const { data: { session } } = await this.supabase.auth.getSession();
      if (!session) {
        throw new Error('User not authenticated');
      }

      // Get battle with problem definition
      const { data: battle, error: battleError } = await this.supabase
        .from('battle_sessions')
        .select(`
          *,
          problem_definitions (
            id,
            title,
            description,
            sample_test_cases,
            hidden_test_cases,
            starter_code,
            time_limit,
            memory_limit,
            validation_type
          )
        `)
        .eq('id', battleId)
        .single();

      if (battleError) {
        throw new Error(`Failed to fetch battle: ${battleError.message}`);
      }

      if (!battle || !battle.problem_definitions) {
        throw new Error('Battle or problem definition not found');
      }

      const problemDef = battle.problem_definitions;

      // Get user's participant record
      const { data: participant, error: participantError } = await this.supabase
        .from('battle_participants')
        .select('id, role')
        .eq('battle_id', battleId)
        .eq('user_id', session.user.id)
        .single();

      if (participantError) {
        throw new Error(`Participant not found: ${participantError.message}`);
      }

      // Only SOLVER can submit solutions
      if (participant.role !== 'SOLVER') {
        throw new Error('Only SOLVER participants can submit solutions');
      }

      // Combine sample and hidden test cases
      const allTestCases: TestCase[] = [
        ...problemDef.sample_test_cases,
        ...problemDef.hidden_test_cases
      ];

      if (allTestCases.length === 0) {
        throw new Error('No test cases found for this problem');
      }

      // Execute code against test cases
      const executionResult = await codeExecutionService.executeSubmission(
        code,
        battle.language as any,
        allTestCases,
        problemDef.time_limit,
        problemDef.memory_limit
      );

      // Create submission result record
      const submissionData = {
        battle_id: battleId,
        participant_id: participant.id,
        code,
        language: battle.language,
        status: executionResult.status,
        score: executionResult.score,
        test_results: executionResult.test_results,
        execution_time: executionResult.execution_time,
        memory_used: executionResult.memory_used,
        compilation_error: executionResult.compilation_error,
        runtime_error: executionResult.runtime_error,
      };

      const { data: submissionResult, error: submissionError } = await this.supabase
        .from('submission_results')
        .insert(submissionData)
        .select()
        .single();

      if (submissionError) {
        throw new Error(`Failed to save submission: ${submissionError.message}`);
      }

      // Update battle participant result based on submission
      const battleResult: BattleResult = executionResult.status === 'AC' ? 'SUCCESS' : 'FAILURE';
      const xpEarned = executionResult.status === 'AC' ? battle.xp_reward : 0;

      const { error: updateError } = await this.supabase
        .from('battle_participants')
        .update({
          result: battleResult,
          xp_earned: xpEarned,
          submitted_at: new Date().toISOString(),
        })
        .eq('id', participant.id);

      if (updateError) {
        console.error('Failed to update participant result:', updateError);
        // Don't throw error as submission was successful
      }

      // Update user's battle statistics if successful
      if (executionResult.status === 'AC') {
        await this.updateUserStats(session.user.id, true, xpEarned);
      } else {
        await this.updateUserStats(session.user.id, false, 0);
      }

      return {
        ...submissionResult,
        submitted_at: new Date(submissionResult.submitted_at),
      };

    } catch (error) {
      console.error('Submission error:', error);
      throw error;
    }
  }

  /**
   * Get submission results for a battle
   */
  async getSubmissionResults(battleId: string): Promise<SubmissionResult[]> {
    const { data, error } = await this.supabase
      .from('submission_results')
      .select(`
        *,
        battle_participants!inner(
          users!inner(
            username,
            avatar_url
          )
        )
      `)
      .eq('battle_id', battleId)
      .order('submitted_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch submissions: ${error.message}`);
    }

    return data?.map(result => ({
      ...result,
      submitted_at: new Date(result.submitted_at),
    })) || [];
  }

  /**
   * Get user's submission for a specific battle
   */
  async getUserSubmission(battleId: string): Promise<SubmissionResult | null> {
    const { data: { session } } = await this.supabase.auth.getSession();
    if (!session) return null;

    const { data, error } = await this.supabase
      .from('submission_results')
      .select(`
        *,
        battle_participants!inner(
          user_id
        )
      `)
      .eq('battle_id', battleId)
      .eq('battle_participants.user_id', session.user.id)
      .order('submitted_at', { ascending: false })
      .limit(1);

    if (error) {
      throw new Error(`Failed to fetch user submission: ${error.message}`);
    }

    if (!data || data.length === 0) return null;

    return {
      ...data[0],
      submitted_at: new Date(data[0].submitted_at),
    };
  }

  /**
   * Check if user can submit (is SOLVER and hasn't submitted successfully)
   */
  async canUserSubmit(battleId: string): Promise<boolean> {
    const { data: { session } } = await this.supabase.auth.getSession();
    if (!session) return false;

    // Check if user is SOLVER
    const { data: participant } = await this.supabase
      .from('battle_participants')
      .select('role, result')
      .eq('battle_id', battleId)
      .eq('user_id', session.user.id)
      .single();

    if (!participant || participant.role !== 'SOLVER') {
      return false;
    }

    // Check if already submitted successfully
    return participant.result !== 'SUCCESS';
  }

  /**
   * Update user statistics after battle completion
   */
  private async updateUserStats(userId: string, won: boolean, xpEarned: number): Promise<void> {
    try {
      const { data: user, error: fetchError } = await this.supabase
        .from('users')
        .select('battles_won, battles_lost, xp, level')
        .eq('id', userId)
        .single();

      if (fetchError) {
        console.error('Failed to fetch user stats:', fetchError);
        return;
      }

      const battlesWon = (user.battles_won || 0) + (won ? 1 : 0);
      const battlesLost = (user.battles_lost || 0) + (won ? 0 : 1);
      const totalXp = (user.xp || 0) + xpEarned;
      
      // Simple level calculation: level = floor(totalXp / 1000) + 1
      const level = Math.floor(totalXp / 1000) + 1;
      const winRate = battlesWon + battlesLost > 0 
        ? Math.round((battlesWon / (battlesWon + battlesLost)) * 100) 
        : 0;

      const { error: updateError } = await this.supabase
        .from('users')
        .update({
          battles_won: battlesWon,
          battles_lost: battlesLost,
          xp: totalXp,
          level: level,
          win_rate: winRate,
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Failed to update user stats:', updateError);
      }
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  }

  /**
   * Get problem definition for a battle
   */
  async getBattleProblem(battleId: string): Promise<ProblemDefinition | null> {
    const { data, error } = await this.supabase
      .from('battle_sessions')
      .select(`
        problem_definitions (
          id,
          title,
          description,
          difficulty,
          sample_test_cases,
          starter_code,
          time_limit,
          memory_limit,
          validation_type,
          created_at,
          updated_at,
          created_by
        )
      `)
      .eq('id', battleId)
      .single();

    if (error || !data?.problem_definitions) {
      return null;
    }

    return {
      ...data.problem_definitions,
      // Don't expose hidden test cases in client
      hidden_test_cases: [],
      created_at: new Date(data.problem_definitions.created_at),
      updated_at: new Date(data.problem_definitions.updated_at),
    };
  }
}

export const battleSubmissionService = new BattleSubmissionService();