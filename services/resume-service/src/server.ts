import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';
import { runMigrations } from './db/client';
import resumeRoutes from './routes/resume.routes';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static('/app/uploads'));

// Routes — gateway forwards /api/resumes, service handles /api/resumes and /resumes
app.use('/api/resumes', resumeRoutes);
app.use('/resumes', resumeRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'resume-service', timestamp: new Date().toISOString() });
});

app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

async function start() {
  try {
    await runMigrations();
    console.log('[resume] Migrations complete');
    app.listen(PORT, () => console.log(`[resume-service] Running on port ${PORT}`));
  } catch (err) {
    console.error('[resume] Failed to start:', err);
    process.exit(1);
  }
}

start();
