"use client";

import { Edit, SimpleForm, TextInput } from "@/components/admin";
import { ReferenceInput } from "@/components/admin/reference-input";
import { AutocompleteInput } from "@/components/admin/autocomplete-input";

export const EnrollmentsEdit = () => (
  <Edit>
    <SimpleForm>
      <ReferenceInput reference="students" source="studentId" label="Student">
        <AutocompleteInput optionText="firstName" />
      </ReferenceInput>
      <ReferenceInput reference="sections" source="sectionId" label="Section">
        <AutocompleteInput optionText="name" />
      </ReferenceInput>
      <TextInput source="status" label="Status" />
      <TextInput source="startDate" label="Start" />
      <TextInput source="endDate" label="End" />
    </SimpleForm>
  </Edit>
);

export default EnrollmentsEdit;



