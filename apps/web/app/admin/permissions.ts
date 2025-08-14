// RBAC Configuration for School Management System
// Four personas: Admin, Teacher, Parent, Student

export type Role = 'admin' | 'teacher' | 'parent' | 'student';
export type Permission = 'list' | 'show' | 'create' | 'edit' | 'delete';
export type Resource = string;

// Define what operations each role can perform on each resource
export const rolePermissions: Record<Role, Record<Resource, Permission[]>> = {
  admin: {
    // Admin has full access to everything
    '*': ['list', 'show', 'create', 'edit', 'delete'],
  },
  
  teacher: {
    // Academic Management - Teachers can manage academic resources
    'students': ['list', 'show'], // View students in their classes
    'guardians': ['list', 'show'], // View guardian information
    'classes': ['list', 'show'], // View class information
    'sections': ['list', 'show'], // View section information
    'enrollments': ['list', 'show'], // View enrollments
    
    // Attendance - Teachers can manage attendance
    'attendanceRecords': ['list', 'show', 'create', 'edit'], // Mark and edit attendance
    
    // Exams & Marks - Teachers can manage exams and marks
    'exams': ['list', 'show', 'create', 'edit'], // Create and manage exams
    'marks': ['list', 'show', 'create', 'edit'], // Enter and edit marks
    
    // Timetable - Teachers can view and manage their schedule
    'subjects': ['list', 'show'], // View subjects
    'rooms': ['list', 'show'], // View rooms
    'timetablePeriods': ['list', 'show'], // View timetable
    'timeSlots': ['list', 'show'], // View time slots
    'substitutions': ['list', 'show', 'create'], // Request substitutions
    
    // Communications - Teachers can communicate
    'messages': ['list', 'show', 'create'], // Send messages
    'templates': ['list', 'show'], // View message templates
    'campaigns': ['list', 'show'], // View campaigns
    'tickets': ['list', 'show', 'create'], // Create support tickets
    'preferences': ['show', 'edit'], // Manage own communication preferences
    
    // Self Management
    'staff': ['show'], // View own profile only
    'teachers': ['show'], // View own teacher profile
    
    // Read-only access to fee information
    'invoices': ['list', 'show'], // View student invoices
    'payments': ['list', 'show'], // View payment records
    'feeStructures': ['list', 'show'], // View fee structures
    'feeSchedules': ['list', 'show'], // View fee schedules
  },
  
  parent: {
    // Student Information - Parents can view their children's data
    'students': ['show'], // View own children only
    'guardians': ['show', 'edit'], // View and update own profile
    'enrollments': ['show'], // View own children's enrollments
    'classes': ['show'], // View children's classes
    'sections': ['show'], // View children's sections
    
    // Academic Records - View only
    'attendanceRecords': ['list', 'show'], // View children's attendance
    'exams': ['list', 'show'], // View exam schedules
    'marks': ['list', 'show'], // View children's marks
    
    // Timetable - View only
    'subjects': ['list', 'show'], // View subjects
    'rooms': ['list', 'show'], // View rooms
    'timetablePeriods': ['list', 'show'], // View timetable
    'timeSlots': ['list', 'show'], // View time slots
    'substitutions': ['list', 'show'], // View substitutions
    
    // Financial - Parents can view and pay fees
    'invoices': ['list', 'show'], // View own invoices
    'payments': ['list', 'show', 'create'], // View payments and make new payments
    'feeStructures': ['show'], // View applicable fee structures
    'feeSchedules': ['show'], // View fee schedules
    
    // Communications - Parents can communicate
    'messages': ['list', 'show'], // View messages
    'tickets': ['list', 'show', 'create', 'edit'], // Create and manage own tickets
    'preferences': ['show', 'edit'], // Manage communication preferences
    
    // Applications - Parents can apply for admissions
    'admissionsApplications': ['list', 'show', 'create', 'edit'], // Manage applications
  },
  
  student: {
    // Personal Information - Students can view their own data
    'students': ['show'], // View own profile only
    'guardians': ['show'], // View guardian information
    'enrollments': ['show'], // View own enrollment
    'classes': ['show'], // View own class
    'sections': ['show'], // View own section
    
    // Academic Records - View only
    'attendanceRecords': ['list', 'show'], // View own attendance
    'exams': ['list', 'show'], // View exam schedules
    'marks': ['list', 'show'], // View own marks
    
    // Timetable - View only
    'subjects': ['list', 'show'], // View subjects
    'rooms': ['list', 'show'], // View rooms
    'timetablePeriods': ['list', 'show'], // View timetable
    'timeSlots': ['list', 'show'], // View time slots
    'substitutions': ['list', 'show'], // View substitutions
    
    // Financial - View only
    'invoices': ['list', 'show'], // View own invoices
    'payments': ['list', 'show'], // View payment history
    'feeStructures': ['show'], // View applicable fee structure
    'feeSchedules': ['show'], // View fee schedules
    
    // Communications - Limited communication
    'messages': ['list', 'show'], // View messages
    'tickets': ['list', 'show', 'create'], // Create support tickets
    'preferences': ['show', 'edit'], // Manage communication preferences
  },
};

// Field-level permissions - which fields each role can see/edit
export const fieldPermissions: Record<Role, Record<Resource, { 
  hidden?: string[], 
  readonly?: string[] 
}>> = {
  admin: {
    // Admin can see and edit everything
    '*': {},
  },
  
  teacher: {
    'students': {
      hidden: ['admissionNo'], // Hide sensitive admission numbers
      readonly: ['*'], // All fields are read-only
    },
    'guardians': {
      hidden: ['consentFlags'], // Hide consent information
      readonly: ['*'],
    },
    'staff': {
      hidden: ['salary', 'bankDetails'], // Hide financial information
      readonly: ['*'],
    },
  },
  
  parent: {
    'students': {
      hidden: ['admissionNo', 'piiRef'], // Hide sensitive data
      readonly: ['*'],
    },
    'guardians': {
      readonly: ['relation', 'custodyType'], // Can't change relationship
    },
    'invoices': {
      hidden: ['internalNotes'], // Hide internal notes
      readonly: ['*'],
    },
  },
  
  student: {
    'students': {
      hidden: ['admissionNo', 'piiRef', 'medicalInfo'], // Hide sensitive data
      readonly: ['*'],
    },
    'guardians': {
      hidden: ['consentFlags', 'custodyType'],
      readonly: ['*'],
    },
    'marks': {
      hidden: ['teacherComments'], // Hide internal comments
      readonly: ['*'],
    },
  },
};

// Row-level security - determine which records each role can access
export const rowLevelSecurity: Record<Role, Record<Resource, (userId: string, record: any) => boolean>> = {
  admin: {
    // Admin can access all records
    '*': () => true,
  },
  
  teacher: {
    // Teachers can only access students in their classes/sections
    'students': (teacherId, student) => {
      // This would check if the teacher teaches this student
      // Implementation would query the database
      return true; // Placeholder
    },
    'attendanceRecords': (teacherId, record) => {
      // Check if teacher is assigned to this student's section
      return true; // Placeholder
    },
    'marks': (teacherId, record) => {
      // Check if teacher teaches this subject/section
      return true; // Placeholder
    },
    'staff': (teacherId, record) => {
      // Only view own profile
      return record.id === teacherId;
    },
  },
  
  parent: {
    // Parents can only access their children's records
    'students': (parentId, student) => {
      // Check if this is the parent's child
      // Would check guardian relationship
      return true; // Placeholder
    },
    'attendanceRecords': (parentId, record) => {
      // Check if this is for parent's child
      return true; // Placeholder
    },
    'marks': (parentId, record) => {
      // Check if this is for parent's child
      return true; // Placeholder
    },
    'invoices': (parentId, invoice) => {
      // Check if this invoice is for parent's child
      return true; // Placeholder
    },
    'tickets': (parentId, ticket) => {
      // Only view own tickets
      return ticket.ownerId === parentId;
    },
  },
  
  student: {
    // Students can only access their own records
    'students': (studentId, student) => {
      return student.id === studentId;
    },
    'attendanceRecords': (studentId, record) => {
      return record.studentId === studentId;
    },
    'marks': (studentId, record) => {
      return record.studentId === studentId;
    },
    'invoices': (studentId, invoice) => {
      return invoice.studentId === studentId;
    },
    'tickets': (studentId, ticket) => {
      return ticket.ownerId === studentId;
    },
  },
};

// Helper functions for permission checking
export function hasPermission(
  role: Role | Role[], 
  resource: Resource, 
  permission: Permission
): boolean {
  const roles = Array.isArray(role) ? role : [role];
  
  return roles.some(r => {
    const perms = rolePermissions[r];
    if (!perms) return false;
    
    // Check wildcard permissions first
    if (perms['*']?.includes(permission)) return true;
    
    // Check specific resource permissions
    return perms[resource]?.includes(permission) || false;
  });
}

export function canAccessResource(
  role: Role | Role[], 
  resource: Resource
): boolean {
  const roles = Array.isArray(role) ? role : [role];
  
  return roles.some(r => {
    const perms = rolePermissions[r];
    if (!perms) return false;
    
    // Check if has any permission on this resource
    return perms['*'] || perms[resource];
  });
}

export function getVisibleFields(
  role: Role, 
  resource: Resource, 
  fields: string[]
): string[] {
  const fieldPerms = fieldPermissions[role]?.[resource] || 
                     fieldPermissions[role]?.['*'] || 
                     {};
  
  const hidden = fieldPerms.hidden || [];
  return fields.filter(field => !hidden.includes(field));
}

export function getEditableFields(
  role: Role, 
  resource: Resource, 
  fields: string[]
): string[] {
  const fieldPerms = fieldPermissions[role]?.[resource] || 
                     fieldPermissions[role]?.['*'] || 
                     {};
  
  const hidden = fieldPerms.hidden || [];
  const readonly = fieldPerms.readonly || [];
  
  // If readonly is ['*'], no fields are editable
  if (readonly.includes('*')) return [];
  
  return fields.filter(field => 
    !hidden.includes(field) && !readonly.includes(field)
  );
}

// Legacy functions for backward compatibility
export const roleAllowedResources: Record<string, string[]> = {
  admin: ['*'],
  teacher: Object.keys(rolePermissions.teacher),
  parent: Object.keys(rolePermissions.parent),
  student: Object.keys(rolePermissions.student),
};

export function isResourceAllowed(
  roles: string[] | undefined, 
  resource: string
): boolean {
  if (!roles || roles.length === 0) return false;
  return canAccessResource(roles as Role[], resource);
}

export type ResourceDefs = Record<string, { hasList?: boolean } | undefined>;

export function computeVisibleResources(
  resources: ResourceDefs,
  roles: string[] | undefined
): string[] {
  const names = Object.keys(resources).filter((n) => resources[n]?.hasList);
  if (!roles || roles.length === 0) return [];
  
  // Filter resources based on permissions
  return names.filter((n) => canAccessResource(roles as Role[], n));
}