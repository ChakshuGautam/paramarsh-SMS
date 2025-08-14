"use client";

import { Create, SimpleForm, TextInput } from "@/components/admin";

export const AdmissionsApplicationsCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="programId" label="Program" />
      <TextInput source="status" label="Status" />
      <TextInput source="score" label="Score" />
    </SimpleForm>
  </Create>
);

export default AdmissionsApplicationsCreate;


