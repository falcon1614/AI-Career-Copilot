import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { db } from '../db/client';
import { parseFile } from '../services/parser.service';
import { calculateATS } from '../services/ats.service';

export const resumeController = {

  async upload(req: Request, res: Response) {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
      if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });

      const { originalname, mimetype, size, path: filePath } = req.file;

      // Parse the file
      const parsed = await parseFile(filePath, mimetype);

      // Calculate ATS score
      const ats = calculateATS(parsed.rawText, parsed.sections as any);

      // Store in DB
      const { rows } = await db.query(
        `INSERT INTO resumes
           (user_id, file_name, file_url, file_size, mime_type,
            parsed_text, parsed_sections, ats_score, ats_details, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'analyzed')
         RETURNING id, user_id, file_name, file_size, ats_score, created_at`,
        [
          userId, originalname,
          `/uploads/${path.basename(filePath)}`,
          size, mimetype,
          parsed.rawText,
          JSON.stringify(parsed.sections),
          ats.score,
          JSON.stringify(ats),
        ]
      );

      return res.status(201).json({
        success: true,
        data: {
          resume: rows[0],
          ats: {
            score: ats.score,
            breakdown: ats.breakdown,
            suggestions: ats.suggestions,
            missingKeywords: ats.missingKeywords,
          },
          parsing: {
            wordCount: parsed.wordCount,
            sectionsFound: Object.keys(parsed.sections).filter(
              k => parsed.sections[k as keyof typeof parsed.sections]
            ),
          },
        },
      });
    } catch (err: any) {
      console.error('[resume] Upload error:', err.message);
      if (err.message === 'UNSUPPORTED_FILE_TYPE') {
        return res.status(400).json({ success: false, error: 'Only PDF and DOCX files are supported' });
      }
      return res.status(500).json({ success: false, error: 'Failed to process resume' });
    }
  },

  async list(req: Request, res: Response) {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { rows } = await db.query(
        `SELECT id, file_name, file_size, ats_score, status, created_at
         FROM resumes WHERE user_id = $1 ORDER BY created_at DESC`,
        [userId]
      );
      return res.json({ success: true, data: rows });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Failed to fetch resumes' });
    }
  },

  async getOne(req: Request, res: Response) {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { id } = req.params;
      const { rows } = await db.query(
        `SELECT id, file_name, file_size, mime_type, parsed_sections,
                ats_score, ats_details, status, created_at
         FROM resumes WHERE id = $1 AND user_id = $2`,
        [id, userId]
      );
      if (rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Resume not found' });
      }
      return res.json({ success: true, data: rows[0] });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Failed to fetch resume' });
    }
  },

  async deleteOne(req: Request, res: Response) {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { id } = req.params;
      const { rows } = await db.query(
        `DELETE FROM resumes WHERE id = $1 AND user_id = $2 RETURNING id, file_url`,
        [id, userId]
      );
      if (rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Resume not found' });
      }
      // Delete file from disk
      const filePath = path.join('/app/uploads', path.basename(rows[0].file_url || ''));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

      return res.json({ success: true, message: 'Resume deleted' });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Failed to delete resume' });
    }
  },

  async reanalyze(req: Request, res: Response) {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { id } = req.params;
      const { rows } = await db.query(
        `SELECT * FROM resumes WHERE id = $1 AND user_id = $2`, [id, userId]
      );
      if (rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Resume not found' });
      }
      const resume = rows[0];
      const ats = calculateATS(resume.parsed_text, resume.parsed_sections);
      await db.query(
        `UPDATE resumes SET ats_score = $1, ats_details = $2 WHERE id = $3`,
        [ats.score, JSON.stringify(ats), id]
      );
      return res.json({ success: true, data: ats });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Failed to analyze resume' });
    }
  },
};
