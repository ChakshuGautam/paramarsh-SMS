"use client";

import { Show, SimpleShowLayout, TextField } from "@/components/admin";
import { ReferenceField } from "@/components/admin/reference-field";

export const TeachersShow = () => (
  <Show>
    <SimpleShowLayout>
      <ReferenceField reference="staff" source="staffId">
        <TextField source="firstName" />
      </ReferenceField>
      <TextField source="subjects" label="Subjects" />
      <TextField source="qualifications" label="Qualifications" />
      <TextField source="experienceYears" label="Experience (years)" />
    </SimpleShowLayout>
  </Show>
);

export default TeachersShow;
