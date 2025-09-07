"use client";

import { useRecordContext } from "ra-core";
import { Badge } from "@/components/ui/badge";
import { getStatusColor, StatusType } from "@/lib/theme/colors";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  source?: string;
  record?: any;
  status?: string;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge = ({ 
  source = "status",
  record: propRecord,
  status: propStatus,
  className,
  showIcon = false,
  size = 'md'
}: StatusBadgeProps) => {
  const contextRecord = useRecordContext();
  const record = propRecord || contextRecord;
  const status = propStatus || record?.[source];

  if (!status) return null;

  const colorConfig = getStatusColor(status);
  const statusLabels: Record<string, string> = {
    active: 'Active',
    inactive: 'Inactive',
    graduated: 'Graduated',
    enrolled: 'Enrolled',
    on_leave: 'On Leave',
    terminated: 'Terminated',
    transferred: 'Transferred',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    draft: 'Draft',
    // Invoice statuses
    paid: 'Paid',
    overdue: 'Overdue',
    partial: 'Partial',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <Badge 
      variant={colorConfig.badgeVariant}
      className={cn(
        colorConfig.background,
        colorConfig.text,
        sizeClasses[size],
        className
      )}
    >
      {statusLabels[status] || status}
    </Badge>
  );
};

// Wrapper component for use with react-admin fields
export const StatusField = (props: StatusBadgeProps) => {
  const record = useRecordContext();
  return <StatusBadge record={record} {...props} />;
};