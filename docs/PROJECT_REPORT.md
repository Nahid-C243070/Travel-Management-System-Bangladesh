# Project Report Draft

## Travel Management System Bangladesh

### 1. Introduction

The Travel Management System Bangladesh is a web-based platform designed to improve domestic travel planning by combining tourist spot discovery, location-based route generation, alternative route comparison, travel guide management, vehicle recommendation and trip cost estimation. Bangladesh has a wide range of coastal, hill, forest, heritage, island and urban destinations, but travelers frequently need to search across several disconnected sources to identify attractions, estimate transport costs and organize a practical itinerary. The proposed system addresses this problem through a centralized database and REST API.

The platform accepts the user's starting latitude and longitude and generates an ordered travel route. It considers tourist spot ratings, categories, entry fees, new and featured status, the user's interests, maximum stop count and budget. It also compares available vehicles using capacity, base fare, per-kilometre rate, travel time and environmental score. Administrators can manage destinations, guides and users, while analytics endpoints summarize route usage, spot ratings, trip completion and user milestones.

### 2. Objectives

The main objective is to build a normalized, secure and reusable backend for Bangladesh travel management. Specific objectives include implementing account registration and logout, managing tourist spots and their locations, generating smart and alternative routes, recommending cost-efficient vehicles, managing travel guides, recording trip plans, measuring user milestones and providing an auditable log of API activity.

### 3. Scope

The project covers domestic tourist destinations in Bangladesh. The supplied seed data contains major attractions from Dhaka, Chattogram, Cox's Bazar, Rangamati, Bandarban, Sylhet, Moulvibazar, Bagerhat, Patuakhali, Naogaon and Bogura. The architecture supports adding all remaining districts and attractions without changing the database structure. The current routing logic is heuristic and uses geographical distance rather than a live road-navigation provider. It is suitable for an academic backend demonstration and can later be integrated with Google Maps, Mapbox or OpenStreetMap routing services.

### 4. Functional Requirements

The authentication module supports user registration, login, token refresh, profile retrieval, single-session logout and logout from all devices. Refresh tokens are stored as hashes and can be revoked, solving the common problem where a JWT-based logout endpoint returns success without invalidating the session.

The destination module stores tourist spots, descriptions, coordinates, entry fees, best season, opening times, ratings, images and categories. Users can search and filter by district, category, new status, featured status, minimum rating and proximity to supplied coordinates. Administrators can create, update and archive destinations, while authenticated users can submit one rating per spot.

The smart route module selects destinations using rating, interest match, new-spot bonus, featured status and budget. A nearest-neighbour algorithm orders the selected stops from the user's starting point. Alternative route generation returns fastest, scenic and budget-focused variants. Every recommendation is recorded for later analytics.

The vehicle module estimates travel cost using base fare, distance rate, time rate, capacity and a five-percent service charge. It can rank recommendations according to balanced, cheapest, fastest or eco-friendly priorities. The trip module saves the selected vehicle, guide, date, estimated cost and ordered stops. Completing a trip updates the user's completed trip count, visited spot count, total distance and achievement badges.

The travel guide module stores district, languages, experience, daily rate, rating and license information. Users can search guides and submit booking requests. Administrators can create, update and deactivate guide records. The analytics module provides an overview of users, destinations, trips, guides and route recommendations, together with detailed spot-rating and route-popularity information.

### 5. Non-Functional Requirements

The API uses JSON, consistent success and error formats, password hashing, role-based authorization, parameterized SQL queries, connection pooling, CORS configuration and HTTP security headers. Database constraints protect referential integrity. The application is designed for Node.js 18 or later and MySQL or MariaDB through XAMPP. The code is separated into configuration, controllers, middleware, routes, services and utilities to improve maintainability.

### 6. System Architecture

The client communicates with the Express API through HTTP requests. Public requests include the health check, location data, destination browsing, vehicle lists and cost estimates. Protected requests pass through JWT authentication middleware. Administrative requests also pass through role authorization. Controllers validate the request and use the service layer for route and cost calculations. The MySQL connection pool executes parameterized queries. Responses are returned as JSON, and completed requests are written to the activity log table.

The backend also serves a small demonstration interface from the `public` directory. This interface allows a user to log in, browse featured destinations, request a route and compare transport costs. It is not intended as a final production frontend, but it provides a working demonstration of the backend.

### 7. Database Design

The database contains 17 normalized tables. `users` and `refresh_tokens` support account and session management. `divisions` and `districts` normalize Bangladesh locations. Tourist spot data is divided among `tourist_spots`, `spot_categories`, `tourist_spot_categories`, `spot_images` and `spot_ratings`. Vehicles and guides are stored independently. Trip planning is divided into `trip_plans` and `trip_plan_stops`, while guide reservations are stored in `guide_bookings`. Analytics and audit functions use `route_recommendation_logs`, `user_milestones` and `activity_logs`.

All main tables use UUID primary keys. Foreign keys define cascade, restrict and set-null behavior according to the meaning of each relationship. Unique constraints protect emails, slugs, rating ownership and stop ordering. Check constraints validate coordinates, ratings, costs, capacities and dates.

### 8. Routing and Cost Algorithms

The destination-selection score combines average rating, category or description match with user interests, new-destination status and featured status. Spots outside the user's entry-fee budget are removed. The system limits the result to the requested maximum number of stops.

After selection, the route begins at the user's coordinates. At each stage the algorithm selects the geographically nearest unvisited destination using the Haversine formula. This approach is computationally simple and produces an understandable route for a classroom project. The scenic strategy gives priority to highly rated places, while the budget strategy gives priority to low entry fees. The final response contains segment distance, total distance, entry fees and visit duration.

Vehicle cost is calculated as base fare plus distance cost plus time cost. If the passenger count is greater than vehicle capacity, the system calculates the required number of vehicles. A service charge is added, and the list is ranked by the selected priority. The result distinguishes base fare, distance fare, time fare, service charge and estimated total.

### 9. Testing

The project includes Node's built-in unit tests for geographical distance, stop ordering, route selection, cost calculation, capacity handling and vehicle ranking. The Postman collection tests authentication, stores returned tokens as environment variables and contains important requests for destinations, routes, vehicles, trips, guides, analytics and logs. Important request and response examples are included as screenshots in the documentation folder.

Recommended final testing steps include importing the schema into XAMPP, running `npm test`, starting the server, executing the complete Postman collection and checking `activity_logs` for recorded requests. Boundary tests should include invalid credentials, expired tokens, a rating outside 1–5, an unknown destination, insufficient budget, missing route coordinates and unauthorized admin access.

### 10. Security

Passwords are hashed with bcrypt. Access tokens are short-lived JWTs, while refresh tokens are separately stored as SHA-256 hashes. Logout revokes a refresh token, and all-device logout revokes every active refresh token for the user. SQL injection risk is reduced through prepared statements. Administrative endpoints use role authorization, and environment secrets are kept outside source control.

The seed accounts and passwords are only for demonstration and must be changed before deployment. Production deployment should use a strong JWT secret, TLS-enabled database connection, restricted CORS, database backups and a dedicated database user with limited privileges.

### 11. Deployment

The code contains a Render Blueprint for the Node.js web service. Actual deployment requires a GitHub repository, a Render account and a reachable MySQL database. After deployment, the team should capture the Render service status, health check, deployed login request and database connection log for the report. XAMPP is appropriate for local development but is not a public production database.

### 12. Limitations and Future Development

The current route uses straight-line geographical distance and does not consider live roads, traffic, ferry schedules, weather, hotel availability or real transport fares. Images are represented by URLs, and payment processing is outside the current scope. Future work can integrate a mapping provider, road-distance matrix, weather API, hotel and ticket booking, payment gateways, multilingual content, guide ratings, live vehicle availability, emergency contacts and a mobile application.

### 13. Conclusion

The Travel Management System Bangladesh satisfies the core database and backend requirements through UUID identifiers, normalized tables, foreign keys, constraints, audit logs and a structured REST API. It demonstrates authentication, destination management, smart routing, alternative routes, vehicle cost recommendation, guide management, trip planning, analytics and user milestones. The supplied XAMPP setup, seed data, Postman collection, diagrams and documentation make the project suitable for development, demonstration and academic submission after the team adds genuine GitHub contribution evidence and a live deployment URL.
