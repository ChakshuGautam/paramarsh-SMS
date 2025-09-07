"use client";

import { useRecordContext } from "ra-core";
import {
  DataTable,
  List,
  TextField,
  NumberField,
} from "@/components/admin";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, BookOpen, Clock } from "lucide-react";

// Component to display class-section combination
const ClassSectionField = () => {
  const record = useRecordContext();
  if (!record) return null;
  
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 bg-primary/10 rounded-full">
        <Users className="w-5 h-5 text-primary" />
      </div>
      <div>
        <div className="font-medium text-base">
          {record.class?.name || 'Class'} - Section {record.name}
        </div>
        <div className="text-sm text-muted-foreground">
          Grade {record.class?.gradeLevel || 'N/A'}
        </div>
      </div>
    </div>
  );
};

// Component to display section capacity
const CapacityField = () => {
  const record = useRecordContext();
  if (!record) return null;
  
  return (
    <div className="flex items-center gap-2">
      <Users className="w-4 h-4 text-muted-foreground" />
      <span>{record.capacity || 0} students</span>
    </div>
  );
};

// Component to display homeroom teacher
const HomeroomTeacherField = () => {
  const record = useRecordContext();
  if (!record?.homeroomTeacher) {
    return <span className="text-muted-foreground">No homeroom teacher</span>;
  }
  
  return (
    <div>
      <div className="font-medium">
        {record.homeroomTeacher.staff?.firstName} {record.homeroomTeacher.staff?.lastName}
      </div>
      <div className="text-xs text-muted-foreground">
        {record.homeroomTeacher.staff?.email}
      </div>
    </div>
  );
};

// Component to show timetable completion status
const TimetableStatusField = () => {
  const record = useRecordContext();
  if (!record) return null;
  
  // This would ideally come from the backend
  // For now, we'll show a placeholder
  const totalSlots = 40; // 8 periods x 5 days
  const filledSlots = record.timetablePeriods?.length || 0;
  const percentage = Math.round((filledSlots / totalSlots) * 100);
  
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium">
            {percentage}% Complete
          </span>
          <span className="text-xs text-muted-foreground">
            {filledSlots}/{totalSlots} slots
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary rounded-full h-2 transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// Action buttons
const ActionButtons = () => {
  const record = useRecordContext();
  if (!record) return null;
  
  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
        <Calendar className="w-3 h-3 mr-1" />
        View Timetable
      </Badge>
    </div>
  );
};

export const TimetablesList = () => (
  <List
    resource="timetables"
    sort={{ field: "class.gradeLevel", order: "ASC" }}
    perPage={10}
    title="Class Timetables"
  >
    <DataTable>
      {/* Class and Section info */}
      <DataTable.Col label="Class - Section">
        <ClassSectionField />
      </DataTable.Col>
      
      {/* Capacity */}
      <DataTable.Col label="Capacity" className="hidden md:table-cell">
        <CapacityField />
      </DataTable.Col>
      
      {/* Homeroom Teacher */}
      <DataTable.Col label="Homeroom Teacher" className="hidden lg:table-cell">
        <HomeroomTeacherField />
      </DataTable.Col>
      
      {/* Timetable Status */}
      <DataTable.Col label="Timetable Status" className="hidden xl:table-cell">
        <TimetableStatusField />
      </DataTable.Col>
      
      {/* Actions */}
      <DataTable.Col label="">
        <ActionButtons />
      </DataTable.Col>
    </DataTable>
  </List>
);

export default TimetablesList;