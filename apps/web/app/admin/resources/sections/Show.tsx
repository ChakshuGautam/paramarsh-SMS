"use client";

import { Show, SimpleShowLayout, TextField } from "@/components/admin";
import { ReferenceField } from "@/components/admin/reference-field";

export const SectionsShow = () => (
  <Show>
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



