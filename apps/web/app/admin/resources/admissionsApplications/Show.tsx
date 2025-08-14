"use client";

import { Show, SimpleShowLayout, TextField } from "@/components/admin";

export const AdmissionsApplicationsShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" label="ID" />
      <TextField source="programId" label="Program" />
      <TextField source="status" label="Status" />
      <TextField source="score" label="Score" />
    </SimpleShowLayout>
  </Show>
);

export default AdmissionsApplicationsShow;


