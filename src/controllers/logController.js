import { query } from '../config/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success } from '../utils/response.js';

export const listLogs = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit || 50), 1), 200);
  const offset = (page - 1) * limit;
  const where = [];
  const params = [];

  if (req.query.action) {
    where.push('l.action = ?');
    params.push(req.query.action);
  }
  if (req.query.userId) {
    where.push('l.user_id = ?');
    params.push(req.query.userId);
  }
  if (req.query.statusCode) {
    where.push('l.status_code = ?');
    params.push(Number(req.query.statusCode));
  }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const [countRow] = await query(`SELECT COUNT(*) AS total FROM activity_logs l ${clause}`, params);
  const rows = await query(
    `SELECT l.id, l.user_id AS userId, u.full_name AS userName, l.action,
            l.entity_type AS entityType, l.entity_id AS entityId, l.method, l.endpoint,
            l.status_code AS statusCode, l.ip_address AS ipAddress, l.user_agent AS userAgent,
            l.details, l.created_at AS createdAt
     FROM activity_logs l
     LEFT JOIN users u ON u.id = l.user_id
     ${clause}
     ORDER BY l.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  return success(res, rows, 'Activity logs retrieved.', 200, {
    page,
    limit,
    total: Number(countRow.total),
    totalPages: Math.ceil(Number(countRow.total) / limit)
  });
});
