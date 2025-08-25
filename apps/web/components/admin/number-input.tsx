"use client";

import { forwardRef } from "react";
import { useInput } from "ra-core";
import { InputHelperText } from "./input-helper-text";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface NumberInputProps {
  source: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  helperText?: string;
  min?: number;
  max?: number;
  step?: number;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ source, label, placeholder, disabled, className, helperText, min, max, step = 1, ...rest }, ref) => {
    const {
      field,
      fieldState: { isTouched, invalid, error },
      formState: { isSubmitting },
      isRequired,
    } = useInput({
      source,
      ...rest,
    });

    return (
      <div className="flex flex-col gap-2 min-w-0">
        {label !== false && (
          <Label htmlFor={source} className="text-sm whitespace-nowrap min-h-[20px]">
            {label}
            {isRequired && label && <span className="ml-1 text-destructive">*</span>}
          </Label>
        )}
        <Input
          {...field}
          ref={ref}
          type="number"
          id={source}
          placeholder={placeholder}
          disabled={disabled || isSubmitting}
          min={min}
          max={max}
          step={step}
          className={cn(
            "h-10 text-sm min-w-[160px] max-w-[240px]",
            invalid && "border-destructive",
            className
          )}
        />
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

NumberInput.displayName = "NumberInput";