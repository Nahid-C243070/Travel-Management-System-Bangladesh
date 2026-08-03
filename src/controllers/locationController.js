import { query } from '../config/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success } from '../utils/response.js';

export const listDivisions = asyncHandler(async (_req, res) => {
  const rows = await query('SELECT id, name, bn_name AS bnName FROM divisions ORDER BY name');
  return success(res, rows, 'Divisions retrieved.');
});

export const listDistricts = asyncHandler(async (req, res) => {
  const params = [];
  let sql = `SELECT d.id, d.name, d.bn_name AS bnName,
                    d.division_id AS divisionId, v.name AS divisionName
             FROM districts d JOIN divisions v ON v.id = d.division_id`;
  if (req.query.divisionId) {
    sql += ' WHERE d.division_id = ?';
    params.push(req.query.divisionId);
  }
  sql += ' ORDER BY d.name';
  const rows = await query(sql, params);
  return success(res, rows, 'Districts retrieved.');
});
