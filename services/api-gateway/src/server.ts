import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { requireAuth } from './middlewares/auth.middleware';

const app = express();
const PORT = process.env.PORT || 3000;

const AUTH_URL      = process.env.AUTH_SERVICE_URL      || 'http://auth-service:3001';
const RESUME_URL    = process.env.RESUME_SERVICE_URL    || 'http://resume-service:3002';
const INTERVIEW_URL = process.env.INTERVIEW_SERVICE_URL || 'http://interview-service:3003';
const CODING_URL    = process.env.CODING_SERVICE_URL    || 'http://coding-service:3004';
const GENAI_URL     = process.env.GENAI_SERVICE_URL     || 'http://genai-service:8001';
const ML_URL        = process.env.ML_SERVICE_URL        || 'http://ml-service:8002';

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'api-gateway', timestamp: new Date().toISOString() });
});

function makeProxy(target: string, pathRewrite?: Record<string, string>): ReturnType<typeof createProxyMiddleware> {
  const opts: Options = {
    target,
    changeOrigin: true,
    logLevel: 'warn',
    ...(pathRewrite && { pathRewrite }),
  };
  return createProxyMiddleware(opts);
}

// Auth — public
app.use('/api/auth', makeProxy(AUTH_URL));

// Resume — protected
app.use('/api/resumes', requireAuth as any, makeProxy(RESUME_URL));

// Interview — protected
app.use('/api/interviews', requireAuth as any, makeProxy(INTERVIEW_URL));

// Coding — protected
app.use('/api/coding', requireAuth as any, makeProxy(CODING_URL));

// GenAI — protected, strip /api/genai → /api
app.use('/api/genai', requireAuth as any, makeProxy(GENAI_URL, {
  '^/api/genai': '/api',
}));

// ML — protected, forward as-is (service has /api/ml routes)
app.use('/api/ml', requireAuth as any, makeProxy(ML_URL));

app.use(express.json());
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`[api-gateway] Running on port ${PORT}`);
});
