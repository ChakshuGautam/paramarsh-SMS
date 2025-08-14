"use client";

import React, { ReactNode, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslate } from "ra-core";

interface FilterCategoryProps {
  icon?: ReactNode;
  label: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export const FilterCategory: React.FC<FilterCategoryProps> = ({
  icon,
  label,
  children,
  defaultOpen = true,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const translate = useTranslate();

  return (
    <div className={cn("border-b border-gray-200 dark:border-gray-700", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-gray-500 dark:text-gray-400">{icon}</span>}
          <span className="font-medium text-sm text-gray-700 dark:text-gray-300">
            {translate(label, { _: label })}
          </span>
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-400" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 py-2 space-y-1">
          {children}
        </div>
      )}
    </div>
  );
};

export default FilterCategory;