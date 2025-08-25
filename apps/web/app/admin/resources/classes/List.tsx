"use client";

import { useListContext, useRecordContext } from "ra-core";
import {
  DataTable,
  List,
<<<<<<< HEAD
  Count,
  ReferenceField,
  TextField,
  EmptyState,
  TextInput,
  SelectInput,
=======
  TextInput,
  SelectInput,
  Count,
  ReferenceField,
  TextField,
>>>>>>> origin/main
} from "@/components/admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// Store keys for different grade level groups
const storeKeyByLevel = {
  primary: "classes.list.primary",
  middle: "classes.list.middle",
  high: "classes.list.high",
  all: "classes.list.all",
};

// Helper function to get grade level filters
const getGradeLevelFilter = (level: string) => {
  switch (level) {
    case "primary":
      return { gradeLevel_gte: 1, gradeLevel_lte: 5 };
    case "middle":
      return { gradeLevel_gte: 6, gradeLevel_lte: 8 };
    case "high":
      return { gradeLevel_gte: 9, gradeLevel_lte: 12 };
    default:
      return {};
  }
};

<<<<<<< HEAD
// Standardized filters with placeholders
const classFilters = [
  <TextInput key="search" source="q" placeholder="Search classes..." label="" alwaysOn />,
  <SelectInput 
    key="gradeLevel"
    source="gradeLevel" 
    placeholder="Filter by grade level" 
    label=""
=======
// Label-less filters with placeholders
const classFilters = [
  <TextInput source="q" placeholder="Search classes..." label="" alwaysOn />,
  <SelectInput 
    source="gradeLevel" 
    placeholder="Filter by grade" 
    label="" 
>>>>>>> origin/main
    choices={[
      { id: 1, name: 'Grade 1' },
      { id: 2, name: 'Grade 2' },
      { id: 3, name: 'Grade 3' },
      { id: 4, name: 'Grade 4' },
      { id: 5, name: 'Grade 5' },
      { id: 6, name: 'Grade 6' },
      { id: 7, name: 'Grade 7' },
      { id: 8, name: 'Grade 8' },
      { id: 9, name: 'Grade 9' },
      { id: 10, name: 'Grade 10' },
      { id: 11, name: 'Grade 11' },
      { id: 12, name: 'Grade 12' },
<<<<<<< HEAD
    ]}
=======
    ]} 
>>>>>>> origin/main
  />,
];

export const ClassesList = () => (
  <List
    sort={{ field: "gradeLevel", order: "ASC" }}
    filters={classFilters}
    perPage={10}
  >
    <TabbedDataTable />
  </List>
);

const TabbedDataTable = () => {
  const listContext = useListContext();
  const { filterValues, setFilters, displayedFilters } = listContext;
  
  const handleChange = (value: string) => () => {
    const gradeLevelFilter = getGradeLevelFilter(value);
    setFilters({ ...filterValues, ...gradeLevelFilter }, displayedFilters);
  };
  
  // Determine current tab based on filter values
  const getCurrentTab = () => {
    if (filterValues.gradeLevel_gte === 1 && filterValues.gradeLevel_lte === 5) return "primary";
    if (filterValues.gradeLevel_gte === 6 && filterValues.gradeLevel_lte === 8) return "middle";
    if (filterValues.gradeLevel_gte === 9 && filterValues.gradeLevel_lte === 12) return "high";
    return "all";
  };
  
  return (
    <Tabs value={getCurrentTab()}>
      <TabsList>
        <TabsTrigger value="primary" onClick={handleChange("primary")}>
          Primary (1-5)
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, ...getGradeLevelFilter("primary") }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="middle" onClick={handleChange("middle")}>
          Middle (6-8)
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, ...getGradeLevelFilter("middle") }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="high" onClick={handleChange("high")}>
          High (9-12)
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, ...getGradeLevelFilter("high") }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="all" onClick={handleChange("all")}>
          All Classes
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, ...getGradeLevelFilter("all") }} />
          </Badge>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="primary">
        <ClassesTable storeKey={storeKeyByLevel.primary} />
      </TabsContent>
      <TabsContent value="middle">
        <ClassesTable storeKey={storeKeyByLevel.middle} />
      </TabsContent>
      <TabsContent value="high">
        <ClassesTable storeKey={storeKeyByLevel.high} />
      </TabsContent>
      <TabsContent value="all">
        <ClassesTable storeKey={storeKeyByLevel.all} />
      </TabsContent>
    </Tabs>
  );
};

const ClassesTable = ({ storeKey }: { storeKey: string }) => (
  <DataTable 
    storeKey={storeKey}
    rowClassName={(record) => {
      const gradeColors = {
        1: 'border-l-4 border-l-blue-300',
        2: 'border-l-4 border-l-blue-300',
        3: 'border-l-4 border-l-blue-300',
        4: 'border-l-4 border-l-blue-300',
        5: 'border-l-4 border-l-blue-300',
        6: 'border-l-4 border-l-green-400',
        7: 'border-l-4 border-l-green-400',
        8: 'border-l-4 border-l-green-400',
        9: 'border-l-4 border-l-purple-400',
        10: 'border-l-4 border-l-purple-400',
        11: 'border-l-4 border-l-purple-400',
        12: 'border-l-4 border-l-purple-400',
      };
      return gradeColors[record.gradeLevel] || '';
    }}
  >
    {/* Always visible columns */}
    <DataTable.Col source="name" label="Class Name" />
    <DataTable.Col source="gradeLevel" label="Grade Level">
      <GradeBadge />
    </DataTable.Col>
    
    {/* Desktop-only columns */}
<<<<<<< HEAD
    <DataTable.Col label="Class Teacher" responsiveVisibility="md">
      <ClassTeacher />
    </DataTable.Col>
=======
    <DataTable.Col label="Class Teacher" className="hidden md:table-cell">
      <ClassTeacher />
    </DataTable.Col>
    <DataTable.Col source="id" label="ID" className="hidden lg:table-cell" />
>>>>>>> origin/main
  </DataTable>
);

const GradeBadge = () => {
  const record = useRecordContext();
  if (!record || record.gradeLevel === null || record.gradeLevel === undefined) return null;
  
  const getGradeColor = (grade: number) => {
    if (grade <= 5) return 'text-blue-700 bg-blue-100';
    if (grade <= 8) return 'text-green-700 bg-green-100';
    return 'text-purple-700 bg-purple-100';
  };
  
  return (
    <Badge className={getGradeColor(record.gradeLevel)}>
      Grade {record.gradeLevel}
    </Badge>
  );
};

const ClassTeacher = () => {
  const record = useRecordContext();
  if (!record) return null;
  
  // Get the first section of this class to find its homeroom teacher
  // In a real app, you might want to have a dedicated class teacher field
  return (
    <span className="text-gray-500 text-sm">
      {/* This would need to be implemented with proper data */}
<<<<<<< HEAD
      <EmptyState type="inline" message="No teacher assigned" />
=======
      <em>No teacher assigned</em>
>>>>>>> origin/main
    </span>
  );
};

export default ClassesList;
