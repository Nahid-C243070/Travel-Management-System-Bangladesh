import { query } from '../config/database.js';
import { HttpError } from '../utils/httpError.js';
import { verifyToken } from '../utils/security.js';

export async function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new HttpError(401, 'Authentication token is required.', 'AUTH_REQUIRED');
    }

    const payload = verifyToken(token);
    const users = await query(
      'SELECT id, full_name, email, phone, role, status FROM users WHERE id = ? LIMIT 1',
      [payload.sub]
    );
    const user = users[0];
    if (!user || user.status !== 'ACTIVE') {
      throw new HttpError(401, 'User account is unavailable.', 'INVALID_ACCOUNT');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new HttpError(401, 'Invalid or expired authentication token.', 'INVALID_TOKEN'));
    }
    next(error);
  }
}

export function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new HttpError(403, 'You do not have permission for this action.', 'FORBIDDEN'));
    }
    next();
  };
}
