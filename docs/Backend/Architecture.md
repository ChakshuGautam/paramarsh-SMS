# Backend Architecture (NestJS)

Version: 1.0
Status: Draft

Structure
- NestJS modular structure: apps/core, apps/sis, apps/academics, apps/exams, apps/finance, apps/communication, apps/reporting, apps/integration (or as modules in one app to start).
- Layers: Controllers -> Services -> Repositories (Prisma/TypeORM) -> DB.
- Cross-cutting: Interceptors (logging, caching), Guards (authz), Pipes (validation with Zod/class-validator), Filters (exceptions).

API
- REST controllers aligned with docs/API/openapi.yaml; versioned at /api/v1.
- DTOs generated from OpenAPI schemas where possible; ensure validation and transformation.

Auth
- JWT access + refresh tokens; role guards with RBAC; optional SSO via OAuth/OIDC.

Async
- BullMQ queues for heavy jobs (reports, result compute, reconciliation); workers with retry/backoff.

Data
- PostgreSQL; migrations; seed scripts; partition large tables by branch/session when needed.

Observability
- Pino logger; OpenTelemetry traces; metrics via Prometheus; healthchecks at /health.

Testing
- Jest unit (services/controllers), e2e with supertest using in-memory or test DB.

