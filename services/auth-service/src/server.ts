import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';
import { runMigrations } from './db/client';
import authRoutes from './routes/auth.routes';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Direct access: POST /auth/register
app.use('/auth', authRoutes);

// Via gateway: POST /api/auth/register (gateway forwards full path)
app.use('/api/auth', authRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'auth-service', timestamp: new Date().toISOString() });
});

app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

async function start() {
  try {
    await runMigrations();
    console.log('[auth] Migrations complete');
    app.listen(PORT, () => console.log(`[auth-service] Running on port ${PORT}`));
  } catch (err) {
    console.error('[auth] Failed to start:', err);
    process.exit(1);
  }
}

start();
