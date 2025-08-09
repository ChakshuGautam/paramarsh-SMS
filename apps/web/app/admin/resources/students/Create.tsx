"use client";

import { Create, SimpleForm, TextInput } from "@/components/admin";
import { ReferenceInput } from "@/components/admin/reference-input";
import { AutocompleteInput } from "@/components/admin/autocomplete-input";

export const StudentsCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="admissionNo" label="Admission No" />
      <TextInput source="firstName" label="First Name" />
      <TextInput source="lastName" label="Last Name" />
      <TextInput source="gender" label="Gender" />
      <ReferenceInput reference="classes" source="classId" label="Class">
        <AutocompleteInput optionText="name" />
      </ReferenceInput>
      <ReferenceInput reference="sections" source="sectionId" label="Section">
        <AutocompleteInput optionText="name" />
      </ReferenceInput>
    </SimpleForm>
  </Create>
);

export default StudentsCreate;
