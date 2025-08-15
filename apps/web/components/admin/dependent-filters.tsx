"use client";

import { ReferenceInput, AutocompleteInput } from "@/components/admin";
import { useListContext } from "ra-core";

interface DependentSectionFilterProps {
  source: string;
  classIdSource?: string;
  placeholder?: string;
  label?: string | false;
}

/**
 * Section filter that depends on selected class
 * Only shows sections from the selected class
 */
export const DependentSectionFilter = ({ 
  source, 
  classIdSource = "classId", 
  placeholder = "Filter by section",
  label = false 
}: DependentSectionFilterProps) => {
  const { filterValues } = useListContext();
  const classId = filterValues[classIdSource];
  
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
        helperText={!classId ? "Select a class first" : undefined}
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