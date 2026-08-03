import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRoute, selectRecommendedSpots } from '../src/services/routingService.js';

const spots = [
  { id: '1', name: 'Heritage A', latitude: 23.71, longitude: 90.40, entry_fee: 20, average_visit_minutes: 90, rating_average: 4.8, categories: 'Heritage', is_new: 0, is_featured: 1 },
  { id: '2', name: 'New Beach', latitude: 23.75, longitude: 90.45, entry_fee: 0, average_visit_minutes: 120, rating_average: 4.2, categories: 'Beach', is_new: 1, is_featured: 0 },
  { id: '3', name: 'Forest', latitude: 23.85, longitude: 90.55, entry_fee: 1000, average_visit_minutes: 120, rating_average: 4.9, categories: 'Forest', is_new: 0, is_featured: 1 }
];

test('spot selection respects budget and maximum stops', () => {
  const selected = selectRecommendedSpots(spots, { budget: 100, maxStops: 2, interests: ['heritage'] });
  assert.equal(selected.length, 2);
  assert.ok(selected.every((spot) => Number(spot.entry_fee) <= 100));
});

test('route construction returns sequenced stops and distance', () => {
  const route = buildRoute({ latitude: 23.81, longitude: 90.41 }, spots.slice(0, 2));
  assert.equal(route.stops.length, 2);
  assert.equal(route.stops[0].sequence, 1);
  assert.ok(route.distanceKm > 0);
});

test('scenic and budget alternatives use different priorities', () => {
  const start = { latitude: 23.81, longitude: 90.41 };
  const scenic = buildRoute(start, spots, 'scenic');
  const budget = buildRoute(start, spots, 'budget');
  assert.equal(scenic.stops[0].spotId, '3');
  assert.equal(budget.stops[0].spotId, '2');
});
