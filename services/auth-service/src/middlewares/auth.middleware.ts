import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, isBlacklisted } from '../utils/jwt';

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authorization header required',
      });
    }

    const token = authHeader.split(' ')[1];

    if (await isBlacklisted(token)) {
      return res.status(401).json({ success: false, error: 'Token revoked' });
    }

    const payload = verifyAccessToken(token);
    (req as any).user = payload;
    next();
  } catch (err: any) {
    return res.status(401).json({
      success: false,
      error: err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token',
    });
  }
}
