"use client";

import { useRecordContext } from "ra-core";
import {
  DataTable,
  List,
  ReferenceField,
  TextField,
  TextInput,
  SelectInput,
  NumberField,
} from "@/components/admin";
import { Badge } from "@/components/ui/badge";

// Filters for timetables
const timetableFilters = [
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
    ]}
  />,
];

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
  );
};

// Component to display class-section combination
const ClassSectionField = () => {
  const record = useRecordContext();
  if (!record?.class) return <span className="text-muted-foreground">-</span>;
  
  return (
    <div className="font-medium">
      {record.class.name} - {record.name}
    </div>
  );
};

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
      </DataTable.Col>
    </DataTable>
  </List>
);

export default TimetablesList;