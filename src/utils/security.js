import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';

export function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET || 'development-only-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
}

export function signRefreshToken(user) {
  const days = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 7);
  return jwt.sign(
    { sub: user.id, type: 'refresh', nonce: crypto.randomUUID() },
    process.env.JWT_SECRET || 'development-only-secret',
    { expiresIn: `${days}d` }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET || 'development-only-secret');
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function refreshTokenExpiryDate() {
  const days = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 7);
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}
