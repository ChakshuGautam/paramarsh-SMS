# Integrations — Razorpay (Payments) & MSG91 (Messaging)

Version: 1.0
Status: Draft

Razorpay Integration
- Create Order (server): amount in paise, currency INR, receipt, notes, payment_capture=0.
- Client Checkout: use key_id; capture response (razorpay_payment_id, order_id, signature).
- Verify Signature (server): HMAC SHA256 of order_id|payment_id using key_secret.
- Capture Payment: amount, currency; update invoice status.
- Webhooks: verify X-Razorpay-Signature; handle events: payment.authorized/captured/failed/refund.processed; idempotent updates.
- Refunds: full/partial; link to invoice credit notes.

MSG91 Integration
- SMS: Template-based; DLT templateId, senderId; variables mapping; consent enforcement.
- Email: domain + templates; fallback when SMS blocked.
- Webhooks/DR: capture delivery status; retries with backoff; provider failover if configured.

Security & Compliance
- Store secrets in env/secret manager; never log PII or full PAN; mask tokens; comply with DLT norms.

