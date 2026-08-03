import { randomUUID } from 'node:crypto';
import bcrypt from 'bcrypt';
import { query, withTransaction } from '../config/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import { success } from '../utils/response.js';
import {
  hashToken,
  refreshTokenExpiryDate,
  signAccessToken,
  signRefreshToken,
  verifyToken
} from '../utils/security.js';

function publicUser(user) {
  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    createdAt: user.created_at
  };
}

async function issueTokens(connection, user, req) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  await connection.execute(
    `INSERT INTO refresh_tokens
     (id, user_id, token_hash, expires_at, ip_address, user_agent, created_at)
     VALUES (?, ?, ?, ?, ?, ?, NOW())`,
    [
      randomUUID(),
      user.id,
      hashToken(refreshToken),
      refreshTokenExpiryDate(),
      req.ip || null,
      String(req.headers['user-agent'] || '').slice(0, 255)
    ]
  );
  return { accessToken, refreshToken };
}

export const register = asyncHandler(async (req, res) => {
  const { fullName, email, phone = null, password } = req.body;
  if (!fullName || !email || !password) {
    throw new HttpError(400, 'fullName, email and password are required.', 'VALIDATION_ERROR');
  }
  if (String(password).length < 8) {
    throw new HttpError(400, 'Password must be at least 8 characters.', 'WEAK_PASSWORD');
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = await query('SELECT id FROM users WHERE email = ? LIMIT 1', [normalizedEmail]);
  if (existing.length) {
    throw new HttpError(409, 'An account with this email already exists.', 'EMAIL_EXISTS');
  }

  const result = await withTransaction(async (connection) => {
    const user = {
      id: randomUUID(),
      full_name: String(fullName).trim(),
      email: normalizedEmail,
      phone: phone ? String(phone).trim() : null,
      role: 'USER',
      status: 'ACTIVE'
    };
    const passwordHash = await bcrypt.hash(String(password), 12);
    await connection.execute(
      `INSERT INTO users
       (id, full_name, email, phone, password_hash, role, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'USER', 'ACTIVE', NOW(), NOW())`,
      [user.id, user.full_name, user.email, user.phone, passwordHash]
    );
    const tokens = await issueTokens(connection, user, req);
    return { user, tokens };
  });

  return success(
    res,
    { user: publicUser(result.user), ...result.tokens },
    'Registration successful.',
    201
  );
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new HttpError(400, 'email and password are required.', 'VALIDATION_ERROR');
  }

  const users = await query('SELECT * FROM users WHERE email = ? LIMIT 1', [
    String(email).trim().toLowerCase()
  ]);
  const user = users[0];
  if (!user || !(await bcrypt.compare(String(password), user.password_hash))) {
    throw new HttpError(401, 'Invalid email or password.', 'INVALID_CREDENTIALS');
  }
  if (user.status !== 'ACTIVE') {
    throw new HttpError(403, 'This account is not active.', 'ACCOUNT_INACTIVE');
  }

  const tokens = await withTransaction((connection) => issueTokens(connection, user, req));
  return success(res, { user: publicUser(user), ...tokens }, 'Login successful.');
});

export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    throw new HttpError(400, 'refreshToken is required.', 'VALIDATION_ERROR');
  }

  let payload;
  try {
    payload = verifyToken(refreshToken);
  } catch {
    throw new HttpError(401, 'Invalid or expired refresh token.', 'INVALID_REFRESH_TOKEN');
  }
  if (payload.type !== 'refresh') {
    throw new HttpError(401, 'Invalid refresh token.', 'INVALID_REFRESH_TOKEN');
  }

  const tokens = await query(
    `SELECT rt.id AS refresh_token_id, rt.revoked_at, rt.expires_at,
            u.id, u.full_name, u.email, u.phone, u.role, u.status, u.created_at
     FROM refresh_tokens rt
     JOIN users u ON u.id = rt.user_id
     WHERE rt.token_hash = ? AND rt.user_id = ? LIMIT 1`,
    [hashToken(refreshToken), payload.sub]
  );
  const record = tokens[0];
  if (!record || record.revoked_at || new Date(record.expires_at) <= new Date()) {
    throw new HttpError(401, 'Refresh token is no longer valid.', 'INVALID_REFRESH_TOKEN');
  }

  const accessToken = signAccessToken(record);
  return success(res, { accessToken }, 'Access token refreshed.');
});

export const logout = asyncHandler(async (req, res) => {
  const { refreshToken, allDevices = false } = req.body;
  if (!refreshToken) {
    throw new HttpError(400, 'refreshToken is required.', 'VALIDATION_ERROR');
  }

  let payload;
  try {
    payload = verifyToken(refreshToken);
  } catch {
    // An expired or malformed token is already unusable. Return an idempotent success response.
    return success(res, null, 'Logout successful.');
  }
  if (payload.type !== 'refresh') {
    throw new HttpError(400, 'A valid refresh token is required.', 'INVALID_REFRESH_TOKEN');
  }

  if (allDevices) {
    await query(
      'UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL',
      [payload.sub]
    );
  } else {
    await query(
      'UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = ? AND token_hash = ? AND revoked_at IS NULL',
      [payload.sub, hashToken(refreshToken)]
    );
  }
  return success(res, null, 'Logout successful.');
});

export const me = asyncHandler(async (req, res) => {
  return success(res, publicUser(req.user), 'Profile retrieved.');
});
