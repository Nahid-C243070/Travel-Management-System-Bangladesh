# Render Deployment Guide

The repository contains `render.yaml` for the Node.js web service. A live deployment still requires the team's Render account, GitHub repository and a reachable MySQL database.

## Option 1: Render web service with an external MySQL database

1. Push the project to GitHub.
2. Create a MySQL database on a provider that permits remote TCP connections.
3. Import `database/schema.sql` and `database/seed.sql` into that database.
4. In Render, create a new Web Service from the GitHub repository.
5. Use:

```text
Build command: npm install
Start command: npm start
Health check: /api/health
```

6. Add environment variables:

```env
NODE_ENV=production
JWT_SECRET=<long-random-secret>
DB_HOST=<database-host>
DB_PORT=3306
DB_USER=<database-user>
DB_PASSWORD=<database-password>
DB_NAME=travel_management_bd
DB_SSL=<true-if-provider-requires-it>
DB_SSL_REJECT_UNAUTHORIZED=true
CORS_ORIGIN=https://<your-service>.onrender.com
ENABLE_API_LOGS=true
```

7. Deploy and verify `/api/health`.

## Option 2: Self-host MySQL on Render

Render documents a MySQL private-service pattern using Docker and a persistent disk. This requires a paid persistent disk for durable data and more operational responsibility than a managed database. Deploy the MySQL private service first, import the schema, then place both services in the same Render region and use the private host in `DB_HOST`.

## Security checklist

- Replace demo passwords
- Use a long random `JWT_SECRET`
- Do not commit `.env`
- Restrict CORS to the actual frontend origin
- Enable database backups
- Use TLS where the database provider supports it
- Disable or rotate seed accounts before production
- Review logs without exposing tokens or passwords

## Deployment evidence for the report

After deployment, capture:

1. Render service status page
2. `/api/health` response
3. Successful login request using the deployed base URL
4. Smart route response
5. Database connection confirmation in Render logs
