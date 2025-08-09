"use client";

import { Show, SimpleShowLayout, TextField } from "@/components/admin";
import { ReferenceField } from "@/components/admin/reference-field";

export const MarksShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" label="ID" />
      <ReferenceField reference="students" source="studentId">
        <TextField source="firstName" label="Student" />
      </ReferenceField>
      <ReferenceField reference="exams" source="sessionId">
        <TextField source="name" label="Session" />
      </ReferenceField>
      <TextField source="rawMarks" label="Marks" />
      <TextField source="grade" label="Grade" />
    </SimpleShowLayout>
  </Show>
);

export default MarksShow;



