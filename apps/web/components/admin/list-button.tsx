"use client";

import * as React from "react";
import { useResourceContext } from "ra-core";
import { useRouter } from "next/navigation";
import { List } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ListButtonProps {
  label?: string;
  resource?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * ListButton component for React Admin
 * Navigates back to the list view of the current resource
 */
export const ListButton = React.forwardRef<HTMLButtonElement, ListButtonProps>(
  ({ label = "List", resource, className, disabled, ...props }, ref) => {
    const router = useRouter();
    const resourceContext = useResourceContext();
    const finalResource = resource || resourceContext;

    const handleClick = () => {
      if (finalResource) {
        router.push(`/admin/${finalResource}`);
      }
    };

    return (
      <Button
        ref={ref}
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={disabled || !finalResource}
        className={className}
        {...props}
      >
        <List className="w-4 h-4 mr-2" />
        {label}
      </Button>
    );
  }
);

ListButton.displayName = "ListButton";