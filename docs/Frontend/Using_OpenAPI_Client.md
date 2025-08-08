# API Client in Next.js with React Query

This guide shows how to generate a typed API client from OpenAPI and consume it with React Query in a Next.js (App Router) app using ShadCN/UI.

1) Generate the client
- Install openapi-typescript-codegen (or Orval)
  - pnpm add -D openapi-typescript-codegen
- Add a script to package.json (example):
  "scripts": {
    "gen:api": "openapi --input docs/API/openapi.yaml --output src/lib/api-client --client fetch"
  }
- Run: pnpm gen:api

2) Configure fetch base and auth
- In src/lib/api-client/core/ApiConfig.ts (or generated config), set base URL to /api/v1 and plug in bearer token from cookies/session.

3) Create React Query hooks
- Example: src/lib/query/students.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { StudentsService, type Student } from '@/lib/api-client'

const qk = {
  students: (params?: any) => ['students', params] as const,
}

export function useStudentsList(params?: { classId?: string; sectionId?: string }) {
  return useQuery({
    queryKey: qk.students(params),
    queryFn: () => StudentsService.getStudents(params),
  })
}

export function useCreateStudent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Student) => StudentsService.postStudents(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.students(undefined) }),
  })
}

4) Use with ShadCN + TanStack Table
- In a table component, wire data from useStudentsList and columns with TanStack Table; use ShadCN table primitives for styling.

5) SSR/ISR considerations
- Prefer client components for interactive lists. For SSR data (read-only pages), use server actions or fetch in server components and hydrate.

6) Error handling
- Normalize API errors (RFC7807/problem+json) in a fetch wrapper; show ShadCN Toast on mutation errors.

7) Auth
- If using NextAuth/OIDC, attach access token in a fetch interceptor; refresh tokens with route handlers as needed.

