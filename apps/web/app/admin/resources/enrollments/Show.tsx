"use client";

import { Show, SimpleShowLayout, TextField } from "@/components/admin";
import { ReferenceField } from "@/components/admin/reference-field";

export const EnrollmentsShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" label="ID" />
      <ReferenceField reference="students" source="studentId">
        <TextField source="firstName" label="Student" />
      </ReferenceField>
      <ReferenceField reference="sections" source="sectionId">
        <TextField source="name" label="Section" />
      </ReferenceField>
      <TextField source="status" label="Status" />
      <TextField source="startDate" label="Start" />
      <TextField source="endDate" label="End" />
    </SimpleShowLayout>
  </Show>
);

export default EnrollmentsShow;




