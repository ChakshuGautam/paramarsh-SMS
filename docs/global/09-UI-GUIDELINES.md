# UI Guidelines

## 🎨 Overview

Paramarsh SMS uses a strict, consistent UI approach based on React Admin with shadcn/ui components. This ensures a unified, accessible, and maintainable user interface across the entire application.

## ⚠️ Critical Rules

### ✅ ALLOWED UI Libraries
```typescript
// ONLY these are allowed:
import { Button } from "@/components/ui/button"        // shadcn/ui
import { List, Create, Edit } from "@/components/admin" // React Admin
import { Calendar, User } from "lucide-react"          // Icons
```

### ❌ FORBIDDEN UI Libraries
```typescript
// NEVER use these:
import { Button } from "@mui/material"     // NO Material-UI
import { Button } from "antd"               // NO Ant Design  
import { Button } from "@chakra-ui/react"   // NO Chakra UI
import { Button } from "react-bootstrap"    // NO Bootstrap
```

**Violation of this rule = Automatic implementation failure**

## 🏗️ Component Architecture

### Directory Structure
```
apps/web/
├── app/
│   ├── admin/
│   │   ├── resources/          # Resource components
│   │   │   ├── students/
│   │   │   │   ├── List.tsx   # List view
│   │   │   │   ├── Create.tsx # Create form
│   │   │   │   ├── Edit.tsx   # Edit form
│   │   │   │   └── Show.tsx   # Detail view
│   │   │   └── ...
│   │   └── Admin.tsx           # Admin configuration
│   └── layout.tsx              # Root layout
│
├── components/
│   ├── ui/                     # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   └── admin/                  # React Admin wrappers
│       ├── DataTable.tsx
│       ├── List.tsx
│       └── ...
└── lib/
    └── utils.ts                # Utility functions
```

## 📋 List Components

### Standard List Pattern
```tsx
"use client";

import { List, DataTable, Count } from "@/components/admin";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const StudentsList = () => (
  <List
    filters={studentFilters}
    sort={{ field: 'firstName', order: 'ASC' }}
    perPage={10}
  >
    <TabbedDataTable />
  </List>
);

const TabbedDataTable = () => {
  return (
    <Tabs defaultValue="active">
      <TabsList>
        <TabsTrigger value="active">
          Active
          <Badge className="ml-2">
            <Count filter={{ status: "active" }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="inactive">
          Inactive
          <Badge className="ml-2">
            <Count filter={{ status: "inactive" }} />
          </Badge>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="active">
        <StudentsTable />
      </TabsContent>
      <TabsContent value="inactive">
        <StudentsTable />
      </TabsContent>
    </Tabs>
  );
};

const StudentsTable = () => (
  <DataTable>
    <DataTable.Col source="admissionNo" label="Admission No" />
    <DataTable.Col source="firstName" label="First Name" />
    <DataTable.Col source="lastName" label="Last Name" />
    <DataTable.Col source="status" label="Status">
      <StatusBadge />
    </DataTable.Col>
  </DataTable>
);
```

### DataTable Features
```tsx
// Column types
<DataTable.Col source="name" />                    // Text column
<DataTable.NumberCol source="amount" />            // Number column
<DataTable.DateCol source="createdAt" />           // Date column
<DataTable.BooleanCol source="isActive" />         // Boolean column

// Column customization
<DataTable.Col 
  source="status" 
  label="Status"
  sortable={true}
  className="hidden md:table-cell"  // Responsive hiding
>
  <CustomComponent />
</DataTable.Col>

// Row styling
<DataTable 
  rowClassName={(record) => 
    record.status === 'active' ? 'bg-green-50' : 'bg-gray-50'
  }
>
```

## 📝 Form Components

### Create Form Pattern
```tsx
"use client";

import { Create, SimpleForm, TextInput, NumberInput } from "@/components/admin";
import { ReferenceInput, AutocompleteInput } from "@/components/admin";

export const StudentsCreate = () => (
  <Create>
    <SimpleForm>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput 
          source="firstName" 
          label="First Name" 
          required 
        />
        <TextInput 
          source="lastName" 
          label="Last Name" 
          required 
        />
      </div>
      
      <ReferenceInput 
        source="classId" 
        reference="classes"
        label="Class"
      >
        <AutocompleteInput 
          optionText="name"
          placeholder="Select a class"
        />
      </ReferenceInput>
      
      <NumberInput 
        source="age" 
        label="Age"
        min={3}
        max={25}
      />
    </SimpleForm>
  </Create>
);
```

### Edit Form Pattern
```tsx
export const StudentsEdit = () => (
  <Edit>
    <SimpleForm>
      {/* Same fields as Create */}
      <TextInput source="id" disabled />
      {/* ... other fields */}
    </SimpleForm>
  </Edit>
);
```

### Form Validation
```tsx
// Client-side validation
<TextInput 
  source="email"
  validate={[required(), email()]}
/>

// Custom validation
const validateAge = (value) => {
  if (value < 3 || value > 25) {
    return 'Age must be between 3 and 25';
  }
  return undefined;
};

<NumberInput 
  source="age"
  validate={validateAge}
/>
```

## 🎯 UI Components (shadcn/ui)

### Buttons
```tsx
import { Button } from "@/components/ui/button";

// Variants
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><User /></Button>
```

### Cards
```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Student Information</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### Badges
```tsx
import { Badge } from "@/components/ui/badge";

// Status badges
<Badge variant="default">Active</Badge>
<Badge variant="secondary">Inactive</Badge>
<Badge variant="destructive">Deleted</Badge>
<Badge variant="outline">Draft</Badge>

// Custom colors
<Badge className="bg-green-100 text-green-800">Paid</Badge>
<Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
```

### Dialogs
```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm Action</DialogTitle>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```

## 🎨 Styling Guidelines

### Color Palette
```css
/* Status Colors */
--success: green-500
--warning: yellow-500
--error: red-500
--info: blue-500

/* Semantic Colors */
--active: green-100/green-800
--inactive: gray-100/gray-800
--pending: yellow-100/yellow-800
--completed: blue-100/blue-800
```

### Spacing System
```tsx
// Use Tailwind spacing classes
<div className="p-4">        // padding: 1rem
<div className="mt-2">       // margin-top: 0.5rem
<div className="space-y-4">   // vertical spacing
<div className="gap-6">       // grid/flex gap
```

### Typography
```tsx
// Headings
<h1 className="text-2xl font-bold">Page Title</h1>
<h2 className="text-xl font-semibold">Section Title</h2>
<h3 className="text-lg font-medium">Subsection</h3>

// Body text
<p className="text-base">Regular text</p>
<p className="text-sm text-muted-foreground">Secondary text</p>
<p className="text-xs">Small text</p>
```

### Responsive Design
```tsx
// Mobile-first approach
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* Responsive grid */}
</div>

// Hide on mobile
<div className="hidden md:block">
  {/* Desktop only */}
</div>

// Show on mobile only
<div className="block md:hidden">
  {/* Mobile only */}
</div>
```

## 🔧 Custom Components

### Status Badge Component
```tsx
const StatusBadge = ({ status }: { status: string }) => {
  const variants = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800',
  };
  
  return (
    <Badge className={variants[status] || variants.inactive}>
      {status}
    </Badge>
  );
};
```

### Empty State Component
```tsx
const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <FileX className="w-12 h-12 text-muted-foreground mb-4" />
    <p className="text-muted-foreground">{message}</p>
  </div>
);
```

### Loading State Component
```tsx
const LoadingState = () => (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);
```

## 🎭 Icons

### Using Lucide Icons
```tsx
import { 
  User, 
  Calendar, 
  Search, 
  ChevronRight,
  Check,
  X 
} from "lucide-react";

// In components
<Button>
  <User className="w-4 h-4 mr-2" />
  Profile
</Button>

// Icon-only button
<Button size="icon" variant="ghost">
  <Search className="w-4 h-4" />
</Button>
```

### Icon Guidelines
- Use size classes: `w-4 h-4` (small), `w-5 h-5` (medium), `w-6 h-6` (large)
- Add spacing with margin classes when used with text
- Use `text-muted-foreground` for secondary icons
- Maintain consistent icon usage across the app

## 📱 Mobile Responsiveness

### Mobile-First Approach
```tsx
// Start with mobile layout, enhance for desktop
<div className="
  flex flex-col        // Mobile: vertical
  md:flex-row         // Desktop: horizontal
  gap-4
">
```

### Touch-Friendly Targets
```tsx
// Minimum 44x44px touch targets
<Button className="min-h-[44px] min-w-[44px]">
  Tap Me
</Button>
```

### Mobile Navigation
```tsx
// Drawer for mobile, sidebar for desktop
<Sheet>
  <SheetTrigger className="md:hidden">
    <Menu />
  </SheetTrigger>
  <SheetContent>
    {/* Mobile menu */}
  </SheetContent>
</Sheet>
```

## ♿ Accessibility

### ARIA Labels
```tsx
<Button aria-label="Delete student">
  <Trash className="w-4 h-4" />
</Button>

<Input 
  aria-label="Search students"
  placeholder="Search..."
/>
```

### Keyboard Navigation
```tsx
// Ensure all interactive elements are keyboard accessible
<div 
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
```

### Focus Management
```tsx
// Visible focus indicators
<Button className="focus:ring-2 focus:ring-primary focus:ring-offset-2">
  Click Me
</Button>
```

## 🚨 Common Mistakes to Avoid

### ❌ Wrong: Using MUI
```tsx
// NEVER DO THIS
import { Button } from '@mui/material';
```

### ✅ Correct: Using shadcn/ui
```tsx
// ALWAYS DO THIS
import { Button } from '@/components/ui/button';
```

### ❌ Wrong: Inline styles
```tsx
// Avoid
<div style={{ padding: '10px', margin: '5px' }}>
```

### ✅ Correct: Tailwind classes
```tsx
// Prefer
<div className="p-2.5 m-1.5">
```

### ❌ Wrong: Custom CSS files
```tsx
// Avoid
import './custom-styles.css';
```

### ✅ Correct: Tailwind utilities
```tsx
// Prefer
<div className="custom-class-using-tailwind">
```

## ✅ UI Checklist

Before submitting any UI component:

- [ ] Uses only shadcn/ui components
- [ ] No MUI/Ant Design imports
- [ ] Follows React Admin patterns for resources
- [ ] Mobile responsive
- [ ] Keyboard accessible
- [ ] Has loading states
- [ ] Has empty states
- [ ] Has error states
- [ ] Uses consistent spacing
- [ ] Uses consistent colors
- [ ] Includes proper ARIA labels
- [ ] Tested on mobile devices

## 📚 References

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [React Admin Documentation](https://marmelab.com/react-admin/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)