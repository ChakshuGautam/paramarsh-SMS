"use client";

import { useListContext, useRecordContext } from "ra-core";
import {
  DataTable,
  List,
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
  <TextInput source="q" placeholder="Search timetable..." label="" alwaysOn />,
  <ReferenceInput source="sectionId" reference="sections">
    <AutocompleteInput placeholder="Filter by section" label="" optionText="name" />
  </ReferenceInput>,
  <ReferenceInput source="subjectId" reference="subjects">
    <AutocompleteInput placeholder="Filter by subject" label="" optionText="name" />
  </ReferenceInput>,
  <ReferenceInput source="teacherId" reference="teachers">
    <AutocompleteInput 
      placeholder="Filter by teacher" 
      label="" 
      optionText={(record) => `${record.firstName} ${record.lastName}`}
    />
  </ReferenceInput>,
  <ReferenceInput source="roomId" reference="rooms">
    <AutocompleteInput placeholder="Filter by room" label="" optionText="name" />
  </ReferenceInput>,
  <BooleanInput source="isActive" label="" />,
  <DateInput source="effectiveFrom" placeholder="Effective from" label="" />,
];

export const TimetableList = () => {
  return (
    <List
      sort={{ field: "effectiveFrom", order: "DESC" }}
      filterDefaultValues={{ isActive: true }}
      filters={timetableFilters}
      perPage={10}
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
    {/* All columns always visible - no responsive hiding */}
    <DataTable.Col label="Section">
      <SectionDisplay />
    </DataTable.Col>
    <DataTable.Col label="Subject">
      <SubjectWithIcon />
    </DataTable.Col>
    <DataTable.Col label="Time Slot">
      <TimeSlotDisplay />
    </DataTable.Col>
    <DataTable.Col label="Teacher">
      <TeacherWithIcon />
    </DataTable.Col>
    <DataTable.Col label="Room">
      <RoomWithIcon />
    </DataTable.Col>
    <DataTable.Col label="Status">
      <StatusBadge />
    </DataTable.Col>
    <DataTable.Col label="Effective From">
      <EffectiveDateBadge />
    </DataTable.Col>
  </DataTable>
);

const SectionDisplay = () => {
  const record = useRecordContext();
  if (!record || !record.section) return <span>-</span>;
  
  return (
    <div className="font-medium">
      {record.section.class?.name} - {record.section.name}
    </div>
  );
};

const SubjectWithIcon = () => {
  const record = useRecordContext();
  if (!record || !record.subject) return (
    <div className="flex items-center gap-2 text-gray-500">
      <BookOpen className="w-4 h-4" />
      <span>No Subject</span>
    </div>
  );
  
  return (
    <div className="flex items-center gap-2">
      <BookOpen className="w-4 h-4 text-blue-600" />
      <span>{record.subject.name}</span>
    </div>
  );
};

const TeacherWithIcon = () => {
  const record = useRecordContext();
  if (!record || !record.teacher?.staff) return (
    <div className="flex items-center gap-2 text-gray-500">
      <User className="w-4 h-4" />
      <span>No Teacher</span>
    </div>
  );
  
  const { firstName, lastName } = record.teacher.staff;
  return (
    <div className="flex items-center gap-2">
      <User className="w-4 h-4 text-green-600" />
      <span>{firstName} {lastName}</span>
    </div>
  );
};

const RoomWithIcon = () => {
  const record = useRecordContext();
  if (!record || !record.room) return (
    <div className="flex items-center gap-2 text-gray-500">
      <MapPin className="w-4 h-4" />
      <span>No Room</span>
    </div>
  );
  
  return (
    <div className="flex items-center gap-2">
      <MapPin className="w-4 h-4 text-orange-600" />
      <span>{record.room.name}</span>
    </div>
  );
};

const TimeSlotDisplay = () => {
  const record = useRecordContext();
  if (!record) return <span>-</span>;
  
  const formatTime = (time: string) => {
    if (!time) return '';
    // Handle time format - assume it's in HH:mm format
    try {
      const [hours, minutes] = time.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return time;
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Clock className="w-4 h-4 text-purple-600" />
      <div className="text-sm">
        <div className="font-medium">
          {formatTime(record.startTime)} - {formatTime(record.endTime)}
        </div>
        <div className="text-gray-500">
          {record.dayOfWeek} P{record.periodNumber}
        </div>
      </div>
    </div>
  );
};

const StatusBadge = () => {
  const record = useRecordContext();
  if (!record) return <span>-</span>;
  
  return (
    <Badge variant={record.isActive ? 'default' : 'secondary'}>
      {record.isActive ? 'Active' : 'Inactive'}
    </Badge>
  );
};

const EffectiveDateBadge = () => {
  const record = useRecordContext();
  if (!record || !record.createdAt) return <span>-</span>;
  
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const date = new Date(record.createdAt);
  const today = new Date();
  
  const getDateColor = () => {
    if (date <= today) return 'text-green-700 bg-green-100';
    return 'text-blue-700 bg-blue-100';
  };
  
  return (
    <Badge className={getDateColor()}>
      {formatDate(record.createdAt)}
    </Badge>
  );
};