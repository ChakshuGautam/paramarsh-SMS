"use client";

import { List, DataTable, TextField } from "@/components/admin";
import { ReferenceField } from "@/components/admin/reference-field";

export const PaymentsList = () => (
  <List>
    <DataTable>
      <DataTable.Col source="id" label="ID" />
      <DataTable.Col label="Invoice">
        <ReferenceField reference="invoices" source="invoiceId">
          <TextField source="id" />
        </ReferenceField>
      </DataTable.Col>
      <DataTable.Col source="amount" label="Amount" />
      <DataTable.Col source="status" label="Status" />
      <DataTable.Col source="method" label="Method" />
    </DataTable>
  </List>
);

export default PaymentsList;
