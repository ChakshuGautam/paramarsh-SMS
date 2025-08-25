import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * LoadingSkeleton Library
 * 
 * Centralized loading states for all components in the application.
 * Replaces inline loading indicators with consistent skeleton screens.
 * 
 * Usage:
 * - TableSkeleton: For data tables
 * - FormSkeleton: For forms
 * - CardSkeleton: For card layouts
 * - ListItemSkeleton: For list items
 * - DetailsSkeleton: For detail views
 */

interface SkeletonProps {
  className?: string;
}

/**
 * TableSkeleton - Loading state for data tables
 * @param rows - Number of skeleton rows to display (default: 5)
 * @param cols - Number of columns (default: 4)
 */
export const TableSkeleton: React.FC<{
  rows?: number;
  cols?: number;
  className?: string;
}> = ({ rows = 5, cols = 4, className }) => {
  return (
    <div className={cn("w-full space-y-3", className)}>
      {/* Table Header */}
      <div className="flex gap-4 p-3 border-b">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={`header-${i}`} className="h-4 flex-1" />
        ))}
      </div>
      
      {/* Table Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex gap-4 p-3 border-b animate-pulse">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton 
              key={`cell-${rowIndex}-${colIndex}`} 
              className={cn(
                "h-4",
                colIndex === 0 ? "w-32" : "flex-1"
              )} 
            />
          ))}
        </div>
      ))}
    </div>
  );
};

/**
 * FormSkeleton - Loading state for forms
 * @param fields - Number of form fields (default: 6)
 */
export const FormSkeleton: React.FC<{
  fields?: number;
  sections?: number;
  className?: string;
}> = ({ fields = 6, sections = 1, className }) => {
  return (
    <div className={cn("w-full space-y-6", className)}>
      {Array.from({ length: sections }).map((_, sectionIndex) => (
        <div key={`section-${sectionIndex}`} className="space-y-4">
          {/* Section Title */}
          {sections > 1 && (
            <Skeleton className="h-6 w-48 mb-4" />
          )}
          
          {/* Form Fields */}
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: fields }).map((_, fieldIndex) => (
              <div key={`field-${sectionIndex}-${fieldIndex}`} className="space-y-2">
                <Skeleton className="h-3 w-24" /> {/* Label */}
                <Skeleton className="h-10 w-full" /> {/* Input */}
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {/* Form Actions */}
      <div className="flex gap-2 pt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
};

/**
 * CardSkeleton - Loading state for card layouts
 * @param count - Number of cards to display (default: 3)
 */
export const CardSkeleton: React.FC<{
  count?: number;
  className?: string;
}> = ({ count = 3, className }) => {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-3", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={`card-${index}`} className="rounded-lg border p-6 space-y-4">
          {/* Card Header */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          
          {/* Card Content */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          
          {/* Card Footer */}
          <div className="flex items-center justify-between pt-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * ListItemSkeleton - Loading state for list items
 * @param count - Number of items (default: 5)
 * @param avatar - Show avatar skeleton (default: true)
 */
export const ListItemSkeleton: React.FC<{
  count?: number;
  avatar?: boolean;
  actions?: boolean;
  className?: string;
}> = ({ count = 5, avatar = true, actions = false, className }) => {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={`item-${index}`} className="flex items-center gap-4 p-4 border rounded-lg">
          {/* Avatar */}
          {avatar && (
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          )}
          
          {/* Content */}
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          
          {/* Actions */}
          {actions && (
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

/**
 * DetailsSkeleton - Loading state for detail views
 */
export const DetailsSkeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-10 w-24" />
      </div>
      
      {/* Content Sections */}
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={`section-${index}`} className="space-y-3">
          <Skeleton className="h-5 w-32" />
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, fieldIndex) => (
              <div key={`field-${index}-${fieldIndex}`} className="space-y-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * StatsSkeleton - Loading state for statistics/metrics
 */
export const StatsSkeleton: React.FC<{
  count?: number;
  className?: string;
}> = ({ count = 4, className }) => {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={`stat-${index}`} className="rounded-lg border p-6 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
};

/**
 * ResourceListSkeleton - Complete loading state for resource lists
 * Combines filters, tabs, and table skeleton
 */
export const ResourceListSkeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Filters */}
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1 max-w-sm" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
      
      {/* Tabs */}
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={`tab-${i}`} className="h-10 w-24" />
        ))}
      </div>
      
      {/* Table */}
      <TableSkeleton rows={10} cols={5} />
      
      {/* Pagination */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
};

// Export all skeleton components
export default {
  Table: TableSkeleton,
  Form: FormSkeleton,
  Card: CardSkeleton,
  ListItem: ListItemSkeleton,
  Details: DetailsSkeleton,
  Stats: StatsSkeleton,
  ResourceList: ResourceListSkeleton,
};