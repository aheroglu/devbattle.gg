import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Battle, Problem, CodeExecution, CodeExecutionResult } from "@/types";

export class BattleService {
  private supabase = createClientComponentClient();

  // Create a new battle
  async createBattle(problemId: string, battleMode: 'classic' | 'speed' | 'debug' = 'classic'): Promise<string> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.supabase
      .from('battles')
      .insert({
        problem_id: problemId,
        player1_id: user.id,
        battle_mode: battleMode,
        status: 'waiting'
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  // Find available battles to join
  async findAvailableBattles(limit: number = 10): Promise<Battle[]> {
    const { data, error } = await this.supabase
      .from('battles')
      .select(`
        *,
        problem:problems(*),
        player1:profiles!battles_player1_id_fkey(*)
      `)
      .eq('status', 'waiting')
      .is('player2_id', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // Get user's battle history
  async getUserBattles(userId: string, limit: number = 20): Promise<Battle[]> {
    const { data, error } = await this.supabase
      .from('battles')
      .select(`
        *,
        problem:problems(*),
        player1:profiles!battles_player1_id_fkey(*),
        player2:profiles!battles_player2_id_fkey(*),
        winner:profiles!battles_winner_id_fkey(*)
      `)
      .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // Execute code against test cases
  async executeCode(execution: CodeExecution): Promise<CodeExecutionResult> {
    // This would typically call a separate code execution service
    // For now, we'll simulate the execution
    
    const results: CodeExecutionResult = {
      success: false,
      test_results: [],
      total_tests: execution.test_cases.length,
      passed_tests: 0,
      execution_time: Math.random() * 1000, // Random execution time
      memory_used: Math.random() * 1024 * 1024 // Random memory usage
    };

    // Simulate test execution
    for (let i = 0; i < execution.test_cases.length; i++) {
      const testCase = execution.test_cases[i];
      
      // Simple simulation - randomly pass/fail tests
      const passed = Math.random() > 0.3; // 70% pass rate for simulation
      
      results.test_results.push({
        test_case_index: i,
        passed,
        expected: testCase.output,
        actual: passed ? testCase.output : "Wrong answer",
        execution_time: Math.random() * 100,
        memory_used: Math.random() * 1024,
        error: passed ? undefined : "Runtime error or wrong logic"
      });

      if (passed) results.passed_tests++;
    }

    results.success = results.passed_tests === results.total_tests;
    
    return results;
  }

  // Submit battle solution
  async submitBattleSolution(battleId: string, code: string, language: string): Promise<CodeExecutionResult> {
    // Get battle and problem details
    const { data: battle, error: battleError } = await this.supabase
      .from('battles')
      .select(`
        *,
        problem:problems(*)
      `)
      .eq('id', battleId)
      .single();

    if (battleError) throw battleError;
    if (!battle?.problem) throw new Error('Problem not found');

    // Execute the code
    const execution: CodeExecution = {
      language: language as any,
      code,
      test_cases: battle.problem.test_cases
    };

    const result = await this.executeCode(execution);

    // Update battle with results
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const isPlayer1 = battle.player1_id === user.id;
    const updateData: any = {
      [`${isPlayer1 ? 'player1' : 'player2'}_test_results`]: result.test_results,
      [`${isPlayer1 ? 'player1' : 'player2'}_submitted_at`]: new Date().toISOString()
    };

    // Check if battle should be completed
    const otherPlayerSubmitted = isPlayer1 ? battle.player2_submitted_at : battle.player1_submitted_at;
    
    if (otherPlayerSubmitted) {
      // Both players have submitted, determine winner
      const otherPlayerResults = isPlayer1 ? battle.player2_test_results : battle.player1_test_results;
      
      if (otherPlayerResults) {
        const currentPlayerPassed = result.passed_tests;
        const otherPlayerPassed = otherPlayerResults.filter((r: any) => r.passed).length;
        
        if (currentPlayerPassed > otherPlayerPassed) {
          updateData.winner_id = user.id;
        } else if (otherPlayerPassed > currentPlayerPassed) {
          updateData.winner_id = isPlayer1 ? battle.player2_id : battle.player1_id;
        }
        // If tied, no winner (or implement tiebreaker logic)
        
        updateData.status = 'completed';
        updateData.ended_at = new Date().toISOString();
      }
    }

    const { error: updateError } = await this.supabase
      .from('battles')
      .update(updateData)
      .eq('id', battleId);

    if (updateError) throw updateError;

    return result;
  }

  // Cancel battle
  async cancelBattle(battleId: string): Promise<void> {
    const { error } = await this.supabase
      .from('battles')
      .update({ 
        status: 'cancelled',
        ended_at: new Date().toISOString()
      })
      .eq('id', battleId);

    if (error) throw error;
  }

  // Get live battles (for spectating)
  async getLiveBattles(limit: number = 10): Promise<Battle[]> {
    const { data, error } = await this.supabase
      .from('battles')
      .select(`
        *,
        problem:problems(*),
        player1:profiles!battles_player1_id_fkey(*),
        player2:profiles!battles_player2_id_fkey(*)
      `)
      .eq('status', 'active')
      .not('player2_id', 'is', null)
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // Quick match - find or create a battle
  async quickMatch(difficulty?: 'easy' | 'medium' | 'hard'): Promise<string> {
    // First, try to find an available battle
    let availableBattles = await this.findAvailableBattles(5);
    
    // Filter by difficulty if specified
    if (difficulty) {
      availableBattles = availableBattles.filter(
        battle => battle.problem?.difficulty === difficulty
      );
    }

    if (availableBattles.length > 0) {
      // Join the first available battle
      const battle = availableBattles[0];
      
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await this.supabase
        .from('battles')
        .update({
          player2_id: user.id,
          status: 'active',
          started_at: new Date().toISOString()
        })
        .eq('id', battle.id);

      if (error) throw error;
      return battle.id;
    } else {
      // Create a new battle with a random problem
      const { data: problems, error: problemsError } = await this.supabase
        .from('problems')
        .select('id')
        .eq('is_active', true)
        .eq('difficulty', difficulty || 'easy')
        .limit(10);

      if (problemsError) throw problemsError;
      if (!problems || problems.length === 0) {
        throw new Error('No problems available');
      }

      const randomProblem = problems[Math.floor(Math.random() * problems.length)];
      return await this.createBattle(randomProblem.id);
    }
  }
}

export const battleService = new BattleService();