import { useGetIdentity } from 'ra-core';
import { useMemo } from 'react';
import { 
  Role, 
  Permission, 
  hasPermission, 
  canAccessResource,
  getVisibleFields,
  getEditableFields,
  rowLevelSecurity
} from '../permissions';

export function usePermissions() {
  const { data: identity } = useGetIdentity();
  const roles = (identity as any)?.roles as Role[] | undefined;

  return useMemo(() => ({
    roles: roles || [],
    hasRole: (role: Role) => roles?.includes(role) || false,
    hasAnyRole: (...checkRoles: Role[]) => 
      checkRoles.some(role => roles?.includes(role)) || false,
    hasAllRoles: (...checkRoles: Role[]) => 
      checkRoles.every(role => roles?.includes(role)) || false,
    
    // Resource permissions
    canAccess: (resource: string) => 
      canAccessResource(roles || [], resource),
    canList: (resource: string) => 
      hasPermission(roles || [], resource, 'list'),
    canShow: (resource: string) => 
      hasPermission(roles || [], resource, 'show'),
    canCreate: (resource: string) => 
      hasPermission(roles || [], resource, 'create'),
    canEdit: (resource: string) => 
      hasPermission(roles || [], resource, 'edit'),
    canDelete: (resource: string) => 
      hasPermission(roles || [], resource, 'delete'),
    
    // Field permissions
    getVisibleFields: (resource: string, fields: string[]) => {
      const role = roles?.[0]; // Use primary role
      if (!role) return [];
      return getVisibleFields(role, resource, fields);
    },
    getEditableFields: (resource: string, fields: string[]) => {
      const role = roles?.[0]; // Use primary role
      if (!role) return [];
      return getEditableFields(role, resource, fields);
    },
    
    // Row-level security
    canAccessRecord: (resource: string, record: any) => {
      if (!roles || roles.length === 0) return false;
      const userId = identity?.id;
      if (!userId) return false;
      
      // Check each role until one allows access
      return roles.some(role => {
        const rls = rowLevelSecurity[role]?.[resource] || 
                   rowLevelSecurity[role]?.['*'];
        if (!rls) return false;
        return rls(userId, record);
      });
    },
    
    // Utility
    isAdmin: roles?.includes('admin') || false,
    isTeacher: roles?.includes('teacher') || false,
    isParent: roles?.includes('parent') || false,
    isStudent: roles?.includes('student') || false,
  }), [roles, identity]);
}

// Hook to check permissions for current resource
export function useResourcePermissions(resource: string) {
  const permissions = usePermissions();
  
  return useMemo(() => ({
    canAccess: permissions.canAccess(resource),
    canList: permissions.canList(resource),
    canShow: permissions.canShow(resource),
    canCreate: permissions.canCreate(resource),
    canEdit: permissions.canEdit(resource),
    canDelete: permissions.canDelete(resource),
    getVisibleFields: (fields: string[]) => 
      permissions.getVisibleFields(resource, fields),
    getEditableFields: (fields: string[]) => 
      permissions.getEditableFields(resource, fields),
    canAccessRecord: (record: any) => 
      permissions.canAccessRecord(resource, record),
  }), [permissions, resource]);
}

// Hook to filter records based on row-level security
export function useFilteredRecords<T extends any>(
  resource: string, 
  records: T[]
): T[] {
  const permissions = usePermissions();
  
  return useMemo(() => {
    if (!records || records.length === 0) return [];
    return records.filter(record => 
      permissions.canAccessRecord(resource, record)
    );
  }, [permissions, resource, records]);
}