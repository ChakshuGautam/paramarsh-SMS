"use client";

import { Show, SimpleShowLayout, TextField, TopToolbar, EditButton } from "@/components/admin";
import { ReferenceField } from "@/components/admin/reference-field";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { useCreatePath, useRecordContext } from "ra-core";
import { Link } from "react-router-dom";

const SectionActions = () => {
  const record = useRecordContext();
  const createPath = useCreatePath();
  
  if (!record) return null;
  
  const timetablePath = createPath({
    resource: "sectionTimetables",
    type: "show", 
    id: record.id,
  });
  
  return (
    <TopToolbar>
      <EditButton />
      <Button asChild variant="outline">
        <Link to={timetablePath}>
          <Calendar className="w-4 h-4 mr-2" />
          View Timetable
        </Link>
      </Button>
    </TopToolbar>
  );
};

export const SectionsShow = () => (
  <Show actions={<SectionActions />}>
    <SimpleShowLayout>
      <TextField source="id" label="ID" />
      <ReferenceField reference="classes" source="classId">
        <TextField source="name" label="Class" />
      </ReferenceField>
      <TextField source="name" label="Section" />
      <TextField source="capacity" label="Capacity" />
      <ReferenceField reference="teachers" source="homeroomTeacherId">
        <TextField source="id" label="Class Teacher" />
      </ReferenceField>
    </SimpleShowLayout>
  </Show>
);

export default SectionsShow;





