import { randomUUID } from 'node:crypto';
import { query } from '../config/database.js';

export function requestLogger(req, res, next) {
  const startedAt = Date.now();
  res.on('finish', () => {
    if (String(process.env.ENABLE_API_LOGS).toLowerCase() !== 'true') return;
    const durationMs = Date.now() - startedAt;
    query(
      `INSERT INTO activity_logs
       (id, user_id, action, entity_type, entity_id, method, endpoint, status_code, ip_address, user_agent, details, created_at)
       VALUES (?, ?, 'API_REQUEST', 'HTTP', NULL, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        randomUUID(),
        req.user?.id || null,
        req.method,
        req.originalUrl.slice(0, 255),
        res.statusCode,
        req.ip || null,
        String(req.headers['user-agent'] || '').slice(0, 255),
        JSON.stringify({ durationMs })
      ]
    ).catch(() => {});
  });
  next();
}
