# Testing Strategy (Jest + Cypress)

Version: 1.0
Status: Draft

Stacks
- Jest for unit/integration across frontend and backend.
- Cypress for E2E and component tests (frontend).

Frontend
- Unit: @testing-library/react for ShadCN/TanStack components and hooks.
- Component: Cypress Component Testing for complex tables and dialogs.
- E2E: Login, admissions funnel, attendance, exams compute/publish, fees payment.

Backend
- Unit: services/controllers/guards with jest-mock.
- Integration/E2E: Nest testing module + supertest against an ephemeral Postgres test DB.

CI
- Parallel jobs for frontend/backend; cache pnpm/node_modules; Cypress dashboard optional.
- Artifacts: coverage, junit, Cypress videos/screenshots.

Quality Gates
- Jest coverage ≥ 80%; ESLint/Prettier clean; typecheck.
- Cypress smoke suite must pass; Lighthouse budgets for PWA/a11y/perf.

