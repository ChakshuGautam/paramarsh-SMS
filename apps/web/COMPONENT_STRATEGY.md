# Component Strategy for School Management System

## Core Principle
**Always search for and use existing high-quality shadcn-compatible components before building custom ones.**

## Component Library Stack

### 1. UI Foundation
- **shadcn/ui** - Primary component library
- **Radix UI** - Headless components (used by shadcn)
- **Tailwind CSS** - Styling system
- **lucide-react** - Icon library

### 2. Form & Admin Components
- **React Admin** - Admin framework
- **react-hook-form** - Form state management (used by React Admin)
- **date-fns** - Date utilities

## Component Sources (in order of preference)

### 1. Official shadcn Components
- Check https://ui.shadcn.com/docs/components first
- Use the official implementation when available

### 2. Community shadcn Extensions
Examples of quality extensions we use:
- **Date Range Picker**: https://github.com/johnpolacek/date-range-picker-for-shadcn
- Always verify compatibility with our React/shadcn versions

### 3. Custom Components
Only build custom when:
- No suitable shadcn component exists
- Community solutions don't meet requirements
- Need deep React Admin integration

## Current Component Inventory

### Input Components
- ✅ **TextInput** - Basic text input with React Admin integration
- ✅ **NumberInput** - Number input with min/max support
- ✅ **SelectInput** - Dropdown select using shadcn Select
- ✅ **SearchInput** - Text input with search icon
- ✅ **DateInput** - Single date picker using shadcn Calendar
- ✅ **DateRangeInput** - Date range picker for filtering
- ✅ **BooleanInput** - Checkbox/switch input
- ✅ **ReferenceInput** - Related entity selector

### Display Components
- ✅ **TextField** - Display text values
- ✅ **NumberField** - Display numeric values
- ✅ **ReferenceField** - Display related entity
- ✅ **BadgeField** - Status badges

### Layout Components
- ✅ **TopToolbar** - Action toolbar for views
- ✅ **ListButton** - Navigate to list view
- ✅ **EditButton** - Navigate to edit view
- ✅ **CreateButton** - Navigate to create view
- ✅ **DeleteButton** - Delete action
- ✅ **SimpleShowLayout** - Show view layout
- ✅ **SimpleForm** - Form layout

## Best Practices

### 1. Before Creating a Component

**ALWAYS ASK:**
1. Does shadcn have this component? Check: https://ui.shadcn.com/docs/components
2. Is there a quality community extension? Search: "shadcn [component name]"
3. Can we compose it from existing shadcn primitives?

### 2. When Using External Components

**Verify:**
- React version compatibility
- shadcn/Radix UI version compatibility
- TypeScript support
- Accessibility features
- Bundle size impact

### 3. Integration Pattern

```typescript
// Wrap shadcn components for React Admin
import { useInput } from "ra-core";
import { ShadcnComponent } from "@/components/ui/...";

export const AdminComponent = ({ source, ...props }) => {
  const { field, fieldState } = useInput({ source });
  
  return (
    <ShadcnComponent
      {...field}
      error={fieldState.error}
      {...props}
    />
  );
};
```

## Component Request Protocol

When needing a new component:

1. **Search First**
   - Check shadcn docs
   - Search GitHub for "shadcn [component]"
   - Check awesome-shadcn repositories

2. **Ask for Approval**
   - Present findings to team/user
   - Get confirmation on approach
   - Document the decision

3. **Implementation**
   - Use existing solution when possible
   - Follow shadcn patterns if building custom
   - Ensure React Admin compatibility

## Examples of Good Decisions

✅ **Date Range Picker**: Used community solution instead of building from scratch
✅ **Calendar**: Used official shadcn component
✅ **Select**: Used shadcn Select instead of custom dropdown

## Never Do This

❌ Build from scratch without checking for existing solutions
❌ Use Material-UI or other incompatible libraries
❌ Create custom styling that conflicts with Tailwind
❌ Ignore accessibility features provided by shadcn/Radix

## Resources

- shadcn Components: https://ui.shadcn.com/docs/components
- Radix UI: https://www.radix-ui.com/
- React Admin: https://marmelab.com/react-admin/
- Tailwind CSS: https://tailwindcss.com/
- Community Extensions: Search "awesome-shadcn" on GitHub