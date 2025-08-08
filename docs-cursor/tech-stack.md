# Technology Stack — Paramarsh SMS

## Frontend
- Framework: Next.js (App Router)
- UI: shadcn/ui (Radix + Tailwind CSS)
- Tables: TanStack Table (headless) with custom shadcn table components
- Data Fetching/Cache: TanStack Query
- Forms/Validation: React Hook Form + Zod
- Charts: Recharts (or Visx)
- Internationalization: next-intl (optional)
- Auth: NextAuth.js (OIDC) or custom OIDC client for SSO

## Backend
- Framework: NestJS (modular architecture)
- API: REST (OpenAPI-first)
- Auth: Passport (OIDC/JWT), RBAC/ABAC guards
- DB: PostgreSQL; ORM: Prisma (or TypeORM)
- Cache/Queues: Redis
- Storage: S3-compatible object storage
- Observability: OpenTelemetry + structured logs

## Testing
- Unit: Jest (frontend and backend)
- E2E (web): Cypress
- API E2E: Jest + Supertest

## Tooling & Quality
- ESLint + Prettier; commitlint + husky
- CI: GitHub Actions (lint, test, build, typecheck)
- Storybook (optional) for UI components
