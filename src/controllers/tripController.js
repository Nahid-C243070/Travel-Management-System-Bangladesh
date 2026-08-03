import { randomUUID } from 'node:crypto';
import { query, withTransaction } from '../config/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import { success } from '../utils/response.js';

export const createTrip = asyncHandler(async (req, res) => {
  const {
    title,
    startLatitude,
    startLongitude,
    startAddress = null,
    startDate = null,
    endDate = null,
    vehicleId = null,
    guideId = null,
    totalDistanceKm = 0,
    estimatedCost = 0,
    notes = null,
    stops = []
  } = req.body;
  if (!title || startLatitude === undefined || startLongitude === undefined || !Array.isArray(stops) || !stops.length) {
    throw new HttpError(
      400,
      'title, startLatitude, startLongitude and at least one stop are required.',
      'VALIDATION_ERROR'
    );
  }

  const tripId = randomUUID();
  await withTransaction(async (connection) => {
    await connection.execute(
      `INSERT INTO trip_plans
       (id, user_id, title, start_latitude, start_longitude, start_address, start_date, end_date,
        vehicle_id, guide_id, status, total_distance_km, estimated_cost, actual_cost, notes,
        created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PLANNED', ?, ?, NULL, ?, NOW(), NOW())`,
      [
        tripId,
        req.user.id,
        title,
        startLatitude,
        startLongitude,
        startAddress,
        startDate,
        endDate,
        vehicleId,
        guideId,
        totalDistanceKm,
        estimatedCost,
        notes
      ]
    );

    for (const [index, stop] of stops.entries()) {
      if (!stop.spotId) {
        throw new HttpError(400, `stops[${index}].spotId is required.`, 'VALIDATION_ERROR');
      }
      await connection.execute(
        `INSERT INTO trip_plan_stops
         (id, trip_plan_id, spot_id, stop_order, planned_arrival, planned_departure,
          segment_distance_km, notes, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', NOW())`,
        [
          randomUUID(),
          tripId,
          stop.spotId,
          index + 1,
          stop.plannedArrival || null,
          stop.plannedDeparture || null,
          stop.segmentDistanceKm || 0,
          stop.notes || null
        ]
      );
    }
  });

  return success(res, { id: tripId }, 'Trip plan created.', 201);
});

export const listTrips = asyncHandler(async (req, res) => {
  const params = [req.user.id];
  let where = 't.user_id = ?';
  if (req.query.status) {
    where += ' AND t.status = ?';
    params.push(String(req.query.status).toUpperCase());
  }
  const rows = await query(
    `SELECT t.id, t.title, t.start_date AS startDate, t.end_date AS endDate, t.status,
            t.total_distance_km AS totalDistanceKm, t.estimated_cost AS estimatedCost,
            t.actual_cost AS actualCost, t.created_at AS createdAt,
            v.name AS vehicleName, g.full_name AS guideName,
            COUNT(ts.id) AS stopCount
     FROM trip_plans t
     LEFT JOIN vehicles v ON v.id = t.vehicle_id
     LEFT JOIN travel_guides g ON g.id = t.guide_id
     LEFT JOIN trip_plan_stops ts ON ts.trip_plan_id = t.id
     WHERE ${where}
     GROUP BY t.id
     ORDER BY t.created_at DESC`,
    params
  );
  return success(res, rows, 'Trips retrieved.');
});

export const getTrip = asyncHandler(async (req, res) => {
  const params = [req.params.id];
  let userFilter = '';
  if (req.user.role !== 'ADMIN') {
    userFilter = ' AND t.user_id = ?';
    params.push(req.user.id);
  }
  const trips = await query(
    `SELECT t.*, v.name AS vehicle_name, g.full_name AS guide_name
     FROM trip_plans t
     LEFT JOIN vehicles v ON v.id = t.vehicle_id
     LEFT JOIN travel_guides g ON g.id = t.guide_id
     WHERE t.id = ? ${userFilter} LIMIT 1`,
    params
  );
  if (!trips.length) throw new HttpError(404, 'Trip plan not found.', 'TRIP_NOT_FOUND');
  const stops = await query(
    `SELECT ts.id, ts.stop_order AS stopOrder, ts.planned_arrival AS plannedArrival,
            ts.planned_departure AS plannedDeparture, ts.segment_distance_km AS segmentDistanceKm,
            ts.status, ts.notes, s.id AS spotId, s.name AS spotName,
            s.latitude, s.longitude, s.entry_fee AS entryFee
     FROM trip_plan_stops ts
     JOIN tourist_spots s ON s.id = ts.spot_id
     WHERE ts.trip_plan_id = ? ORDER BY ts.stop_order`,
    [req.params.id]
  );
  return success(res, { ...trips[0], stops }, 'Trip retrieved.');
});

export const updateTripStatus = asyncHandler(async (req, res) => {
  const status = String(req.body.status || '').toUpperCase();
  const allowed = ['PLANNED', 'ONGOING', 'COMPLETED', 'CANCELLED'];
  if (!allowed.includes(status)) {
    throw new HttpError(400, `status must be one of: ${allowed.join(', ')}.`, 'VALIDATION_ERROR');
  }

  await withTransaction(async (connection) => {
    const [trips] = await connection.execute(
      'SELECT id, user_id FROM trip_plans WHERE id = ? LIMIT 1',
      [req.params.id]
    );
    const trip = trips[0];
    if (!trip || (req.user.role !== 'ADMIN' && trip.user_id !== req.user.id)) {
      throw new HttpError(404, 'Trip plan not found.', 'TRIP_NOT_FOUND');
    }
    await connection.execute(
      'UPDATE trip_plans SET status = ?, actual_cost = COALESCE(?, actual_cost), updated_at = NOW() WHERE id = ?',
      [status, req.body.actualCost ?? null, req.params.id]
    );
    if (status === 'COMPLETED') {
      await connection.execute(
        "UPDATE trip_plan_stops SET status = 'VISITED' WHERE trip_plan_id = ?",
        [req.params.id]
      );
      const [counts] = await connection.execute(
        `SELECT COUNT(DISTINCT t.id) AS completedTrips,
                COUNT(DISTINCT ts.spot_id) AS visitedSpots,
                COALESCE(SUM(t.total_distance_km), 0) AS totalDistance
         FROM trip_plans t
         LEFT JOIN trip_plan_stops ts ON ts.trip_plan_id = t.id AND ts.status = 'VISITED'
         WHERE t.user_id = ? AND t.status = 'COMPLETED'`,
        [trip.user_id]
      );
      const metrics = counts[0];
      const badges = [];
      if (Number(metrics.completedTrips) >= 1) badges.push('FIRST_TRIP');
      if (Number(metrics.visitedSpots) >= 5) badges.push('EXPLORER_5');
      if (Number(metrics.visitedSpots) >= 10) badges.push('EXPLORER_10');
      if (Number(metrics.totalDistance) >= 500) badges.push('ROAD_TRAVELER_500KM');
      await connection.execute(
        `INSERT INTO user_milestones
         (id, user_id, completed_trips, visited_spots, total_distance_km, badges, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE completed_trips = VALUES(completed_trips),
           visited_spots = VALUES(visited_spots), total_distance_km = VALUES(total_distance_km),
           badges = VALUES(badges), updated_at = NOW()`,
        [
          randomUUID(),
          trip.user_id,
          metrics.completedTrips,
          metrics.visitedSpots,
          metrics.totalDistance,
          JSON.stringify(badges)
        ]
      );
    }
  });

  return success(res, { id: req.params.id, status }, 'Trip status updated.');
});
