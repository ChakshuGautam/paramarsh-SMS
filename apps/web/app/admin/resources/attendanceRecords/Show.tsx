"use client";

import { Show, SimpleShowLayout, TextField } from "@/components/admin";
import { ReferenceField } from "@/components/admin/reference-field";

export const AttendanceRecordsShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" label="ID" />
      <ReferenceField reference="students" source="studentId">
        <TextField source="firstName" label="Student" />
      </ReferenceField>
      <TextField source="date" label="Date" />
      <TextField source="status" label="Status" />
      <TextField source="markedBy" label="Marked By" />
      <TextField source="source" label="Source" />
    </SimpleShowLayout>
  </Show>
);

export default AttendanceRecordsShow;




