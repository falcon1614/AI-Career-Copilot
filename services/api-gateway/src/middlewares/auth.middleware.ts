import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_SECRET || 'dev_access_secret_change_in_prod';

export interface JWTPayload {
  userId: string;
  email: string;
  type: string;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Authorization header required' });
    }

    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, ACCESS_SECRET) as JWTPayload;

    if (payload.type !== 'access') {
      return res.status(401).json({ success: false, error: 'Invalid token type' });
    }

    // Forward user identity to downstream services via headers
    req.headers['x-user-id'] = payload.userId;
    req.headers['x-user-email'] = payload.email;
    next();
  } catch (err: any) {
    return res.status(401).json({
      success: false,
      error: err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token',
    });
  }
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const payload = jwt.verify(token, ACCESS_SECRET) as JWTPayload;
      req.headers['x-user-id'] = payload.userId;
      req.headers['x-user-email'] = payload.email;
    }
  } catch {
    // Optional — ignore invalid tokens
  }
  next();
}
