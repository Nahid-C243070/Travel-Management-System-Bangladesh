import { query } from '../config/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success } from '../utils/response.js';

export const overview = asyncHandler(async (_req, res) => {
  const [summary] = await query(`
    SELECT
      (SELECT COUNT(*) FROM users WHERE status = 'ACTIVE') AS activeUsers,
      (SELECT COUNT(*) FROM tourist_spots WHERE status = 'ACTIVE') AS activeSpots,
      (SELECT COUNT(*) FROM tourist_spots WHERE status = 'ACTIVE' AND is_new = 1) AS newSpots,
      (SELECT COUNT(*) FROM trip_plans) AS totalTrips,
      (SELECT COUNT(*) FROM trip_plans WHERE status = 'COMPLETED') AS completedTrips,
      (SELECT COUNT(*) FROM travel_guides WHERE status = 'ACTIVE') AS activeGuides,
      (SELECT COUNT(*) FROM route_recommendation_logs) AS routeRecommendations,
      (SELECT COALESCE(AVG(rating_average), 0) FROM tourist_spots WHERE status = 'ACTIVE') AS averageSpotRating
  `);

  const topSpots = await query(`
    SELECT s.id, s.name, d.name AS districtName, s.rating_average AS ratingAverage,
           s.rating_count AS ratingCount, COUNT(ts.id) AS plannedVisits
    FROM tourist_spots s
    JOIN districts d ON d.id = s.district_id
    LEFT JOIN trip_plan_stops ts ON ts.spot_id = s.id
    WHERE s.status = 'ACTIVE'
    GROUP BY s.id
    ORDER BY plannedVisits DESC, s.rating_average DESC
    LIMIT 10
  `);

  const popularStrategies = await query(`
    SELECT strategy, COUNT(*) AS usageCount,
           AVG(total_distance_km) AS averageDistanceKm,
           AVG(estimated_cost) AS averageEstimatedCost
    FROM route_recommendation_logs
    GROUP BY strategy
    ORDER BY usageCount DESC
  `);

  return success(res, { summary, topSpots, popularStrategies }, 'Analytics overview retrieved.');
});

export const spotRatings = asyncHandler(async (_req, res) => {
  const rows = await query(`
    SELECT s.id, s.name, d.name AS districtName,
           s.rating_average AS ratingAverage, s.rating_count AS ratingCount,
           SUM(CASE WHEN r.rating = 5 THEN 1 ELSE 0 END) AS fiveStar,
           SUM(CASE WHEN r.rating = 4 THEN 1 ELSE 0 END) AS fourStar,
           SUM(CASE WHEN r.rating = 3 THEN 1 ELSE 0 END) AS threeStar,
           SUM(CASE WHEN r.rating = 2 THEN 1 ELSE 0 END) AS twoStar,
           SUM(CASE WHEN r.rating = 1 THEN 1 ELSE 0 END) AS oneStar
    FROM tourist_spots s
    JOIN districts d ON d.id = s.district_id
    LEFT JOIN spot_ratings r ON r.spot_id = s.id
    WHERE s.status = 'ACTIVE'
    GROUP BY s.id
    ORDER BY s.rating_average DESC, s.rating_count DESC
  `);
  return success(res, rows, 'Spot rating analytics retrieved.');
});

export const routePopularity = asyncHandler(async (_req, res) => {
  const rows = await query(`
    SELECT DATE(created_at) AS date, strategy, COUNT(*) AS recommendations,
           AVG(total_distance_km) AS averageDistanceKm,
           AVG(estimated_cost) AS averageCost,
           AVG(spot_count) AS averageStopCount
    FROM route_recommendation_logs
    GROUP BY DATE(created_at), strategy
    ORDER BY date DESC, recommendations DESC
    LIMIT 60
  `);
  return success(res, rows, 'Route popularity analytics retrieved.');
});

export const myMilestones = asyncHandler(async (req, res) => {
  const rows = await query(
    `SELECT completed_trips AS completedTrips, visited_spots AS visitedSpots,
            total_distance_km AS totalDistanceKm, badges, updated_at AS updatedAt
     FROM user_milestones WHERE user_id = ? LIMIT 1`,
    [req.user.id]
  );
  const milestone = rows[0] || {
    completedTrips: 0,
    visitedSpots: 0,
    totalDistanceKm: 0,
    badges: []
  };
  if (typeof milestone.badges === 'string') {
    try {
      milestone.badges = JSON.parse(milestone.badges);
    } catch {
      milestone.badges = [];
    }
  }
  return success(res, milestone, 'User milestones retrieved.');
});
