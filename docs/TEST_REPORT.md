# Test Report

## Static JavaScript validation

Command:

```bash
npm run check
```

Result: all JavaScript files in `src`, `scripts` and `tests` passed `node --check` without syntax errors.

## Unit tests

Command:

```bash
npm test
```

Result: 7 tests passed.

Covered behavior:

1. Haversine distance calculation
2. Nearest-stop route ordering
3. Total route distance
4. Spot selection with budget and stop limit
5. Vehicle capacity and fare calculation
6. Eco-priority vehicle ranking
7. Scenic and budget alternative-route priority

## Integration testing to perform on the project computer

The final integration test requires XAMPP MySQL and installed npm dependencies. After importing the database and running the server, execute the Postman collection and verify:

- Health check
- User and admin login
- Refresh-token logout
- Tourist spot filters
- Smart and alternative routes
- Vehicle cost estimation
- Trip creation and completion
- Guide booking
- Analytics and activity logs

The included screenshots are sample response-contract images. Retake the important requests from the live Postman run for final submission evidence.
