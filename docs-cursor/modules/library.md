# Library — Detailed Spec

## Overview
Cataloging and circulation with fines.

## Data Entities
- Book(id, isbn, title, author, category)
- Loan(id, bookId, memberId, issuedAt, dueAt, returnedAt, fine)

## UI Screens
- Librarian: Catalog, Issue/Return/Renew, Reservations, Fines, Inventory
- Student/Staff: Search, Reserve, My Loans

## APIs
- POST /api/v1/library/books
- POST /api/v1/library/loans
- POST /api/v1/library/returns

## Acceptance Criteria
- Barcode/RFID support; overdue fine calculation

## Tickets
- LIB-1: Catalog (SP: 5)
- LIB-2: Circulation (SP: 8)
- LIB-3: Fines & Inventory (SP: 5)
