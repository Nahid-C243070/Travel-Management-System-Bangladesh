import test from 'node:test';
import assert from 'node:assert/strict';
import { haversineDistanceKm, nearestNeighborPath, pathDistanceKm } from '../src/utils/geo.js';

test('haversine distance returns a realistic Dhaka to Narayanganj distance', () => {
  const distance = haversineDistanceKm(23.8103, 90.4125, 23.6238, 90.5);
  assert.ok(distance > 20 && distance < 30);
});

test('nearest-neighbor routing orders the closer stop first', () => {
  const start = { latitude: 23.81, longitude: 90.41 };
  const spots = [
    { id: 'far', latitude: 23.65, longitude: 90.60 },
    { id: 'near', latitude: 23.72, longitude: 90.39 }
  ];
  const route = nearestNeighborPath(start, spots);
  assert.equal(route[0].id, 'near');
  assert.ok(pathDistanceKm(start, route) > 0);
});
