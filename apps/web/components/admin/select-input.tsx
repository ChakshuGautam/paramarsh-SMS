"use client";

import { forwardRef, ReactNode } from "react";
import { useInput, useChoicesContext } from "ra-core";
import { InputHelperText } from "./input-helper-text";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface SelectInputProps {
  source: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  helperText?: string;
  choices?: Array<{ id: string | number; name: string }>;
  optionText?: string | ((record: any) => string);
  optionValue?: string;
  placeholder?: string;
  emptyText?: string;
  translateChoice?: boolean;
  children?: ReactNode;
}

export const SelectInput = forwardRef<HTMLDivElement, SelectInputProps>(
  (
    {
      source,
      label,
      disabled,
      className,
      helperText,
      choices: providedChoices,
      optionText = "name",
      optionValue = "id",
      placeholder = "Select an option",
      emptyText = "No options available",
      translateChoice = true,
      children,
      ...rest
    },
    ref
  ) => {
    // Guard against missing source prop
    if (!source) {
      console.error('SelectInput: source prop is required');
      return (
        <div className="text-destructive">
          Error: SelectInput requires a source prop
        </div>
      );
    }

    const {
      field,
      fieldState: { isTouched, invalid, error },
      formState: { isSubmitting },
      isRequired,
    } = useInput({
      source,
      ...rest,
    });

    // Get choices from context if in a ReferenceInput
    const choicesContext = useChoicesContext();
    const choices = providedChoices || choicesContext?.allChoices || [];

    const getOptionLabel = (choice: any) => {
      if (typeof optionText === "function") {
        return optionText(choice);
      }
      return choice[optionText] || choice.id;
    };

    const getOptionValue = (choice: any) => {
      return String(choice[optionValue] || choice.id);
    };

    return (
      <div className="flex items-center gap-2 min-w-0">
        {label && (
          <Label htmlFor={source} className="text-sm whitespace-nowrap">
            {label}
            {isRequired && <span className="ml-1 text-destructive">*</span>}
          </Label>
        )}
        <Select
          value={field.value ? String(field.value) : undefined}
          onValueChange={field.onChange}
          disabled={disabled || isSubmitting}
        >
          <SelectTrigger 
            ref={ref}
            id={source}
            className={cn(
              "h-8 text-sm min-w-[160px] max-w-[240px]",
              invalid ? "border-destructive" : "",
              className
            )}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {choices.length === 0 ? (
              <div className="py-2 px-3 text-sm text-muted-foreground">
                {emptyText}
              </div>
            ) : (
              choices.map((choice) => (
                <SelectItem
                  key={getOptionValue(choice)}
                  value={getOptionValue(choice)}
                >
                  {getOptionLabel(choice)}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {(error?.message || helperText) && (
          <InputHelperText
            touched={isTouched}
            error={error?.message}
            helperText={helperText}
          />
        )}
        {children}
      </div>
    );
  }
);

SelectInput.displayName = "SelectInput";