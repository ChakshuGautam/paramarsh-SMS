"use client";

import { Create, SimpleForm, TextInput } from "@/components/admin";
import { ReferenceInput } from "@/components/admin/reference-input";
import { AutocompleteInput } from "@/components/admin/autocomplete-input";

export const TeachersCreate = () => (
  <Create>
    <SimpleForm>
      <ReferenceInput reference="staff" source="staffId" label="Staff">
        <AutocompleteInput optionText="firstName" />
      </ReferenceInput>
      <TextInput source="subjects" label="Subjects (CSV or JSON)" />
      <TextInput source="qualifications" label="Qualifications" />
      <TextInput source="experienceYears" label="Experience (years)" />
    </SimpleForm>
  </Create>
);

export default TeachersCreate;
