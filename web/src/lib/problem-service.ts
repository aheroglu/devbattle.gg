import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Problem, TestCase } from "@/types";

export class ProblemService {
  private supabase = createClientComponentClient();

  // Get all active problems
  async getProblems(
    difficulty?: 'easy' | 'medium' | 'hard',
    tags?: string[],
    limit: number = 50
  ): Promise<Problem[]> {
    let query = this.supabase
      .from('problems')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    if (tags && tags.length > 0) {
      query = query.overlaps('tags', tags);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  // Get problem by ID
  async getProblem(id: string): Promise<Problem | null> {
    const { data, error } = await this.supabase
      .from('problems')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  }

  // Create a new problem (admin/creator function)
  async createProblem(problem: Omit<Problem, 'id' | 'created_at' | 'updated_at' | 'created_by'>): Promise<string> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.supabase
      .from('problems')
      .insert({
        ...problem,
        created_by: user.id
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  // Update problem
  async updateProblem(id: string, updates: Partial<Problem>): Promise<void> {
    const { error } = await this.supabase
      .from('problems')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  }

  // Delete problem (soft delete by setting is_active to false)
  async deleteProblem(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('problems')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  }

  // Get problems by difficulty distribution
  async getProblemsByDifficulty(): Promise<{
    easy: number;
    medium: number;
    hard: number;
  }> {
    const { data, error } = await this.supabase
      .from('problems')
      .select('difficulty')
      .eq('is_active', true);

    if (error) throw error;

    const distribution = { easy: 0, medium: 0, hard: 0 };
    data?.forEach(problem => {
      distribution[problem.difficulty as keyof typeof distribution]++;
    });

    return distribution;
  }

  // Get random problem by difficulty
  async getRandomProblem(difficulty?: 'easy' | 'medium' | 'hard'): Promise<Problem | null> {
    let query = this.supabase
      .from('problems')
      .select('*')
      .eq('is_active', true);

    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    const { data, error } = await query;
    if (error) throw error;
    if (!data || data.length === 0) return null;

    // Return random problem
    const randomIndex = Math.floor(Math.random() * data.length);
    return data[randomIndex];
  }

  // Get all unique tags
  async getAllTags(): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('problems')
      .select('tags')
      .eq('is_active', true);

    if (error) throw error;

    const allTags = new Set<string>();
    data?.forEach(problem => {
      problem.tags?.forEach((tag: string) => allTags.add(tag));
    });

    return Array.from(allTags).sort();
  }

  // Search problems
  async searchProblems(query: string, limit: number = 20): Promise<Problem[]> {
    const { data, error } = await this.supabase
      .from('problems')
      .select('*')
      .eq('is_active', true)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // Validate test cases
  validateTestCases(testCases: TestCase[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!testCases || testCases.length === 0) {
      errors.push('At least one test case is required');
      return { valid: false, errors };
    }

    testCases.forEach((testCase, index) => {
      if (!testCase.input) {
        errors.push(`Test case ${index + 1}: Input is required`);
      }
      
      if (testCase.output === undefined || testCase.output === null) {
        errors.push(`Test case ${index + 1}: Output is required`);
      }

      // Check if input is a valid object
      if (typeof testCase.input !== 'object') {
        errors.push(`Test case ${index + 1}: Input must be an object`);
      }
    });

    return { valid: errors.length === 0, errors };
  }

  // Validate starter code
  validateStarterCode(starterCode: Record<string, string>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const supportedLanguages = ['javascript', 'python', 'java', 'cpp', 'go', 'rust'];

    if (!starterCode || Object.keys(starterCode).length === 0) {
      errors.push('At least one starter code is required');
      return { valid: false, errors };
    }

    Object.entries(starterCode).forEach(([language, code]) => {
      if (!supportedLanguages.includes(language)) {
        errors.push(`Unsupported language: ${language}`);
      }
      
      if (!code || code.trim().length === 0) {
        errors.push(`Starter code for ${language} cannot be empty`);
      }
    });

    return { valid: errors.length === 0, errors };
  }

  // Get problem statistics
  async getProblemStats(problemId: string): Promise<{
    totalAttempts: number;
    successfulSolutions: number;
    averageTime: number;
    languageDistribution: Record<string, number>;
  }> {
    // This would typically query battle statistics
    // For now, return mock data
    return {
      totalAttempts: Math.floor(Math.random() * 1000),
      successfulSolutions: Math.floor(Math.random() * 500),
      averageTime: Math.floor(Math.random() * 300), // seconds
      languageDistribution: {
        javascript: Math.floor(Math.random() * 100),
        python: Math.floor(Math.random() * 100),
        java: Math.floor(Math.random() * 50),
        cpp: Math.floor(Math.random() * 30),
      }
    };
  }
}

export const problemService = new ProblemService();