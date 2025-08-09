"use client";

import { Show, SimpleShowLayout, TextField } from "@/components/admin";
import { ReferenceField } from "@/components/admin/reference-field";

export const StudentsShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" label="ID" />
      <TextField source="admissionNo" label="Admission No" />
      <TextField source="firstName" label="First Name" />
      <TextField source="lastName" label="Last Name" />
      <TextField source="gender" label="Gender" />
      <ReferenceField reference="classes" source="classId">
        <TextField source="name" label="Class" />
      </ReferenceField>
      <ReferenceField reference="sections" source="sectionId">
        <TextField source="name" label="Section" />
      </ReferenceField>
    </SimpleShowLayout>
  </Show>
);

export default StudentsShow;
