# API Responses & Conventions

Version: 1.0
Status: Draft

## Overview

This document defines the common response patterns, pagination, error handling, and security conventions used across the Paramarsh SMS API. The OpenAPI spec (`docs/API/openapi.yaml`) should reference these conventions but need not inline every repeated response for readability.

## Success Responses

- 200 OK: Successful read
- 201 Created: Successful create
- 202 Accepted: Asynchronous processing started

### List Responses

- Shape: `{ data, meta }`
- `data`: array of resource objects.
- `meta`:
  - `page`: integer (1-based) or omitted if using cursor pagination
  - `pageSize`: integer
  - `total`: integer (optional; may be omitted for cursor pagination)
  - `hasNext`: boolean (optional)
  - `nextCursor`: string (when cursor pagination is used)

Example (page/pageSize):

```json
{
  "data": [{ "id": "stu_1", "firstName": "Aarav", "lastName": "Sharma" }],
  "meta": { "page": 1, "pageSize": 25, "total": 1, "hasNext": false }
}
```

Example (cursor):

```json
{
  "data": [{ "id": "stu_1", "firstName": "Aarav", "lastName": "Sharma" }],
  "meta": { "nextCursor": "eyJjdXJzb3IiOiJzdHUxIn0=" }
}
```

### Single Resource Responses

- Shape: resource object directly (e.g., `Student`, `Invoice`).

### Mutation Responses

- 201 on create; return created resource or `Location` header when applicable.
- 200 or 202 on update/async tasks; include minimal payload (e.g., status) if not returning full resource.

## Error Responses

- Format: RFC 7807 Problem+JSON.
- Content type: `application/problem+json`.
- Headers: include `X-Correlation-Id` and relevant rate limit headers when applicable.
- Reuse error codes from `docs/API/Error_Codes.md`.

Standard statuses to support where relevant:

- 400 Bad Request (syntax/format errors)
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict (including optimistic concurrency/version conflicts)
- 422 Unprocessable Entity (validation)
- 429 Too Many Requests
- 5xx Server Errors

Problem+JSON example:

```json
{
  "type": "https://docs.sms/errors/SMS_VALIDATION_001",
  "title": "Validation failed",
  "status": 422,
  "detail": "Invalid field values",
  "instance": "/requests/7b1c77f7",
  "code": "SMS_VALIDATION_001",
  "errors": {
    "firstName": ["Required"],
    "dateOfBirth": ["Must be a date (YYYY-MM-DD)"]
  }
}
```

## Pagination

- Query parameters:
  - Offset pagination: `page`, `pageSize`, `sort`
  - Cursor pagination: `cursor`, `limit`, `sort`
- Server should enforce maximums; defaults are `page=1`, `pageSize=25`.
- Sorting format: comma-separated fields; prefix with `-` for descending (e.g., `name,-createdAt`).

## Idempotency & Retries

- Idempotent endpoints (e.g., POST to start async job) should accept `Idempotency-Key` header.
- Clients may retry 5xx and 429 with exponential backoff; 409 should be resolved before retry.

## Security

- Authentication: Bearer JWT (`Authorization: Bearer <token>`)
- Multi-tenancy: tenancy claims in JWT; server enforces tenant scoping.
- RBAC/ABAC: enforced server-side; clients should not rely on UI gating.

## Webhooks

- Respond with 2xx as soon as payload is syntactically valid; validate signatures if supported.
- Retry policy: provider-specific; server should be idempotent.

## Examples Guidance

- Provide at least one example for complex endpoints (async jobs, nested objects).
- For common CRUD endpoints, examples in this document suffice; avoid duplicating in every path unless needed.

## OpenAPI Authoring Tips

- Use `components.parameters` and `components.responses` for shared artifacts.
- Keep the spec readable by referencing this document for boilerplate responses.
- Prefer `$ref` to JSON Schemas in `docs/API/schemas/*` for complex bodies.

## Change Management

- Any deviation from these conventions must be documented here and reflected in `openapi.yaml`.
- Backwards-incompatible changes require a major version bump and migration guidance.
