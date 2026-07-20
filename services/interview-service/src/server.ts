import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';
import { runMigrations } from './db/client';
import interviewRoutes from './routes/interview.routes';

const app = express();
const PORT = process.env.PORT || 3003;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/interviews', interviewRoutes);
app.use('/interviews', interviewRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'interview-service', timestamp: new Date().toISOString() });
});

app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

async function start() {
  try {
    await runMigrations();
    console.log('[interview] Migrations complete');
    app.listen(PORT, () => console.log(`[interview-service] Running on port ${PORT}`));
  } catch (err) {
    console.error('[interview] Failed to start:', err);
    process.exit(1);
  }
}

start();
