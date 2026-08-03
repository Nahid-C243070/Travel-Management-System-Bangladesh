import { randomUUID } from 'node:crypto';
import { query } from '../config/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { calculateVehicleEstimate, rankVehicleEstimates } from '../services/costService.js';
import { buildRoute, createAlternatives, selectRecommendedSpots } from '../services/routingService.js';
import { HttpError } from '../utils/httpError.js';
import { success } from '../utils/response.js';

async function loadSpots({ districtId, spotIds }) {
  const params = [];
  const where = ["s.status = 'ACTIVE'"];
  if (districtId) {
    where.push('s.district_id = ?');
    params.push(districtId);
  }
  if (spotIds?.length) {
    where.push(`s.id IN (${spotIds.map(() => '?').join(',')})`);
    params.push(...spotIds);
  }
  return query(
    `SELECT s.*, d.name AS district_name,
            GROUP_CONCAT(DISTINCT c.name SEPARATOR ',') AS categories
     FROM tourist_spots s
     JOIN districts d ON d.id = s.district_id
     LEFT JOIN tourist_spot_categories sc ON sc.spot_id = s.id
     LEFT JOIN spot_categories c ON c.id = sc.category_id
     WHERE ${where.join(' AND ')}
     GROUP BY s.id`,
    params
  );
}

async function attachVehicleRecommendation(route, passengers, priority) {
  const vehicles = await query("SELECT * FROM vehicles WHERE status = 'ACTIVE'");
  const ranked = rankVehicleEstimates(
    vehicles.map((vehicle) => calculateVehicleEstimate(vehicle, route.distanceKm, passengers)),
    priority
  );
  return { ...route, recommendedVehicle: ranked[0] || null, vehicleAlternatives: ranked.slice(1, 4) };
}

export const recommendRoute = asyncHandler(async (req, res) => {
  const {
    startLat,
    startLng,
    districtId = null,
    spotIds = [],
    interests = [],
    maxStops = 5,
    budget,
    includeNew = true,
    passengers = 1,
    vehiclePriority = 'balanced',
    strategy = 'balanced'
  } = req.body;
  if (startLat === undefined || startLng === undefined) {
    throw new HttpError(400, 'startLat and startLng are required.', 'VALIDATION_ERROR');
  }

  const availableSpots = await loadSpots({ districtId, spotIds });
  if (!availableSpots.length) {
    throw new HttpError(404, 'No tourist spots match the request.', 'NO_SPOTS_FOUND');
  }
  const selected = selectRecommendedSpots(availableSpots, { interests, maxStops, budget, includeNew });
  if (!selected.length) {
    throw new HttpError(404, 'No spots fit the selected budget or filters.', 'NO_SPOTS_FOUND');
  }

  const start = { latitude: Number(startLat), longitude: Number(startLng) };
  const route = await attachVehicleRecommendation(
    buildRoute(start, selected, strategy),
    passengers,
    vehiclePriority
  );
  const logId = randomUUID();
  await query(
    `INSERT INTO route_recommendation_logs
     (id, user_id, start_latitude, start_longitude, district_id, strategy, total_distance_km,
      estimated_cost, spot_count, request_payload, response_summary, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      logId,
      req.user?.id || null,
      startLat,
      startLng,
      districtId,
      route.strategy,
      route.distanceKm,
      route.recommendedVehicle?.estimatedTotal || 0,
      route.stops.length,
      JSON.stringify(req.body),
      JSON.stringify({ stopIds: route.stops.map((stop) => stop.spotId) })
    ]
  );

  return success(res, { recommendationId: logId, route }, 'Smart route generated.');
});

export const alternativeRoutes = asyncHandler(async (req, res) => {
  const { startLat, startLng, spotIds = [], districtId = null, passengers = 1 } = req.body;
  if (startLat === undefined || startLng === undefined) {
    throw new HttpError(400, 'startLat and startLng are required.', 'VALIDATION_ERROR');
  }
  const spots = await loadSpots({ districtId, spotIds });
  if (!spots.length) throw new HttpError(404, 'No spots found.', 'NO_SPOTS_FOUND');
  const selected = selectRecommendedSpots(spots, { maxStops: Math.min(spots.length, 6), includeNew: true });
  const alternatives = createAlternatives(
    { latitude: Number(startLat), longitude: Number(startLng) },
    selected
  );
  const enriched = await Promise.all(
    alternatives.map((route) => {
      const priority = route.strategy === 'budget' ? 'cheapest' : route.strategy === 'fastest' ? 'fastest' : 'balanced';
      return attachVehicleRecommendation(route, passengers, priority);
    })
  );
  return success(res, enriched, 'Alternative routes generated.');
});
