import { Request, Response } from 'express';
import { authService } from '../services/auth.service';

function errorResponse(res: Response, error: unknown) {
  const msg = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
  const map: Record<string, [number, string]> = {
    EMAIL_EXISTS:        [409, 'Email already registered'],
    INVALID_CREDENTIALS: [401, 'Invalid email or password'],
    ACCOUNT_DISABLED:    [403, 'Account has been disabled'],
    USE_OAUTH:           [400, 'Please sign in with Google'],
    TOKEN_REVOKED:       [401, 'Token has been revoked'],
    USER_NOT_FOUND:      [404, 'User not found'],
    JsonWebTokenError:   [401, 'Invalid token'],
    TokenExpiredError:   [401, 'Token expired'],
  };
  const [status, message] = map[msg] || [500, 'Internal server error'];
  return res.status(status).json({ success: false, error: message });
}

export const authController = {

  async register(req: Request, res: Response) {
    try {
      const { email, password, fullName } = req.body;

      if (!email || !password || !fullName) {
        return res.status(400).json({
          success: false,
          error: 'email, password, and fullName are required',
        });
      }
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 8 characters',
        });
      }

      const result = await authService.register({ email, password, fullName });
      return res.status(201).json({ success: true, data: result });
    } catch (err) {
      return errorResponse(res, err);
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'email and password are required',
        });
      }
      const result = await authService.login({ email, password });
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      return errorResponse(res, err);
    }
  },

  async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: 'refreshToken is required',
        });
      }
      const result = await authService.refresh(refreshToken);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      return errorResponse(res, err);
    }
  },

  async logout(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      const accessToken = req.headers.authorization?.split(' ')[1] || '';
      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: 'refreshToken is required',
        });
      }
      await authService.logout(refreshToken, accessToken);
      return res.status(200).json({ success: true, message: 'Logged out' });
    } catch (err) {
      return errorResponse(res, err);
    }
  },

  async me(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const user = await authService.getMe(userId);
      return res.status(200).json({ success: true, data: user });
    } catch (err) {
      return errorResponse(res, err);
    }
  },
};
