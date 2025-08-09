"use client";

import { Edit, SimpleForm, TextInput } from "@/components/admin";
import { ReferenceInput } from "@/components/admin/reference-input";
import { AutocompleteInput } from "@/components/admin/autocomplete-input";

export const InvoicesEdit = () => (
  <Edit>
    <SimpleForm>
      <ReferenceInput reference="students" source="studentId" label="Student">
        <AutocompleteInput optionText="firstName" />
      </ReferenceInput>
      <TextInput source="period" label="Period" />
      <TextInput source="dueDate" label="Due" />
      <TextInput source="amount" label="Amount" />
      <TextInput source="status" label="Status" />
    </SimpleForm>
  </Edit>
);

export default InvoicesEdit;



