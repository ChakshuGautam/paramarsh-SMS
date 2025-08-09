"use client";

import { List, DataTable } from "@/components/admin";

export const StaffList = () => (
  <List>
    <DataTable>
      <DataTable.Col source="id" label="ID" />
      <DataTable.Col source="firstName" label="First Name" />
      <DataTable.Col source="lastName" label="Last Name" />
      <DataTable.Col source="designation" label="Designation" />
      <DataTable.Col source="department" label="Department" />
      <DataTable.Col source="status" label="Status" />
    </DataTable>
  </List>
);

export default StaffList;
