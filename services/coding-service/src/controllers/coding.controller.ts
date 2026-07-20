import { Request, Response } from 'express';
import { PROBLEMS, getProblemById } from '../problems/problems';
import { executeCode, compareOutputs } from '../services/executor.service';
import { db } from '../db/client';

export const codingController = {

  // List all problems
  listProblems(_req: Request, res: Response) {
    const problems = PROBLEMS.map(({ id, title, slug, difficulty, category, tags }) => ({
      id, title, slug, difficulty, category, tags,
    }));
    return res.json({ success: true, data: problems });
  },

  // Get single problem
  getProblem(req: Request, res: Response) {
    const problem = getProblemById(req.params.id);
    if (!problem) return res.status(404).json({ success: false, error: 'Problem not found' });

    // Return problem without hidden test cases
    const { testCases, ...problemData } = problem;
    const visibleTests = testCases.filter(t => !t.hidden);
    return res.json({ success: true, data: { ...problemData, testCases: visibleTests } });
  },

  // Submit code
  async submit(req: Request, res: Response) {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

      const { problemId, language, code } = req.body;
      if (!problemId || !language || !code) {
        return res.status(400).json({ success: false, error: 'problemId, language, and code required' });
      }

      const problem = getProblemById(problemId);
      if (!problem) return res.status(404).json({ success: false, error: 'Problem not found' });

      if (!['python', 'javascript', 'cpp'].includes(language)) {
        return res.status(400).json({ success: false, error: 'Supported languages: python, javascript, cpp' });
      }

      // Create pending submission
      const { rows: [submission] } = await db.query(
        `INSERT INTO submissions (user_id, problem_id, problem_title, language, code, total_tests)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [userId, problemId, problem.title, language, code, problem.testCases.length]
      );

      // Run all test cases
      const testResults: any[] = [];
      let passedTests = 0;
      let totalTime = 0;
      let errorMessage = '';

      for (const [i, testCase] of problem.testCases.entries()) {
        const result = await executeCode(code, language, testCase.input);
        const passed = !result.timedOut && result.exitCode === 0 &&
                       compareOutputs(result.stdout, testCase.expectedOutput);

        if (passed) passedTests++;
        totalTime += result.executionTime;

        testResults.push({
          testCase: i + 1,
          passed,
          input: testCase.hidden ? '[hidden]' : testCase.input,
          expectedOutput: testCase.hidden ? '[hidden]' : testCase.expectedOutput,
          actualOutput: testCase.hidden ? (passed ? '[correct]' : '[wrong]') : result.stdout,
          executionTime: result.executionTime,
          error: result.stderr || null,
          timedOut: result.timedOut,
        });

        if (result.stderr && !errorMessage) errorMessage = result.stderr;
      }

      const allPassed = passedTests === problem.testCases.length;
      const status = allPassed ? 'accepted' :
                     errorMessage ? 'runtime_error' : 'wrong_answer';

      // Update submission
      await db.query(
        `UPDATE submissions SET status=$1, passed_tests=$2, execution_time=$3,
         error_message=$4, test_results=$5 WHERE id=$6`,
        [status, passedTests, totalTime, errorMessage || null, JSON.stringify(testResults), submission.id]
      );

      return res.json({
        success: true,
        data: {
          submissionId: submission.id,
          status,
          passedTests,
          totalTests: problem.testCases.length,
          executionTime: totalTime,
          testResults,
          message: allPassed ? '🎉 All test cases passed!' :
                   `${passedTests}/${problem.testCases.length} test cases passed`,
        },
      });
    } catch (err: any) {
      console.error('[coding] submit error:', err.message);
      return res.status(500).json({ success: false, error: 'Failed to execute code' });
    }
  },

  // List submissions
  async listSubmissions(req: Request, res: Response) {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { problemId } = req.query;
      const params: any[] = [userId];
      let query = `SELECT id, problem_id, problem_title, language, status,
                          passed_tests, total_tests, execution_time, created_at
                   FROM submissions WHERE user_id = $1`;
      if (problemId) { query += ' AND problem_id = $2'; params.push(problemId); }
      query += ' ORDER BY created_at DESC LIMIT 50';

      const { rows } = await db.query(query, params);
      return res.json({ success: true, data: rows });
    } catch {
      return res.status(500).json({ success: false, error: 'Failed to fetch submissions' });
    }
  },

  // Get single submission
  async getSubmission(req: Request, res: Response) {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { rows } = await db.query(
        'SELECT * FROM submissions WHERE id = $1 AND user_id = $2',
        [req.params.id, userId]
      );
      if (!rows[0]) return res.status(404).json({ success: false, error: 'Submission not found' });
      return res.json({ success: true, data: rows[0] });
    } catch {
      return res.status(500).json({ success: false, error: 'Failed to fetch submission' });
    }
  },
};
