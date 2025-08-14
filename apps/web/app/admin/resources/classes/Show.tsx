"use client";

import { Show, SimpleShowLayout, TextField } from "@/components/admin";

export const ClassesShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" label="ID" />
      <TextField source="name" label="Name" />
      <TextField source="gradeLevel" label="Grade" />
    </SimpleShowLayout>
  </Show>
);

export default ClassesShow;




