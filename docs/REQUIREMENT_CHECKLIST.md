# Requirement Checklist

## Project features

| Requirement | Status | Location |
|---|---:|---|
| Travel spot routing from user location | Done | `POST /api/routes/recommend` |
| Alternative routes | Done | `POST /api/routes/alternatives` |
| Spot rating analytics | Done | `GET /api/analytics/spot-ratings` |
| User milestones | Done | `GET /api/analytics/milestones/me` |
| Route usage analytics | Done | `GET /api/analytics/route-popularity` |
| New spot exploration | Done | `GET /api/spots?isNew=true` |
| Travel guide management | Done | `/api/guides` and guide bookings |
| Vehicle recommendation | Done | Smart route response and `/api/vehicles/estimate-cost` |
| Trip cost estimation | Done | Vehicle cost service and endpoint |
| User authentication | Done | Register, login, refresh, profile and logout |
| Tourist spot management | Done | Admin CRUD endpoints |
| Trip planning | Done | `/api/trips` and ordered trip stops |

## Database requirements

| Requirement | Status | Evidence |
|---|---:|---|
| UUID | Done | All major primary keys use `CHAR(36)`; Node generates `crypto.randomUUID()` |
| Foreign keys | Done | 25+ FK constraints in `database/schema.sql` |
| Normalization | Done | Separate entities and many-to-many junction table |
| Constraints | Done | PK, FK, UNIQUE, CHECK, ENUM and NOT NULL |
| Necessary tables | Done | 17 tables |
| Log table | Done | `activity_logs` |

## Backend requirements

| Requirement | Status | Evidence |
|---|---:|---|
| Necessary functions | Done | Controllers, routing/cost services and middleware |
| Postman API test | Done | Collection and environment in `postman/` |
| Render deployment files | Prepared | `render.yaml` and `docs/DEPLOY_RENDER.md` |
| GitHub-ready code | Prepared | `.gitignore` and GitHub team guide |
| Team member contribution | Requires team action | Each member must push commits using the provided workflow |

## Report and presentation

| Requirement | Status | Evidence |
|---|---:|---|
| Workflow diagram | Done | PNG, SVG and DOT files in `docs/diagrams/` |
| ERD | Done | PNG, SVG and DOT files in `docs/diagrams/` |
| Important API screenshots | Included | `docs/screenshots/` |
| Project report draft | Included | `docs/PROJECT_REPORT.md` |
| Presentation outline | Included | `docs/PRESENTATION_OUTLINE.md` |

## Items that cannot be completed without external accounts

The code is deployment-ready, but an actual Render deployment URL requires a Render account and a hosted MySQL database. The code is GitHub-ready, but pushing the repository and proving contributions require the team's GitHub accounts. These steps are documented and must be performed by the team.
