"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDelete, useNotify, useRefresh, useResourceContext } from 'ra-core';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { DeleteDialog } from '@/components/ui/base-dialog';
import { cn } from '@/lib/utils';
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash,
  Copy,
  Download,
  Share,
  Archive,
  RotateCcw,
  FileText,
  Calendar,
  DollarSign,
  Users,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';

/**
 * TableActions - Standardized action buttons for table rows
 * 
 * Replaces 300+ lines of duplicate Edit/Delete/View button patterns
 * across all List components.
 */

type ActionType = 
  | 'view' 
  | 'edit' 
  | 'delete' 
  | 'duplicate' 
  | 'download' 
  | 'share' 
  | 'archive'
  | 'restore'
  | 'report'
  | 'schedule'
  | 'payment'
  | 'attendance'
  | 'contact'
  | 'email'
  | 'phone'
  | 'location'
  | 'approve'
  | 'reject'
  | 'pending'
  | 'custom';

interface Action {
  type: ActionType;
  label?: string;
  icon?: React.ElementType;
  onClick?: (record: any) => void | Promise<void>;
  disabled?: boolean | ((record: any) => boolean);
  hidden?: boolean | ((record: any) => boolean);
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
}

interface TableActionsProps {
  record?: any;
  resource?: string;
  actions?: (ActionType | Action)[];
  variant?: 'buttons' | 'dropdown' | 'hybrid';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onView?: (record: any) => void;
  onEdit?: (record: any) => void;
  onDelete?: (record: any) => void | Promise<void>;
  customActions?: Action[];
  showLabels?: boolean;
  align?: 'left' | 'center' | 'right';
}

const actionIcons: Record<ActionType, React.ElementType> = {
  view: Eye,
  edit: Edit,
  delete: Trash,
  duplicate: Copy,
  download: Download,
  share: Share,
  archive: Archive,
  restore: RotateCcw,
  report: FileText,
  schedule: Calendar,
  payment: DollarSign,
  attendance: Users,
  contact: Users,
  email: Mail,
  phone: Phone,
  location: MapPin,
  approve: CheckCircle,
  reject: XCircle,
  pending: AlertTriangle,
  custom: MoreHorizontal,
};

const actionLabels: Record<ActionType, string> = {
  view: 'View',
  edit: 'Edit',
  delete: 'Delete',
  duplicate: 'Duplicate',
  download: 'Download',
  share: 'Share',
  archive: 'Archive',
  restore: 'Restore',
  report: 'Generate Report',
  schedule: 'Schedule',
  payment: 'Payment',
  attendance: 'Attendance',
  contact: 'Contact',
  email: 'Send Email',
  phone: 'Call',
  location: 'View Location',
  approve: 'Approve',
  reject: 'Reject',
  pending: 'Mark Pending',
  custom: 'More',
};

export const TableActions: React.FC<TableActionsProps> = ({
  record,
  resource: resourceProp,
  actions = ['view', 'edit', 'delete'],
  variant = 'buttons',
  size = 'sm',
  className,
  onView,
  onEdit,
  onDelete,
  customActions = [],
  showLabels = false,
  align = 'right',
}) => {
  const navigate = useNavigate();
  const notify = useNotify();
  const refresh = useRefresh();
  const resourceContext = useResourceContext();
  const resource = resourceProp || resourceContext;
  
  const [deleteOne] = useDelete(resource, { 
    id: record?.id,
    previousData: record,
  });
  
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  // Default action handlers
  const handleView = React.useCallback(() => {
    if (onView) {
      onView(record);
    } else if (resource && record?.id) {
      navigate(`/${resource}/${record.id}/show`);
    }
  }, [onView, navigate, resource, record]);

  const handleEdit = React.useCallback(() => {
    if (onEdit) {
      onEdit(record);
    } else if (resource && record?.id) {
      navigate(`/${resource}/${record.id}`);
    }
  }, [onEdit, navigate, resource, record]);

  const handleDelete = React.useCallback(async () => {
    try {
      if (onDelete) {
        await onDelete(record);
      } else {
        await deleteOne();
      }
      notify(`${resource} deleted successfully`, { type: 'success' });
      refresh();
    } catch (error) {
      notify(`Error deleting ${resource}`, { type: 'error' });
    }
  }, [onDelete, deleteOne, notify, refresh, resource, record]);

  // Build action configurations
  const actionConfigs: Action[] = actions.map(action => {
    if (typeof action === 'string') {
      // Default action configuration
      const baseAction: Action = {
        type: action,
        label: actionLabels[action],
        icon: actionIcons[action],
      };

      // Add default handlers
      switch (action) {
        case 'view':
          baseAction.onClick = handleView;
          break;
        case 'edit':
          baseAction.onClick = handleEdit;
          break;
        case 'delete':
          baseAction.onClick = () => setDeleteDialogOpen(true);
          baseAction.variant = 'destructive';
          break;
      }

      return baseAction;
    }
    return action;
  });

  // Add custom actions
  const allActions = [...actionConfigs, ...customActions];

  // Filter visible actions
  const visibleActions = allActions.filter(action => {
    if (typeof action.hidden === 'function') {
      return !action.hidden(record);
    }
    return !action.hidden;
  });

  // Check if action is disabled
  const isDisabled = (action: Action) => {
    if (typeof action.disabled === 'function') {
      return action.disabled(record);
    }
    return action.disabled;
  };

  // Render as buttons
  if (variant === 'buttons') {
    return (
      <>
        <div className={cn('flex gap-1', `justify-${align}`, className)}>
          <TooltipProvider>
            {visibleActions.map((action, index) => {
              const Icon = action.icon;
              const disabled = isDisabled(action);
              
              return (
                <Tooltip key={`${action.type}-${index}`}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={action.variant || 'ghost'}
                      size={size === 'sm' ? 'icon' : size}
                      onClick={() => action.onClick?.(record)}
                      disabled={disabled}
                      className={cn(
                        size === 'sm' && 'h-8 w-8',
                        action.className
                      )}
                    >
                      {Icon && <Icon className={cn('h-4 w-4', showLabels && 'mr-2')} />}
                      {showLabels && action.label}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{action.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </div>
        
        {/* Delete confirmation dialog */}
        <DeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          resource={resource}
          itemName={record?.name || record?.title || record?.id}
          onDelete={handleDelete}
        />
      </>
    );
  }

  // Render as dropdown
  if (variant === 'dropdown') {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className={cn('h-8 w-8', className)}>
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {visibleActions.map((action, index) => {
              const Icon = action.icon;
              const disabled = isDisabled(action);
              
              return (
                <DropdownMenuItem
                  key={`${action.type}-${index}`}
                  onClick={() => action.onClick?.(record)}
                  disabled={disabled}
                  className={cn(
                    action.variant === 'destructive' && 'text-destructive',
                    action.className
                  )}
                >
                  {Icon && <Icon className="mr-2 h-4 w-4" />}
                  {action.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Delete confirmation dialog */}
        <DeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          resource={resource}
          itemName={record?.name || record?.title || record?.id}
          onDelete={handleDelete}
        />
      </>
    );
  }

  // Render as hybrid (primary actions as buttons, rest in dropdown)
  const primaryActions = visibleActions.slice(0, 2);
  const secondaryActions = visibleActions.slice(2);

  return (
    <>
      <div className={cn('flex gap-1', `justify-${align}`, className)}>
        <TooltipProvider>
          {primaryActions.map((action, index) => {
            const Icon = action.icon;
            const disabled = isDisabled(action);
            
            return (
              <Tooltip key={`${action.type}-${index}`}>
                <TooltipTrigger asChild>
                  <Button
                    variant={action.variant || 'ghost'}
                    size="icon"
                    onClick={() => action.onClick?.(record)}
                    disabled={disabled}
                    className={cn('h-8 w-8', action.className)}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{action.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
        
        {secondaryActions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {secondaryActions.map((action, index) => {
                const Icon = action.icon;
                const disabled = isDisabled(action);
                
                return (
                  <DropdownMenuItem
                    key={`${action.type}-${index}`}
                    onClick={() => action.onClick?.(record)}
                    disabled={disabled}
                    className={action.className}
                  >
                    {Icon && <Icon className="mr-2 h-4 w-4" />}
                    {action.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      
      {/* Delete confirmation dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        resource={resource}
        itemName={record?.name || record?.title || record?.id}
        onDelete={handleDelete}
      />
    </>
  );
};

/**
 * BulkActions - Actions for multiple selected records
 */
export const BulkActions: React.FC<{
  selectedIds: any[];
  resource?: string;
  actions?: ActionType[];
  onBulkDelete?: () => Promise<void>;
  onBulkArchive?: () => Promise<void>;
  customActions?: Action[];
}> = ({
  selectedIds,
  resource,
  actions = ['delete', 'archive'],
  onBulkDelete,
  onBulkArchive,
  customActions = [],
}) => {
  const notify = useNotify();
  const refresh = useRefresh();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const handleBulkDelete = async () => {
    try {
      if (onBulkDelete) {
        await onBulkDelete();
      }
      notify(`${selectedIds.length} items deleted`, { type: 'success' });
      refresh();
    } catch (error) {
      notify('Error deleting items', { type: 'error' });
    }
  };

  if (selectedIds.length === 0) return null;

  return (
    <>
      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
        <span className="text-sm text-muted-foreground">
          {selectedIds.length} selected
        </span>
        
        {actions.includes('delete') && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete Selected
          </Button>
        )}
        
        {actions.includes('archive') && onBulkArchive && (
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkArchive}
          >
            <Archive className="mr-2 h-4 w-4" />
            Archive Selected
          </Button>
        )}
        
        {customActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Button
              key={index}
              variant={action.variant || 'outline'}
              size="sm"
              onClick={() => action.onClick?.(selectedIds)}
            >
              {Icon && <Icon className="mr-2 h-4 w-4" />}
              {action.label}
            </Button>
          );
        })}
      </div>
      
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        resource={resource || 'items'}
        itemName={`${selectedIds.length} selected items`}
        onDelete={handleBulkDelete}
      />
    </>
  );
};

// Export default and named exports
export default TableActions;