"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TopToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

/**
 * TopToolbar component for React Admin
 * Used in Show/Edit views to display action buttons
 */
export const TopToolbar = React.forwardRef<HTMLDivElement, TopToolbarProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-between mb-4 gap-2",
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-2">
          {children}
        </div>
      </div>
    );
  }
);

TopToolbar.displayName = "TopToolbar";