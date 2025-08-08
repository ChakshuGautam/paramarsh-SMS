# Hostel/Boarding — Detailed Spec

Hostel allocations, attendance, mess plans, fees.

Data Entities
- Hostel(id, name)
- Room(id, hostelId, number, capacity)
- Allocation(id, studentId, roomId, start, end)

UI Screens
- Warden: Occupancy, Allocations, Attendance, Visitors

APIs
- POST /api/v1/hostel/rooms
- POST /api/v1/hostel/allocations

Acceptance Criteria
- Occupancy report; conflicts detection

Tickets
- HOS-1: Rooms  Allocations (SP: 5)
- HOS-2: Attendance  Visitors (SP: 5)
