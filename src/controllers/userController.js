import { query } from '../config/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import { success } from '../utils/response.js';

export const listUsers = asyncHandler(async (req, res) => {
  const where = [];
  const params = [];
  if (req.query.role) {
    where.push('u.role = ?');
    params.push(String(req.query.role).toUpperCase());
  }
  if (req.query.status) {
    where.push('u.status = ?');
    params.push(String(req.query.status).toUpperCase());
  }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const rows = await query(
    `SELECT u.id, u.full_name AS fullName, u.email, u.phone, u.role, u.status,
            u.created_at AS createdAt, COUNT(DISTINCT t.id) AS tripCount
     FROM users u
     LEFT JOIN trip_plans t ON t.user_id = u.id
     ${clause}
     GROUP BY u.id
     ORDER BY u.created_at DESC`,
    params
  );
  return success(res, rows, 'Users retrieved.');
});

export const updateUser = asyncHandler(async (req, res) => {
  const role = req.body.role ? String(req.body.role).toUpperCase() : null;
  const status = req.body.status ? String(req.body.status).toUpperCase() : null;
  if (role && !['ADMIN', 'USER', 'GUIDE'].includes(role)) {
    throw new HttpError(400, 'Invalid role.', 'VALIDATION_ERROR');
  }
  if (status && !['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(status)) {
    throw new HttpError(400, 'Invalid status.', 'VALIDATION_ERROR');
  }
  if (!role && !status) throw new HttpError(400, 'role or status is required.', 'VALIDATION_ERROR');

  const sets = [];
  const params = [];
  if (role) {
    sets.push('role = ?');
    params.push(role);
  }
  if (status) {
    sets.push('status = ?');
    params.push(status);
  }
  sets.push('updated_at = NOW()');
  params.push(req.params.id);

  const result = await query(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`, params);
  if (!result.affectedRows) throw new HttpError(404, 'User not found.', 'USER_NOT_FOUND');
  return success(res, null, 'User updated.');
});
