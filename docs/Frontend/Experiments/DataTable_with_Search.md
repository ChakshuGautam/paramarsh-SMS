# DataTable with Search (ShadCN + TanStack Table + React Query)

Goal
- A reusable DataTable component that supports server-side pagination, sorting, and a global search box. Uses ShadCN Table primitives, TanStack Table core, and React Query for data.

Assumptions
- Next.js App Router, ShadCN installed, React Query provider set up, Tailwind configured.

Component: components/table/DataTable.tsx

```tsx
import * as React from "react"
import { useMemo } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  total: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onSortChange?: (sort: string | undefined) => void
  onSearch?: (q: string) => void
  defaultSearch?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  total,
  page,
  pageSize,
  onPageChange,
  onSortChange,
  onSearch,
  defaultSearch,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [q, setQ] = React.useState(defaultSearch ?? "")

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater
      setSorting(next)
      const sort = next.map((s) => `${s.id}${s.desc ? ":desc" : ""}`).join(",")
      onSortChange?.(sort || undefined)
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: true,
  })

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize])

  return (
    <div className="space-y-3">
      {onSearch && (
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSearch(q)
            }}
            className="max-w-sm"
          />
          <Button onClick={() => onSearch(q)}>Search</Button>
        </div>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="cursor-pointer select-none" onClick={header.column.getToggleSortingHandler()}>
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center gap-1">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{ asc: "▲", desc: "▼" }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between text-sm">
        <div>
          Page {page} of {totalPages} • {total} items
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            Prev
          </Button>
          <Button variant="outline" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
```

Example usage: app/(experiments)/students/page.tsx

```tsx
'use client'
import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/table/DataTable'
import { useQuery } from '@tanstack/react-query'

interface Student { id: string; admissionNo: string; firstName: string; lastName: string }

async function fetchStudents({ page, pageSize, sort, q }: { page: number; pageSize: number; sort?: string; q?: string }) {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
  if (sort) params.set('sort', sort)
  if (q) params.set('q', q)
  const res = await fetch(`/api/experiments/students?${params.toString()}`)
  return res.json() as Promise<{ data: Student[]; total: number }>
}

export default function StudentsPage() {
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<string | undefined>()
  const [q, setQ] = useState<string | undefined>()
  const pageSize = 10

  const { data } = useQuery({
    queryKey: ['exp-students', page, pageSize, sort, q],
    queryFn: () => fetchStudents({ page, pageSize, sort, q }),
  })

  const columns: ColumnDef<Student>[] = [
    { accessorKey: 'admissionNo', header: 'Adm No' },
    { accessorKey: 'firstName', header: 'First Name' },
    { accessorKey: 'lastName', header: 'Last Name' },
  ]

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Students</h1>
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onSortChange={setSort}
        onSearch={(value) => { setPage(1); setQ(value || undefined) }}
      />
    </div>
  )
}
```

Testing (Jest + React Testing Library)

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { DataTable } from './DataTable'

it('renders rows and supports search click', () => {
  const onSearch = vi.fn()
  render(
    <DataTable
      columns={[{ accessorKey: 'name', header: 'Name' }]}
      data={[{ name: 'Alice' }]}
      total={1}
      page={1}
      pageSize={10}
      onPageChange={() => {}}
      onSearch={onSearch}
    />
  )
  fireEvent.click(screen.getByRole('button', { name: /search/i }))
  expect(onSearch).toHaveBeenCalled()
})
```

