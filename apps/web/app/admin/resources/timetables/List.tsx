"use client";

import { useRecordContext } from "ra-core";
import {
  DataTable,
  List,
<<<<<<< HEAD
  TextField,
  NumberField,
  SelectInput,
  TextInput,
=======
  ReferenceField,
  TextField,
  TextInput,
  SelectInput,
  NumberField,
>>>>>>> origin/main
} from "@/components/admin";
import { Badge } from "@/components/ui/badge";

// Filters for timetables
const timetableFilters = [
<<<<<<< HEAD
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
=======
  <TextInput key="search" source="q" placeholder="Search classes and sections..." label="" alwaysOn />,
  <SelectInput
    key="gradeLevel"
    source="class.gradeLevel"
    placeholder="Filter by grade level"
    label=""
    choices={[
      { id: 0, name: 'Nursery' },
      { id: 1, name: 'LKG' },
      { id: 2, name: 'UKG' },
      { id: 3, name: 'Class 1' },
      { id: 4, name: 'Class 2' },
      { id: 5, name: 'Class 3' },
      { id: 6, name: 'Class 4' },
      { id: 7, name: 'Class 5' },
      { id: 8, name: 'Class 6' },
      { id: 9, name: 'Class 7' },
      { id: 10, name: 'Class 8' },
      { id: 11, name: 'Class 9' },
      { id: 12, name: 'Class 10' },
>>>>>>> origin/main
    ]}
  />,
];

<<<<<<< HEAD
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
=======
// Component to display completion status
const CompletionBadge = () => {
  const record = useRecordContext();
  // Mock completion calculation - in real app this would be calculated from timetable periods
  const completion = Math.floor(Math.random() * 100);
  
  const getColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (percentage >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <Badge className={`${getColor(completion)} text-xs`}>
      {completion}%
    </Badge>
>>>>>>> origin/main
  );
};

// Component to display class-section combination
const ClassSectionField = () => {
  const record = useRecordContext();
<<<<<<< HEAD
  if (!record?.section) return <span className="text-muted-foreground">-</span>;
  
  return (
    <div className="font-medium">
      {record.section.class?.name || ''} - {record.section.name}
=======
  if (!record?.class) return <span className="text-muted-foreground">-</span>;
  
  return (
    <div className="font-medium">
      {record.class.name} - {record.name}
>>>>>>> origin/main
    </div>
  );
};

<<<<<<< HEAD
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
=======
// Component to display homeroom teacher
const HomeroomTeacher = () => {
  const record = useRecordContext();
  if (!record?.homeroomTeacherId) return <span className="text-muted-foreground">-</span>;
  
  return (
    <ReferenceField reference="teachers" source="homeroomTeacherId" link={false}>
      <TextField source="name" />
    </ReferenceField>
  );
};

export const TimetablesList = () => (
  <List
    sort={{ field: "class.gradeLevel", order: "ASC" }}
    filters={timetableFilters}
    perPage={10}
  >
    <DataTable 
      storeKey="timetables.list"
      rowClassName={() => 'border-l-4 border-l-blue-500'}
    >
      {/* Always visible columns */}
      <DataTable.Col label="Class - Section">
        <ClassSectionField />
      </DataTable.Col>
      <DataTable.Col label="Grade Level">
        <TextField source="class.gradeLevel" />
      </DataTable.Col>
      
      {/* Desktop-only columns */}
      <DataTable.Col source="capacity" label="Capacity" className="hidden md:table-cell">
        <NumberField source="capacity" />
      </DataTable.Col>
      <DataTable.Col label="Completion" className="hidden md:table-cell">
        <CompletionBadge />
      </DataTable.Col>
      <DataTable.Col label="Homeroom Teacher" className="hidden lg:table-cell">
        <HomeroomTeacher />
>>>>>>> origin/main
      </DataTable.Col>
    </DataTable>
  </List>
);

export default TimetablesList;