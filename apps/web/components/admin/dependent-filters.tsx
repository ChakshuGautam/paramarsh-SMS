"use client";

import { ReferenceInput, AutocompleteInput } from "@/components/admin";
import { useListContext } from "ra-core";
import { useWatch, useFormContext } from "react-hook-form";
import React, { useEffect } from "react";

interface DependentSectionFilterProps {
  source: string;
  classIdSource?: string;
  placeholder?: string;
  label?: string | false;
  className?: string;
}

/**
 * Section filter that depends on selected class
 * Only shows sections from the selected class
 */
export const DependentSectionFilter = ({ 
  source, 
  classIdSource = "classId", 
  placeholder = "Filter by section",
  label = false,
  className
}: DependentSectionFilterProps) => {
  const { filterValues, setFilters } = useListContext();
  const classId = filterValues[classIdSource];
  const sectionId = filterValues[source];
  
  // Clear section filter when class changes
  useEffect(() => {
    if (sectionId && !classId) {
      // If section is selected but no class, clear section
      setFilters({ ...filterValues, [source]: undefined }, filterValues);
    }
  }, [classId, sectionId, source, filterValues, setFilters]);
  
  return (
    <ReferenceInput 
      source={source} 
      reference="sections"
      filter={classId ? { classId } : {}}
    >
      <AutocompleteInput 
        placeholder={placeholder} 
        label={label} 
        optionText="name"
        disabled={!classId}
        allowEmpty
        emptyText="All Sections"
        className={className}
      />
    </ReferenceInput>
  );
};

interface UniqueReferenceFilterProps {
  source: string;
  reference: string;
  optionText: string;
  placeholder?: string;
  label?: string | false;
  additionalFilter?: Record<string, any>;
}

/**
 * Reference filter that only shows unique values
 * Useful for avoiding duplicate display names
 */
export const UniqueReferenceFilter = ({ 
  source,
  reference,
  optionText,
  placeholder,
  label = false,
  additionalFilter = {}
}: UniqueReferenceFilterProps) => {
  return (
    <ReferenceInput 
      source={source} 
      reference={reference}
      filter={{
        ...additionalFilter,
        // Add a unique constraint parameter that the backend can handle
        _distinct: optionText,
      }}
    >
      <AutocompleteInput 
        placeholder={placeholder} 
        label={label} 
        optionText={optionText}
      />
    </ReferenceInput>
  );
};

/**
 * Class filter for student forms/filters
 */
export const ClassFilter = ({ 
  source = "classId", 
  placeholder = "Filter by class",
  label = false 
}) => (
  <ReferenceInput source={source} reference="classes">
    <AutocompleteInput 
      placeholder={placeholder} 
      label={label} 
      optionText="name" 
    />
  </ReferenceInput>
);

/**
 * Enhanced section filter that shows unique sections and can be dependent
 */
export const SectionFilter = ({ 
  source = "sectionId",
  classIdSource,
  placeholder = "Filter by section",
  label = false,
  showUnique = false,
  hideUntilClassSelected = true
}) => {
  const { filterValues } = useListContext();
  const classId = classIdSource ? filterValues[classIdSource] : undefined;
  
  // Hide the filter completely if class is not selected and hideUntilClassSelected is true
  if (hideUntilClassSelected && classIdSource && !classId) {
    return null;
  }
  
  const filter = classId ? { classId } : {};
  
  // Add unique constraint if requested
  if (showUnique && !classId) {
    filter._distinct = "name";
  }
  
  return (
    <ReferenceInput 
      source={source} 
      reference="sections"
      filter={filter}
    >
      <AutocompleteInput 
        placeholder={placeholder} 
        label={label} 
        optionText="name"
        disabled={classIdSource && !classId}
      />
    </ReferenceInput>
  );
};

interface DependentSectionInputProps {
  source?: string;
  classIdSource?: string;
  placeholder?: string;
  label?: string;
  validate?: any;
}

/**
 * Section input for forms that depends on selected class
 * Only shows sections from the selected class
 * Works with React Admin forms using useWatch
 */
export const DependentSectionInput = ({ 
  source = "sectionId", 
  classIdSource = "classId", 
  placeholder = "Search for section",
  label = "Section",
  validate
}: DependentSectionInputProps) => {
  const classId = useWatch({ name: classIdSource });
  const { setValue, getValues } = useFormContext();
  const [previousClassId, setPreviousClassId] = React.useState(classId);
  
  // Clear section only when class actually changes (not on initial load)
  useEffect(() => {
    if (previousClassId && classId && previousClassId !== classId) {
      // Clear the section field only when class changes to a different value
      setValue(source, null);
    }
    setPreviousClassId(classId);
  }, [classId, source, setValue, previousClassId]);
  
  if (!classId) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <div className="relative">
          <button
            type="button"
            disabled
            className="w-full flex items-center justify-between rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
          >
            <span>Select a class first</span>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <ReferenceInput 
      source={source} 
      reference="sections"
      filter={{ classId }}
      label={label}
    >
      <AutocompleteInput 
        optionText="name" 
        placeholder={placeholder}
        validate={validate}
      />
    </ReferenceInput>
  );
};