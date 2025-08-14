"use client";

import React from 'react';
import { Resource } from 'react-admin';
import { usePermissions } from '../hooks/usePermissions';

interface PermissionAwareResourceProps {
  name: string;
  list?: React.ComponentType<any>;
  show?: React.ComponentType<any>;
  create?: React.ComponentType<any>;
  edit?: React.ComponentType<any>;
  options?: any;
}

export const PermissionAwareResource: React.FC<PermissionAwareResourceProps> = ({
  name,
  list: ListComponent,
  show: ShowComponent,
  create: CreateComponent,
  edit: EditComponent,
  options
}) => {
  const permissions = usePermissions();
  
  // In development or when no roles are set, allow all resources
  const hasNoRoles = !permissions.roles || permissions.roles.length === 0;
  
  // Don't render resource if user has no access (unless no roles are set)
  if (!hasNoRoles && !permissions.canAccess(name)) {
    return null;
  }
  
  // Only include components user has permission for (or all if no roles)
  const allowedList = (hasNoRoles || permissions.canList(name)) ? ListComponent : undefined;
  const allowedShow = (hasNoRoles || permissions.canShow(name)) ? ShowComponent : undefined;
  const allowedCreate = (hasNoRoles || permissions.canCreate(name)) ? CreateComponent : undefined;
  const allowedEdit = (hasNoRoles || permissions.canEdit(name)) ? EditComponent : undefined;
  
  return (
    <Resource
      name={name}
      list={allowedList}
      show={allowedShow}
      create={allowedCreate}
      edit={allowedEdit}
      options={options}
    />
  );
};