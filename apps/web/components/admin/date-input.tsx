"use client";

import * as React from "react";
import { format, isValid, parse } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useInput } from "ra-core";
import { DayPicker, type DayPickerProps } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

// Generate years from 1940 to current year + 10
const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1940 + 11 }, (_, i) => 1940 + i);

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Enhanced Calendar with year/month dropdowns and decade navigation
interface EnhancedCalendarProps extends DayPickerProps {
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
}

const EnhancedCalendar = ({ selected, onSelect, ...props }: EnhancedCalendarProps) => {
  const [month, setMonth] = React.useState<Date>(selected || new Date());

  // Handle year change
  const handleYearChange = (year: string) => {
    const newDate = new Date(month);
    newDate.setFullYear(parseInt(year));
    setMonth(newDate);
  };

  // Handle month change
  const handleMonthChange = (monthIndex: string) => {
    const newDate = new Date(month);
    newDate.setMonth(parseInt(monthIndex));
    setMonth(newDate);
  };

  // Decade navigation
  const goToPreviousDecade = () => {
    const newDate = new Date(month);
    newDate.setFullYear(month.getFullYear() - 10);
    setMonth(newDate);
  };

  const goToNextDecade = () => {
    const newDate = new Date(month);
    newDate.setFullYear(month.getFullYear() + 10);
    setMonth(newDate);
  };

  return (
    <div className="p-3">
      {/* Enhanced Header with Year/Month Dropdowns and Decade Navigation */}
      <div className="flex items-center justify-between space-x-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPreviousDecade}
          title="Previous Decade"
          className="h-7 w-7 p-0"
        >
          <ChevronLeft className="h-3 w-3" />
          <ChevronLeft className="h-3 w-3 -ml-1" />
        </Button>

        <div className="flex items-center space-x-2 flex-1">
          {/* Month Dropdown */}
          <Select
            value={month.getMonth().toString()}
            onValueChange={handleMonthChange}
          >
            <SelectTrigger className="h-8 w-auto min-w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((monthName, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {monthName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Year Dropdown */}
          <Select
            value={month.getFullYear().toString()}
            onValueChange={handleYearChange}
          >
            <SelectTrigger className="h-8 w-auto min-w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {years.reverse().map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={goToNextDecade}
          title="Next Decade"
          className="h-7 w-7 p-0"
        >
          <ChevronRight className="h-3 w-3" />
          <ChevronRight className="h-3 w-3 -ml-1" />
        </Button>
      </div>

      {/* Calendar */}
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={onSelect}
        month={month}
        onMonthChange={setMonth}
        showOutsideDays={true}
        className="p-0"
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "hidden", // Hide default caption since we have custom header
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell:
            "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          day: cn(
            "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
          ),
          day_range_end: "day-range-end",
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground",
          day_outside:
            "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle:
            "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
        }}
        {...props}
      />
    </div>
  );
};

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
    const [textValue, setTextValue] = React.useState<string>(
      field.value || ""
    );
    const [isOpen, setIsOpen] = React.useState(false);
    const [inputMode, setInputMode] = React.useState<'calendar' | 'text'>('calendar');

    // Update form field when date changes
    React.useEffect(() => {
      if (date) {
        const formatted = format(date, "yyyy-MM-dd");
        field.onChange(formatted);
        setTextValue(formatted);
      } else {
        field.onChange("");
        setTextValue("");
      }
    }, [date, field]);

    // Handle text input change
    const handleTextInputChange = (value: string) => {
      setTextValue(value);
      
      // Try to parse the input as a date
      if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const parsedDate = parse(value, "yyyy-MM-dd", new Date());
        if (isValid(parsedDate)) {
          setDate(parsedDate);
        }
      } else if (value === "") {
        setDate(undefined);
      }
    };

    // Handle text input blur - validate format
    const handleTextInputBlur = () => {
      if (textValue && !textValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Invalid format, reset to last valid date or empty
        if (date) {
          setTextValue(format(date, "yyyy-MM-dd"));
        } else {
          setTextValue("");
        }
      }
    };

    // Handle calendar date selection
    const handleCalendarSelect = (selectedDate: Date | undefined) => {
      setDate(selectedDate);
      setIsOpen(false);
    };

    return (
      <div className="grid w-full gap-2">
        {label && (
          <Label htmlFor={source}>
            {label}
            {isRequired && <span className="ml-1 text-destructive">*</span>}
          </Label>
        )}
        
        <div className="flex gap-2">
          {/* Calendar Picker */}
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                id={source}
                variant="outline"
                className={cn(
                  "flex-1 justify-start text-left font-normal",
                  !date && "text-muted-foreground",
                  invalid && "border-destructive",
                  className
                )}
                disabled={disabled || isSubmitting}
                onClick={() => setInputMode('calendar')}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>{placeholder}</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" ref={ref}>
              <EnhancedCalendar
                selected={date}
                onSelect={handleCalendarSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Text Input Toggle */}
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => setInputMode(inputMode === 'text' ? 'calendar' : 'text')}
            disabled={disabled || isSubmitting}
            title={inputMode === 'text' ? 'Switch to calendar' : 'Type date directly'}
            className="px-3"
          >
            {inputMode === 'text' ? <CalendarIcon className="h-4 w-4" /> : 'ABC'}
          </Button>
        </div>

        {/* Direct Text Input Mode */}
        {inputMode === 'text' && (
          <Input
            type="text"
            placeholder="YYYY-MM-DD (e.g., 1985-06-15)"
            value={textValue}
            onChange={(e) => handleTextInputChange(e.target.value)}
            onBlur={handleTextInputBlur}
            disabled={disabled || isSubmitting}
            className={cn(
              "mt-1",
              invalid && "border-destructive"
            )}
          />
        )}

        <InputHelperText
          touched={isTouched}
          error={error?.message}
          helperText={helperText || (inputMode === 'text' ? 'Format: YYYY-MM-DD (e.g., 1985-06-15)' : undefined)}
        />
      </div>
    );
  }
);

DateInput.displayName = "DateInput";