const EARTH_RADIUS_KM = 6371;

export function toRadians(value) {
  return (Number(value) * Math.PI) / 180;
}

export function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const dLat = toRadians(Number(lat2) - Number(lat1));
  const dLon = toRadians(Number(lon2) - Number(lon1));
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

export function round(value, places = 2) {
  const factor = 10 ** places;
  return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
}

export function estimateTravelMinutes(distanceKm, speedKmph) {
  const safeSpeed = Math.max(Number(speedKmph || 25), 1);
  return Math.max(1, Math.round((Number(distanceKm) / safeSpeed) * 60));
}

export function nearestNeighborPath(start, spots) {
  const remaining = [...spots];
  const ordered = [];
  let current = { latitude: Number(start.latitude), longitude: Number(start.longitude) };

  while (remaining.length) {
    let bestIndex = 0;
    let bestDistance = Infinity;
    remaining.forEach((spot, index) => {
      const distance = haversineDistanceKm(
        current.latitude,
        current.longitude,
        spot.latitude,
        spot.longitude
      );
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });
    const [next] = remaining.splice(bestIndex, 1);
    ordered.push({ ...next, segmentDistanceKm: round(bestDistance) });
    current = next;
  }

  return ordered;
}

export function pathDistanceKm(start, orderedSpots) {
  let current = start;
  let total = 0;
  for (const spot of orderedSpots) {
    total += haversineDistanceKm(
      current.latitude,
      current.longitude,
      spot.latitude,
      spot.longitude
    );
    current = spot;
  }
  return round(total);
}
