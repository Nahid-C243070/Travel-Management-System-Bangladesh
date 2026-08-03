import { randomUUID } from 'node:crypto';
import { query } from '../config/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import { success } from '../utils/response.js';

export const listCategories = asyncHandler(async (_req, res) => {
  const rows = await query(
    'SELECT id, name, slug, description, icon FROM spot_categories ORDER BY name'
  );
  return success(res, rows, 'Spot categories retrieved.');
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, slug, description = null, icon = null } = req.body;
  if (!name || !slug) throw new HttpError(400, 'name and slug are required.', 'VALIDATION_ERROR');
  const category = { id: randomUUID(), name, slug, description, icon };
  await query(
    `INSERT INTO spot_categories (id, name, slug, description, icon, created_at)
     VALUES (?, ?, ?, ?, ?, NOW())`,
    [category.id, category.name, category.slug, category.description, category.icon]
  );
  return success(res, category, 'Category created.', 201);
});
