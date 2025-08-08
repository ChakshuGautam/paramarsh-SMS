# Test Plan & Quality Strategy

Version: 1.0
Status: Draft

Test Levels
- Unit tests (Jest):
  - Frontend: React components (ShadCN), hooks, utilities with @testing-library/react.
  - Backend (NestJS): services, controllers, guards, pipes, interceptors with testing module.
- Integration tests (Jest):
  - Backend: NestJS e2e with supertest; API endpoints with real DB (test schema) and mocked externals.
- Component tests (Cypress Component Testing):
  - Key ShadCN + TanStack Table components in isolation.
- E2E tests (Cypress):
  - Critical user journeys with seeded data and API fixtures; run against Next.js + NestJS test env.
- Performance: k6/Gatling for hot paths (directory, attendance, invoices, results compute).
- Security: SAST/DAST, dependency scanning, secrets scanning, penetration testing.
- Accessibility: Automated (axe) + manual keyboard/screen reader checks.

Test Scenarios (samples)
- Admissions: submit application with missing required -> error; payment webhook retries -> idempotent.
- SIS: promote students across sessions; transfer out -> TC generated and archived.
- Attendance: offline marking -> sync conflict resolution.
- Academics: timetable conflict detection; gradebook boundary validations.
- Exams: moderation deltas recorded; re-eval workflow.
- Fees: partial payments; overdue interest accrual; reconciliation mismatch resolution.
- Communication: rate limiting; fallback providers; opt-out honoring.
- Transport: overcapacity route assignment blocked; GPS ping ingestion at scale.
- Library: multiple copies circulation; fine capping policy.

Environments
- Dev, Staging, Prod; seed scripts; fixture libraries; data anonymization for staging.
- Frontend: Next.js App Router; storybook optional for visual QA.
- Backend: NestJS application with test module; PostgreSQL test DB with migrations.

Release Gates
- Coverage: Jest 80% statements/branches/lines minimum per package.
- E2E: Cypress green on smoke suite; Lighthouse PWA/a11y/perf budgets.
- Perf: p95 latency checks; DB migration rollback plan tested.
- Security: SAST/DAST clear; dependency audit zero criticals.

Observability in Tests
- Correlation IDs asserted; logs for key flows; metrics emitted on success/failure.
- Cypress dashboard artifacts saved (screenshots/videos) for failures.

