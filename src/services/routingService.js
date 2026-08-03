import { haversineDistanceKm, nearestNeighborPath, round } from '../utils/geo.js';

function interestScore(spot, interests) {
  const categories = String(spot.categories || '').toLowerCase();
  const description = `${spot.name} ${spot.short_description || ''}`.toLowerCase();
  return interests.reduce(
    (score, interest) => score + (categories.includes(interest) || description.includes(interest) ? 2 : 0),
    0
  );
}

export function selectRecommendedSpots(spots, options = {}) {
  const interests = (options.interests || []).map((item) => String(item).toLowerCase());
  const maxStops = Math.max(1, Math.min(Number(options.maxStops || 5), 10));
  const includeNew = options.includeNew !== false;
  const budget = options.budget === undefined ? Infinity : Math.max(Number(options.budget), 0);

  const ranked = [...spots]
    .filter((spot) => includeNew || !spot.is_new)
    .map((spot) => ({
      ...spot,
      recommendationScore:
        Number(spot.rating_average) * 2 +
        interestScore(spot, interests) +
        (spot.is_new ? 1.5 : 0) +
        (spot.is_featured ? 1 : 0)
    }))
    .sort((a, b) => b.recommendationScore - a.recommendationScore);

  const selected = [];
  let entryFeeTotal = 0;
  for (const spot of ranked) {
    const fee = Number(spot.entry_fee || 0);
    if (entryFeeTotal + fee > budget) continue;
    selected.push(spot);
    entryFeeTotal += fee;
    if (selected.length >= maxStops) break;
  }
  return selected;
}

function addSegments(start, spots) {
  let current = { latitude: Number(start.latitude), longitude: Number(start.longitude) };
  return spots.map((spot) => {
    const segmentDistanceKm = round(
      haversineDistanceKm(current.latitude, current.longitude, spot.latitude, spot.longitude)
    );
    current = spot;
    return { ...spot, segmentDistanceKm };
  });
}

function orderedForStrategy(start, spots, strategy) {
  if (strategy === 'scenic') {
    return addSegments(
      start,
      [...spots].sort(
        (a, b) =>
          Number(b.rating_average) - Number(a.rating_average) ||
          Number(b.is_featured) - Number(a.is_featured)
      )
    );
  }
  if (strategy === 'budget') {
    return addSegments(
      start,
      [...spots].sort(
        (a, b) =>
          Number(a.entry_fee) - Number(b.entry_fee) ||
          Number(b.rating_average) - Number(a.rating_average)
      )
    );
  }
  return nearestNeighborPath(start, spots);
}

export function buildRoute(start, selectedSpots, strategy = 'balanced') {
  const ordered = orderedForStrategy(start, selectedSpots, strategy);
  const distanceKm = round(
    ordered.reduce((sum, spot) => sum + Number(spot.segmentDistanceKm || 0), 0)
  );
  const entryFees = ordered.reduce((sum, spot) => sum + Number(spot.entry_fee || 0), 0);
  const visitMinutes = ordered.reduce(
    (sum, spot) => sum + Number(spot.average_visit_minutes || 90),
    0
  );

  return {
    strategy,
    distanceKm,
    entryFees: round(entryFees),
    visitMinutes,
    stops: ordered.map((spot, index) => ({
      sequence: index + 1,
      spotId: spot.id,
      name: spot.name,
      districtName: spot.district_name,
      latitude: Number(spot.latitude),
      longitude: Number(spot.longitude),
      segmentDistanceKm: spot.segmentDistanceKm,
      entryFee: Number(spot.entry_fee),
      rating: Number(spot.rating_average),
      isNew: Boolean(spot.is_new)
    }))
  };
}

export function createAlternatives(start, selectedSpots) {
  return [
    { ...buildRoute(start, selectedSpots, 'balanced'), strategy: 'fastest' },
    buildRoute(start, selectedSpots, 'scenic'),
    buildRoute(start, selectedSpots, 'budget')
  ];
}
