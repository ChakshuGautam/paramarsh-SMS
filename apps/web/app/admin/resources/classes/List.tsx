"use client";

import { List, DataTable } from "@/components/admin";

export const ClassesList = () => (
  <List>
    <DataTable>
      <DataTable.Col source="id" label="ID" />
      <DataTable.Col source="name" label="Name" />
      <DataTable.Col source="gradeLevel" label="Grade" />
    </DataTable>
  </List>
);

export default ClassesList;
