"use client";

import { Edit, SimpleForm, TextInput, NumberInput } from "@/components/admin";
import { ReferenceInput } from "@/components/admin/reference-input";
import { AutocompleteInput } from "@/components/admin/autocomplete-input";

export const TeachersEdit = () => (
  <Edit>
    <SimpleForm>
      <ReferenceInput reference="staff" source="staffId" label="Staff Member">
        <AutocompleteInput 
          optionText={(record: any) => `${record.firstName} ${record.lastName}`} 
        />
      </ReferenceInput>
      <TextInput source="subjects" label="Subjects" helperText="Comma-separated list of subjects" />
      <TextInput source="qualifications" label="Qualifications" />
      <NumberInput source="experienceYears" label="Experience (years)" />
    </SimpleForm>
  </Edit>
);

export default TeachersEdit;