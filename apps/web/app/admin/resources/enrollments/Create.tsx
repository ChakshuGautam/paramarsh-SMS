"use client";

import { Create, SimpleForm, TextInput } from "@/components/admin";
import { ReferenceInput } from "@/components/admin/reference-input";
import { AutocompleteInput } from "@/components/admin/autocomplete-input";

export const EnrollmentsCreate = () => (
  <Create>
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
  </Create>
);

export default EnrollmentsCreate;



