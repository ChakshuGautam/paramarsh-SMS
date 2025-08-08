# Communications  Notifications — Detailed Spec

Transactional and campaign messaging across SMS, Email, Push, WhatsApp (where compliant).

Data Entities
- Template(id, name, channel, locale, content, variables)
- Campaign(id, name, audienceQuery, schedule, status)
- Message(id, channel, to, templateId, payload, status, providerId, error)
- Preference(id, ownerType, ownerId, channel, consent, quietHours)

UI Screens
- Admin: Templates, Campaigns, Audiences, Delivery Reports, Provider Settings
- Teacher/Admin: Send announcement to class/grade
- Parent/Student: Preferences

APIs
- POST /api/v1/comms/messages
- POST /api/v1/comms/campaigns
- GET /api/v1/comms/messages?status=failed
- POST /api/v1/comms/webhooks/{provider}

Validations
- Templating variables vs data; opt-in/opt-out enforcement; DND handling

Acceptance Criteria
- Deliver ≥ 99% provider-accepted; retries with backoff; dedupe by idempotency key

Tickets
- COM-1: Template Engine (SP: 8)
- COM-2: Multi-Channel Senders (SP: 8)
- COM-3: Preferences  Consent (SP: 5)
- COM-4: Campaigns  Audiences (SP: 8)
