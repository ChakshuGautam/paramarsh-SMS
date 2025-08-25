"use client";

import * as React from "react";
import { useInput } from "ra-core";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";

import { DateRangePicker } from "@/components/ui/date-range-picker";
import { InputHelperText } from "./input-helper-text";
import { Label } from "@/components/ui/label";

export interface DateRangeInputProps {
  source: string;
  sourceFrom?: string;
  sourceTo?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  helperText?: string;
  placeholder?: string;
}

/**
 * DateRangeInput for React Admin forms
 * Can work with either:
 * 1. A single source that stores an object with from/to dates
 * 2. Separate sourceFrom and sourceTo fields
 */
export const DateRangeInput = React.forwardRef<HTMLDivElement, DateRangeInputProps>(
  ({ 
    source, 
    sourceFrom,
    sourceTo,
    label, 
    disabled, 
    className, 
    helperText, 
    placeholder = "Select date range",
    ...rest 
  }, ref) => {
    // Use separate fields if provided, otherwise use single source
    const fromSource = sourceFrom || `${source}.from`;
    const toSource = sourceTo || `${source}.to`;

    const fromInput = useInput({
      source: fromSource,
      ...rest,
    });

    const toInput = useInput({
      source: toSource,
      ...rest,
    });

    const isRequired = fromInput.isRequired || toInput.isRequired;
    const invalid = fromInput.fieldState.invalid || toInput.fieldState.invalid;
    const isTouched = fromInput.fieldState.isTouched || toInput.fieldState.isTouched;
    const error = fromInput.fieldState.error?.message || toInput.fieldState.error?.message;
    const isSubmitting = fromInput.formState.isSubmitting;

    const [dateRange, setDateRange] = React.useState<DateRange | undefined>(() => {
      const from = fromInput.field.value ? new Date(fromInput.field.value) : undefined;
      const to = toInput.field.value ? new Date(toInput.field.value) : undefined;
      return from || to ? { from, to } : undefined;
    });

    const handleDateChange = (range: DateRange | undefined) => {
      setDateRange(range);
      
      if (range?.from) {
        fromInput.field.onChange(format(range.from, "yyyy-MM-dd"));
      } else {
        fromInput.field.onChange("");
      }
      
      if (range?.to) {
        toInput.field.onChange(format(range.to, "yyyy-MM-dd"));
      } else {
        toInput.field.onChange("");
      }
    };

    return (
<<<<<<< HEAD
      <div className="flex flex-col gap-2 min-w-0" ref={ref}>
        {label !== false && (
          <Label className="text-sm whitespace-nowrap min-h-[20px]">
            {label}
            {isRequired && label && <span className="ml-1 text-destructive">*</span>}
=======
      <div className="grid w-full gap-2" ref={ref}>
        {label && (
          <Label>
            {label}
            {isRequired && <span className="ml-1 text-destructive">*</span>}
>>>>>>> origin/main
          </Label>
        )}
        <DateRangePicker
          className={className}
          date={dateRange}
          onDateChange={handleDateChange}
          placeholder={placeholder}
          disabled={disabled || isSubmitting}
        />
        <InputHelperText
          touched={isTouched}
          error={error}
          helperText={helperText}
        />
      </div>
    );
  }
);

DateRangeInput.displayName = "DateRangeInput";