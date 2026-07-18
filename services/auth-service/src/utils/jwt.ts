import jwt, { SignOptions } from 'jsonwebtoken';
import redis from '../db/redis';

const ACCESS_SECRET = process.env.JWT_SECRET || 'dev_access_secret_change_in_prod';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change_in_prod';

export interface TokenPayload {
  userId: string;
  email: string;
  type: 'access' | 'refresh';
}

export function generateAccessToken(userId: string, email: string): string {
  const options: SignOptions = { expiresIn: 900 }; // 15 minutes in seconds
  return jwt.sign({ userId, email, type: 'access' }, ACCESS_SECRET, options);
}

export function generateRefreshToken(userId: string, email: string): string {
  const options: SignOptions = { expiresIn: 604800 }; // 7 days in seconds
  return jwt.sign({ userId, email, type: 'refresh' }, REFRESH_SECRET, options);
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
}

export async function storeRefreshToken(userId: string, token: string): Promise<void> {
  await redis.setex(`refresh:${userId}`, 604800, token);
}

export async function blacklistToken(token: string): Promise<void> {
  const decoded = jwt.decode(token) as any;
  if (!decoded?.exp) return;
  const ttl = decoded.exp - Math.floor(Date.now() / 1000);
  if (ttl > 0) await redis.setex(`blacklist:${token}`, ttl, '1');
}

export async function isBlacklisted(token: string): Promise<boolean> {
  const result = await redis.get(`blacklist:${token}`);
  return result === '1';
}

export async function deleteRefreshToken(userId: string): Promise<void> {
  await redis.del(`refresh:${userId}`);
}
