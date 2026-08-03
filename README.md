# Travel Management System Bangladesh

A complete Node.js, Express and MySQL backend prepared from the supplied demo backend structure and redesigned for a Bangladesh-focused travel management project.

## Main features

- User registration, login, refresh token and working logout/revocation
- Bangladesh divisions, districts and tourist spot management
- Smart route recommendation from the user's latitude and longitude
- Fastest, scenic and budget alternative route generation
- New tourist spot exploration and category-based filtering
- Vehicle recommendation and trip cost estimation in BDT
- Travel guide listing, management and booking
- Trip-plan creation, stops and completion milestones
- Analytics for spot ratings, route usage, users and trips
- Activity/API log table for audit records
- Admin user, spot, guide, analytics and log endpoints
- Postman collection and local environment
- XAMPP/MySQL schema and seed data
- ERD, workflow diagram, project report draft and presentation outline
- Render deployment configuration and GitHub team guide
- Small demo web interface served by the same backend

## Technology

- Node.js 18+
- Express 5
- MySQL/MariaDB through XAMPP
- `mysql2` connection pool
- JWT access and refresh tokens
- bcrypt password hashing
- UUID values stored as `CHAR(36)`

## Quick start with XAMPP

1. Start **Apache** and **MySQL** from the XAMPP Control Panel.
2. Open `http://localhost/phpmyadmin`.
3. Import `database/schema.sql` and then `database/seed.sql`.
4. Copy `.env.example` to `.env`.
5. Open a terminal in this project folder and run:

```bash
npm install
npm run dev
```

6. Open:

- Demo UI: `http://localhost:5000`
- Health check: `http://localhost:5000/api/health`

Detailed Bangla instructions are in [`docs/XAMPP_SETUP_BN.md`](docs/XAMPP_SETUP_BN.md). Windows users can also run `setup-xampp.bat` after starting MySQL in XAMPP, then use `start-dev.bat`.

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@travelbd.local` | `Admin@123` |
| User | `user@travelbd.local` | `User@123` |

Change these passwords before production deployment.

## Important API groups

| Group | Base path |
|---|---|
| Authentication | `/api/auth` |
| Locations | `/api/locations` |
| Spot categories | `/api/categories` |
| Tourist spots | `/api/spots` |
| Smart routes | `/api/routes` |
| Vehicles and cost | `/api/vehicles` |
| Trip plans | `/api/trips` |
| Travel guides | `/api/guides` |
| Analytics | `/api/analytics` |
| Admin users and logs | `/api/admin` |

Import the files inside `postman/` to test all important requests.

## Database requirement coverage

| Requirement | Implementation |
|---|---|
| UUID | Every main table uses a `CHAR(36)` UUID primary key generated with `crypto.randomUUID()` |
| Foreign keys | Explicit foreign keys with cascade, restrict or set-null behavior |
| Normalization | Locations, categories, spots, images, ratings, vehicles, guides, trips, stops and logs are separated into related tables |
| Constraints | Unique, check, not-null, enum, primary-key and foreign-key constraints |
| Necessary tables | 17 tables covering authentication, travel data, planning, analytics and logging |
| Log table | `activity_logs` records API method, endpoint, response status, user, IP and execution duration |

## Project structure

```text
travel-management-system-bangladesh/
├── database/
│   ├── schema.sql
│   └── seed.sql
├── docs/
│   ├── diagrams/
│   ├── screenshots/
│   ├── API_DOCUMENTATION.md
│   ├── DATABASE_DESIGN.md
│   ├── DEPLOY_RENDER.md
│   ├── GITHUB_TEAM_GUIDE.md
│   ├── PRESENTATION_OUTLINE.md
│   ├── PROJECT_REPORT.md
│   ├── REQUIREMENT_CHECKLIST.md
│   └── XAMPP_SETUP_BN.md
├── postman/
├── public/
├── scripts/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   └── utils/
├── tests/
├── .env.example
├── package.json
└── render.yaml
```

## Useful commands

```bash
npm install
npm run db:setup
npm run dev
npm test
npm run check
npm start
```

`npm run db:setup` recreates and reseeds the database, so do not run it on a production database containing real data.

## Notes about XAMPP

XAMPP supplies MySQL/MariaDB and phpMyAdmin. The Node.js API does not need to be copied into `htdocs`; it runs separately on port 5000 and connects to XAMPP MySQL on port 3306. Apache is only needed for phpMyAdmin or a separate PHP frontend.
