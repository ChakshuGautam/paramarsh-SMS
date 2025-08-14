"use client";

import { useListContext } from "ra-core";
import {
  DataTable,
  List,
  ReferenceField,
  TextField,
  TextInput,
  ReferenceInput,
  AutocompleteInput,
  NumberInput,
  Count,
} from "@/components/admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { useCreatePath } from "ra-core";
import { Link } from "react-router-dom";

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

// Label-less filters with placeholders
const sectionFilters = [
  <TextInput source="q" placeholder="Search sections..." label={false} alwaysOn />,
  <ReferenceInput source="classId" reference="classes">
    <AutocompleteInput placeholder="Filter by class" label={false} optionText="name" />
  </ReferenceInput>,
  <NumberInput source="capacity_gte" placeholder="Min capacity" label={false} />,
];

const ViewTimetableButton = ({ record }: { record?: any }) => {
  const createPath = useCreatePath();
  
  if (!record || !record.id) {
    return null;
  }
  
  const path = createPath({
    resource: "sectionTimetables",
    type: "show",
    id: record.id,
  });
  
  return (
    <Button 
      asChild 
      variant="outline" 
      size="sm"
    >
      <Link to={path}>
        <Calendar className="w-4 h-4 mr-2" />
        View Timetable
      </Link>
    </Button>
  );
};

export const SectionsList = () => (
  <List
    sort={{ field: "name", order: "ASC" }}
    filters={sectionFilters}
    perPage={25}
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
      </TabsContent>
      <TabsContent value="middle">
        <SectionsTable storeKey={storeKeyByLevel.middle} />
      </TabsContent>
      <TabsContent value="high">
        <SectionsTable storeKey={storeKeyByLevel.high} />
      </TabsContent>
      <TabsContent value="all">
        <SectionsTable storeKey={storeKeyByLevel.all} />
      </TabsContent>
    </Tabs>
  );
};

const SectionsTable = ({ storeKey }: { storeKey: string }) => (
  <DataTable storeKey={storeKey}>
    {/* Always visible columns */}
    <DataTable.Col source="name" label="Section Name" />
    <DataTable.Col label="Class">
      <ReferenceField reference="classes" source="classId">
        <TextField source="name" />
      </ReferenceField>
    </DataTable.Col>
    <DataTable.Col source="capacity" label="Capacity">
      <CapacityBadge />
    </DataTable.Col>
    
    {/* Desktop-only columns */}
    <DataTable.Col label="Actions" className="hidden md:table-cell" render={(record) => (
      <ViewTimetableButton record={record} />
    )} />
    <DataTable.Col source="id" label="ID" className="hidden lg:table-cell" />
  </DataTable>
);

const CapacityBadge = ({ record }: { record?: any }) => {
  if (!record) return null;
  
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
