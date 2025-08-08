# Inventory & Procurement — Detailed Spec

## Overview
Purchase requests, approvals, POs, GRNs, stock, issues/returns, audits.

## Data Entities
- Item(id, sku, name, category, unit, minStock)
- Supplier(id, name, contact)
- PurchaseRequest(id, requesterId, items[], status)
- PurchaseOrder(id, prId, supplierId, items[], status)
- GRN(id, poId, items[], receivedAt)
- StockLedger(id, itemId, qtyDelta, reason)

## UI Screens
- Admin: Items, PRs, PO, GRN, Stock, Audits
- Department: Raise PR

## APIs
- POST /api/v1/inventory/items
- POST /api/v1/inventory/pr
- POST /api/v1/inventory/po
- POST /api/v1/inventory/grn

## Acceptance Criteria
- Stock accuracy within 1%; audit trails

## Tickets
- INV-1: Items & Ledger (SP: 8)
- INV-2: PR/PO/GRN Workflow (SP: 13)
- INV-3: Audits & Reports (SP: 5)
