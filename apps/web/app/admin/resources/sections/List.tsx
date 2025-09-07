"use client";

import { useListContext, useRecordContext } from "ra-core";
import {
  DataTable,
  List,
  ReferenceField,
  TextField,
  Count,
  EmptyState,
  TextInput,
  SelectInput,
  NumberInput,
  ListPagination,
} from "@/components/admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { useRedirect } from "ra-core";

// Store keys for different grade level groups
const storeKeyByLevel = {
  primary: "sections.list.primary",
  middle: "sections.list.middle",
  high: "sections.list.high",
  all: "sections.list.all",
};

// Helper function to get grade level filters via class reference
const getGradeLevelFilter = (level: string) => {
  switch (level) {
    case "primary":
      return { "class.gradeLevel_gte": 1, "class.gradeLevel_lte": 5 };
    case "middle":
      return { "class.gradeLevel_gte": 6, "class.gradeLevel_lte": 8 };
    case "high":
      return { "class.gradeLevel_gte": 9, "class.gradeLevel_lte": 12 };
    default:
      return {};
  }
};

// Standardized filters using filter components
const sectionFilters = [
  <TextInput source="q" placeholder="Search sections..." label="" alwaysOn />,
  <SelectInput 
    source="classId" 
    placeholder="Filter by class" 
    label="" 
    choices={[]} // Would need to be populated with class data
  />,
  <NumberInput source="capacity_gte" placeholder="Min capacity" label="" />,
];

const ViewTimetableButton = ({ record }: { record?: any }) => {
  const redirect = useRedirect();
  
  if (!record || !record.id) {
    return null;
  }
  
  const handleClick = () => {
    // Navigate to the timetable view for this section
    redirect('/admin/timetable', { filter: { sectionId: record.id } });
  };
  
  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={handleClick}
    >
      <Calendar className="w-4 h-4 mr-2" />
      View Timetable
    </Button>
  );
};

export const SectionsList = () => (
  <List
    sort={{ field: "name", order: "ASC" }}
    filters={sectionFilters}
    perPage={10}
    pagination={false}
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
    if (filterValues["class.gradeLevel_gte"] === 1 && filterValues["class.gradeLevel_lte"] === 5) return "primary";
    if (filterValues["class.gradeLevel_gte"] === 6 && filterValues["class.gradeLevel_lte"] === 8) return "middle";
    if (filterValues["class.gradeLevel_gte"] === 9 && filterValues["class.gradeLevel_lte"] === 12) return "high";
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
          All Sections
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, ...getGradeLevelFilter("all") }} />
          </Badge>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="primary">
        <SectionsTable storeKey={storeKeyByLevel.primary} />
        <ListPagination className="justify-start mt-2" />
      </TabsContent>
      <TabsContent value="middle">
        <SectionsTable storeKey={storeKeyByLevel.middle} />
        <ListPagination className="justify-start mt-2" />
      </TabsContent>
      <TabsContent value="high">
        <SectionsTable storeKey={storeKeyByLevel.high} />
        <ListPagination className="justify-start mt-2" />
      </TabsContent>
      <TabsContent value="all">
        <SectionsTable storeKey={storeKeyByLevel.all} />
        <ListPagination className="justify-start mt-2" />
      </TabsContent>
    </Tabs>
  );
};

const SectionsTable = ({ storeKey }: { storeKey: string }) => (
  <DataTable storeKey={storeKey}>
    {/* Always visible columns */}
    <DataTable.Col label="Class & Section">
      <ClassAndSection />
    </DataTable.Col>
    <DataTable.Col label="Homeroom Teacher">
      <ReferenceField reference="teachers" source="homeroomTeacherId">
        <TeacherName />
      </ReferenceField>
    </DataTable.Col>
    <DataTable.Col source="capacity" label="Capacity">
      <CapacityBadge />
    </DataTable.Col>
    
    {/* Desktop-only columns */}
    <DataTable.Col label="Actions" responsiveVisibility="md" render={(record) => (
      <ViewTimetableButton record={record} />
    )} />
  </DataTable>
);

const ClassAndSection = () => {
  const record = useRecordContext();
  if (!record) return null;
  
  return (
    <div className="flex items-center gap-2">
      <ReferenceField reference="classes" source="classId" link={false}>
        <span className="font-medium">
          <TextField source="name" /> - 
        </span>
      </ReferenceField>
      <span>Section {record.name}</span>
    </div>
  );
};

const TeacherName = () => {
  const record = useRecordContext();
  if (!record) return <EmptyState type="inline" message="No teacher assigned" />;
  
  // This assumes the teacher record has been fetched
  // You might need to adjust based on your teacher data structure
  return (
    <div className="flex flex-col">
      <span className="font-medium">
        <TextField source="staff.firstName" /> <TextField source="staff.lastName" />
      </span>
      <span className="text-xs text-gray-500">
        <TextField source="subjects" />
      </span>
    </div>
  );
};

const CapacityBadge = () => {
  const record = useRecordContext();
  if (!record || !record.capacity) return null;
  
  const getCapacityColor = (capacity: number) => {
    if (capacity >= 40) return 'text-red-700 bg-red-100';
    if (capacity >= 30) return 'text-yellow-700 bg-yellow-100';
    return 'text-green-700 bg-green-100';
  };
  
  return (
    <Badge className={getCapacityColor(record.capacity)}>
      {record.capacity} students
    </Badge>
  );
};

export default SectionsList;
