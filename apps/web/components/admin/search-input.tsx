"use client";

import { forwardRef } from "react";
import { useInput } from "ra-core";
import { InputHelperText } from "./input-helper-text";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { sanitizeInputRestProps } from "@/lib/sanitizeInputRestProps";

export interface SearchInputProps {
  source: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  helperText?: string;
  alwaysOn?: boolean;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ source, label, placeholder = "Search...", disabled, className, helperText, alwaysOn, ...rest }, ref) => {
    // Extract alwaysOn to prevent it from being passed to DOM
    // alwaysOn is used by React Admin for filter persistence but shouldn't go to DOM elements
    const {
      field,
      fieldState: { isTouched, invalid, error },
      formState: { isSubmitting },
      isRequired,
    } = useInput({
      source,
      ...sanitizeInputRestProps({ ...rest, alwaysOn }),
    });

    return (
      <div className="flex items-center gap-2 min-w-0">
        {label && (
          <Label htmlFor={source} className="text-sm whitespace-nowrap">
            {label}
            {isRequired && <span className="ml-1 text-destructive">*</span>}
          </Label>
        )}
        <div className="relative flex-shrink min-w-[180px] max-w-[280px]">
          <Search className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
          <Input
            {...field}
            ref={ref}
            type="search"
            id={source}
            placeholder={placeholder}
            disabled={disabled || isSubmitting}
            className={cn(
              "pl-7 h-8 text-sm",
              invalid && "border-destructive",
              className
            )}
          />
        </div>
        {(error?.message || helperText) && (
          <InputHelperText
            touched={isTouched}
            error={error?.message}
            helperText={helperText}
          />
        )}
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";