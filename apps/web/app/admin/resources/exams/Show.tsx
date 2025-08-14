"use client";

import { Show, SimpleShowLayout, TextField } from "@/components/admin";

export const ExamsShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" label="ID" />
      <TextField source="name" label="Name" />
      <TextField source="startDate" label="Start" />
      <TextField source="endDate" label="End" />
    </SimpleShowLayout>
  </Show>
);

export default ExamsShow;


