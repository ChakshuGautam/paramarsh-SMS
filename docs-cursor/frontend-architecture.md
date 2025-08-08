# Frontend Architecture — Next.js + shadcn/ui + TanStack

## Structure
```
app/
  (auth)/       # auth routes
  (dashboard)/  # role-based dashboards
  api/          # Next route handlers only where needed
  layout.tsx
  page.tsx
components/
  ui/           # shadcn generated components
  table/        # TanStack Table wrappers
  forms/        # RHF + Zod wrappers
lib/
  api-client/   # typed fetchers aligned to OpenAPI
  auth/
  rbac/
  query/        # TanStack Query setup
styles/
```

## UI
- Use shadcn/ui primitives for inputs, dialogs, toasts, drawers
- Table pattern: TanStack headless core + reusable `DataTable` with column defs, sorting, filtering, pagination, selection, toolbar slots

## Data Layer
- `fetchJson` with interceptors (auth headers, error normalization)
- TanStack Query for caching, retries, invalidation keys per module

## Forms
- React Hook Form + Zod schemas colocated; shadcn `Form`, `Input`, `Select` controls

## Access Control
- Middleware for route protection; client hooks for role/tenant; component-level guard wrappers

## Performance
- Server Components where possible; client components for interactive lists/tables/forms
- ISR/SSR policies per page; skeletons for loading states

## RBAC in FE
- Clerk session holds roles/tenant; usePermission hook gates UI
- All data security enforced server-side; FE gating is UX only
- /me endpoint hydrates derived claims (taughtSectionIds, ownedStudentIds)

