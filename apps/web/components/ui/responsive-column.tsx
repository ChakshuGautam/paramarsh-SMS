import React from 'react';
import { cn } from '@/lib/utils';

export type ResponsiveVisibility = 'always' | 'sm' | 'md' | 'lg' | 'xl';

interface ResponsiveColumnProps {
  visibility?: ResponsiveVisibility;
  className?: string;
  children: React.ReactNode;
}

/**
 * ResponsiveColumn - Wrapper for table cells with responsive visibility
 * 
 * Replaces hardcoded responsive classes like "hidden md:table-cell"
 * throughout the codebase with a centralized, configurable component.
 * 
 * @example
 * // Always visible
 * <ResponsiveColumn>
 *   <TextField source="name" />
 * </ResponsiveColumn>
 * 
 * @example
 * // Visible on medium screens and up
 * <ResponsiveColumn visibility="md">
 *   <TextField source="email" />
 * </ResponsiveColumn>
 * 
 * @example
 * // Visible on large screens and up
 * <ResponsiveColumn visibility="lg">
 *   <DateField source="createdAt" />
 * </ResponsiveColumn>
 */
export const ResponsiveColumn: React.FC<ResponsiveColumnProps> = ({
  visibility = 'always',
  className,
  children
}) => {
  const visibilityClasses: Record<ResponsiveVisibility, string> = {
    always: '',
    sm: 'hidden sm:table-cell',
    md: 'hidden md:table-cell', 
    lg: 'hidden lg:table-cell',
    xl: 'hidden xl:table-cell'
  };

  return (
    <td className={cn(visibilityClasses[visibility], className)}>
      {children}
    </td>
  );
};

/**
 * ResponsiveHeader - Wrapper for table headers with responsive visibility
 * Companion to ResponsiveColumn for table headers
 */
export const ResponsiveHeader: React.FC<ResponsiveColumnProps> = ({
  visibility = 'always',
  className,
  children
}) => {
  const visibilityClasses: Record<ResponsiveVisibility, string> = {
    always: '',
    sm: 'hidden sm:table-cell',
    md: 'hidden md:table-cell',
    lg: 'hidden lg:table-cell', 
    xl: 'hidden xl:table-cell'
  };

  return (
    <th className={cn(visibilityClasses[visibility], className)}>
      {children}
    </th>
  );
};

/**
 * ResponsiveDiv - Generic responsive wrapper for non-table elements
 */
export const ResponsiveDiv: React.FC<ResponsiveColumnProps> = ({
  visibility = 'always',
  className,
  children
}) => {
  const visibilityClasses: Record<ResponsiveVisibility, string> = {
    always: '',
    sm: 'hidden sm:block',
    md: 'hidden md:block',
    lg: 'hidden lg:block',
    xl: 'hidden xl:block'
  };

  return (
    <div className={cn(visibilityClasses[visibility], className)}>
      {children}
    </div>
  );
};

/**
 * ResponsiveSpan - Inline responsive wrapper
 */
export const ResponsiveSpan: React.FC<ResponsiveColumnProps> = ({
  visibility = 'always',
  className,
  children
}) => {
  const visibilityClasses: Record<ResponsiveVisibility, string> = {
    always: '',
    sm: 'hidden sm:inline',
    md: 'hidden md:inline',
    lg: 'hidden lg:inline',
    xl: 'hidden xl:inline'
  };

  return (
    <span className={cn(visibilityClasses[visibility], className)}>
      {children}
    </span>
  );
};

// Export all components
export default {
  Column: ResponsiveColumn,
  Header: ResponsiveHeader,
  Div: ResponsiveDiv,
  Span: ResponsiveSpan
};