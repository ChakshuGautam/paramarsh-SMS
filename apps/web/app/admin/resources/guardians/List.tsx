"use client";

import { List, DataTable } from "@/components/admin";

export const GuardiansList = () => (
  <List>
    <DataTable>
      <DataTable.Col source="id" label="ID" />
      <DataTable.Col source="name" label="Name" />
      <DataTable.Col source="relation" label="Relation" />
      <DataTable.Col source="phone" label="Phone" />
      <DataTable.Col source="email" label="Email" />
    </DataTable>
  </List>
);

export default GuardiansList;
