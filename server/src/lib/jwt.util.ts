import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import crypto from 'crypto';

// Generates a JWT access token with the given payload and expiration time
export const generateAccessToken = (payload: { id: string }) => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

// Generates a secure random refresh token
export const generateRefreshToken = (): string => {
  return crypto.randomBytes(32).toString('base64url');
};

// Hashes the provided refresh token using SHA-256
export const hashRefreshToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
