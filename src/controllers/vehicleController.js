import { randomUUID } from 'node:crypto';
import { query } from '../config/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import { success } from '../utils/response.js';
import { calculateVehicleEstimate, rankVehicleEstimates } from '../services/costService.js';

export const listVehicles = asyncHandler(async (req, res) => {
  const params = [];
  let sql = `SELECT * FROM vehicles WHERE status = 'ACTIVE'`;
  if (req.query.districtId) {
    sql += ' AND (district_id IS NULL OR district_id = ?)';
    params.push(req.query.districtId);
  }
  if (req.query.type) {
    sql += ' AND vehicle_type = ?';
    params.push(String(req.query.type).toUpperCase());
  }
  sql += ' ORDER BY eco_score DESC, per_km_rate ASC';
  const vehicles = await query(sql, params);
  return success(res, vehicles, 'Vehicles retrieved.');
});

export const estimateCost = asyncHandler(async (req, res) => {
  const { distanceKm, passengers = 1, vehicleId, priority = 'balanced' } = req.body;
  if (distanceKm === undefined || Number(distanceKm) <= 0) {
    throw new HttpError(400, 'A positive distanceKm is required.', 'VALIDATION_ERROR');
  }

  const params = [];
  let sql = `SELECT * FROM vehicles WHERE status = 'ACTIVE'`;
  if (vehicleId) {
    sql += ' AND id = ?';
    params.push(vehicleId);
  }
  const vehicles = await query(sql, params);
  if (!vehicles.length) throw new HttpError(404, 'No matching vehicles are available.', 'VEHICLE_NOT_FOUND');

  const estimates = rankVehicleEstimates(
    vehicles.map((vehicle) => calculateVehicleEstimate(vehicle, distanceKm, passengers)),
    priority
  );
  return success(
    res,
    { recommended: estimates[0], alternatives: estimates.slice(1) },
    'Trip cost estimated.'
  );
});

export const createVehicle = asyncHandler(async (req, res) => {
  const {
    name,
    vehicleType,
    description = null,
    capacity,
    baseFare = 0,
    perKmRate = 0,
    perMinuteRate = 0,
    averageSpeedKmph = 25,
    ecoScore = 50,
    districtId = null
  } = req.body;
  if (!name || !vehicleType || !capacity) {
    throw new HttpError(400, 'name, vehicleType and capacity are required.', 'VALIDATION_ERROR');
  }
  const id = randomUUID();
  await query(
    `INSERT INTO vehicles
     (id, district_id, name, vehicle_type, description, capacity, base_fare, per_km_rate,
      per_minute_rate, average_speed_kmph, eco_score, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', NOW(), NOW())`,
    [
      id,
      districtId,
      name,
      String(vehicleType).toUpperCase(),
      description,
      capacity,
      baseFare,
      perKmRate,
      perMinuteRate,
      averageSpeedKmph,
      ecoScore
    ]
  );
  return success(res, { id }, 'Vehicle created.', 201);
});

export const updateVehicle = asyncHandler(async (req, res) => {
  const allowed = {
    districtId: 'district_id', name: 'name', vehicleType: 'vehicle_type', description: 'description',
    capacity: 'capacity', baseFare: 'base_fare', perKmRate: 'per_km_rate',
    perMinuteRate: 'per_minute_rate', averageSpeedKmph: 'average_speed_kmph',
    ecoScore: 'eco_score', status: 'status'
  };
  const sets = [];
  const params = [];
  for (const [key, column] of Object.entries(allowed)) {
    if (Object.hasOwn(req.body, key)) {
      sets.push(`${column} = ?`);
      const value = key === 'vehicleType' || key === 'status'
        ? String(req.body[key]).toUpperCase()
        : req.body[key];
      params.push(value);
    }
  }
  if (!sets.length) throw new HttpError(400, 'No supported fields were provided.', 'VALIDATION_ERROR');
  sets.push('updated_at = NOW()');
  params.push(req.params.id);
  const result = await query(`UPDATE vehicles SET ${sets.join(', ')} WHERE id = ?`, params);
  if (!result.affectedRows) throw new HttpError(404, 'Vehicle not found.', 'VEHICLE_NOT_FOUND');
  return success(res, { id: req.params.id }, 'Vehicle updated.');
});

export const deleteVehicle = asyncHandler(async (req, res) => {
  const result = await query(
    "UPDATE vehicles SET status = 'INACTIVE', updated_at = NOW() WHERE id = ?",
    [req.params.id]
  );
  if (!result.affectedRows) throw new HttpError(404, 'Vehicle not found.', 'VEHICLE_NOT_FOUND');
  return success(res, null, 'Vehicle deactivated.');
});
