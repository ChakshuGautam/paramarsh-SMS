"use client";

import { Create, SimpleForm, TextInput } from "@/components/admin";
import { ReferenceInput } from "@/components/admin/reference-input";
import { AutocompleteInput } from "@/components/admin/autocomplete-input";

export const SectionsCreate = () => (
  <Create>
    <SimpleForm>
      <ReferenceInput reference="classes" source="classId" label="Class">
        <AutocompleteInput optionText="name" />
      </ReferenceInput>
      <TextInput source="name" label="Section" />
      <TextInput source="capacity" label="Capacity" />
    </SimpleForm>
  </Create>
);

export default SectionsCreate;




