"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useInput } from "ra-core";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { InputHelperText } from "./input-helper-text";
import { Label } from "@/components/ui/label";

export interface DateInputProps {
  source: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  helperText?: string;
  placeholder?: string;
}

export const DateInput = React.forwardRef<HTMLDivElement, DateInputProps>(
  ({ source, label, disabled, className, helperText, placeholder = "Pick a date", ...rest }, ref) => {
    const {
      field,
      fieldState: { isTouched, invalid, error },
      formState: { isSubmitting },
      isRequired,
    } = useInput({
      source,
      ...rest,
    });

    const [date, setDate] = React.useState<Date | undefined>(
      field.value ? new Date(field.value) : undefined
    );

    React.useEffect(() => {
      if (date) {
        field.onChange(format(date, "yyyy-MM-dd"));
      } else {
        field.onChange("");
      }
    }, [date]);

    return (
      <div className="grid w-full gap-2">
        {label && (
          <Label htmlFor={source}>
            {label}
            {isRequired && <span className="ml-1 text-destructive">*</span>}
          </Label>
        )}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id={source}
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground",
                invalid && "border-destructive",
                className
              )}
              disabled={disabled || isSubmitting}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>{placeholder}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" ref={ref}>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <InputHelperText
          touched={isTouched}
          error={error?.message}
          helperText={helperText}
        />
      </div>
    );
  }
);

DateInput.displayName = "DateInput";