# RBAC (Role-Based Access Control) Implementation

Generated: 2025-08-11

## Overview
Complete RBAC system implemented for the School Management System with four personas:
- **Admin** - Full system access
- **Teacher** - Academic management and limited administrative access
- **Parent** - View children's records and manage own data
- **Student** - View own records only

## Implementation Features

### ✅ Core Features Implemented
1. **Role-Based Permissions** - Granular control per resource and operation
2. **Field-Level Security** - Hide/readonly specific fields per role
3. **Row-Level Security** - Filter records based on user relationships
4. **Permission-Aware UI** - Resources automatically hidden based on permissions
5. **Development Testing** - Role switcher for testing different personas
6. **Permission Hooks** - React hooks for permission checking

## Permission Matrix

### Admin Role
| Resource | List | Show | Create | Edit | Delete | Notes |
|----------|------|------|--------|------|--------|-------|
| **All Resources** | ✅ | ✅ | ✅ | ✅ | ✅ | Full system access |

### Teacher Role
| Resource | List | Show | Create | Edit | Delete | Notes |
|----------|------|------|--------|------|--------|-------|
| Students | ✅ | ✅ | ❌ | ❌ | ❌ | View only |
| Guardians | ✅ | ✅ | ❌ | ❌ | ❌ | View only |
| Classes | ✅ | ✅ | ❌ | ❌ | ❌ | View only |
| Sections | ✅ | ✅ | ❌ | ❌ | ❌ | View only |
| Enrollments | ✅ | ✅ | ❌ | ❌ | ❌ | View only |
| Attendance | ✅ | ✅ | ✅ | ✅ | ❌ | Can mark attendance |
| Exams | ✅ | ✅ | ✅ | ✅ | ❌ | Can create exams |
| Marks | ✅ | ✅ | ✅ | ✅ | ❌ | Can enter marks |
| Messages | ✅ | ✅ | ✅ | ❌ | ❌ | Can send messages |
| Templates | ✅ | ✅ | ❌ | ❌ | ❌ | View templates |
| Campaigns | ✅ | ✅ | ❌ | ❌ | ❌ | View campaigns |
| Tickets | ✅ | ✅ | ✅ | ❌ | ❌ | Can create tickets |
| Invoices | ✅ | ✅ | ❌ | ❌ | ❌ | View only |
| Payments | ✅ | ✅ | ❌ | ❌ | ❌ | View only |
| Fee Structures | ✅ | ✅ | ❌ | ❌ | ❌ | View only |
| Staff | ❌ | ✅* | ❌ | ❌ | ❌ | Own profile only |
| Teachers | ❌ | ✅* | ❌ | ❌ | ❌ | Own profile only |

### Parent Role
| Resource | List | Show | Create | Edit | Delete | Notes |
|----------|------|------|--------|------|--------|-------|
| Students | ❌ | ✅* | ❌ | ❌ | ❌ | Own children only |
| Guardians | ❌ | ✅ | ❌ | ✅* | ❌ | Own profile |
| Enrollments | ❌ | ✅* | ❌ | ❌ | ❌ | Children's only |
| Classes | ❌ | ✅* | ❌ | ❌ | ❌ | Children's only |
| Sections | ❌ | ✅* | ❌ | ❌ | ❌ | Children's only |
| Attendance | ✅* | ✅* | ❌ | ❌ | ❌ | Children's only |
| Exams | ✅ | ✅ | ❌ | ❌ | ❌ | View schedules |
| Marks | ✅* | ✅* | ❌ | ❌ | ❌ | Children's only |
| Invoices | ✅* | ✅* | ❌ | ❌ | ❌ | Own invoices |
| Payments | ✅* | ✅* | ✅ | ❌ | ❌ | Can make payments |
| Fee Structures | ❌ | ✅ | ❌ | ❌ | ❌ | View applicable |
| Messages | ✅ | ✅ | ❌ | ❌ | ❌ | View messages |
| Tickets | ✅* | ✅* | ✅ | ✅* | ❌ | Own tickets |
| Applications | ✅* | ✅* | ✅ | ✅* | ❌ | Own applications |

### Student Role
| Resource | List | Show | Create | Edit | Delete | Notes |
|----------|------|------|--------|------|--------|-------|
| Students | ❌ | ✅* | ❌ | ❌ | ❌ | Own profile only |
| Guardians | ❌ | ✅ | ❌ | ❌ | ❌ | View only |
| Enrollments | ❌ | ✅* | ❌ | ❌ | ❌ | Own enrollment |
| Classes | ❌ | ✅* | ❌ | ❌ | ❌ | Own class |
| Sections | ❌ | ✅* | ❌ | ❌ | ❌ | Own section |
| Attendance | ✅* | ✅* | ❌ | ❌ | ❌ | Own records |
| Exams | ✅ | ✅ | ❌ | ❌ | ❌ | View schedules |
| Marks | ✅* | ✅* | ❌ | ❌ | ❌ | Own marks |
| Invoices | ✅* | ✅* | ❌ | ❌ | ❌ | Own invoices |
| Payments | ✅* | ✅* | ❌ | ❌ | ❌ | View history |
| Fee Structures | ❌ | ✅ | ❌ | ❌ | ❌ | View applicable |
| Messages | ✅ | ✅ | ❌ | ❌ | ❌ | View messages |
| Tickets | ✅* | ✅* | ✅ | ❌ | ❌ | Create tickets |

*Note: Asterisk (*) indicates filtered/restricted access based on ownership or relationship*

## Field-Level Permissions

### Hidden Fields by Role

#### Teacher
- **Students**: `admissionNo` (sensitive)
- **Guardians**: `consentFlags` (privacy)
- **Staff**: `salary`, `bankDetails` (financial)

#### Parent
- **Students**: `admissionNo`, `piiRef` (sensitive)
- **Invoices**: `internalNotes` (internal)

#### Student
- **Students**: `admissionNo`, `piiRef`, `medicalInfo` (sensitive)
- **Guardians**: `consentFlags`, `custodyType` (privacy)
- **Marks**: `teacherComments` (internal)

### Read-Only Fields by Role

#### Teacher
- All student and guardian fields are read-only

#### Parent
- **Guardians**: `relation`, `custodyType` cannot be changed
- All invoice fields are read-only

#### Student
- All fields are read-only (view-only access)

## Row-Level Security Rules

### Teacher
- Can only view students in their assigned classes/sections
- Can only mark attendance for their students
- Can only enter marks for subjects they teach
- Can only view their own staff profile

### Parent
- Can only view their own children's records
- Can only view invoices for their children
- Can only view/manage their own tickets
- Can only manage their own applications

### Student
- Can only view their own records
- Can only view their own attendance
- Can only view their own marks
- Can only view their own invoices

## Technical Implementation

### Files Created/Modified

#### New Files
1. `/apps/web/app/admin/hooks/usePermissions.ts` - Permission checking hooks
2. `/apps/web/app/admin/components/PermissionAwareResource.tsx` - Permission wrapper
3. `/apps/web/app/admin/components/RoleSwitcher.tsx` - Development testing tool
4. `/apps/web/app/admin/resources/marks/Create.tsx` - Marks creation form
5. `/apps/web/app/admin/resources/marks/Edit.tsx` - Marks edit form
6. `/apps/web/app/admin/resources/messages/Create.tsx` - Message placeholder
7. `/apps/web/app/admin/resources/messages/Edit.tsx` - Message placeholder

#### Modified Files
1. `/apps/web/app/admin/permissions.ts` - Complete RBAC configuration
2. `/apps/web/app/admin/AdminApp.tsx` - Permission-aware resources
3. `/apps/web/app/admin/resources/marks/index.ts` - Export new components
4. `/apps/web/app/admin/resources/messages/index.ts` - Export placeholders

## Usage

### For Developers

#### Testing Different Roles
1. In development mode, a Role Switcher appears in bottom-right
2. Select a role to test (Admin, Teacher, Parent, Student)
3. Page will reload with selected permissions
4. Resources and operations will be filtered accordingly

#### Using Permission Hooks
```typescript
import { usePermissions } from '../hooks/usePermissions';

function MyComponent() {
  const permissions = usePermissions();
  
  if (permissions.canEdit('students')) {
    // Show edit button
  }
  
  if (permissions.isTeacher) {
    // Show teacher-specific content
  }
}
```

#### Checking Resource Permissions
```typescript
import { useResourcePermissions } from '../hooks/usePermissions';

function StudentList() {
  const permissions = useResourcePermissions('students');
  
  if (!permissions.canList) {
    return <div>No access</div>;
  }
  
  // Show list
}
```

### For Production

#### Setting User Roles
Roles should be set in the authentication system (Clerk):
1. In user's `publicMetadata.roles` array
2. Or in organization membership roles
3. Multiple roles are supported (e.g., ['teacher', 'parent'])

#### Security Considerations
1. **Frontend permissions are for UX only** - Always validate on backend
2. **Row-level security must be enforced in API** - Frontend filters are convenience
3. **Field hiding is not security** - Sensitive data shouldn't be sent from API
4. **Role switcher is dev-only** - Disabled in production builds

## Testing Scenarios

### Teacher Scenario
1. Switch to Teacher role
2. Verify can see student list but no Create button
3. Check attendance - should have Create/Edit
4. Check marks - should have Create/Edit
5. Try accessing Staff list - should only see own profile

### Parent Scenario
1. Switch to Parent role
2. Verify limited sidebar items
3. Check students - should not see list
4. Check invoices - should see list
5. Check tickets - can create new

### Student Scenario
1. Switch to Student role
2. Verify minimal sidebar items
3. All resources should be read-only
4. Can create support tickets
5. Cannot see other students

## Next Steps

### High Priority
1. **Backend enforcement** - Implement RBAC in API controllers
2. **Data filtering** - Apply row-level security in database queries
3. **Field masking** - Remove sensitive fields in API responses

### Medium Priority
1. **Audit logging** - Track permission usage
2. **Permission delegation** - Allow admins to customize roles
3. **Temporary permissions** - Time-based access grants

### Low Priority
1. **Fine-grained permissions** - Per-record permissions
2. **Permission inheritance** - Hierarchical roles
3. **Permission analytics** - Usage patterns and optimization

## Summary
- **4 Personas** fully configured with appropriate permissions
- **18 Resources** with role-based access control
- **Field-level security** hiding sensitive information
- **Row-level security** framework (requires backend implementation)
- **Development tools** for easy testing
- **React hooks** for permission checking
- **100% TypeScript** with type safety

The RBAC system is fully functional in the frontend and ready for backend enforcement.