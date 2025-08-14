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
  BooleanInput,
  DateInput,
  Count,
} from "@/components/admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, User, BookOpen } from "lucide-react";

// Store keys for different status tabs
const storeKeyByStatus = {
  active: "timetable.list.active",
  inactive: "timetable.list.inactive",
  current: "timetable.list.current",
  all: "timetable.list.all",
};

// Label-less filters with placeholders
const timetableFilters = [
  <TextInput source="q" placeholder="Search timetable..." label={false} alwaysOn />,
  <ReferenceInput source="sectionId" reference="sections">
    <AutocompleteInput placeholder="Filter by section" label={false} optionText="name" />
  </ReferenceInput>,
  <ReferenceInput source="subjectId" reference="subjects">
    <AutocompleteInput placeholder="Filter by subject" label={false} optionText="name" />
  </ReferenceInput>,
  <ReferenceInput source="teacherId" reference="teachers">
    <AutocompleteInput 
      placeholder="Filter by teacher" 
      label={false} 
      optionText={(record) => `${record.firstName} ${record.lastName}`}
    />
  </ReferenceInput>,
  <ReferenceInput source="roomId" reference="rooms">
    <AutocompleteInput placeholder="Filter by room" label={false} optionText="name" />
  </ReferenceInput>,
  <BooleanInput source="isActive" label={false} />,
  <DateInput source="effectiveFrom" placeholder="Effective from" label={false} />,
];

export const TimetableList = () => {
  return (
    <List
      sort={{ field: "effectiveFrom", order: "DESC" }}
      filterDefaultValues={{ isActive: true }}
      filters={timetableFilters}
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
    
    switch (value) {
      case "active":
        newFilters.isActive = true;
        break;
      case "inactive":
        newFilters.isActive = false;
        break;
      case "current":
        newFilters.isActive = true;
        newFilters.effectiveFrom_lte = new Date().toISOString().split('T')[0];
        break;
      case "all":
        delete newFilters.isActive;
        delete newFilters.effectiveFrom_lte;
        break;
    }
    
    setFilters(newFilters, displayedFilters);
  };
  
  // Determine current tab based on filter values
  const getCurrentTab = () => {
    if (filterValues.isActive === true && filterValues.effectiveFrom_lte) return "current";
    if (filterValues.isActive === true) return "active";
    if (filterValues.isActive === false) return "inactive";
    return "all";
  };
  
  return (
    <Tabs value={getCurrentTab()}>
      <TabsList>
        <TabsTrigger value="current" onClick={handleChange("current")}>
          Current
          <Badge variant="outline" className="ml-2">
            <Count filter={{ 
              ...filterValues, 
              isActive: true, 
              effectiveFrom_lte: new Date().toISOString().split('T')[0] 
            }} />
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
          All Schedules
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues }} />
          </Badge>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="current">
        <TimetableTable storeKey={storeKeyByStatus.current} />
      </TabsContent>
      <TabsContent value="active">
        <TimetableTable storeKey={storeKeyByStatus.active} />
      </TabsContent>
      <TabsContent value="inactive">
        <TimetableTable storeKey={storeKeyByStatus.inactive} />
      </TabsContent>
      <TabsContent value="all">
        <TimetableTable storeKey={storeKeyByStatus.all} />
      </TabsContent>
    </Tabs>
  );
};

const TimetableTable = ({ storeKey }: { storeKey: string }) => (
  <DataTable 
    storeKey={storeKey}
    rowClassName={(record) => {
      if (!record.isActive) return 'border-l-4 border-l-gray-400 opacity-60';
      const today = new Date().toISOString().split('T')[0];
      const effectiveDate = record.effectiveFrom;
      
      if (effectiveDate <= today) return 'border-l-4 border-l-green-500';
      return 'border-l-4 border-l-blue-500';
    }}
  >
    {/* Always visible columns */}
    <DataTable.Col label="Section">
      <ReferenceField reference="sections" source="sectionId">
        <TextField source="name" />
      </ReferenceField>
    </DataTable.Col>
    <DataTable.Col label="Subject">
      <SubjectWithIcon />
    </DataTable.Col>
    <DataTable.Col label="Time Slot">
      <TimeSlotWithIcon />
    </DataTable.Col>
    
    {/* Desktop-only columns */}
    <DataTable.Col label="Teacher" className="hidden md:table-cell">
      <TeacherWithIcon />
    </DataTable.Col>
    <DataTable.Col label="Room" className="hidden md:table-cell">
      <RoomWithIcon />
    </DataTable.Col>
    <DataTable.Col source="isActive" label="Status" className="hidden lg:table-cell">
      <StatusBadge />
    </DataTable.Col>
    <DataTable.Col source="effectiveFrom" label="Effective From" className="hidden lg:table-cell">
      <EffectiveDateBadge />
    </DataTable.Col>
  </DataTable>
);

const SubjectWithIcon = ({ record }: { record?: any }) => {
  if (!record) return null;
  
  return (
    <div className="flex items-center gap-2">
      <BookOpen className="w-4 h-4 text-blue-600" />
      <ReferenceField reference="subjects" source="subjectId">
        <TextField source="name" />
      </ReferenceField>
    </div>
  );
};

const TeacherWithIcon = ({ record }: { record?: any }) => {
  if (!record) return null;
  
  return (
    <div className="flex items-center gap-2">
      <User className="w-4 h-4 text-green-600" />
      <ReferenceField reference="teachers" source="teacherId">
        <TextField source="firstName" />
      </ReferenceField>
    </div>
  );
};

const RoomWithIcon = ({ record }: { record?: any }) => {
  if (!record) return null;
  
  return (
    <div className="flex items-center gap-2">
      <MapPin className="w-4 h-4 text-orange-600" />
      <ReferenceField reference="rooms" source="roomId">
        <TextField source="name" />
      </ReferenceField>
    </div>
  );
};

const TimeSlotWithIcon = ({ record }: { record?: any }) => {
  if (!record) return null;
  
  return (
    <div className="flex items-center gap-2">
      <Clock className="w-4 h-4 text-purple-600" />
      <ReferenceField reference="timeSlots" source="timeSlotId">
        <TextField source="name" />
      </ReferenceField>
    </div>
  );
};

const StatusBadge = ({ record }: { record?: any }) => {
  if (!record) return null;
  
  return (
    <Badge variant={record.isActive ? 'default' : 'secondary'}>
      {record.isActive ? 'Active' : 'Inactive'}
    </Badge>
  );
};

const EffectiveDateBadge = ({ record }: { record?: any }) => {
  if (!record || !record.effectiveFrom) return null;
  
  const effectiveDate = new Date(record.effectiveFrom);
  const today = new Date();
  
  const getDateColor = () => {
    if (effectiveDate <= today) return 'text-green-700 bg-green-100';
    return 'text-blue-700 bg-blue-100';
  };
  
  return (
    <Badge className={getDateColor()}>
      {effectiveDate.toLocaleDateString()}
    </Badge>
  );
};