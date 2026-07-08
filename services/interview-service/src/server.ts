// services/api-gateway/src/server.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check — this is what docker-compose healthchecks (if any)
// and your future k8s liveness probes will hit
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'interview-service',
    timestamp: new Date().toISOString(),
  });
});

// Phase 0 placeholder — will be replaced with real proxy routes in Phase 1
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'AI Career Copilot — API Gateway' });
});

// Catch-all for Phase 0
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not implemented yet' });
});

app.listen(PORT, () => {
  console.log(`[api-gateway] Running on port ${PORT}`);
});

export default app;
