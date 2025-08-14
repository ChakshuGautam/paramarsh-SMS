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
      <div className="grid w-full gap-2">
        {label && (
          <Label htmlFor={source}>
            {label}
            {isRequired && <span className="ml-1 text-destructive">*</span>}
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
            invalid && "border-destructive",
            className
          )}
        />
        <InputHelperText
          touched={isTouched}
          error={error?.message}
          helperText={helperText}
        />
      </div>
    );
  }
);

NumberInput.displayName = "NumberInput";