# RBAC/ABAC Design — Paramarsh SMS

## Goals
- Enforce least privilege with simple role-based rules and targeted ABAC conditions
- Multi-tenant isolation across all access paths
- Consistent enforcement on backend; frontend only gates UX

## Roles (base)
- student, parent, teacher, homeroom_teacher, hod, admin, finance, hr, transport_manager, librarian, nurse, counselor, discipline_officer, super_admin

## Resources & Actions (examples)
- attendance: read, mark, import
- students: read, create, update, export
- exams: read, create, update, publish
- fees: read, invoice, collect, refund, reconcile
- timetable: read, generate, substitute
(Full matrix in PRD; modules define their resource verbs explicitly.)

## Attributes (ABAC)
- tenantId (always required), schoolId, sectionId, subjectId, userId, ownedStudentIds (for parents), taughtSectionIds (for teachers), timeWindow, status

## Backend Enforcement (NestJS)
- AuthN: Passport (JWT/OIDC). Token contains `sub`, `tenantId`, `roles[]`. Request context augments with computed claims (e.g., taughtSectionIds)
- AuthZ: Amplication-style stack:
  - Guards: `DefaultAuthGuard` + `ACGuard` (nest-access-control) per route
  - Interceptors: `AclValidateRequestInterceptor` on create/update; `AclFilterResponseInterceptor` on read to strip forbidden fields/records
  - ValidationPipe: `{ whitelist: true, transform: true, forbidNonWhitelisted: true }`
- Policy Store:
  - Code-first `RolesBuilder` for base RBAC
  - Optional tenant overrides from DB; merge at boot into RolesBuilder
- Multi-tenant:
  - Resolve tenant from domain/header; inject `tenantId` into Prisma `where` for all queries
- ABAC Options:
  - For complex conditions (e.g., teacher can mark attendance only for scheduled periods), compute condition DTOs in service and apply to `where`
  - For dynamic row filtering, use response interceptor or query scoping by attributes

### Sample Policy Concepts (pseudocode)
- teacher: attendance.mark if `sectionId in taughtSectionIds` and `periodId in scheduledPeriods`
- parent: students.read if `studentId in ownedStudentIds`
- finance: fees.refund if invoice.status = Paid
- admin: `*` on tenant

### Error & Audit
- Deny → 403 with standardized Error schema; log decision with correlationId, subject, resource, action, reason

### Testing
- Unit: policy allow/deny cases per resource/action
- API E2E: positive/negative role tests per endpoint (Jest + Supertest)

## Frontend Enforcement (Next.js)
- Session via NextAuth OIDC; include `tenantId`, `roles[]`, and minimal claims cache
- Hooks:
  - `usePermission(resource, action, context?)` → returns boolean based on roles/claims (UX only)
  - `withPermission` HOC for components/route segments
- UI Gating:
  - Hide/disable actions (buttons, menu items) when `usePermission` is false
  - Table rows scoped by server filters; client never relies on front-end filtering for security
- Data Fetching:
  - All APIs enforce RBAC; FE passes context (e.g., sectionId) but backend validates

## Claim Resolution
- On login, backend computes derived claims (taughtSectionIds, ownedStudentIds) and exposes a `/me` endpoint for FE to hydrate
- Claims cached client-side and refreshed on role/scope changes

## Migration & Admin UX
- Seed default roles and policies per tenant
- Admin UI to assign roles, manage custom permissions (if enabled), and test access for a user

## Examples
- Attendance: Teacher can `mark` for their scheduled section/period today; parent can `read` their child’s daily status; admin can `import`
- Fees: Finance can `invoice`, `collect`, `refund`; parent can `read` and `pay` own invoices
- Exams: Teacher can `update marks` for own sessions; Admin can `publish`

## Non-Goals
- Full policy language UI at MVP; advanced policy editor can arrive later
