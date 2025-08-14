# SMS Admin Interface Best Practices

This document outlines the best practices for creating and maintaining list views and other admin interfaces in the SMS application. Follow these guidelines when creating new resources or updating existing ones.

## 🎯 Core Principles

1. **Consistency**: All list views should follow the same patterns
2. **Responsiveness**: Every interface must work on mobile and desktop
3. **Performance**: Use proper optimization techniques
4. **Accessibility**: Ensure all users can navigate the interface
5. **Maintainability**: Write reusable, testable components

## 📋 List View Template

When creating a new list view, use this template:

```tsx
"use client";

import { useListContext } from "ra-core";
import {
  DataTable,
  List,
  ReferenceField,
  TextField,
  TextInput,
  ReferenceInput,
  AutocompleteInput,
  Count,
} from "@/components/admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// Define store keys for different tabs/states
const storeKeyByStatus = {
  active: "resourceName.list.active",
  inactive: "resourceName.list.inactive",
  archived: "resourceName.list.archived",
};

// Define label-less filters with placeholders
const filters = [
  <TextInput source="q" placeholder="Search..." label={false} alwaysOn />,
  <ReferenceInput source="reference_id" reference="references">
    <AutocompleteInput placeholder="Filter by reference" label={false} />
  </ReferenceInput>,
];

export const ResourceNameList = () => (
  <List
    sort={{ field: "createdAt", order: "DESC" }}
    filterDefaultValues={{ status: "active" }}
    filters={filters}
    perPage={25}
  >
    <TabbedDataTable />
  </List>
);

const TabbedDataTable = () => {
  const listContext = useListContext();
  const { filterValues, setFilters, displayedFilters } = listContext;
  
  const handleChange = (value: string) => () => {
    setFilters({ ...filterValues, status: value }, displayedFilters);
  };
  
  return (
    <Tabs value={filterValues.status ?? "active"}>
      <TabsList>
        <TabsTrigger value="active" onClick={handleChange("active")}>
          Active
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, status: "active" }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="inactive" onClick={handleChange("inactive")}>
          Inactive
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, status: "inactive" }} />
          </Badge>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="active">
        <ResourceTable storeKey={storeKeyByStatus.active} />
      </TabsContent>
      <TabsContent value="inactive">
        <ResourceTable storeKey={storeKeyByStatus.inactive} />
      </TabsContent>
    </Tabs>
  );
};

const ResourceTable = ({ storeKey }: { storeKey: string }) => (
  <DataTable storeKey={storeKey}>
    {/* Always visible columns */}
    <DataTable.Col source="id" label="ID" />
    <DataTable.Col source="name" label="Name" />
    
    {/* Desktop-only columns */}
    <DataTable.Col source="description" className="hidden md:table-cell" />
    <DataTable.Col source="createdAt" className="hidden lg:table-cell" />
    
    {/* Reference fields */}
    <DataTable.Col source="reference_id" className="hidden md:table-cell">
      <ReferenceField source="reference_id" reference="references">
        <TextField source="name" />
      </ReferenceField>
    </DataTable.Col>
  </DataTable>
);
```

## 🔍 Filter Patterns

### 1. Label-less Filters (Preferred)

```tsx
// ✅ Good - Clean, modern look
<TextInput source="q" placeholder="Search..." label={false} />
<SelectInput source="status" placeholder="Filter by status" label={false} />

// ❌ Avoid - Cluttered with labels
<TextInput source="q" label="Search" />
<SelectInput source="status" label="Filter by Status" />
```

### 2. Reference Filters with Autocomplete

```tsx
// ✅ Good - User-friendly autocomplete
<ReferenceInput source="student_id" reference="students">
  <AutocompleteInput 
    placeholder="Filter by student" 
    label={false}
    optionText={(record) => `${record.firstName} ${record.lastName}`}
  />
</ReferenceInput>

// ❌ Avoid - Basic select without search
<ReferenceInput source="student_id" reference="students">
  <SelectInput />
</ReferenceInput>
```

### 3. Sidebar Filtering for Complex Filters

```tsx
const MyList = () => (
  <div className="flex gap-4">
    <aside className="w-64 hidden lg:block">
      <FilterLiveForm>
        <TextInput source="q" placeholder="Search" label={false} />
        <FilterCategory icon={<Users />} label="Students">
          <ToggleFilterButton label="Active" value={{ status: "active" }} />
          <ToggleFilterButton label="Inactive" value={{ status: "inactive" }} />
        </FilterCategory>
      </FilterLiveForm>
    </aside>
    <div className="flex-1">
      <DataTable>
        {/* columns */}
      </DataTable>
    </div>
  </div>
);
```

## 📱 Responsive Design Patterns

### 1. Column Visibility

```tsx
// Essential info - always visible
<DataTable.Col source="name" />

// Secondary info - hide on mobile
<DataTable.Col source="description" className="hidden md:table-cell" />

// Tertiary info - hide on tablet and mobile
<DataTable.Col source="metadata" className="hidden lg:table-cell" />
```

### 2. Breakpoint Classes

- `sm:` - Small devices (640px+)
- `md:` - Medium devices/tablets (768px+)
- `lg:` - Large devices/desktops (1024px+)
- `xl:` - Extra large screens (1280px+)

### 3. Mobile-First Approach

```tsx
// Mobile layout by default, desktop layout with md: prefix
<div className="flex flex-col md:flex-row gap-4">
  <div className="w-full md:w-64">Sidebar</div>
  <div className="flex-1">Content</div>
</div>
```

## 🎨 Status Indicators

### 1. Tab-based Status Filtering

Use tabs for primary status filtering with count badges:

```tsx
<TabsTrigger value="pending">
  Pending
  <Badge variant="outline" className="ml-2">
    <Count filter={{ status: "pending" }} />
  </Badge>
</TabsTrigger>
```

### 2. Row Status Styling

Add visual indicators for row status:

```tsx
<DataTable 
  rowClassName={(record) => {
    const statusColors = {
      active: 'border-l-4 border-l-green-500',
      pending: 'border-l-4 border-l-yellow-500',
      inactive: 'border-l-4 border-l-gray-400',
      error: 'border-l-4 border-l-red-500',
    };
    return statusColors[record.status] || '';
  }}
>
```

### 3. Status Badges

```tsx
const StatusBadge = ({ status }) => {
  const variants = {
    active: 'success',
    pending: 'warning',
    inactive: 'secondary',
    error: 'destructive',
  };
  
  return (
    <Badge variant={variants[status] || 'default'}>
      {status}
    </Badge>
  );
};
```

## 🚀 Performance Optimizations

### 1. Store Keys for Tabs

Always use unique store keys for different tab states:

```tsx
const storeKeyByStatus = {
  active: 'resource.list.active',
  inactive: 'resource.list.inactive',
};
```

### 2. Debounced Search

Use debounced search inputs to reduce API calls:

```tsx
<TextInput 
  source="q" 
  placeholder="Search..." 
  label={false}
  debounce={500} // milliseconds
/>
```

### 3. Pagination

Set appropriate page sizes:

```tsx
<List perPage={25}> {/* Default: 25 items */}
  {/* For data-heavy lists, consider 10-15 */}
  {/* For simple lists, can go up to 50 */}
</List>
```

## 🏗️ Component Structure

### 1. File Organization

```
/app/admin/resources/
  /resourceName/
    List.tsx       # Main list component
    Create.tsx     # Create form
    Edit.tsx       # Edit form
    Show.tsx       # Detail view (optional)
    index.ts       # Exports
    components/    # Resource-specific components
```

### 2. Component Composition

```tsx
// Main export
export const ResourceNameList = () => ( /* ... */ );

// Internal components
const TabbedDataTable = () => ( /* ... */ );
const ResourceTable = () => ( /* ... */ );
const FilterSidebar = () => ( /* ... */ );

// Keep components focused and reusable
```

## 📝 Common Patterns by Resource Type

### 1. Financial Resources (Invoices, Payments)

- Use status tabs: Pending, Paid, Overdue, Cancelled
- Include amount columns with currency formatting
- Add date range filters
- Show totals/summaries

### 2. User Resources (Students, Teachers, Staff)

- Use status tabs: Active, Inactive, Archived
- Include search by name
- Add role/type filtering
- Show contact information responsively

### 3. Academic Resources (Classes, Sections, Subjects)

- Filter by grade level
- Show capacity/enrollment
- Include teacher assignments
- Add academic year filtering

### 4. Communication Resources (Messages, Notifications)

- Filter by channel (SMS, Email, Push)
- Status tabs: Draft, Sent, Delivered, Failed
- Include recipient information
- Show delivery metrics

## ✅ Checklist for New Resources

When creating a new resource list, ensure:

- [ ] Label-less filters with placeholders
- [ ] Responsive column visibility
- [ ] Status tabs with counts (if applicable)
- [ ] Proper store keys for tabs
- [ ] Debounced search input
- [ ] Reference fields use AutocompleteInput
- [ ] Mobile-friendly layout
- [ ] Status indicators (colors/badges)
- [ ] Consistent with existing patterns
- [ ] Proper TypeScript types
- [ ] Follows file organization structure

## 🚫 Anti-Patterns to Avoid

1. **Don't use labeled filters** - Use placeholders instead
2. **Don't show all columns on mobile** - Hide non-essential ones
3. **Don't use basic SelectInput for references** - Use AutocompleteInput
4. **Don't forget store keys for tabs** - Each tab needs unique key
5. **Don't inline complex logic** - Extract to separate components
6. **Don't skip responsive testing** - Test on multiple screen sizes
7. **Don't hardcode status values** - Use enums or constants
8. **Don't forget loading states** - Handle loading/error states properly

## 📚 Resources

- [React Admin Documentation](https://marmelab.com/react-admin/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)

## 🔄 Migration from Old Patterns

If updating an existing resource:

1. Start with filters - remove labels, add placeholders
2. Add responsive classes to columns
3. Implement status tabs if applicable
4. Add visual status indicators
5. Test on mobile devices
6. Update to use new components (AutocompleteInput, etc.)

Remember: Consistency is key. When in doubt, look at recently updated resources like InvoicesList or StudentsList for reference.