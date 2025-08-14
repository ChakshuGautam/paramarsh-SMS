"use client";

import { Create, SimpleForm, TextInput } from "@/components/admin";

export const ExamsCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="name" label="Name" />
      <TextInput source="startDate" label="Start" />
      <TextInput source="endDate" label="End" />
    </SimpleForm>
  </Create>
);

export default ExamsCreate;


