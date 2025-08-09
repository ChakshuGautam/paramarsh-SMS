"use client";

import { List, DataTable, TextField } from "@/components/admin";
import { ReferenceField } from "@/components/admin/reference-field";

export const InvoicesList = () => (
  <List>
    <DataTable>
      <DataTable.Col source="id" label="ID" />
      <DataTable.Col label="Student">
        <ReferenceField reference="students" source="studentId">
          <TextField source="firstName" />
        </ReferenceField>
      </DataTable.Col>
      <DataTable.Col source="period" label="Period" />
      <DataTable.Col source="status" label="Status" />
      <DataTable.Col source="amount" label="Amount" />
      <DataTable.Col source="dueDate" label="Due" />
    </DataTable>
  </List>
);

export default InvoicesList;
