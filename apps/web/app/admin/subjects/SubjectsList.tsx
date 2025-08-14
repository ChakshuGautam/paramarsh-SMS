"use client";

import { useListContext } from "ra-core";
import {
  DataTable,
  List,
  TextField,
  TextInput,
  NumberInput,
  BooleanInput,
  Count,
} from "@/components/admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Star, Award } from "lucide-react";

// Store keys for different subject types
const storeKeyByType = {
  core: "subjects.list.core",
  elective: "subjects.list.elective",
  active: "subjects.list.active",
  inactive: "subjects.list.inactive",
  all: "subjects.list.all",
};

// Label-less filters with placeholders
const subjectFilters = [
  <TextInput source="q" placeholder="Search subjects..." label={false} alwaysOn />,
  <NumberInput source="credits" placeholder="Filter by credits" label={false} />,
  <BooleanInput source="isActive" label={false} />,
  <BooleanInput source="isElective" label={false} />,
];

export const SubjectsList = () => {
  return (
    <List
      sort={{ field: "name", order: "ASC" }}
      filterDefaultValues={{ isActive: true }}
      filters={subjectFilters}
      perPage={25}
    >
      <TabbedDataTable />
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
      if (!record.isActive) return 'border-l-4 border-l-gray-400 opacity-60';
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
    
    {/* Desktop-only columns */}
    <DataTable.Col source="description" label="Description" className="hidden md:table-cell" />
    <DataTable.Col source="isElective" label="Type" className="hidden md:table-cell">
      <TypeBadge />
    </DataTable.Col>
    <DataTable.Col source="createdAt" label="Created" className="hidden lg:table-cell" />
  </DataTable>
);

const CodeBadge = ({ record }: { record?: any }) => {
  if (!record || !record.code) return null;
  
  return (
    <Badge variant="outline" className="font-mono">
      {record.code}
    </Badge>
  );
};

const NameWithIcon = ({ record }: { record?: any }) => {
  if (!record) return null;
  
  return (
    <div className="flex items-center gap-2">
      <BookOpen className={`w-4 h-4 ${record.isActive ? 'text-blue-600' : 'text-gray-400'}`} />
      <span className={record.isActive ? '' : 'text-gray-500'}>{record.name}</span>
    </div>
  );
};

const CreditsBadge = ({ record }: { record?: any }) => {
  if (!record || record.credits === undefined) return null;
  
  const getCreditsColor = (credits: number) => {
    if (credits >= 4) return 'text-purple-700 bg-purple-100';
    if (credits >= 3) return 'text-blue-700 bg-blue-100';
    if (credits >= 2) return 'text-green-700 bg-green-100';
    return 'text-gray-700 bg-gray-100';
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

const TypeBadge = ({ record }: { record?: any }) => {
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