# Backend Architecture — NestJS

## Structure
```
src/
  main.ts
  app.module.ts
  common/
    guards/ (RBAC/ABAC)
    pipes/  (validation)
    interceptors/ (logging, transform)
    filters/ (exceptions)
  modules/
    students/
    attendance/
    exams/
    fees/
    admissions/
    timetable/
    hr/
    transport/
    library/
    hostel/
    comms/
    analytics/
    inventory/
    tenants/
  prisma/ (or typeorm)  
```

## Patterns
- Controllers → Services → Repos; DTOs with class-validator
- Guards for auth/roles; CASL (optional) for ABAC
- Config module; Env validation
- OpenAPI via `@nestjs/swagger` generated from decorators to align with `docs-cursor/api/openapi.yaml`

## Testing
- Unit: Jest with testing module
- E2E: Nest testing + Supertest (spin up app with in-memory DB or test container)
