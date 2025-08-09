"use client";

import { Show, SimpleShowLayout, TextField } from "@/components/admin";
import { ReferenceField } from "@/components/admin/reference-field";

export const GuardiansShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" label="ID" />
      <ReferenceField reference="students" source="studentId">
        <TextField source="firstName" label="Student" />
      </ReferenceField>
      <TextField source="relation" label="Relation" />
      <TextField source="name" label="Name" />
      <TextField source="phone" label="Phone" />
      <TextField source="email" label="Email" />
      <TextField source="address" label="Address" />
    </SimpleShowLayout>
  </Show>
);

export default GuardiansShow;
