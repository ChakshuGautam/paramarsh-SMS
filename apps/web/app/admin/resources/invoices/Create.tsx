"use client";

import { Create, SimpleForm, TextInput } from "@/components/admin";
import { ReferenceInput } from "@/components/admin/reference-input";
import { AutocompleteInput } from "@/components/admin/autocomplete-input";

export const InvoicesCreate = () => (
  <Create>
    <SimpleForm>
      <ReferenceInput reference="students" source="studentId" label="Student">
        <AutocompleteInput optionText="firstName" />
      </ReferenceInput>
      <TextInput source="period" label="Period" />
      <TextInput source="dueDate" label="Due" />
      <TextInput source="amount" label="Amount" />
      <TextInput source="status" label="Status" />
    </SimpleForm>
  </Create>
);

export default InvoicesCreate;





