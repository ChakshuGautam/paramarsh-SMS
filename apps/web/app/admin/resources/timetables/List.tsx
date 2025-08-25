"use client";

import { useRecordContext } from "ra-core";
import {
  DataTable,
  List,
  TextField,
  NumberField,
  SelectInput,
  TextInput,
} from "@/components/admin";
import { Badge } from "@/components/ui/badge";

// Filters for timetables
const timetableFilters = [
  <TextInput source="q" placeholder="Search periods..." label="" alwaysOn />,
  <SelectInput
    source="dayOfWeek"
    placeholder="Filter by day"
    label=""
    choices={[
      { id: 1, name: 'Monday' },
      { id: 2, name: 'Tuesday' },
      { id: 3, name: 'Wednesday' },
      { id: 4, name: 'Thursday' },
      { id: 5, name: 'Friday' },
      { id: 6, name: 'Saturday' },
    ]}
  />,
  <SelectInput
    source="periodNumber"
    placeholder="Filter by period"
    label=""
    choices={[
      { id: 1, name: 'Period 1' },
      { id: 2, name: 'Period 2' },
      { id: 3, name: 'Period 3' },
      { id: 4, name: 'Period 4' },
      { id: 5, name: 'Period 5' },
      { id: 6, name: 'Period 6' },
      { id: 7, name: 'Period 7' },
      { id: 8, name: 'Period 8' },
    ]}
  />,
];

// Component to display day of week
const DayOfWeekField = () => {
  const record = useRecordContext();
  const days = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return <span>{days[record?.dayOfWeek] || '-'}</span>;
};

// Component to display time slot
const TimeSlotField = () => {
  const record = useRecordContext();
  if (!record?.startTime || !record?.endTime) return <span className="text-muted-foreground">-</span>;
  
  return (
    <span className="text-sm">
      {record.startTime} - {record.endTime}
    </span>
  );
};

// Component to display class-section combination
const ClassSectionField = () => {
  const record = useRecordContext();
  if (!record?.section) return <span className="text-muted-foreground">-</span>;
  
  return (
    <div className="font-medium">
      {record.section.class?.name || ''} - {record.section.name}
    </div>
  );
};

// Component to display subject
const SubjectField = () => {
  const record = useRecordContext();
  if (!record?.subject) return <span className="text-muted-foreground">-</span>;
  
  return (
    <div>
      <span className="font-medium">{record.subject.name}</span>
      {record.subject.isElective && (
        <Badge className="ml-2 text-xs bg-purple-100 text-purple-800">Elective</Badge>
      )}
    </div>
  );
};

// Component to display teacher
const TeacherField = () => {
  const record = useRecordContext();
  if (!record?.teacher?.staff) return <span className="text-muted-foreground">-</span>;
  
  return (
    <span className="text-sm">
      {record.teacher.staff.firstName} {record.teacher.staff.lastName}
    </span>
  );
};

// Component to display room
const RoomField = () => {
  const record = useRecordContext();
  if (record?.isBreak) {
    return <Badge className="bg-yellow-100 text-yellow-800">{record.breakType || 'Break'}</Badge>;
  }
  if (!record?.room) return <span className="text-muted-foreground">No Room</span>;
  
  return <span>{record.room.name}</span>;
};

export const TimetablesList = () => (
  <List
    sort={{ field: "dayOfWeek", order: "ASC" }}
    filters={timetableFilters}
    perPage={25}
  >
    <DataTable 
      storeKey="timetables.list"
      rowClassName={(record) => record?.isBreak ? 'bg-yellow-50' : ''}
    >
      {/* Always visible columns */}
      <DataTable.Col label="Day">
        <DayOfWeekField />
      </DataTable.Col>
      <DataTable.Col label="Period">
        <NumberField source="periodNumber" />
      </DataTable.Col>
      <DataTable.Col label="Time">
        <TimeSlotField />
      </DataTable.Col>
      <DataTable.Col label="Class - Section">
        <ClassSectionField />
      </DataTable.Col>
      
      {/* Desktop-only columns */}
      <DataTable.Col label="Subject" className="hidden md:table-cell">
        <SubjectField />
      </DataTable.Col>
      <DataTable.Col label="Teacher" className="hidden lg:table-cell">
        <TeacherField />
      </DataTable.Col>
      <DataTable.Col label="Room" className="hidden xl:table-cell">
        <RoomField />
      </DataTable.Col>
    </DataTable>
  </List>
);

export default TimetablesList;