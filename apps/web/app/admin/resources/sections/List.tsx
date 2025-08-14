"use client";

import { List, DataTable, TextField } from "@/components/admin";
import { ReferenceField } from "@/components/admin/reference-field";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { useCreatePath } from "ra-core";
import { Link } from "react-router-dom";

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
  <List>
    <DataTable>
      <DataTable.Col source="id" label="ID" />
      <DataTable.Col label="Class">
        <ReferenceField reference="classes" source="classId">
          <TextField source="name" />
        </ReferenceField>
      </DataTable.Col>
      <DataTable.Col source="name" label="Section" />
      <DataTable.Col source="capacity" label="Capacity" />
      <DataTable.Col label="Timetable" render={(record) => (
        <ViewTimetableButton record={record} />
      )} />
    </DataTable>
  </List>
);

export default SectionsList;
