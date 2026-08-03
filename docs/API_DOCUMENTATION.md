# API Documentation

Base URL for local development:

```text
http://localhost:5000/api
```

Protected endpoints use:

```http
Authorization: Bearer <accessToken>
```

## Authentication

### Register

```http
POST /auth/register
Content-Type: application/json
```

```json
{
  "fullName": "Rahim Ahmed",
  "email": "rahim@example.com",
  "phone": "01711111111",
  "password": "StrongPass123"
}
```

### Login

```http
POST /auth/login
```

```json
{
  "email": "user@travelbd.local",
  "password": "User@123"
}
```

The response contains `accessToken` and `refreshToken`.

### Refresh access token

```http
POST /auth/refresh
```

```json
{
  "refreshToken": "<refreshToken>"
}
```

### Logout

```http
POST /auth/logout
# Access token is optional; the refresh token identifies the session
```

```json
{
  "refreshToken": "<refreshToken>"
}
```

Logout from every active device:

```json
{
  "allDevices": true
}
```

### Current profile

```http
GET /auth/me
Authorization: Bearer <accessToken>
```

## Locations

```http
GET /locations/divisions
GET /locations/districts
GET /locations/districts?divisionId=<uuid>
```

## Categories

```http
GET /categories
POST /categories                 ADMIN
```

Create body:

```json
{
  "name": "River Cruise",
  "slug": "river-cruise",
  "description": "River and cruise attractions",
  "icon": "ship"
}
```

## Tourist spots

```http
GET    /spots
GET    /spots/:id
POST   /spots                     ADMIN
PATCH  /spots/:id                 ADMIN
DELETE /spots/:id                 ADMIN
POST   /spots/:id/ratings         USER/ADMIN
```

Useful query parameters:

```text
search=sundarbans
category=heritage
districtId=<uuid>
isNew=true
featured=true
minRating=4
lat=23.8103&lng=90.4125&radiusKm=50
```

Rating body:

```json
{
  "rating": 5,
  "review": "Excellent destination and route plan."
}
```

## Smart route recommendation

```http
POST /routes/recommend
Authorization: Bearer <accessToken>
```

```json
{
  "startLat": 23.8103,
  "startLng": 90.4125,
  "districtId": "21000000-0000-4000-8000-000000000001",
  "interests": ["heritage", "city attraction"],
  "maxStops": 3,
  "budget": 500,
  "includeNew": true,
  "passengers": 4,
  "vehiclePriority": "balanced",
  "strategy": "balanced"
}
```

The route uses user coordinates, spot rating, category interests, new/featured status, budget, nearest-neighbor ordering and the vehicle cost model.

## Alternative routes

```http
POST /routes/alternatives
Authorization: Bearer <accessToken>
```

```json
{
  "startLat": 23.8103,
  "startLng": 90.4125,
  "districtId": "21000000-0000-4000-8000-000000000001",
  "passengers": 4
}
```

Returns fastest, scenic and budget route variants.

## Vehicles and trip cost

```http
GET    /vehicles
POST   /vehicles/estimate-cost
POST   /vehicles                  ADMIN
PATCH  /vehicles/:id              ADMIN
DELETE /vehicles/:id              ADMIN
```

```json
{
  "distanceKm": 120,
  "passengers": 4,
  "priority": "cheapest"
}
```

`priority` can be `balanced`, `cheapest`, `fastest` or `eco`.

## Trip plans

```http
GET   /trips
POST  /trips
GET   /trips/:id
PATCH /trips/:id/status
```

Create body:

```json
{
  "title": "Dhaka Heritage Tour",
  "startLatitude": 23.8103,
  "startLongitude": 90.4125,
  "startAddress": "Dhaka",
  "startDate": "2026-08-10",
  "endDate": "2026-08-10",
  "vehicleId": "50000000-0000-4000-8000-000000000001",
  "guideId": "60000000-0000-4000-8000-000000000003",
  "totalDistanceKm": 25,
  "estimatedCost": 1500,
  "stops": [
    {
      "spotId": "40000000-0000-4000-8000-000000000011",
      "segmentDistanceKm": 10
    },
    {
      "spotId": "40000000-0000-4000-8000-000000000012",
      "segmentDistanceKm": 5
    }
  ]
}
```

Status update:

```json
{
  "status": "COMPLETED",
  "actualCost": 1600
}
```

Completing a trip updates user milestone statistics.

## Travel guides

```http
GET    /guides
GET    /guides?districtId=<uuid>&language=English&maxDailyRate=2500
POST   /guides                    ADMIN
PATCH  /guides/:id                ADMIN
DELETE /guides/:id                ADMIN
POST   /guides/bookings           USER/ADMIN
GET    /guides/bookings/me        USER/ADMIN
GET    /guides/bookings           ADMIN
PATCH  /guides/bookings/:id/status ADMIN
```

Booking body:

```json
{
  "guideId": "60000000-0000-4000-8000-000000000003",
  "tripPlanId": null,
  "bookingDate": "2026-08-10",
  "days": 1,
  "notes": "English-speaking heritage guide preferred."
}
```

## Analytics

```http
GET /analytics/milestones/me      USER/ADMIN
GET /analytics/overview           ADMIN
GET /analytics/spot-ratings       ADMIN
GET /analytics/route-popularity   ADMIN
```

## Admin

```http
GET   /admin/users
PATCH /admin/users/:id
GET   /admin/logs
```

Log filters:

```text
page=1
limit=50
action=API_REQUEST
userId=<uuid>
statusCode=200
```

## Standard success format

```json
{
  "success": true,
  "message": "Success message.",
  "data": {},
  "meta": {}
}
```

## Standard error format

```json
{
  "success": false,
  "message": "Readable error message.",
  "error": {
    "code": "ERROR_CODE",
    "details": null
  }
}
```
