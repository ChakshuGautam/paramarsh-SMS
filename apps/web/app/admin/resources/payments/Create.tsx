"use client";

import { Create, SimpleForm, TextInput } from "@/components/admin";
import { ReferenceInput } from "@/components/admin/reference-input";
import { AutocompleteInput } from "@/components/admin/autocomplete-input";

export const PaymentsCreate = () => (
  <Create>
    <SimpleForm>
      <ReferenceInput reference="invoices" source="invoiceId" label="Invoice">
        <AutocompleteInput optionText="id" />
      </ReferenceInput>
      <TextInput source="amount" label="Amount" />
      <TextInput source="status" label="Status" />
      <TextInput source="method" label="Method" />
      <TextInput source="gateway" label="Gateway" />
      <TextInput source="reference" label="Reference" />
    </SimpleForm>
  </Create>
);

export default PaymentsCreate;





