import { estimateTravelMinutes, round } from '../utils/geo.js';

export function calculateVehicleEstimate(vehicle, distanceKm, passengers = 1, durationMinutes = null) {
  const distance = Math.max(Number(distanceKm || 0), 0);
  const duration = durationMinutes ?? estimateTravelMinutes(distance, vehicle.average_speed_kmph);
  const passengerMultiplier = Math.max(1, Math.ceil(Number(passengers || 1) / Number(vehicle.capacity || 1)));
  const raw =
    Number(vehicle.base_fare) +
    distance * Number(vehicle.per_km_rate) +
    duration * Number(vehicle.per_minute_rate);
  const subtotal = raw * passengerMultiplier;
  const serviceCharge = subtotal * 0.05;
  const estimatedTotal = subtotal + serviceCharge;

  return {
    vehicleId: vehicle.id,
    vehicleName: vehicle.name,
    vehicleType: vehicle.vehicle_type,
    passengerCapacity: Number(vehicle.capacity),
    requiredVehicles: passengerMultiplier,
    distanceKm: round(distance),
    durationMinutes: Number(duration),
    baseFare: round(Number(vehicle.base_fare) * passengerMultiplier),
    distanceFare: round(distance * Number(vehicle.per_km_rate) * passengerMultiplier),
    timeFare: round(duration * Number(vehicle.per_minute_rate) * passengerMultiplier),
    serviceCharge: round(serviceCharge),
    estimatedTotal: round(estimatedTotal),
    ecoScore: Number(vehicle.eco_score)
  };
}

export function rankVehicleEstimates(estimates, priority = 'balanced') {
  return [...estimates].sort((a, b) => {
    if (priority === 'cheapest') return a.estimatedTotal - b.estimatedTotal;
    if (priority === 'fastest') return a.durationMinutes - b.durationMinutes;
    if (priority === 'eco') return b.ecoScore - a.ecoScore || a.estimatedTotal - b.estimatedTotal;
    const scoreA = a.estimatedTotal / 100 + a.durationMinutes / 10 - a.ecoScore / 5;
    const scoreB = b.estimatedTotal / 100 + b.durationMinutes / 10 - b.ecoScore / 5;
    return scoreA - scoreB;
  });
}
