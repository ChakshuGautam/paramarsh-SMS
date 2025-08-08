# CBSE + India (Razorpay, MSG91) Configuration

Version: 1.0
Status: Draft

Academic Structure
- Sessions: April–March; Terms: Term 1, Term 2 (configurable).
- Grading: CBSE Scholastic 8-point scale (A1–E) with marks-to-grade mappings; Co-scholastic 3-point (A–C).
- Attendance: Promotion criteria min 75% (configurable); medical exceptions with documentation.
- Report Card: Term-wise subject marks, grades, remarks, attendance summary, overall result.

Localization
- Date format: DD-MM-YYYY; Timezone: Asia/Kolkata; Currency: INR; Numbering: lakh/crore display optional.
- Languages: English/Hindi initial.

Compliance
- Messaging via DLT (TRAI): register templates and headers; ensure opt-in/consent and opt-out.
- Data residency: prefer India region for storage; follow data retention policies.
- Tax: GST on fee heads where applicable; GSTIN on invoices; HSN/SAC codes optional.

Payments — Razorpay
- Gateway: Razorpay Orders API; capture payments server-side via signature verification.
- Webhooks: payment.authorized, payment.captured, payment.failed, refund.processed.
- Reconciliation: T+1 settlements; fees and MDR handling; retries and idempotency.
- UPI intent and collected flows supported.

Messaging — MSG91
- Channels: SMS + Email; template IDs, sender IDs (DLT headers), variables mapping.
- Rate limits: per MSG91 account; handle fallbacks to Email when SMS blocked.

Transport
- GPS providers common in India; configure stop ETA windows with buffer for traffic.

