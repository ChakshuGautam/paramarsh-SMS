# System Architecture — Paramarsh SMS

## System Context
- Multi-tenant SaaS for K-12 schools. Tenants are schools or groups.
- Web (admin/teacher) and mobile (teacher/student/parent) clients.
- Core services: Authentication/SSO, SIS, Attendance, Exams, Fees, HR/Payroll, Timetable, Transport, Library, Communications, Analytics.
- Integrations: Payments (Razorpay/Stripe), SMS/Email/Push, SSO (Google/Microsoft), RFID/Biometrics, GPS, Accounting (Tally/QuickBooks).

```mermaid
graph TD
  subgraph Clients
    A[Admin Web]-->|OIDC| Auth
    T[Teacher Web/Mobile]-->|OIDC| Auth
    P[Parent/Student App]-->|OIDC| Auth
  end
  Auth[Auth/SSO]
  API[API Gateway]
  SIS[SIS Service]
  ATT[Attendance Service]
  EXM[Exams Service]
  FEE[Fees Service]
  HR[HR/Payroll Service]
  TTB[Timetable Service]
  TRN[Transport Service]
  LIB[Library Service]
  COM[Comms Service]
  ANA[Analytics/Reporting]
  MQ[(Event Bus)]
  OBJ[(Object Storage)]
  DB[(Tenant DBs)]
  EXT[Integrations]

  Auth-->API
  API-->SIS
  API-->ATT
  API-->EXM
  API-->FEE
  API-->HR
  API-->TTB
  API-->TRN
  API-->LIB
  API-->COM
  SIS-->DB
  ATT-->DB
  EXM-->DB
  FEE-->DB
  HR-->DB
  TTB-->DB
  TRN-->DB
  LIB-->DB
  COM-->DB
  SIS-->|events|MQ
  ATT-->|events|MQ
  FEE-->|events|MQ
  MQ-->|ETL|ANA
  ANA-->OBJ
  API-->|webhooks|EXT
```

## Deployment
- Containerized microservices behind an API Gateway and WAF; per-tenant schema sharding.
- Managed Postgres cluster; Redis for cache/queues; S3-compatible object storage.
- Observability: logs, metrics, traces via centralized stack.

## Security
- Zero trust between services with mTLS; secrets in vault; short-lived tokens; least privilege.

## Data Ownership & Residency
- Tenant isolation enforced at DB and application layers; regional deployments for EU/India.
