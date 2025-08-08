# API Error Codes  Problem Details

Version: 1.0
Status: Draft

Error Code Catalog (prefix SMS_)
- SMS_AUTH_001: Invalid credentials (401)
- SMS_AUTH_002: Token expired (401)
- SMS_AUTH_003: Insufficient permissions (403)
- SMS_VALIDATION_001: Validation failed (422)
- SMS_NOT_FOUND_001: Resource not found (404)
- SMS_CONFLICT_001: Version conflict / concurrent modification (409)
- SMS_RATE_LIMIT_001: Rate limit exceeded (429)
- SMS_GATEWAY_001: Payment gateway error (502)
- SMS_PROVIDER_001: Messaging provider error (502)
- SMS_INTERNAL_001: Unexpected error (500)

Problem+JSON Shape
{
  "type": "https://docs.sms/errors/{code}",
  "title": "Human readable title",
  "status": 400,
  "detail": "Detailed message",
  "instance": "/requests/{correlation_id}",
  "code": "SMS_VALIDATION_001",
  "errors": { "field": ["message"] }
}

Correlation
- Every response includes X-Correlation-Id; echo in errors.

Retry Semantics
- 5xx safe to retry with backoff (idempotent endpoints only).
- 409 requires client refresh and retry.

