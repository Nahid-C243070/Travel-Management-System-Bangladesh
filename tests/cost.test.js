import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateVehicleEstimate, rankVehicleEstimates } from '../src/services/costService.js';

const car = {
  id: 'car', name: 'Car', vehicle_type: 'CAR', capacity: 4,
  base_fare: 100, per_km_rate: 20, per_minute_rate: 1,
  average_speed_kmph: 40, eco_score: 50
};
const train = {
  id: 'train', name: 'Train', vehicle_type: 'TRAIN', capacity: 60,
  base_fare: 200, per_km_rate: 7, per_minute_rate: 0.2,
  average_speed_kmph: 55, eco_score: 90
};

test('vehicle estimate includes service charge and capacity calculation', () => {
  const estimate = calculateVehicleEstimate(car, 100, 5);
  assert.equal(estimate.requiredVehicles, 2);
  assert.ok(estimate.estimatedTotal > estimate.baseFare);
});

test('eco ranking favors the higher eco score', () => {
  const ranked = rankVehicleEstimates(
    [calculateVehicleEstimate(car, 100), calculateVehicleEstimate(train, 100)],
    'eco'
  );
  assert.equal(ranked[0].vehicleId, 'train');
});
