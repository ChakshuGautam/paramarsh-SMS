# Navbar (ShadCN + Command Palette + Tenant Switcher)

Goal
- A top navigation bar with tenant switcher, command palette (ShadCN Command), and notifications bell.

Component: components/nav/Navbar.tsx

```tsx
'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Command, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export function Navbar({ tenants, currentTenant, onTenantChange }:{ tenants: {id:string; name:string}[]; currentTenant:string; onTenantChange:(id:string)= void }) {
  const [open, setOpen] = useState(false)
  return (
    header className="sticky top-0 z-40 w-full border-b bg-background"
      div className="flex h-12 items-center gap-2 px-4"
        Popover open={open} onOpenChange={setOpen}
          PopoverTrigger asChild
            Button variant="outline" size="sm"{tenants.find(t= t.id===currentTenant)?.name || 'Select Tenant'}/Button
          /PopoverTrigger
          PopoverContent className="p-0" align="start"
            Command
              CommandInput placeholder="Search tenant..." /
              CommandList
                {tenants.map(t= (
                  CommandItem key={t.id} onSelect={()= { onTenantChange(t.id); setOpen(false) }}{t.name}/CommandItem
                ))}
              /CommandList
            /Command
          /PopoverContent
        /Popover
        div className="ml-auto flex items-center gap-2"
          CommandDemo /
          Button variant="ghost" size="icon" aria-label="Notifications"🔔/Button
        /div
      /div
    /header
  )
}

function CommandDemo() {
  const [open, setOpen] = useState(false)
  return (
    Popover open={open} onOpenChange={setOpen}
      PopoverTrigger asChild
        Button variant="ghost" size="sm"⌘K/Button
      /PopoverTrigger
      PopoverContent className="p-0" align="end"
        Command
          CommandInput placeholder="Type a command or search..." /
          CommandList
            CommandItem onSelect={()= setOpen(false)}Go to Students/CommandItem
            CommandItem onSelect={()= setOpen(false)}Go to Fees/CommandItem
          /CommandList
        /Command
      /PopoverContent
    /Popover
  )
}
```

Testing tips
- RTL: assert tenant popover opens and onTenantChange invoked on select.
- E2E: Cypress to validate command palette and navigation shortcuts.

