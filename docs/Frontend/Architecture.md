# Frontend Architecture (Next.js + ShadCN + TanStack)

Version: 1.0
Status: Draft

Structure
- Next.js App Router with routes grouped per module (admissions, students, academics, exams, fees, comm, reports, transport, library).
- UI components: shadcn/ui with tailwind; shared components in ui/; feature components under each route.
- Data access: React Query hooks per resource (useStudents, useInvoices, useAttendance); query keys normalized.
- Tables: TanStack Table composed with ShadCN Table primitives; server-side pagination/sort/filter.
- Forms: React Hook Form with Zod schemas colocated with components (schema.ts).
- State: React Query for server state; minimal local state via useState/useReducer.
- Auth: NextAuth (if using OIDC) or custom JWT; protected routes using middleware and server actions.

Patterns
- Suspense-ready data fetching (use server components where feasible, client components for interactions).
- Optimistic updates for non-critical mutations (homework submit, attendance mark) with rollback on error.
- Infinite scroll for large lists (directory) or classic pagination with page size 50.

Performance
- Code-splitting per route; memoization; virtualization for large tables (react-virtual).
- Image optimization; prefetch on hover for common navigations.

Accessibility
- ShadCN/Radix primitives ensure focus management; test keyboard flows; aria-labels on table controls.

Testing
- Jest + RTL for components/hooks; Cypress component tests for complex tables; Cypress E2E for flows.

