/**
 * Filter Wrapper Component
 * 
 * Ensures consistent styling, dimensions, and behavior for all filter components
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface FilterWrapperProps {
  children: React.ReactNode;
  className?: string;
  minWidth?: string;
  maxWidth?: string;
}

/**
 * Wrapper component that ensures consistent filter dimensions and styling
 * - Consistent height: 40px (h-10)
 * - Minimum width: 180px
 * - Maximum width: 320px for better readability
 * - Consistent padding and borders
 */
export const FilterWrapper: React.FC<FilterWrapperProps> = ({ 
  children, 
  className,
  minWidth = "180px",
  maxWidth = "320px"
}) => {
  return (
    <div 
      className={cn(
        "filter-wrapper",
        "inline-flex items-center",
        className
      )}
      style={{
        minWidth,
        maxWidth,
      }}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          // Apply consistent className to the child component
          return React.cloneElement(child as React.ReactElement<any>, {
            className: cn(
              "h-10", // Consistent height
              "w-full", // Full width within wrapper
              "text-sm", // Consistent text size
              (child.props as any).className
            ),
            // Ensure consistent styling props
            size: "small",
            variant: "outlined",
            fullWidth: true,
          });
        }
        return child;
      })}
    </div>
  );
};

/**
 * Filter container for organizing multiple filters
 * Ensures consistent spacing and responsive layout
 */
export const FilterContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => {
  return (
    <div 
      className={cn(
        "filter-container",
        "flex flex-wrap items-center gap-2 p-2",
        "border-b border-gray-200",
        className
      )}
    >
      {children}
    </div>
  );
};

/**
 * Style constants for consistent filter appearance
 */
export const FILTER_STYLES = {
  // Input field styles
  input: {
    base: "h-10 px-3 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary",
    error: "border-red-500 focus:ring-red-500",
    disabled: "bg-gray-50 cursor-not-allowed opacity-60",
  },
  
  // Select/Dropdown styles
  select: {
    base: "h-10 px-3 text-sm border rounded-md bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary",
    placeholder: "text-gray-500",
    icon: "w-4 h-4 text-gray-400",
  },
  
  // Common dimensions
  dimensions: {
    height: "40px", // h-10 in Tailwind
    minWidth: "180px",
    maxWidth: "320px",
    gap: "8px", // gap-2 in Tailwind
  },
  
  // Consistent colors
  colors: {
    border: "#e5e7eb", // gray-200
    focus: "#3b82f6", // blue-500
    placeholder: "#9ca3af", // gray-400
    text: "#111827", // gray-900
  },
  
  // Responsive breakpoints
  responsive: {
    mobile: "w-full",
    tablet: "w-auto min-w-[180px]",
    desktop: "w-auto min-w-[200px] max-w-[320px]",
  },
};

/**
 * Hook for consistent filter styling
 */
export const useFilterStyles = (variant: 'input' | 'select' | 'date' | 'number' = 'input') => {
  const baseStyles = {
    height: FILTER_STYLES.dimensions.height,
    minWidth: FILTER_STYLES.dimensions.minWidth,
    fontSize: '14px',
    lineHeight: '20px',
  };
  
  const variantStyles = {
    input: {
      ...baseStyles,
      padding: '0 12px',
    },
    select: {
      ...baseStyles,
      padding: '0 12px',
      cursor: 'pointer',
    },
    date: {
      ...baseStyles,
      padding: '0 12px',
    },
    number: {
      ...baseStyles,
      padding: '0 12px',
      textAlign: 'right' as const,
    },
  };
  
  return variantStyles[variant];
};

export default FilterWrapper;