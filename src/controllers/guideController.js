import { randomUUID } from 'node:crypto';
import { query } from '../config/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import { success } from '../utils/response.js';

export const listGuides = asyncHandler(async (req, res) => {
  const where = ["g.status = 'ACTIVE'"];
  const params = [];
  if (req.query.districtId) {
    where.push('g.district_id = ?');
    params.push(req.query.districtId);
  }
  if (req.query.language) {
    where.push('g.languages LIKE ?');
    params.push(`%${req.query.language}%`);
  }
  if (req.query.maxDailyRate) {
    where.push('g.daily_rate <= ?');
    params.push(Number(req.query.maxDailyRate));
  }
  const rows = await query(
    `SELECT g.id, g.full_name AS fullName, g.phone, g.email, g.bio, g.languages,
            g.experience_years AS experienceYears, g.daily_rate AS dailyRate,
            g.rating_average AS ratingAverage, g.rating_count AS ratingCount,
            g.license_number AS licenseNumber, g.photo_url AS photoUrl,
            g.district_id AS districtId, d.name AS districtName
     FROM travel_guides g
     JOIN districts d ON d.id = g.district_id
     WHERE ${where.join(' AND ')}
     ORDER BY g.rating_average DESC, g.experience_years DESC`,
    params
  );
  return success(res, rows, 'Travel guides retrieved.');
});

export const createGuide = asyncHandler(async (req, res) => {
  const {
    fullName,
    phone,
    email = null,
    bio = null,
    languages = ['Bangla'],
    experienceYears = 0,
    dailyRate,
    licenseNumber = null,
    photoUrl = null,
    districtId
  } = req.body;
  if (!fullName || !phone || dailyRate === undefined || !districtId) {
    throw new HttpError(400, 'fullName, phone, dailyRate and districtId are required.', 'VALIDATION_ERROR');
  }
  const guide = {
    id: randomUUID(),
    fullName,
    phone,
    email,
    bio,
    languages: Array.isArray(languages) ? languages.join(', ') : String(languages),
    experienceYears,
    dailyRate,
    licenseNumber,
    photoUrl,
    districtId
  };
  await query(
    `INSERT INTO travel_guides
     (id, full_name, phone, email, bio, languages, experience_years, daily_rate,
      rating_average, rating_count, license_number, photo_url, district_id, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?, 'ACTIVE', NOW(), NOW())`,
    [
      guide.id,
      guide.fullName,
      guide.phone,
      guide.email,
      guide.bio,
      guide.languages,
      guide.experienceYears,
      guide.dailyRate,
      guide.licenseNumber,
      guide.photoUrl,
      guide.districtId
    ]
  );
  return success(res, guide, 'Travel guide created.', 201);
});

export const updateGuide = asyncHandler(async (req, res) => {
  const allowed = {
    fullName: 'full_name', phone: 'phone', email: 'email', bio: 'bio', languages: 'languages',
    experienceYears: 'experience_years', dailyRate: 'daily_rate', licenseNumber: 'license_number',
    photoUrl: 'photo_url', districtId: 'district_id', status: 'status'
  };
  const sets = [];
  const params = [];
  for (const [key, column] of Object.entries(allowed)) {
    if (Object.hasOwn(req.body, key)) {
      sets.push(`${column} = ?`);
      params.push(Array.isArray(req.body[key]) ? req.body[key].join(', ') : req.body[key]);
    }
  }
  if (!sets.length) throw new HttpError(400, 'No supported fields were provided.', 'VALIDATION_ERROR');
  sets.push('updated_at = NOW()');
  params.push(req.params.id);
  const result = await query(`UPDATE travel_guides SET ${sets.join(', ')} WHERE id = ?`, params);
  if (!result.affectedRows) throw new HttpError(404, 'Travel guide not found.', 'GUIDE_NOT_FOUND');
  return success(res, null, 'Travel guide updated.');
});

export const deleteGuide = asyncHandler(async (req, res) => {
  const result = await query(
    "UPDATE travel_guides SET status = 'INACTIVE', updated_at = NOW() WHERE id = ?",
    [req.params.id]
  );
  if (!result.affectedRows) throw new HttpError(404, 'Travel guide not found.', 'GUIDE_NOT_FOUND');
  return success(res, null, 'Travel guide deactivated.');
});

export const bookGuide = asyncHandler(async (req, res) => {
  const { guideId, tripPlanId = null, bookingDate, days = 1, notes = null } = req.body;
  if (!guideId || !bookingDate || Number(days) < 1) {
    throw new HttpError(400, 'guideId, bookingDate and a positive days value are required.', 'VALIDATION_ERROR');
  }
  const guides = await query(
    "SELECT id, daily_rate FROM travel_guides WHERE id = ? AND status = 'ACTIVE' LIMIT 1",
    [guideId]
  );
  if (!guides.length) throw new HttpError(404, 'Travel guide not found.', 'GUIDE_NOT_FOUND');
  const totalAmount = Number(guides[0].daily_rate) * Number(days);
  const booking = {
    id: randomUUID(), guideId, tripPlanId, userId: req.user.id, bookingDate,
    days: Number(days), totalAmount, status: 'PENDING', notes
  };
  await query(
    `INSERT INTO guide_bookings
     (id, guide_id, user_id, trip_plan_id, booking_date, days, total_amount, status, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, NOW(), NOW())`,
    [booking.id, guideId, req.user.id, tripPlanId, bookingDate, booking.days, totalAmount, notes]
  );
  return success(res, booking, 'Guide booking submitted.', 201);
});

export const listMyBookings = asyncHandler(async (req, res) => {
  const rows = await query(
    `SELECT b.id, b.booking_date AS bookingDate, b.days, b.total_amount AS totalAmount,
            b.status, b.notes, b.created_at AS createdAt,
            g.id AS guideId, g.full_name AS guideName, g.phone AS guidePhone,
            t.id AS tripPlanId, t.title AS tripTitle
     FROM guide_bookings b
     JOIN travel_guides g ON g.id = b.guide_id
     LEFT JOIN trip_plans t ON t.id = b.trip_plan_id
     WHERE b.user_id = ? ORDER BY b.created_at DESC`,
    [req.user.id]
  );
  return success(res, rows, 'Guide bookings retrieved.');
});

export const listAllBookings = asyncHandler(async (req, res) => {
  const params = [];
  let where = '1=1';
  if (req.query.status) {
    where += ' AND b.status = ?';
    params.push(String(req.query.status).toUpperCase());
  }
  const rows = await query(
    `SELECT b.id, b.booking_date AS bookingDate, b.days, b.total_amount AS totalAmount,
            b.status, b.notes, b.created_at AS createdAt,
            g.id AS guideId, g.full_name AS guideName,
            u.id AS userId, u.full_name AS userName, u.email AS userEmail,
            t.id AS tripPlanId, t.title AS tripTitle
     FROM guide_bookings b
     JOIN travel_guides g ON g.id = b.guide_id
     JOIN users u ON u.id = b.user_id
     LEFT JOIN trip_plans t ON t.id = b.trip_plan_id
     WHERE ${where}
     ORDER BY b.created_at DESC`,
    params
  );
  return success(res, rows, 'All guide bookings retrieved.');
});

export const updateBookingStatus = asyncHandler(async (req, res) => {
  const status = String(req.body.status || '').toUpperCase();
  const allowed = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
  if (!allowed.includes(status)) {
    throw new HttpError(400, `status must be one of: ${allowed.join(', ')}.`, 'VALIDATION_ERROR');
  }
  const result = await query(
    'UPDATE guide_bookings SET status = ?, updated_at = NOW() WHERE id = ?',
    [status, req.params.id]
  );
  if (!result.affectedRows) throw new HttpError(404, 'Guide booking not found.', 'BOOKING_NOT_FOUND');
  return success(res, { id: req.params.id, status }, 'Guide booking status updated.');
});
