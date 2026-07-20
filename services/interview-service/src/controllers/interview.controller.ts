import { Request, Response } from 'express';
import { db } from '../db/client';
import { generateQuestions, generateAnswerFeedback } from '../services/genai.service';

export const interviewController = {

  // Create a new interview session + generate questions
  async createSession(req: Request, res: Response) {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

      const { jobRole, questionType = 'mixed', difficulty = 'medium', resumeText = '', count = 10 } = req.body;
      if (!jobRole) return res.status(400).json({ success: false, error: 'jobRole is required' });

      // Create session
      const { rows: [session] } = await db.query(
        `INSERT INTO interview_sessions
           (user_id, job_role, question_type, difficulty, resume_text, total_questions)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [userId, jobRole, questionType, difficulty, resumeText, Math.min(count, 20)]
      );

      // Generate questions (AI or fallback)
      const questions = await generateQuestions(
        resumeText || `Candidate applying for ${jobRole}`,
        jobRole, questionType,
        Math.min(count, 20)
      );

      // Store questions in DB
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        await db.query(
          `INSERT INTO interview_questions
             (session_id, question_text, question_type, difficulty, topic, hint, follow_up, order_index)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [session.id, q.question, q.type || questionType, q.difficulty || difficulty,
           q.topic || '', q.hint || '', q.followUp || '', i]
        );
      }

      // Fetch created questions
      const { rows: createdQuestions } = await db.query(
        `SELECT * FROM interview_questions WHERE session_id = $1 ORDER BY order_index`,
        [session.id]
      );

      return res.status(201).json({
        success: true,
        data: { session, questions: createdQuestions },
      });
    } catch (err: any) {
      console.error('[interview] createSession error:', err.message);
      return res.status(500).json({ success: false, error: 'Failed to create session' });
    }
  },

  // List user's sessions
  async listSessions(req: Request, res: Response) {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { rows } = await db.query(
        `SELECT id, job_role, question_type, difficulty, status, score,
                total_questions, answered_questions, created_at
         FROM interview_sessions
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [userId]
      );
      return res.json({ success: true, data: rows });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Failed to fetch sessions' });
    }
  },

  // Get single session with all questions
  async getSession(req: Request, res: Response) {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { id } = req.params;

      const { rows: [session] } = await db.query(
        `SELECT * FROM interview_sessions WHERE id = $1 AND user_id = $2`,
        [id, userId]
      );
      if (!session) return res.status(404).json({ success: false, error: 'Session not found' });

      const { rows: questions } = await db.query(
        `SELECT * FROM interview_questions WHERE session_id = $1 ORDER BY order_index`,
        [id]
      );

      return res.json({ success: true, data: { session, questions } });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Failed to fetch session' });
    }
  },

  // Submit answer for a question
  async submitAnswer(req: Request, res: Response) {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { id } = req.params;
      const { questionId, answer } = req.body;

      if (!questionId || !answer) {
        return res.status(400).json({ success: false, error: 'questionId and answer required' });
      }

      // Verify session belongs to user
      const { rows: [session] } = await db.query(
        `SELECT * FROM interview_sessions WHERE id = $1 AND user_id = $2`,
        [id, userId]
      );
      if (!session) return res.status(404).json({ success: false, error: 'Session not found' });

      // Get the question
      const { rows: [question] } = await db.query(
        `SELECT * FROM interview_questions WHERE id = $1 AND session_id = $2`,
        [questionId, id]
      );
      if (!question) return res.status(404).json({ success: false, error: 'Question not found' });

      // Get AI feedback
      const { feedback, score } = await generateAnswerFeedback(
        question.question_text, answer, session.job_role
      );

      // Update question with answer + feedback
      await db.query(
        `UPDATE interview_questions
         SET user_answer = $1, ai_feedback = $2, score = $3, answered_at = NOW()
         WHERE id = $4`,
        [answer, feedback, score, questionId]
      );

      // Update session progress
      await db.query(
        `UPDATE interview_sessions
         SET answered_questions = (
           SELECT COUNT(*) FROM interview_questions
           WHERE session_id = $1 AND user_answer IS NOT NULL
         )
         WHERE id = $1`,
        [id]
      );

      return res.json({
        success: true,
        data: { feedback, score, questionId },
      });
    } catch (err: any) {
      console.error('[interview] submitAnswer error:', err.message);
      return res.status(500).json({ success: false, error: 'Failed to submit answer' });
    }
  },

  // Complete session + calculate final score
  async completeSession(req: Request, res: Response) {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { id } = req.params;

      const { rows: [session] } = await db.query(
        `SELECT * FROM interview_sessions WHERE id = $1 AND user_id = $2`,
        [id, userId]
      );
      if (!session) return res.status(404).json({ success: false, error: 'Session not found' });

      // Calculate average score from answered questions
      const { rows: [scoreResult] } = await db.query(
        `SELECT ROUND(AVG(score)) as avg_score, COUNT(*) as answered
         FROM interview_questions
         WHERE session_id = $1 AND score IS NOT NULL`,
        [id]
      );

      const finalScore = scoreResult.avg_score || 0;

      await db.query(
        `UPDATE interview_sessions
         SET status = 'completed', score = $1,
             answered_questions = $2
         WHERE id = $3`,
        [finalScore, scoreResult.answered, id]
      );

      return res.json({
        success: true,
        data: { sessionId: id, finalScore, answeredQuestions: scoreResult.answered },
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Failed to complete session' });
    }
  },

  // Delete session
  async deleteSession(req: Request, res: Response) {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { id } = req.params;

      const { rows } = await db.query(
        `DELETE FROM interview_sessions WHERE id = $1 AND user_id = $2 RETURNING id`,
        [id, userId]
      );
      if (rows.length === 0) return res.status(404).json({ success: false, error: 'Session not found' });

      return res.json({ success: true, message: 'Session deleted' });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Failed to delete session' });
    }
  },
};
