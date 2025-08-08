# Mock API Server — Tech Debt Checklist

- [ ] OpenAPI alignment
  - [ ] Drive routes and validation from `docs/API/openapi.yaml` (express-openapi-validator or Prism)
  - [ ] Ensure all responses match `{ data, meta }` and Problem+JSON consistently
  - [ ] Use a single base path prefix (e.g., `/api/v1`) to mirror the spec

- [ ] Validation and typing
  - [ ] Validate request bodies and query params with Zod/Ajv
  - [ ] Enforce enums (status, method) and formats (uuid, date)
  - [ ] Generate TS types from OpenAPI and use them in handlers

- [ ] Pagination, sorting, filtering
  - [ ] Support multi-field sort (e.g., `sort=name,-createdAt`)
  - [ ] Add simple text search (`q` over name/admissionNo)
  - [ ] Add richer filters (date ranges, status)
  - [ ] Return `totalPages` or `nextPage` in `meta`

- [ ] Relations and expansions
  - [ ] Support `include`/`expand` (e.g., `include=guardians,invoices`)
  - [ ] Support relational counts (`includeCounts=true`)
  - [ ] Implement `getMany`/`getManyReference` patterns to support admin relations

- [ ] Tenancy/scoping
  - [ ] Add `tenantId`/`subdomain` filters across relevant endpoints
  - [ ] Expose `/tenants` list/show endpoints

- [ ] Error handling
  - [ ] Unify errors to RFC7807 Problem+JSON (400/404/409/422/429/500)
  - [ ] Return 400 on invalid params with validation details

- [ ] Observability and DX
  - [ ] Add `/health` endpoint
  - [ ] Add request IDs and structured logging (pino)
  - [ ] Add latency/failure injection via query (e.g., `__delay`, `__failRate`)

- [ ] Performance and schema
  - [ ] Add Prisma indexes for common filters (`classId`, `sectionId`, `studentId`, `invoiceId`)
  - [ ] Cap `pageSize` and guard large `include`s

- [ ] Config and lifecycle
  - [ ] Read `PORT` and DB path from env
  - [ ] Graceful shutdown closing Prisma on SIGTERM/SIGINT
  - [ ] Add `.env.example`

- [ ] Coverage gaps
  - [ ] Implement Tenants routes fully
  - [ ] Fill missing resources to match `openapi.yaml`

- [ ] Testing
  - [ ] Supertest E2E for shape, sorting, filtering, and error cases
  - [ ] CI job to run seeding + tests

- [ ] Seeding ergonomics
  - [ ] Keep CSV-first seed; add `/__reset` dev-only reload endpoint
  - [ ] Parameterize dataset via env (sizes, locale)

- [ ] Consistency
  - [ ] Normalize route naming and default ordering
  - [ ] Standardize date formats to ISO 8601

- [ ] Security (even for mocks)
  - [ ] Sanitize inputs
  - [ ] Restrict CORS via env
  - [ ] Toggle to simulate rate limiting

---

# Backend Migration — NestJS API

- [ ] Scaffold NestJS app in `apps/api`
  - [ ] Nest CLI minimal project with `@nestjs/cli`
  - [ ] Add `dev`, `build`, `start:dev` scripts via Turborepo
- [ ] Prisma integration
  - [ ] Share Prisma schema or mirror models
  - [ ] Add PrismaModule and service lifecycle
- [ ] OpenAPI-first
  - [ ] Import `docs/API/openapi.yaml` and validate routes (nestjs-zod/openapi)
  - [ ] Generate DTOs/types from OpenAPI
- [ ] Modules for domains (Students, Fees, Exams, Admissions, HR, Tenants)
  - [ ] Controllers → Services → Repos
  - [ ] DTO validation (class-validator)
  - [ ] Pagination/sorting/filtering utilities
- [ ] Auth (stub for mock), tenancy scoping guards
- [ ] Error handling
  - [ ] Global exception filter to RFC7807 Problem+JSON
- [ ] Observability
  - [ ] Health check, pino logger, request IDs
- [ ] Testing
  - [ ] Jest + Supertest E2E for key modules
