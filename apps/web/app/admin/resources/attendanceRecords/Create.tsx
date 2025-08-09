"use client";

import { Create, SimpleForm, TextInput } from "@/components/admin";
import { ReferenceInput } from "@/components/admin/reference-input";
import { AutocompleteInput } from "@/components/admin/autocomplete-input";

export const AttendanceRecordsCreate = () => (
  <Create>
    <SimpleForm>
      <ReferenceInput reference="students" source="studentId" label="Student">
        <AutocompleteInput optionText="firstName" />
      </ReferenceInput>
      <TextInput source="date" label="Date" />
      <TextInput source="status" label="Status" />
      <TextInput source="markedBy" label="Marked By" />
      <TextInput source="source" label="Source" />
    </SimpleForm>
  </Create>
);

export default AttendanceRecordsCreate;



