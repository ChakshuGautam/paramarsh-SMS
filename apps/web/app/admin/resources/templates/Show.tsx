"use client";

import { Show, SimpleShowLayout, TextField } from "@/components/admin";

export const TemplatesShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" label="ID" />
      <TextField source="name" label="Name" />
      <TextField source="channel" label="Channel" />
      <TextField source="locale" label="Locale" />
      <TextField source="content" label="Content" />
      <TextField source="variables" label="Variables" />
      <TextField source="createdAt" label="Created" />
      <TextField source="updatedAt" label="Updated" />
    </SimpleShowLayout>
  </Show>
);

export default TemplatesShow;