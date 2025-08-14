"use client";

import { List, DataTable } from "@/components/admin";

export const TemplatesList = () => (
  <List>
    <DataTable>
      <DataTable.Col source="id" label="ID" />
      <DataTable.Col source="name" label="Name" />
      <DataTable.Col source="channel" label="Channel" />
      <DataTable.Col source="locale" label="Locale" />
      <DataTable.Col source="createdAt" label="Created" />
      <DataTable.Col source="updatedAt" label="Updated" />
    </DataTable>
  </List>
);

export default TemplatesList;