# Multi-tenant Strategy (Single-DB, Shared-Schema)

Version: 1.0
Status: Draft

Overview
- All schools (tenants) share a single logical database and a shared schema. Tenant isolation is enforced at the application layer (NestJS guards/repositories) and optionally at the database layer via Row-Level Security (if using Postgres).
- Hierarchy: org (group) → branch (school/campus) → academic_session → class → section.

Key Principles
- Every multi-tenant table includes a tenant scope column (org_id or branch_id as appropriate) and uses composite unique constraints with the scope.
- All queries must include tenant scope predicates; write paths validate scope on input DTOs.
- Authorization combines RBAC (role/permission) with tenant scope filtering (org/branch/section).
- Cross-tenant data is prohibited in app code; cross-branch within an org is allowed only for authorized roles (e.g., group principals) using explicit filters.

Database Design
- Scope columns:
  - org-scoped tables (users, roles, permissions, templates): column org_id
  - branch-scoped tables (students, attendance, exams, invoices): column branch_id
  - session-scoped data includes academic_session_id where relevant
- Indexing:
  - Always index by scope column(s) + primary key (e.g., (branch_id, id))
  - For hot queries add compound indexes (branch_id, foreign_key), (branch_id, date), etc.
- Constraints:
  - Composite uniqueness within scope (e.g., UNIQUE(branch_id, admission_no))
  - Foreign keys must include matching scope where applicable (enforced in app and via triggers if needed)
- Partitioning (optional, later):
  - Partition large tables by branch_id or academic_session_id for performance and maintenance

Application Enforcement (NestJS)
- Request context middleware extracts tenant context from JWT (org_id, branch_ids) and request headers (e.g., X-Org-Id, X-Branch-Id) where appropriate.
- Guards enforce permissions and scope (RBAC + scope) before controller logic.
- Repository layer automatically injects scope predicates:
  - Example: findMany({ where: { branch_id: ctx.branch_id, ...filters } })
- DTO validation ensures scope fields match context (no cross-tenant spoofing).

Row-Level Security (optional, Postgres)
- Enable RLS on branch-scoped tables with policies like:
  - USING (branch_id = current_setting('app.branch_id')::uuid)
- Set app.branch_id (and app.org_id) per connection via SET LOCAL in a request-scoped transaction; or use PgBouncer session variables carefully.
- Keep application checks even with RLS (defense-in-depth).

API Design Considerations
- All endpoints operate within a tenant scope; mandatory query/path params include identifiers that imply scope (e.g., branch_id) or scope is resolved from auth context.
- List endpoints require scope filters server-side; clients may not override scope outside of permitted IDs.
- Multi-branch roles: support an array of branch_ids in claims; APIs accept branch_id to select scope among allowed IDs.

Sharding and Growth
- Start with single DB; prepare for:
  - Read replicas (read-heavy endpoints)
  - Partitioning high-volume tables
  - Future org-level sharding (move large orgs to separate DBs) with the same schema; keep tenant_id stable across shards.

Operational Concerns
- Backups include entire DB; restore supports org/branch-level logical export/import when possible (data export endpoints + ETL).
- Migrations must be backward compatible and consider large multi-tenant datasets; use transactional migrations.

Security and Privacy
- PII masked in logs; audit logs include scope fields.
- Rate limits per tenant.
- Data export honors scope and is audited.

Examples
- Students table key columns: id (uuid), branch_id (uuid), admission_no (string UNIQUE within branch), ...
- Attendance list: GET /attendance/students/{studentId}?from&to resolves branch_id from student → verifies the caller has access to that branch.

References
- Docs: Modules/* for scope and permissions per entity
- API: docs/API/openapi.yaml → ensure every path is scoped implicitly or explicitly

