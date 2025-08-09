"use client";

import { List, DataTable } from "@/components/admin";

export const ExamsList = () => (
  <List>
    <DataTable>
      <DataTable.Col source="id" label="ID" />
      <DataTable.Col source="name" label="Name" />
      <DataTable.Col source="startDate" label="Start" />
      <DataTable.Col source="endDate" label="End" />
    </DataTable>
  </List>
);

export default ExamsList;
