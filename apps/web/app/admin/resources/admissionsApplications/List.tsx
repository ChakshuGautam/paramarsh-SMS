"use client";

import { List, DataTable } from "@/components/admin";

export const AdmissionsApplicationsList = () => (
  <List>
    <DataTable>
      <DataTable.Col source="id" label="ID" />
      <DataTable.Col source="programId" label="Program" />
      <DataTable.Col source="status" label="Status" />
      <DataTable.Col source="score" label="Score" />
    </DataTable>
  </List>
);

export default AdmissionsApplicationsList;
