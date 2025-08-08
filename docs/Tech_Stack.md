# Tech Stack Overview

Version: 1.0
Status: Draft

Frontend
- Framework: Next.js (App Router), TypeScript, ESLint/Prettier
- UI: ShadCN/UI (Radix + TailwindCSS), TailwindCSS
- Data: React Query (TanStack Query), TanStack Table (headless data grid)
- Forms: React Hook Form + Zod
- i18n: i18next
- Charts: Recharts/Chart.js (configurable)

Backend
- Framework: NestJS (TypeScript)
- DB: PostgreSQL + Prisma/TypeORM (finalize preference), Redis (cache/queues)
- Messaging: BullMQ / NestJS Queues (for async jobs)
- Auth: JWT (OAuth2/OIDC provider integration), RBAC middleware/guards
- Files: S3-compatible storage
- Search: OpenSearch/Elasticsearch (optional)

Testing
- Unit/Integration: Jest (frontend and backend)
- E2E/UI: Cypress (E2E + Component Testing)
- Load: k6/Gatling
- Lint/Format: ESLint, Prettier

Tooling
- Monorepo optional (pnpm workspaces / Nx)
- CI: GitHub Actions with matrix (frontend/backend)
- Container: Docker Compose for local dev (next, nest, postgres, redis)

Conventions
- Typesafe APIs: OpenAPI → typed client generation (or tRPC alternative if chosen later)
- Error handling: RFC7807 problem+json
- Logging: Pino (backend), console with tagging (frontend)

