import bcrypt from 'bcryptjs';
import { db } from '../db/client';
import {
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
  verifyRefreshToken,
  blacklistToken,
  deleteRefreshToken,
  isBlacklisted,
} from '../utils/jwt';

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export const authService = {

  async register(input: RegisterInput) {
    const { email, password, fullName } = input;

    // Check existing user
    const existing = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    if (existing.rows.length > 0) {
      throw new Error('EMAIL_EXISTS');
    }

    // Hash password (12 rounds = secure but not too slow)
    const passwordHash = await bcrypt.hash(password, 12);

    // Insert user
    const { rows } = await db.query(
      `INSERT INTO users (email, password_hash, full_name)
       VALUES ($1, $2, $3)
       RETURNING id, email, full_name, created_at`,
      [email.toLowerCase(), passwordHash, fullName]
    );

    const user = rows[0];

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id, user.email);
    await storeRefreshToken(user.id, refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        createdAt: user.created_at,
      },
      accessToken,
      refreshToken,
    };
  },

  async login(input: LoginInput) {
    const { email, password } = input;

    // Find user
    const { rows } = await db.query(
      `SELECT id, email, password_hash, full_name, is_active
       FROM users WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (rows.length === 0) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const user = rows[0];

    if (!user.is_active) {
      throw new Error('ACCOUNT_DISABLED');
    }

    if (!user.password_hash) {
      // OAuth user trying to login with password
      throw new Error('USE_OAUTH');
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id, user.email);
    await storeRefreshToken(user.id, refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
      },
      accessToken,
      refreshToken,
    };
  },

  async refresh(refreshToken: string) {
    // Verify the token is valid
    const payload = verifyRefreshToken(refreshToken);

    // Check if blacklisted
    if (await isBlacklisted(refreshToken)) {
      throw new Error('TOKEN_REVOKED');
    }

    // Issue new tokens
    const newAccessToken = generateAccessToken(payload.userId, payload.email);
    const newRefreshToken = generateRefreshToken(payload.userId, payload.email);

    // Rotate: blacklist old, store new
    await blacklistToken(refreshToken);
    await storeRefreshToken(payload.userId, newRefreshToken);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  },

  async logout(refreshToken: string, accessToken: string) {
    const payload = verifyRefreshToken(refreshToken);
    await Promise.all([
      blacklistToken(refreshToken),
      blacklistToken(accessToken),
      deleteRefreshToken(payload.userId),
    ]);
  },

  async getMe(userId: string) {
    const { rows } = await db.query(
      `SELECT id, email, full_name, avatar_url, is_verified, created_at
       FROM users WHERE id = $1`,
      [userId]
    );
    if (rows.length === 0) throw new Error('USER_NOT_FOUND');
    const u = rows[0];
    return {
      id: u.id,
      email: u.email,
      fullName: u.full_name,
      avatarUrl: u.avatar_url,
      isVerified: u.is_verified,
      createdAt: u.created_at,
    };
  },
};
