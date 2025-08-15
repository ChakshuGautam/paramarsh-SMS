"use client";

import { Edit, SimpleForm, TextInput } from "@/components/admin";

export const AdmissionsApplicationsEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="programId" label="Program" />
      <TextInput source="status" label="Status" />
      <TextInput source="score" label="Score" />
    </SimpleForm>
  </Edit>
);

export default AdmissionsApplicationsEdit;



