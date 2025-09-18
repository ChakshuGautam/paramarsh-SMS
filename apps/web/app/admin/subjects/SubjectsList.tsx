"use client";

import { useListContext, useRecordContext, FilterLiveForm, useTranslate, Translate, useDataProvider } from "ra-core";
import { useEffect, useState } from "react";
import {
  DataTable,
  List,
  TextField,
  TextInput,
  NumberInput,
  BooleanInput,
  Count,
  ToggleFilterButton,
} from "@/components/admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Star, Award, Filter, GraduationCap } from "lucide-react";
import type { ReactNode } from "react";

// Store keys for different subject types
const storeKeyByType = {
  core: "subjects.list.core",
  elective: "subjects.list.elective",
  active: "subjects.list.active",
  inactive: "subjects.list.inactive",
  all: "subjects.list.all",
};

export const SubjectsList = () => {
  return (
    <List
      sort={{ field: "name", order: "ASC" }}
      filterDefaultValues={{ isActive: true }}
      perPage={10}
      pagination={false}
    >
      <div className="flex flex-row gap-4 mb-4">
        <SidebarFilters />
        <div className="flex-1">
          <TabbedDataTable />
        </div>
      </div>
    </List>
  );
};

const TabbedDataTable = () => {
  const listContext = useListContext();
  const { filterValues, setFilters, displayedFilters } = listContext;
  
  const handleChange = (value: string) => () => {
    let newFilters = { ...filterValues };
    
    // Clear existing type filters
    delete newFilters.isElective;
    delete newFilters.isActive;
    
    switch (value) {
      case "core":
        newFilters.isElective = false;
        newFilters.isActive = true;
        break;
      case "elective":
        newFilters.isElective = true;
        newFilters.isActive = true;
        break;
      case "active":
        newFilters.isActive = true;
        break;
      case "inactive":
        newFilters.isActive = false;
        break;
      case "all":
        // No additional filters
        break;
    }
    
    setFilters(newFilters, displayedFilters);
  };
  
  // Determine current tab based on filter values
  const getCurrentTab = () => {
    if (filterValues.isElective === false && filterValues.isActive === true) return "core";
    if (filterValues.isElective === true && filterValues.isActive === true) return "elective";
    if (filterValues.isActive === true && filterValues.isElective === undefined) return "active";
    if (filterValues.isActive === false) return "inactive";
    return "all";
  };
  
  return (
    <Tabs value={getCurrentTab()}>
      <TabsList>
        <TabsTrigger value="core" onClick={handleChange("core")}>
          Core Subjects
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, isElective: false, isActive: true }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="elective" onClick={handleChange("elective")}>
          Electives
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, isElective: true, isActive: true }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="active" onClick={handleChange("active")}>
          Active
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, isActive: true }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="inactive" onClick={handleChange("inactive")}>
          Inactive
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, isActive: false }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="all" onClick={handleChange("all")}>
          All Subjects
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues }} />
          </Badge>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="core">
        <SubjectsTable storeKey={storeKeyByType.core} />
      </TabsContent>
      <TabsContent value="elective">
        <SubjectsTable storeKey={storeKeyByType.elective} />
      </TabsContent>
      <TabsContent value="active">
        <SubjectsTable storeKey={storeKeyByType.active} />
      </TabsContent>
      <TabsContent value="inactive">
        <SubjectsTable storeKey={storeKeyByType.inactive} />
      </TabsContent>
      <TabsContent value="all">
        <SubjectsTable storeKey={storeKeyByType.all} />
      </TabsContent>
    </Tabs>
  );
};

const SubjectsTable = ({ storeKey }: { storeKey: string }) => (
  <DataTable 
    storeKey={storeKey}
    rowClassName={(record) => {
      if (!record.isActive) return 'border-l-4 border-l-muted-foreground opacity-60';
      if (record.isElective) return 'border-l-4 border-l-purple-500';
      return 'border-l-4 border-l-blue-500';
    }}
  >
    {/* Always visible columns */}
    <DataTable.Col source="code" label="Code">
      <CodeBadge />
    </DataTable.Col>
    <DataTable.Col source="name" label="Subject Name">
      <NameWithIcon />
    </DataTable.Col>
    <DataTable.Col source="credits" label="Credits">
      <CreditsBadge />
    </DataTable.Col>
    <DataTable.Col label="Classes" className="hidden md:table-cell">
      <ClassTags />
    </DataTable.Col>
    
    {/* Desktop-only columns */}
    <DataTable.Col source="description" label="Description" className="hidden lg:table-cell" />
    <DataTable.Col source="isElective" label="Type" className="hidden lg:table-cell">
      <TypeBadge />
    </DataTable.Col>
  </DataTable>
);

const CodeBadge = () => {
  const record = useRecordContext();
  if (!record || !record.code) return null;
  
  return (
    <Badge variant="outline" className="font-mono">
      {record.code}
    </Badge>
  );
};

const NameWithIcon = () => {
  const record = useRecordContext();
  if (!record) return null;
  
  return (
    <div className="flex items-center gap-2">
      <BookOpen className={`w-4 h-4 ${record.isActive ? 'text-blue-600' : 'text-muted-foreground'}`} />
      <span className={record.isActive ? '' : 'text-muted-foreground'}>{record.name}</span>
    </div>
  );
};

const CreditsBadge = () => {
  const record = useRecordContext();
  if (!record || record.credits === undefined) return null;
  
  const getCreditsColor = (credits: number) => {
    if (credits >= 4) return 'text-purple-700 bg-purple-100';
    if (credits >= 3) return 'text-blue-700 bg-blue-100';
    if (credits >= 2) return 'text-green-700 bg-green-100';
    return 'text-muted-foreground bg-muted';
  };
  
  return (
    <div className="flex items-center gap-2">
      <Award className="w-4 h-4 text-yellow-600" />
      <Badge className={getCreditsColor(record.credits)}>
        {record.credits} credit{record.credits !== 1 ? 's' : ''}
      </Badge>
    </div>
  );
};

const TypeBadge = () => {
  const record = useRecordContext();
  if (!record) return null;
  
  if (record.isElective) {
    return (
      <div className="flex items-center gap-2">
        <Star className="w-4 h-4 text-purple-600" />
        <Badge className="text-purple-700 bg-purple-100">
          Elective
        </Badge>
      </div>
    );
  }
  
  return (
    <Badge className="text-blue-700 bg-blue-100">
      Core
    </Badge>
  );
};

const ClassTags = () => {
  const record = useRecordContext();
  const dataProvider = useDataProvider();
  const [classAssignments, setClassAssignments] = useState<any[]>([]);
  
  useEffect(() => {
    // Note: ClassSubjectTeacher endpoint not yet implemented in backend
    // For now, just show "Not assigned" for all subjects
    setClassAssignments([]);
  }, [record?.id]);
  
  if (!record) return <span className="text-muted-foreground text-sm">-</span>;
  
  // If no assignments found
  if (!classAssignments || classAssignments.length === 0) {
    return (
      <span className="text-xs text-muted-foreground">Not assigned</span>
    );
  }
  
  // Group classes by grade level ranges for compact display
  const classes = classAssignments.map(a => a.class).filter(Boolean);
  const uniqueClasses = Array.from(new Map(classes.map(c => [c.id, c])).values());
  
  // Sort by grade level
  uniqueClasses.sort((a, b) => (a.gradeLevel || 0) - (b.gradeLevel || 0));
  
  // Group by grade level ranges
  const primaryClasses = uniqueClasses.filter(c => c.gradeLevel >= 1 && c.gradeLevel <= 5);
  const middleClasses = uniqueClasses.filter(c => c.gradeLevel >= 6 && c.gradeLevel <= 8);
  const highClasses = uniqueClasses.filter(c => c.gradeLevel >= 9 && c.gradeLevel <= 12);
  
  // Create compact display text
  const displayParts = [];
  if (primaryClasses.length > 0) {
    displayParts.push(`Primary (LKG, UKG, ${primaryClasses.map(c => `Class ${c.gradeLevel}`).join(', ')})`);
  }
  if (middleClasses.length > 0) {
    displayParts.push(`Middle (${middleClasses.map(c => `Class ${c.gradeLevel}`).join(', ')})`);
  }
  if (highClasses.length > 0) {
    displayParts.push(`High (${highClasses.map(c => `Class ${c.gradeLevel}`).join(', ')})`);
  }
  
  // Display as single line text
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-muted-foreground truncate max-w-md">
        {displayParts.join(' | ') || 'Not assigned'}
      </span>
    </div>
  );
};

const SidebarFilters = () => {
  const translate = useTranslate();
  return (
    <div className="min-w-48 hidden md:block">
      <FilterLiveForm>
        <TextInput
          source="q"
          placeholder={translate("ra.action.search")}
          label=""
          className="mb-6"
        />
      </FilterLiveForm>
      <FilterCategory
        icon={<BookOpen size={16} />}
        label="Subject Type"
      >
        <ToggleFilterButton
          label="Core"
          value={{ isElective: false }}
        />
        <ToggleFilterButton
          label="Elective"
          value={{ isElective: true }}
        />
      </FilterCategory>
      <FilterCategory
        icon={<Filter size={16} />}
        label="Status"
      >
        <ToggleFilterButton
          label="Active"
          value={{ isActive: true }}
        />
        <ToggleFilterButton
          label="Inactive"
          value={{ isActive: false }}
        />
      </FilterCategory>
      <FilterCategory
        icon={<GraduationCap size={16} />}
        label="Grade Level"
      >
        <ToggleFilterButton
          label="Primary (1-5)"
          value={{ gradeLevel: 'primary' }}
        />
        <ToggleFilterButton
          label="Middle (6-8)"
          value={{ gradeLevel: 'middle' }}
        />
        <ToggleFilterButton
          label="High (9-12)"
          value={{ gradeLevel: 'high' }}
        />
      </FilterCategory>
      <FilterCategory
        icon={<Award size={16} />}
        label="Credits"
      >
        <ToggleFilterButton
          label="1 Credit"
          value={{ credits: 1 }}
        />
        <ToggleFilterButton
          label="2 Credits"
          value={{ credits: 2 }}
        />
        <ToggleFilterButton
          label="3 Credits"
          value={{ credits: 3 }}
        />
        <ToggleFilterButton
          label="4+ Credits"
          value={{ credits_gte: 4 }}
        />
      </FilterCategory>
    </div>
  );
};

const FilterCategory = ({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children?: ReactNode;
}) => (
  <>
    <h3 className="flex flex-row items-center gap-2 mb-1 font-bold text-sm">
      {icon}
      <Translate i18nKey={label} />
    </h3>
    <div className="flex flex-col items-start ml-3 mb-4">{children}</div>
  </>
);