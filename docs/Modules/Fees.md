# Fees & Finance — Detailed Spec

Configure fee structures, invoice, collect payments, reconcile.

Data Entities
- FeeComponent(id, name, type, amount, slabRef)
- FeeStructure(id, gradeId, components, concessions)
- Invoice(id, studentId, period, dueDate, items[], status)
- Payment(id, invoiceId, gateway, amount, status, reference, method)
- DunningRule(id, cadence, channels)

UI Screens
- Finance: Fee Setup, Invoices (list/detail), Collect Payment, Dunning, Reconciliation, Refunds, Reports
- Parent: Invoice List/Detail, Pay, Receipts

APIs
- POST /api/v1/fees/structures
- POST /api/v1/fees/invoices/generate
- GET /api/v1/fees/invoices/{id}
- POST /api/v1/fees/invoices/{id}/pay
- POST /api/v1/fees/webhooks/gateway

Scholarships & Financial Aid

- Entities: ScholarshipScheme(id, name, eligibilityRules, amountType[fixed,percentage], cap, validFrom, validTo), ScholarshipAward(id, studentId, schemeId, period, amount, status[pending,approved,rejected]).
- Process: Apply → Review → Approve/Reject → Auto-apply concessions to invoices → Audit trail.
- APIs:
  - GET /api/v1/finance/scholarships/schemes
  - POST /api/v1/finance/scholarships/schemes
  - POST /api/v1/finance/scholarships/awards
  - PATCH /api/v1/finance/scholarships/awards/{id}

Accounts Receivable/Payable (Students & Vendors)

- AR: student balances, dunning, write-offs, refunds; statements by period.
- AP: vendor invoices for services (transport, uniforms, labs), approvals, payments, and reconciliation.
- Entities: Vendor(id, name, contact), VendorInvoice(id, vendorId, period, amount, status), PaymentOut(id, vendorInvoiceId, method, status).
- APIs:
  - GET /api/v1/finance/ar/students/{studentId}/statement?from&to
  - GET /api/v1/finance/ap/vendors
  - POST /api/v1/finance/ap/vendor-invoices
  - POST /api/v1/finance/ap/vendor-invoices/{id}/pay

Validations
- No PAN storage; signature verification; idempotency keys

Acceptance Criteria
- Reconciliation report matches gateway settlements within 1%
- Dunning suppression on payment
 - Scholarships applied correctly and reflected on invoices and statements
 - Vendor AP workflow supports approvals and payment tracking

Tickets
- FEE-1: Fee Structure Config (SP: 8)
- FEE-2: Invoice Generation (SP: 8)
- FEE-3: Payment Integration (SP: 13)
- FEE-4: Dunning Engine (SP: 8)
- FEE-5: Reconciliation & Reports (SP: 8)
 - FEE-6: Scholarships & Awards (SP: 8)
 - FEE-7: AP (Vendors) Workflow (SP: 13)

