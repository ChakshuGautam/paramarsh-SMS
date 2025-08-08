# Transport — Detailed Spec

Routes, stops, allocations, GPS, transport fees.

Data Entities
- Vehicle(id, regNo, capacity)
- Route(id, name)
- Stop(id, routeId, name, time)
- Allocation(id, studentId, routeId, stopId)

UI Screens
- Transport Manager: Routes/Stops, Allocations, GPS View, Incidents
- Parent: Stop and timing, Bus attendance (optional)

APIs
- POST /api/v1/transport/routes
- POST /api/v1/transport/routes/{id}/stops
- POST /api/v1/transport/allocations

Acceptance Criteria
- GPS map view with last known time; stale warnings  10m

Tickets
- TRN-1: Routes/Stops CRUD (SP: 5)
- TRN-2: Allocations (SP: 5)
- TRN-3: GPS Integration (SP: 8)
