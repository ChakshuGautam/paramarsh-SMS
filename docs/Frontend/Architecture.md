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

API client codegen (OpenAPI-first)

- Source of truth: `docs/API/openapi.yaml`
- Use `openapi-typescript` to generate types and a lightweight client wrapper.

Generate types

```bash
npx openapi-typescript ./docs/API/openapi.yaml -o ./frontend/lib/api/types.ts --export-type
```

Client wrapper example

```ts
// frontend/lib/api/client.ts
import { paths } from "./types";

type Fetch = typeof fetch;

export class ApiClient {
  constructor(private baseUrl: string, private fetchImpl: Fetch = fetch) {}

  private async request<T>(url: string, init: RequestInit = {}): Promise<T> {
    const res = await this.fetchImpl(`${this.baseUrl}${url}`, init);
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return (await res.json()) as T;
  }

  listStudents(params?: {
    page?: number;
    pageSize?: number;
    sort?: string;
    sectionId?: string;
  }) {
    const sp = new URLSearchParams();
    if (params)
      Object.entries(params).forEach(([k, v]) =>
        v !== undefined ? sp.set(k, String(v)) : undefined
      );
    const qs = sp.toString() ? `?${sp.toString()}` : "";
    return this.request<
      paths["/students"]["get"]["responses"]["200"]["content"]["application/json"]
    >(`/students${qs}`);
  }
}
```
