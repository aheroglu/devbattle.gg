import axios from 'axios';
import { logger } from '../utils/logger';

export interface TestCase {
  input: string;
  expected_output: string;
  explanation?: string;
}

export interface TestResult {
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  execution_time?: number;
  memory_usage?: number;
  error?: string | null;
}

export interface ExecutionResult {
  status: 'AC' | 'WA' | 'TLE' | 'MLE' | 'RE' | 'CE';
  execution_time?: number;
  memory_usage?: number;
  test_results: TestResult[];
  total_tests: number;
  passed_tests: number;
  error_message?: string | null;
}

// Language ID mapping for Judge0
const LANGUAGE_IDS = {
  javascript: 63, // Node.js
  python: 71,     // Python 3
  java: 62,       // Java
  cpp: 54,        // C++17
  c: 50,          // C
  csharp: 51,     // C#
  go: 60,         // Go
  rust: 73,       // Rust
  typescript: 74  // TypeScript
};

export class CodeExecutionService {
  private static judge0ApiUrl = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
  private static judge0ApiKey = process.env.JUDGE0_API_KEY;

  /**
   * Execute code submission with test cases
   */
  static async executeSubmission(
    code: string,
    language: keyof typeof LANGUAGE_IDS,
    testCases: TestCase[],
    timeLimit: number = 5000,
    memoryLimit: number = 256000
  ): Promise<ExecutionResult> {
    try {
      // If Judge0 API is not configured, use mock execution
      if (!this.judge0ApiKey) {
        logger.warn('Judge0 API not configured, using mock execution');
        return this.mockExecution(code, language, testCases);
      }

      const languageId = LANGUAGE_IDS[language];
      if (!languageId) {
        throw new Error(`Unsupported language: ${language}`);
      }

      const testResults: TestResult[] = [];
      let totalExecutionTime = 0;
      let maxMemoryUsage = 0;

      for (const testCase of testCases) {
        const result = await this.executeTestCase(
          code,
          languageId,
          testCase,
          timeLimit,
          memoryLimit
        );
        
        testResults.push(result);
        totalExecutionTime += result.execution_time || 0;
        maxMemoryUsage = Math.max(maxMemoryUsage, result.memory_usage || 0);
      }

      const passedTests = testResults.filter(r => r.passed).length;
      const allPassed = passedTests === testCases.length;

      let status: ExecutionResult['status'] = 'AC';
      let errorMessage: string | undefined;

      if (!allPassed) {
        // Check for specific error types
        const hasRuntimeError = testResults.some(r => r.error?.includes('runtime error'));
        const hasTimeLimit = testResults.some(r => r.error?.includes('time limit'));
        const hasMemoryLimit = testResults.some(r => r.error?.includes('memory limit'));
        const hasCompilationError = testResults.some(r => r.error?.includes('compilation error'));

        if (hasCompilationError) {
          status = 'CE';
          errorMessage = 'Compilation error';
        } else if (hasRuntimeError) {
          status = 'RE';
          errorMessage = 'Runtime error';
        } else if (hasTimeLimit) {
          status = 'TLE';
          errorMessage = 'Time limit exceeded';
        } else if (hasMemoryLimit) {
          status = 'MLE';
          errorMessage = 'Memory limit exceeded';
        } else {
          status = 'WA';
          errorMessage = 'Wrong answer';
        }
      }

      return {
        status,
        execution_time: totalExecutionTime,
        memory_usage: maxMemoryUsage,
        test_results: testResults,
        total_tests: testCases.length,
        passed_tests: passedTests,
        error_message: errorMessage || null
      };
    } catch (error) {
      logger.error('Code execution error:', error);
      return {
        status: 'RE',
        test_results: [],
        total_tests: testCases.length,
        passed_tests: 0,
        error_message: error instanceof Error ? error.message : 'Execution failed'
      };
    }
  }

  /**
   * Execute a single test case
   */
  private static async executeTestCase(
    code: string,
    languageId: number,
    testCase: TestCase,
    timeLimit: number,
    memoryLimit: number
  ): Promise<TestResult> {
    try {
      // Create submission
      const submissionResponse = await axios.post(
        `${this.judge0ApiUrl}/submissions`,
        {
          source_code: code,
          language_id: languageId,
          stdin: testCase.input,
          expected_output: testCase.expected_output,
          cpu_time_limit: timeLimit / 1000, // Convert to seconds
          memory_limit: memoryLimit / 1024,  // Convert to MB
          wall_time_limit: (timeLimit / 1000) + 2 // Add buffer
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-RapidAPI-Key': this.judge0ApiKey,
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
          }
        }
      );

      const submissionToken = submissionResponse.data.token;

      // Wait for completion
      let result;
      let attempts = 0;
      const maxAttempts = 10;

      do {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        
        const resultResponse = await axios.get(
          `${this.judge0ApiUrl}/submissions/${submissionToken}`,
          {
            headers: {
              'X-RapidAPI-Key': this.judge0ApiKey,
              'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
            }
          }
        );

        result = resultResponse.data;
        attempts++;
      } while (result.status.id <= 2 && attempts < maxAttempts); // Status 1-2 means processing

      const passed = result.status.id === 3; // Status 3 means accepted
      const actualOutput = result.stdout || '';
      const executionTime = parseFloat(result.time) * 1000; // Convert to ms
      const memoryUsage = parseInt(result.memory) * 1024; // Convert to bytes

      let error: string | undefined;
      if (result.stderr) {
        error = result.stderr;
      } else if (result.compile_output) {
        error = 'compilation error: ' + result.compile_output;
      } else if (result.status.id === 5) {
        error = 'time limit exceeded';
      } else if (result.status.id === 6) {
        error = 'compilation error';
      } else if (result.status.id === 7) {
        error = 'runtime error';
      } else if (result.status.id === 8) {
        error = 'runtime error';
      } else if (result.status.id === 9) {
        error = 'runtime error';
      } else if (result.status.id === 10) {
        error = 'runtime error';
      } else if (result.status.id === 11) {
        error = 'runtime error';
      } else if (result.status.id === 12) {
        error = 'runtime error';
      } else if (result.status.id === 13) {
        error = 'internal error';
      } else if (result.status.id === 14) {
        error = 'execution error';
      }

      return {
        input: testCase.input,
        expected: testCase.expected_output,
        actual: actualOutput.trim(),
        passed,
        execution_time: executionTime,
        memory_usage: memoryUsage,
        error: error || null
      };
    } catch (error) {
      logger.error('Judge0 API error:', error);
      return {
        input: testCase.input,
        expected: testCase.expected_output,
        actual: '',
        passed: false,
        error: 'API execution error'
      };
    }
  }

  /**
   * Mock execution for development/testing
   */
  private static mockExecution(
    code: string,
    language: keyof typeof LANGUAGE_IDS,
    testCases: TestCase[]
  ): ExecutionResult {
    logger.info('Using mock code execution');

    // Simple mock logic - randomly pass/fail tests
    const testResults: TestResult[] = testCases.map((testCase, index) => {
      const passed = Math.random() > 0.3; // 70% pass rate
      const executionTime = Math.random() * 100 + 50; // 50-150ms
      const memoryUsage = Math.random() * 1000 + 5000; // 5-6KB

      return {
        input: testCase.input,
        expected: testCase.expected_output,
        actual: passed ? testCase.expected_output : 'wrong output',
        passed,
        execution_time: executionTime,
        memory_usage: memoryUsage
      };
    });

    const passedTests = testResults.filter(r => r.passed).length;
    const allPassed = passedTests === testCases.length;

    return {
      status: allPassed ? 'AC' : 'WA',
      execution_time: testResults.reduce((sum, r) => sum + (r.execution_time || 0), 0),
      memory_usage: Math.max(...testResults.map(r => r.memory_usage || 0)),
      test_results: testResults,
      total_tests: testCases.length,
      passed_tests: passedTests,
      error_message: allPassed ? null : 'Some test cases failed'
    };
  }

  /**
   * Get supported languages
   */
  static getSupportedLanguages() {
    return Object.keys(LANGUAGE_IDS);
  }

  /**
   * Validate code submission
   */
  static validateCodeSubmission(code: string, language: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!code || code.trim().length === 0) {
      errors.push('Code cannot be empty');
    }

    if (code.length > 10000) {
      errors.push('Code must be less than 10,000 characters');
    }

    if (!LANGUAGE_IDS[language as keyof typeof LANGUAGE_IDS]) {
      errors.push(`Unsupported language: ${language}`);
    }

    // Basic syntax checks for common issues
    if (language === 'javascript' || language === 'typescript') {
      const suspiciousPatterns = [
        /require\s*\(\s*['"]fs['"]\s*\)/,
        /require\s*\(\s*['"]child_process['"]\s*\)/,
        /process\.exit/,
        /eval\s*\(/
      ];

      for (const pattern of suspiciousPatterns) {
        if (pattern.test(code)) {
          errors.push('Code contains potentially unsafe operations');
          break;
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}