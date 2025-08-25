import React from 'react';
import { cn } from '@/lib/utils';
import { FileX, AlertCircle, SearchX, InboxIcon } from 'lucide-react';
import { EMPTY_MESSAGES } from '@/lib/constants';

export interface EmptyStateProps {
  message?: string;
  variant?: 'default' | 'no-data' | 'no-results' | 'error' | 'loading';
  icon?: React.ReactNode;
  className?: string;
  showIcon?: boolean;
}

/**
 * EmptyState component for consistent empty/null state display
 * Replaces all inline "No data" spans throughout the codebase
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  variant = 'default',
  icon,
  className,
  showIcon = true,
}) => {
  // Determine the message based on variant if not provided
  const displayMessage = message || getDefaultMessage(variant);
  
  // Determine the icon based on variant if not provided
  const displayIcon = icon || (showIcon && getDefaultIcon(variant));
  
  return (
    <div className={cn(
      'flex items-center gap-2 text-muted-foreground',
      className
    )}>
      {displayIcon && (
        <span className="shrink-0">
          {displayIcon}
        </span>
      )}
      <span className="text-sm">{displayMessage}</span>
    </div>
  );
};

// Helper function to get default message by variant
function getDefaultMessage(variant: string): string {
  switch (variant) {
    case 'no-data':
      return EMPTY_MESSAGES.NO_DATA;
    case 'no-results':
      return EMPTY_MESSAGES.NO_RESULTS;
    case 'error':
      return EMPTY_MESSAGES.ERROR;
    case 'loading':
      return EMPTY_MESSAGES.LOADING;
    default:
      return EMPTY_MESSAGES.NO_DATA;
  }
}

// Helper function to get default icon by variant
function getDefaultIcon(variant: string): React.ReactNode {
  const iconClass = 'h-4 w-4';
  
  switch (variant) {
    case 'no-data':
      return <InboxIcon className={iconClass} />;
    case 'no-results':
      return <SearchX className={iconClass} />;
    case 'error':
      return <AlertCircle className={iconClass} />;
    case 'loading':
      return null; // No icon for loading state
    default:
      return <FileX className={iconClass} />;
  }
}

// Specialized empty state components for common use cases
export const NoPhone: React.FC<{ className?: string }> = ({ className }) => (
  <EmptyState 
    message={EMPTY_MESSAGES.NO_PHONE} 
    variant="no-data" 
    showIcon={false}
    className={className}
  />
);

export const NoEmail: React.FC<{ className?: string }> = ({ className }) => (
  <EmptyState 
    message={EMPTY_MESSAGES.NO_EMAIL} 
    variant="no-data" 
    showIcon={false}
    className={className}
  />
);

export const NoAddress: React.FC<{ className?: string }> = ({ className }) => (
  <EmptyState 
    message={EMPTY_MESSAGES.NO_ADDRESS} 
    variant="no-data" 
    showIcon={false}
    className={className}
  />
);

export const NoGuardian: React.FC<{ className?: string }> = ({ className }) => (
  <EmptyState 
    message={EMPTY_MESSAGES.NO_GUARDIAN} 
    variant="no-data" 
    className={className}
  />
);

export const NoStudents: React.FC<{ className?: string }> = ({ className }) => (
  <EmptyState 
    message={EMPTY_MESSAGES.NO_STUDENTS} 
    variant="no-data" 
    className={className}
  />
);

export const NoSubjects: React.FC<{ className?: string }> = ({ className }) => (
  <EmptyState 
    message={EMPTY_MESSAGES.NO_SUBJECTS} 
    variant="no-data" 
    className={className}
  />
);

export const NoQualifications: React.FC<{ className?: string }> = ({ className }) => (
  <EmptyState 
    message={EMPTY_MESSAGES.NO_QUALIFICATIONS} 
    variant="no-data" 
    className={className}
  />
);

export const NoWards: React.FC<{ className?: string }> = ({ className }) => (
  <EmptyState 
    message={EMPTY_MESSAGES.NO_WARDS} 
    variant="no-data" 
    className={className}
  />
);