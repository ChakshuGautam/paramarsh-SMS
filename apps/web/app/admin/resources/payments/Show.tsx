"use client";

import { Show, SimpleShowLayout, TextField } from "@/components/admin";
import { ReferenceField } from "@/components/admin/reference-field";

export const PaymentsShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" label="ID" />
      <ReferenceField reference="invoices" source="invoiceId">
        <TextField source="id" label="Invoice" />
      </ReferenceField>
      <TextField source="amount" label="Amount" />
      <TextField source="status" label="Status" />
      <TextField source="method" label="Method" />
      <TextField source="gateway" label="Gateway" />
      <TextField source="reference" label="Reference" />
    </SimpleShowLayout>
  </Show>
);

export default PaymentsShow;





