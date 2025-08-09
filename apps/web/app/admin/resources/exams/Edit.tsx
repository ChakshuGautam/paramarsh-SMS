"use client";

import { Edit, SimpleForm, TextInput } from "@/components/admin";

export const ExamsEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="name" label="Name" />
      <TextInput source="startDate" label="Start" />
      <TextInput source="endDate" label="End" />
    </SimpleForm>
  </Edit>
);

export default ExamsEdit;

