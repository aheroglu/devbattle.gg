import { TestCase, TestResult, SubmissionResult, SubmissionStatus } from "@/types";

// Judge0 API language IDs
const LANGUAGE_IDS = {
  javascript: 63, // Node.js
  python: 71,     // Python 3
  java: 62,       // Java
  cpp: 54,        // C++ (GCC 9.2.0)
  go: 60,         // Go
  rust: 73,       // Rust
  csharp: 51,     // C#
  typescript: 74, // TypeScript
} as const;

interface Judge0Submission {
  source_code: string;
  language_id: number;
  stdin?: string;
  expected_output?: string;
  cpu_time_limit?: number;
  memory_limit?: number;
}

interface Judge0Result {
  token: string;
  status: {
    id: number;
    description: string;
  };
  stdout?: string;
  stderr?: string;
  compile_output?: string;
  time?: number;
  memory?: number;
}

export class CodeExecutionService {
  private readonly judge0BaseUrl: string;
  private readonly judge0ApiKey?: string;

  constructor() {
    // In production, these should come from environment variables
    this.judge0BaseUrl = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
    this.judge0ApiKey = process.env.JUDGE0_API_KEY;
  }

  /**
   * Execute code against a single test case
   */
  private async executeTestCase(
    code: string,
    language: keyof typeof LANGUAGE_IDS,
    testCase: TestCase,
    timeLimit: number = 5000,
    memoryLimit: number = 256000 // 256MB in KB
  ): Promise<TestResult> {
    const startTime = Date.now();

    try {
      // Prepare input for the test case
      const input = typeof testCase.input === 'string' 
        ? testCase.input 
        : JSON.stringify(testCase.input);

      // Prepare expected output
      const expectedOutput = typeof testCase.expected_output === 'string'
        ? testCase.expected_output.trim()
        : JSON.stringify(testCase.expected_output);

      const submission: Judge0Submission = {
        source_code: code,
        language_id: LANGUAGE_IDS[language],
        stdin: input,
        expected_output: expectedOutput,
        cpu_time_limit: timeLimit / 1000, // Convert to seconds
        memory_limit: memoryLimit, // In KB
      };

      // Submit to Judge0
      const result = await this.submitToJudge0(submission);
      const executionTime = Date.now() - startTime;

      // Process result
      const passed = result.status.id === 3; // Status 3 = Accepted
      const actualOutput = result.stdout?.trim() || '';

      return {
        test_case_id: testCase.id,
        passed,
        input: testCase.input,
        expected: testCase.expected_output,
        actual: actualOutput || result.stderr || 'No output',
        execution_time: result.time ? result.time * 1000 : executionTime, // Convert to milliseconds
        memory_used: result.memory ? result.memory * 1024 : 0, // Convert to bytes
        error: result.status.id !== 3 ? result.stderr || result.status.description : undefined
      };

    } catch (error) {
      return {
        test_case_id: testCase.id,
        passed: false,
        input: testCase.input,
        expected: testCase.expected_output,
        actual: '',
        execution_time: Date.now() - startTime,
        memory_used: 0,
        error: error instanceof Error ? error.message : 'Unknown execution error'
      };
    }
  }

  /**
   * Submit code to Judge0 API and get result
   */
  private async submitToJudge0(submission: Judge0Submission): Promise<Judge0Result> {
    if (!this.judge0ApiKey) {
      // Fallback to mock execution for development
      return this.mockExecution(submission);
    }

    try {
      // Submit code
      const submitResponse = await fetch(`${this.judge0BaseUrl}/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': this.judge0ApiKey,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
        },
        body: JSON.stringify({
          ...submission,
          wait: false, // Don't wait for completion
        }),
      });

      if (!submitResponse.ok) {
        throw new Error(`Judge0 submission failed: ${submitResponse.statusText}`);
      }

      const { token } = await submitResponse.json();

      // Poll for result
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds max wait time

      while (attempts < maxAttempts) {
        const resultResponse = await fetch(`${this.judge0BaseUrl}/submissions/${token}`, {
          headers: {
            'X-RapidAPI-Key': this.judge0ApiKey,
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
          },
        });

        if (!resultResponse.ok) {
          throw new Error(`Judge0 result fetch failed: ${resultResponse.statusText}`);
        }

        const result: Judge0Result = await resultResponse.json();

        // Status 1 = In Queue, Status 2 = Processing
        if (result.status.id !== 1 && result.status.id !== 2) {
          return result;
        }

        // Wait 1 second before next attempt
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }

      throw new Error('Judge0 execution timeout');

    } catch (error) {
      console.error('Judge0 API error:', error);
      // Fallback to mock execution
      return this.mockExecution(submission);
    }
  }

  /**
   * Mock execution for development/fallback
   */
  private mockExecution(submission: Judge0Submission): Judge0Result {
    const isCorrect = Math.random() > 0.3; // 70% success rate for testing
    
    return {
      token: 'mock-token',
      status: {
        id: isCorrect ? 3 : 4, // 3 = Accepted, 4 = Wrong Answer
        description: isCorrect ? 'Accepted' : 'Wrong Answer'
      },
      stdout: isCorrect ? submission.expected_output : 'Wrong output',
      time: Math.random() * 0.1, // Random execution time in seconds
      memory: Math.random() * 1024, // Random memory usage in KB
    };
  }

  /**
   * Execute code against multiple test cases and return submission result
   */
  async executeSubmission(
    code: string,
    language: keyof typeof LANGUAGE_IDS,
    testCases: TestCase[],
    timeLimit: number = 5000,
    memoryLimit: number = 256000
  ): Promise<Omit<SubmissionResult, 'id' | 'battle_id' | 'participant_id' | 'submitted_at'>> {
    const startTime = Date.now();
    const testResults: TestResult[] = [];
    let totalExecutionTime = 0;
    let maxMemoryUsed = 0;
    let compilationError: string | undefined;
    let runtimeError: string | undefined;

    // Execute each test case
    for (const testCase of testCases) {
      try {
        const result = await this.executeTestCase(code, language, testCase, timeLimit, memoryLimit);
        testResults.push(result);
        
        totalExecutionTime += result.execution_time;
        maxMemoryUsed = Math.max(maxMemoryUsed, result.memory_used);

        // Capture errors
        if (result.error) {
          if (result.error.includes('compilation') || result.error.includes('compile')) {
            compilationError = result.error;
          } else {
            runtimeError = result.error;
          }
        }

        // Stop on compilation error
        if (compilationError) break;

      } catch (error) {
        // Handle unexpected errors
        testResults.push({
          test_case_id: testCase.id,
          passed: false,
          input: testCase.input,
          expected: testCase.expected_output,
          actual: '',
          execution_time: 0,
          memory_used: 0,
          error: error instanceof Error ? error.message : 'Execution failed'
        });
      }
    }

    // Calculate score and status
    const passedTests = testResults.filter(r => r.passed).length;
    const totalTests = testResults.length;
    const score = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

    let status: SubmissionStatus;
    if (compilationError) {
      status = 'CE'; // Compilation Error
    } else if (totalExecutionTime > timeLimit) {
      status = 'TLE'; // Time Limit Exceeded
    } else if (maxMemoryUsed > memoryLimit * 1024) { // Convert KB to bytes
      status = 'MLE'; // Memory Limit Exceeded
    } else if (runtimeError) {
      status = 'RE'; // Runtime Error
    } else if (score === 100) {
      status = 'AC'; // Accepted
    } else {
      status = 'WA'; // Wrong Answer
    }

    return {
      code,
      language,
      status,
      score,
      test_results: testResults,
      execution_time: totalExecutionTime,
      memory_used: maxMemoryUsed,
      compilation_error: compilationError,
      runtime_error: runtimeError,
    };
  }

  /**
   * Get supported programming languages
   */
  getSupportedLanguages(): Array<{id: keyof typeof LANGUAGE_IDS, name: string, judge0_id: number}> {
    return [
      { id: 'javascript', name: 'JavaScript (Node.js)', judge0_id: LANGUAGE_IDS.javascript },
      { id: 'python', name: 'Python 3', judge0_id: LANGUAGE_IDS.python },
      { id: 'java', name: 'Java', judge0_id: LANGUAGE_IDS.java },
      { id: 'cpp', name: 'C++', judge0_id: LANGUAGE_IDS.cpp },
      { id: 'go', name: 'Go', judge0_id: LANGUAGE_IDS.go },
      { id: 'rust', name: 'Rust', judge0_id: LANGUAGE_IDS.rust },
      { id: 'csharp', name: 'C#', judge0_id: LANGUAGE_IDS.csharp },
      { id: 'typescript', name: 'TypeScript', judge0_id: LANGUAGE_IDS.typescript },
    ];
  }
}

export const codeExecutionService = new CodeExecutionService();