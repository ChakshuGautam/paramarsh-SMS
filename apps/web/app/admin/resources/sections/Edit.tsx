"use client";

import { Edit, SimpleForm, TextInput } from "@/components/admin";
import { ReferenceInput } from "@/components/admin/reference-input";
import { AutocompleteInput } from "@/components/admin/autocomplete-input";

export const SectionsEdit = () => (
  <Edit>
    <SimpleForm>
      <ReferenceInput reference="classes" source="classId" label="Class">
        <AutocompleteInput optionText="name" />
      </ReferenceInput>
      <TextInput source="name" label="Section" />
      <TextInput source="capacity" label="Capacity" />
      <ReferenceInput reference="teachers" source="homeroomTeacherId" label="Class Teacher">
        <AutocompleteInput optionText="id" />
      </ReferenceInput>
    </SimpleForm>
  </Edit>
);

export default SectionsEdit;





