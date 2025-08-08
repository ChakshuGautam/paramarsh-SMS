# QA Test Plan — Paramarsh SMS

## Strategy
- Unit, Integration, E2E; smoke and regression per release

## Environments
- Staging mirrors production configs; seeded data sets

## Test Areas
- Functional by module; Permissions; Performance; Security; Accessibility

## Automation
- API tests (Postman/newman or Playwright)
- UI E2E (Playwright/Cypress); visual snapshots

## Entry/Exit Criteria
- Entry: features dev-complete with test data
- Exit: critical bugs = 0; major bugs ≤ 2 with workarounds
