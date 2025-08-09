# Sidebar (ShadCN + Next.js)

Goal
- A responsive, collapsible sidebar with role-aware items. Uses ShadCN components and Tailwind.

Component: components/nav/Sidebar.tsx

```tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type NavItem = { href: string; label: string; roles?: string[] }

export function Sidebar({ items, role }: { items: NavItem[]; role: string }) {
  const pathname = usePathname()
  return (
    aside className="w-64 border-r bg-background p-2 hidden md:block">
      <nav className="space-y-1">
        {items
          .filter((i) => !i.roles || i.roles.includes(role))
          .map((i) => (
            <Link key={i.href} href={i.href} className="block">
              <Button variant={pathname.startsWith(i.href) ? 'secondary' : 'ghost'} className={cn('w-full justify-start')}>
                {i.label}
              </Button>
            </Link>
          ))}
      </nav>
    </aside>
  )
}
```

Usage
```tsx
<Sidebar role="Admin" items={[
  { href: '/students', label: 'Students' },
  { href: '/attendance', label: 'Attendance', roles: ['Teacher','Admin'] },
]} />
```

