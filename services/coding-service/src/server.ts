import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';
import { runMigrations } from './db/client';
import codingRoutes from './routes/coding.routes';

const app = express();
const PORT = process.env.PORT || 3004;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.use('/api/coding', codingRoutes);
app.use('/coding', codingRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'coding-service', timestamp: new Date().toISOString() });
});

app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

async function start() {
  try {
    await runMigrations();
    console.log('[coding] Migrations complete');
    app.listen(PORT, () => console.log(`[coding-service] Running on port ${PORT}`));
  } catch (err) {
    console.error('[coding] Failed to start:', err);
    process.exit(1);
  }
}

start();
