# Presentation Outline

## Slide 1 — Title

**Travel Management System Bangladesh**

- Team member names and IDs
- Course and instructor
- Project type: Node.js, Express and MySQL REST API

Suggested visual: Bangladesh map with travel icons.

## Slide 2 — Problem Statement

Travelers often use separate sources for destinations, routes, transport prices and guides. This creates uncertainty about the best route, total travel cost and suitable vehicle. The project centralizes those activities in one platform.

Suggested visual: fragmented planning versus one integrated platform.

## Slide 3 — Objectives and Scope

Explain location-based route creation, alternative routes, new spot exploration, vehicle recommendation, cost estimation, guide management, trip plans and analytics. State that the current implementation focuses on domestic tourism in Bangladesh.

## Slide 4 — Main Users

- Traveler: discover spots, create routes, estimate cost, plan trips, book guides and rate places
- Administrator: manage users, spots, categories and guides; view analytics and logs
- Guide: represented through guide records and bookings; a separate guide portal can be future work

## Slide 5 — System Workflow

Insert `docs/diagrams/workflow.png`.

Explain request flow from client to authentication, route or cost services, MySQL and activity logs.

## Slide 6 — Database Design

Insert `docs/diagrams/erd.png`.

Highlight UUID, normalized location structure, many-to-many spot categories, trip header and stop tables, refresh-token revocation and the activity log table.

## Slide 7 — Smart Route Recommendation

Explain inputs: starting coordinates, district, interests, maximum stops, budget, passengers and strategy. Explain scoring and nearest-neighbour stop ordering. Show the route recommendation API screenshot.

## Slide 8 — Alternative Routes and New Spot Exploration

Explain fastest, scenic and budget variants. Demonstrate `isNew=true`, category and nearby filters. Show how the route response identifies new destinations.

## Slide 9 — Vehicle Recommendation and Cost

Show the vehicle cost screenshot. Explain base fare, per-kilometre fare, time fare, capacity multiplier, service charge and balanced/cheapest/fastest/eco ranking.

## Slide 10 — Travel Guides and Trip Planning

Explain guide profiles, language and district filters, guide booking, saved trip plans, ordered stops and status changes.

## Slide 11 — Analytics and Milestones

Present active users, spots, guides, completed trips, route strategy usage, rating distribution and user badges. Insert the analytics API screenshot.

## Slide 12 — Security and Logging

Explain bcrypt passwords, JWT access tokens, hashed refresh tokens, real logout through revocation, role authorization, parameterized queries, constraints and the `activity_logs` table.

## Slide 13 — API Testing

Show Postman collection folders and important request/response screenshots. Mention unit tests for distance, route selection and vehicle cost.

## Slide 14 — Deployment and GitHub

Show the GitHub repository, contributor graph, pull requests and Render service. Explain that each team member used a separate feature branch and meaningful commits.

## Slide 15 — Limitations and Future Work

Current route distance is geographical rather than live road distance. Future work includes Google Maps or OpenStreetMap routing, live traffic, weather, booking, payment, guide portal and mobile application.

## Slide 16 — Conclusion and Demo

Summarize the fulfilled requirements. Run a short live demonstration: login, list spots, generate route, estimate cost and view logs.
