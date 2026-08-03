import { randomUUID } from 'node:crypto';
import { query, withTransaction } from '../config/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { haversineDistanceKm, round } from '../utils/geo.js';
import { HttpError } from '../utils/httpError.js';
import { success } from '../utils/response.js';

function normalizeSpot(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    shortDescription: row.short_description,
    description: row.description,
    districtId: row.district_id,
    districtName: row.district_name,
    divisionName: row.division_name,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    entryFee: Number(row.entry_fee),
    averageVisitMinutes: Number(row.average_visit_minutes),
    bestSeason: row.best_season,
    openingTime: row.opening_time,
    closingTime: row.closing_time,
    ratingAverage: Number(row.rating_average),
    ratingCount: Number(row.rating_count),
    isNew: Boolean(row.is_new),
    isFeatured: Boolean(row.is_featured),
    status: row.status,
    coverImage: row.cover_image,
    categories: row.categories ? String(row.categories).split(',').filter(Boolean) : [],
    distanceKm: row.distanceKm
  };
}

const baseSpotSql = `
  SELECT s.*, d.name AS district_name, v.name AS division_name,
         (SELECT si.image_url FROM spot_images si
          WHERE si.spot_id = s.id ORDER BY si.is_cover DESC, si.display_order ASC LIMIT 1) AS cover_image,
         GROUP_CONCAT(DISTINCT c.name ORDER BY c.name SEPARATOR ',') AS categories
  FROM tourist_spots s
  JOIN districts d ON d.id = s.district_id
  JOIN divisions v ON v.id = d.division_id
  LEFT JOIN tourist_spot_categories sc ON sc.spot_id = s.id
  LEFT JOIN spot_categories c ON c.id = sc.category_id
`;

export const listSpots = asyncHandler(async (req, res) => {
  const { search, districtId, category, isNew, featured, minRating, lat, lng, radiusKm } = req.query;
  const where = ["s.status = 'ACTIVE'"];
  const params = [];

  if (search) {
    where.push('(s.name LIKE ? OR s.short_description LIKE ? OR s.description LIKE ?)');
    const term = `%${String(search).trim()}%`;
    params.push(term, term, term);
  }
  if (districtId) {
    where.push('s.district_id = ?');
    params.push(districtId);
  }
  if (category) {
    where.push('c.slug = ?');
    params.push(category);
  }
  if (isNew !== undefined) {
    where.push('s.is_new = ?');
    params.push(String(isNew) === 'true' ? 1 : 0);
  }
  if (featured !== undefined) {
    where.push('s.is_featured = ?');
    params.push(String(featured) === 'true' ? 1 : 0);
  }
  if (minRating) {
    where.push('s.rating_average >= ?');
    params.push(Number(minRating));
  }

  const rows = await query(
    `${baseSpotSql} WHERE ${where.join(' AND ')} GROUP BY s.id ORDER BY s.is_featured DESC, s.rating_average DESC, s.name`,
    params
  );
  let spots = rows.map(normalizeSpot);

  if (lat !== undefined && lng !== undefined) {
    spots = spots
      .map((spot) => ({
        ...spot,
        distanceKm: round(haversineDistanceKm(lat, lng, spot.latitude, spot.longitude))
      }))
      .filter((spot) => !radiusKm || spot.distanceKm <= Number(radiusKm))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }

  return success(res, spots, 'Tourist spots retrieved.', 200, { count: spots.length });
});

export const getSpot = asyncHandler(async (req, res) => {
  const rows = await query(`${baseSpotSql} WHERE s.id = ? GROUP BY s.id LIMIT 1`, [req.params.id]);
  if (!rows.length) throw new HttpError(404, 'Tourist spot not found.', 'SPOT_NOT_FOUND');
  const images = await query(
    'SELECT id, image_url AS imageUrl, alt_text AS altText, is_cover AS isCover, display_order AS displayOrder FROM spot_images WHERE spot_id = ? ORDER BY is_cover DESC, display_order',
    [req.params.id]
  );
  const spot = normalizeSpot(rows[0]);
  spot.images = images;
  return success(res, spot, 'Tourist spot retrieved.');
});

export const createSpot = asyncHandler(async (req, res) => {
  const {
    name,
    slug,
    shortDescription,
    description,
    districtId,
    latitude,
    longitude,
    entryFee = 0,
    averageVisitMinutes = 120,
    bestSeason = null,
    openingTime = null,
    closingTime = null,
    isNew = false,
    isFeatured = false,
    categoryIds = [],
    images = []
  } = req.body;
  if (!name || !slug || !description || !districtId || latitude === undefined || longitude === undefined) {
    throw new HttpError(400, 'name, slug, description, districtId, latitude and longitude are required.', 'VALIDATION_ERROR');
  }

  const id = randomUUID();
  await withTransaction(async (connection) => {
    await connection.execute(
      `INSERT INTO tourist_spots
       (id, name, slug, short_description, description, district_id, latitude, longitude,
        entry_fee, average_visit_minutes, best_season, opening_time, closing_time,
        is_new, is_featured, status, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, NOW(), NOW())`,
      [
        id, name, slug, shortDescription || null, description, districtId, latitude, longitude,
        entryFee, averageVisitMinutes, bestSeason, openingTime, closingTime,
        Boolean(isNew), Boolean(isFeatured), req.user.id
      ]
    );
    for (const categoryId of categoryIds) {
      await connection.execute(
        'INSERT INTO tourist_spot_categories (spot_id, category_id) VALUES (?, ?)',
        [id, categoryId]
      );
    }
    for (const [index, image] of images.entries()) {
      await connection.execute(
        `INSERT INTO spot_images
         (id, spot_id, image_url, alt_text, is_cover, display_order, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [randomUUID(), id, image.imageUrl, image.altText || name, index === 0, index]
      );
    }
  });

  return success(res, { id }, 'Tourist spot created.', 201);
});

export const updateSpot = asyncHandler(async (req, res) => {
  const allowed = {
    name: 'name', slug: 'slug', shortDescription: 'short_description', description: 'description',
    districtId: 'district_id', latitude: 'latitude', longitude: 'longitude', entryFee: 'entry_fee',
    averageVisitMinutes: 'average_visit_minutes', bestSeason: 'best_season', openingTime: 'opening_time',
    closingTime: 'closing_time', isNew: 'is_new', isFeatured: 'is_featured', status: 'status'
  };
  const sets = [];
  const params = [];
  for (const [bodyKey, column] of Object.entries(allowed)) {
    if (Object.hasOwn(req.body, bodyKey)) {
      sets.push(`${column} = ?`);
      params.push(req.body[bodyKey]);
    }
  }
  if (!sets.length) throw new HttpError(400, 'No supported fields were provided.', 'VALIDATION_ERROR');
  sets.push('updated_at = NOW()');
  params.push(req.params.id);
  const result = await query(`UPDATE tourist_spots SET ${sets.join(', ')} WHERE id = ?`, params);
  if (!result.affectedRows) throw new HttpError(404, 'Tourist spot not found.', 'SPOT_NOT_FOUND');
  return success(res, { id: req.params.id }, 'Tourist spot updated.');
});

export const deleteSpot = asyncHandler(async (req, res) => {
  const result = await query(
    "UPDATE tourist_spots SET status = 'ARCHIVED', updated_at = NOW() WHERE id = ?",
    [req.params.id]
  );
  if (!result.affectedRows) throw new HttpError(404, 'Tourist spot not found.', 'SPOT_NOT_FOUND');
  return success(res, null, 'Tourist spot archived.');
});

export const rateSpot = asyncHandler(async (req, res) => {
  const { rating, review = null } = req.body;
  const numeric = Number(rating);
  if (!Number.isInteger(numeric) || numeric < 1 || numeric > 5) {
    throw new HttpError(400, 'rating must be an integer from 1 to 5.', 'VALIDATION_ERROR');
  }

  await withTransaction(async (connection) => {
    const [spots] = await connection.execute('SELECT id FROM tourist_spots WHERE id = ? LIMIT 1', [
      req.params.id
    ]);
    if (!spots.length) throw new HttpError(404, 'Tourist spot not found.', 'SPOT_NOT_FOUND');
    await connection.execute(
      `INSERT INTO spot_ratings (id, spot_id, user_id, rating, review, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE rating = VALUES(rating), review = VALUES(review), updated_at = NOW()`,
      [randomUUID(), req.params.id, req.user.id, numeric, review]
    );
    await connection.execute(
      `UPDATE tourist_spots s
       SET s.rating_average = (SELECT COALESCE(AVG(r.rating), 0) FROM spot_ratings r WHERE r.spot_id = s.id),
           s.rating_count = (SELECT COUNT(*) FROM spot_ratings r WHERE r.spot_id = s.id),
           s.updated_at = NOW()
       WHERE s.id = ?`,
      [req.params.id]
    );
  });

  return success(res, null, 'Rating saved.');
});
